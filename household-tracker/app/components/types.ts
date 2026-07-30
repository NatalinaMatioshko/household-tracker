export interface Purchase {
  id: string;
  datePurchased: string;
  dateEnded: string | null;
  price: number;
  quantity: number;
  store?: string;
  notes?: string;
}

export type ProductCategory =
  | "Гігієна"
  | "Догляд"
  | "Побутова хімія"
  | "Прання"
  | "Кухня"
  | "Інше";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  brand?: string;
  /** Compressed JPEG data URL */
  image?: string;
  /** Pastel accent swatch hex */
  accentColor?: string;
  purchases: Purchase[];
}

export interface NewPurchaseForm {
  datePurchased: string;
  dateEnded: string;
  price: number;
  quantity: number;
  store: string;
  notes: string;
}

export const emptyNewPurchase = (): NewPurchaseForm => ({
  datePurchased: "",
  dateEnded: "",
  price: 0,
  quantity: 1,
  store: "",
  notes: "",
});

export const CATEGORY_OPTIONS: ProductCategory[] = [
  "Гігієна",
  "Догляд",
  "Побутова хімія",
  "Прання",
  "Кухня",
  "Інше",
];

/** Soft pastel swatches (FoB-style Select Color row) */
export const ACCENT_SWATCHES = [
  "#A8D4F0",
  "#C9B8E8",
  "#B8E0D2",
  "#F5C9B8",
  "#F0D6DE",
  "#D7E8F4",
  "#E4DFF0",
  "#F3D0C8",
  "#D8EFE8",
  "#F5DDD4",
] as const;

export type AccentSwatch = (typeof ACCENT_SWATCHES)[number];

const CATEGORY_ACCENTS: Record<ProductCategory, string> = {
  Гігієна: ACCENT_SWATCHES[2],
  Догляд: ACCENT_SWATCHES[3],
  "Побутова хімія": ACCENT_SWATCHES[0],
  Прання: ACCENT_SWATCHES[5],
  Кухня: ACCENT_SWATCHES[9],
  Інше: ACCENT_SWATCHES[1],
};

export function defaultAccentForCategory(category: ProductCategory): string {
  return CATEGORY_ACCENTS[category] ?? ACCENT_SWATCHES[2];
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

export function optionalText(value: string | undefined | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
