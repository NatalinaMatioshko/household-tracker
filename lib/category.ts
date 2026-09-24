import { Category } from "@prisma/client";
import {
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  type ProductCategory,
} from "@/app/components/types";

/** Re-export UI category helpers for server code that also uses Prisma Category. */
export { CATEGORY_LABELS, CATEGORY_OPTIONS };
export type { ProductCategory };

export function categoryToLabel(category: Category | ProductCategory): string {
  return CATEGORY_LABELS[category as ProductCategory];
}

export function labelToCategory(label: string): ProductCategory | null {
  const entry = (
    Object.entries(CATEGORY_LABELS) as [ProductCategory, string][]
  ).find(([, value]) => value === label);
  return entry ? entry[0] : null;
}

/** Prisma enum values used in server actions. */
export const PRISMA_CATEGORIES = [Category.HYGIENE, Category.CARE] as const;
