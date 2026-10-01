import type { ProductCategory } from "@/app/components/types";
import { CATEGORY_LABELS } from "@/app/components/types";

/**
 * Legacy localStorage / export shape (householdProducts):
 * [
 *   {
 *     id, name, category ("Гігієна"|"Догляд"|…),
 *     brand?, image?, accentColor?,   // ignored
 *     purchases: [{ id, datePurchased, dateEnded?, price, quantity, store?, notes? }]
 *   }
 * ]
 */

export type ImportablePurchase = {
  datePurchased: string;
  dateEnded: string | null;
  price: number;
  quantity: number;
  notes?: string;
};

export type ImportableProduct = {
  name: string;
  category: ProductCategory;
  purchases: ImportablePurchase[];
};

export type LegacyParseResult = {
  products: ImportableProduct[];
  purchaseCount: number;
  skippedProducts: number;
  skippedPurchases: number;
  /** skippedProducts + skippedPurchases */
  skippedInvalidRecords: number;
  parseError: string | null;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function asDateOnly(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return DATE_RE.test(trimmed) ? trimmed : null;
}

function asPositiveNumber(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function asPositiveInt(value: unknown, fallback = 1): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.floor(n);
}

function optionalText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * Strict MVP mapping only:
 * - "Гігієна" / HYGIENE → HYGIENE
 * - "Догляд" / CARE → CARE
 * Anything else → not importable (caller counts as skipped).
 */
export function mapLegacyCategory(raw: unknown): ProductCategory | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const value = raw.trim();

  if (value === "HYGIENE" || value === CATEGORY_LABELS.HYGIENE) {
    return "HYGIENE";
  }
  if (value === "CARE" || value === CATEGORY_LABELS.CARE) {
    return "CARE";
  }
  return null;
}

function normalizePurchase(raw: unknown): ImportablePurchase | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Record<string, unknown>;

  const datePurchased = asDateOnly(p.datePurchased);
  const price = asPositiveNumber(p.price);
  if (!datePurchased || price == null) return null;

  // Ignore store, brand, image, accentColor, id, and other UI metadata.
  const dateEndedRaw = p.dateEnded;
  const dateEnded =
    dateEndedRaw == null || dateEndedRaw === ""
      ? null
      : asDateOnly(dateEndedRaw);

  return {
    datePurchased,
    dateEnded,
    price,
    quantity: asPositiveInt(p.quantity, 1),
    notes: optionalText(p.notes)?.slice(0, 500),
  };
}

function normalizeProduct(raw: unknown): ImportableProduct | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Record<string, unknown>;

  const name = optionalText(p.name)?.slice(0, 120);
  const category = mapLegacyCategory(p.category);
  if (!name || !category) return null;

  const purchases: ImportablePurchase[] = [];
  if (Array.isArray(p.purchases)) {
    for (const item of p.purchases) {
      const purchase = normalizePurchase(item);
      if (purchase) purchases.push(purchase);
    }
  }

  return { name, category, purchases };
}

/** Parse pasted / recovered householdProducts JSON into MVP import rows. */
export function parseLegacyProductsJson(raw: string): LegacyParseResult {
  const empty = (parseError: string | null = null): LegacyParseResult => ({
    products: [],
    purchaseCount: 0,
    skippedProducts: 0,
    skippedPurchases: 0,
    skippedInvalidRecords: 0,
    parseError,
  });

  const trimmed = raw.trim();
  if (!trimmed) {
    return empty("Вставте JSON-масив засобів.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return empty("Невалідний JSON — перевірте синтаксис.");
  }

  if (!Array.isArray(parsed)) {
    return empty("Очікується JSON-масив (як у localStorage householdProducts).");
  }

  const products: ImportableProduct[] = [];
  let skippedProducts = 0;
  let skippedPurchases = 0;

  for (const item of parsed) {
    if (!item || typeof item !== "object") {
      skippedProducts += 1;
      continue;
    }
    const record = item as Record<string, unknown>;
    const beforePurchases = Array.isArray(record.purchases)
      ? record.purchases.length
      : 0;

    const product = normalizeProduct(item);
    if (!product) {
      skippedProducts += 1;
      continue;
    }

    skippedPurchases += Math.max(0, beforePurchases - product.purchases.length);
    products.push(product);
  }

  const purchaseCount = products.reduce(
    (sum, product) => sum + product.purchases.length,
    0,
  );

  return {
    products,
    purchaseCount,
    skippedProducts,
    skippedPurchases,
    skippedInvalidRecords: skippedProducts + skippedPurchases,
    parseError: null,
  };
}

/** Fingerprint used for purchase dedupe. */
export function purchaseFingerprint(purchase: {
  datePurchased: string;
  price: number;
  quantity: number;
}): string {
  return `${purchase.datePurchased}|${purchase.price}|${purchase.quantity}`;
}

export function productMatchKey(
  name: string,
  category: ProductCategory,
): string {
  return `${name.trim().toLowerCase()}|${category}`;
}
