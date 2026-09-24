/** MVP product categories — matches Prisma enum Category. */
export type ProductCategory = "HYGIENE" | "CARE";

export const CATEGORY_OPTIONS: ProductCategory[] = ["HYGIENE", "CARE"];

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  HYGIENE: "Гігієна",
  CARE: "Догляд",
};

export function categoryLabel(category: ProductCategory): string {
  return CATEGORY_LABELS[category];
}

export interface Purchase {
  id: string;
  datePurchased: string;
  dateEnded: string | null;
  price: number;
  quantity: number;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  purchases: Purchase[];
}

export interface NewPurchaseForm {
  datePurchased: string;
  dateEnded: string;
  price: number;
  quantity: number;
  notes: string;
}

export const emptyNewPurchase = (): NewPurchaseForm => ({
  datePurchased: "",
  dateEnded: "",
  price: 0,
  quantity: 1,
  notes: "",
});

/** Payload to create a product + first purchase together in the UI. */
export interface NewProductInput {
  name: string;
  category: ProductCategory;
  datePurchased: string;
  price: number;
  quantity: number;
  notes?: string;
}

export function formatDateUk(value: string): string {
  if (!value) return "—";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );
  return date.toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatPrice(price: number): string {
  return `${price.toLocaleString("uk-UA")} ₴`;
}

export function optionalText(
  value: string | undefined | null,
): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/** Latest purchase date (YYYY-MM-DD), or empty if none. */
export function latestPurchaseDate(product: Product): string {
  if (!product.purchases.length) return "";
  return product.purchases.reduce(
    (latest, purchase) =>
      purchase.datePurchased > latest ? purchase.datePurchased : latest,
    product.purchases[0].datePurchased,
  );
}

/** Newest latest-purchase first. */
export function sortProductsByPurchaseDate(products: Product[]): Product[] {
  return [...products].sort((a, b) =>
    latestPurchaseDate(b).localeCompare(latestPurchaseDate(a)),
  );
}
