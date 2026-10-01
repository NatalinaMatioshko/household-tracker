import { z } from "zod";
import { Category } from "@prisma/client";

/** YYYY-MM-DD calendar date from the DatePicker / <input type="date">. */
export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Дата має бути у форматі РРРР-ММ-ДД");

export const categorySchema = z.nativeEnum(Category);

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Вкажіть назву засобу").max(120),
  category: categorySchema,
});

export const updateProductSchema = z.object({
  productId: z.string().min(1),
  name: z.string().trim().min(1, "Вкажіть назву засобу").max(120),
  category: categorySchema,
});

export const productIdSchema = z.object({
  productId: z.string().min(1),
});

export const createPurchaseSchema = z.object({
  productId: z.string().min(1),
  price: z.number().finite().positive("Ціна має бути більшою за 0"),
  quantity: z.number().int().positive("Кількість має бути цілим числом > 0"),
  datePurchased: dateStringSchema,
  // nullish: Server Actions often serialize missing optional fields as null
  dateEnded: dateStringSchema.nullish(),
  notes: z.string().trim().max(500).nullish(),
});

export const updatePurchaseSchema = z.object({
  purchaseId: z.string().min(1),
  price: z.number().finite().positive("Ціна має бути більшою за 0"),
  quantity: z.number().int().positive("Кількість має бути цілим числом > 0"),
  datePurchased: dateStringSchema,
  dateEnded: dateStringSchema.nullish(),
  notes: z.string().trim().max(500).nullish(),
});

export const purchaseIdSchema = z.object({
  purchaseId: z.string().min(1),
});

export const setDateEndedSchema = z.object({
  purchaseId: z.string().min(1),
  dateEnded: dateStringSchema.nullable(),
});

/** One-time localStorage → DB import payload (already normalized on the client). */
export const importPurchaseSchema = z.object({
  datePurchased: dateStringSchema,
  dateEnded: dateStringSchema.nullish(),
  price: z.number().finite().positive(),
  quantity: z.number().int().positive(),
  notes: z.string().trim().max(500).nullish(),
});

export const importProductSchema = z.object({
  name: z.string().trim().min(1).max(120),
  category: categorySchema,
  purchases: z.array(importPurchaseSchema).max(200),
});

export const importLocalProductsSchema = z.object({
  products: z.array(importProductSchema).min(1).max(200),
});

/** Parse YYYY-MM-DD as a UTC calendar date for Prisma @db.Date. */
export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function toDateOnlyString(value: Date): string {
  return value.toISOString().slice(0, 10);
}
