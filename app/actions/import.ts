"use server";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import {
  importLocalProductsSchema,
  parseDateOnly,
  toDateOnlyString,
} from "@/lib/validators";
import {
  productMatchKey,
  purchaseFingerprint,
} from "@/lib/legacyImport";
import type { Category } from "@prisma/client";

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type ImportLocalResult = {
  productsCreated: number;
  productsReused: number;
  purchasesCreated: number;
  purchasesSkipped: number;
};

function formatZodError(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? "Невалідні дані.";
}

/**
 * One-time import of preview-normalized legacy products
 * into the signed-in user's database records.
 *
 * Duplicate rules:
 * - Product: same user + same name (case-insensitive) + category + brand → reuse
 * - Purchase: same product + same datePurchased + price + quantity → skip
 */
export async function importLocalProducts(
  input: unknown,
): Promise<ActionResult<ImportLocalResult>> {
  try {
    const userId = await requireUserId();
    const parsed = importLocalProductsSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: formatZodError(parsed.error) };
    }

    const existing = await prisma.product.findMany({
      where: { userId },
      include: { purchases: true },
    });

    const byKey = new Map<
      string,
      {
        id: string;
        purchaseKeys: Set<string>;
      }
    >();

    for (const product of existing) {
      const key = productMatchKey(
        product.name,
        product.category,
        product.brand,
      );
      byKey.set(key, {
        id: product.id,
        purchaseKeys: new Set(
          product.purchases.map((purchase) =>
            purchaseFingerprint({
              datePurchased: toDateOnlyString(purchase.datePurchased),
              price: purchase.price,
              quantity: purchase.quantity,
            }),
          ),
        ),
      });
    }

    let productsCreated = 0;
    let productsReused = 0;
    let purchasesCreated = 0;
    let purchasesSkipped = 0;

    await prisma.$transaction(async (tx) => {
      for (const item of parsed.data.products) {
        const brand = item.brand?.trim() || null;
        const key = productMatchKey(
          item.name,
          item.category as Category,
          brand,
        );
        let entry = byKey.get(key);

        if (!entry) {
          const created = await tx.product.create({
            data: {
              userId,
              name: item.name,
              brand,
              category: item.category,
            },
          });
          entry = { id: created.id, purchaseKeys: new Set() };
          byKey.set(key, entry);
          productsCreated += 1;
        } else {
          productsReused += 1;
        }

        for (const purchase of item.purchases) {
          const fp = purchaseFingerprint(purchase);
          if (entry.purchaseKeys.has(fp)) {
            purchasesSkipped += 1;
            continue;
          }

          await tx.purchase.create({
            data: {
              productId: entry.id,
              price: purchase.price,
              quantity: purchase.quantity,
              datePurchased: parseDateOnly(purchase.datePurchased),
              dateEnded: purchase.dateEnded
                ? parseDateOnly(purchase.dateEnded)
                : null,
              store: purchase.store?.trim() || null,
              notes: purchase.notes?.trim() || null,
            },
          });
          entry.purchaseKeys.add(fp);
          purchasesCreated += 1;
        }
      }
    });

    return {
      ok: true,
      data: {
        productsCreated,
        productsReused,
        purchasesCreated,
        purchasesSkipped,
      },
    };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return { ok: false, error: "Потрібно увійти." };
    }
    console.error("importLocalProducts", error);
    return { ok: false, error: "Не вдалося імпортувати дані." };
  }
}
