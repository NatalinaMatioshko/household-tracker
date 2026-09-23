import { Category } from "@prisma/client";

/** UI labels for the two MVP categories. */
export const CATEGORY_LABELS: Record<Category, string> = {
  HYGIENE: "Гігієна",
  CARE: "Догляд",
};

export const CATEGORY_VALUES = [Category.HYGIENE, Category.CARE] as const;

export function categoryToLabel(category: Category): string {
  return CATEGORY_LABELS[category];
}

export function labelToCategory(label: string): Category | null {
  const entry = (Object.entries(CATEGORY_LABELS) as [Category, string][]).find(
    ([, value]) => value === label,
  );
  return entry ? entry[0] : null;
}
