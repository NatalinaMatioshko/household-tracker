"use server";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import {
  createPurchaseSchema,
  parseDateOnly,
  purchaseIdSchema,
  setDateEndedSchema,
  updatePurchaseSchema,
} from "@/lib/validators";

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function formatZodError(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? "Невалідні дані.";
}

/**
 * Ensure the purchase's product belongs to the signed-in user.
 * Ownership is via Product.userId (Purchase has no userId in MVP).
 */
async function findOwnedPurchase(purchaseId: string, userId: string) {
  return prisma.purchase.findFirst({
    where: {
      id: purchaseId,
      product: { userId },
    },
    select: { id: true, productId: true },
  });
}

/** Add a purchase to a product owned by the current user. */
export async function createPurchase(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const userId = await requireUserId();
    const parsed = createPurchaseSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: formatZodError(parsed.error) };
    }

    const product = await prisma.product.findFirst({
      where: { id: parsed.data.productId, userId },
      select: { id: true },
    });
    if (!product) {
      return { ok: false, error: "Засіб не знайдено." };
    }

    const notes = parsed.data.notes?.trim() || null;
    const dateEnded = parsed.data.dateEnded
      ? parseDateOnly(parsed.data.dateEnded)
      : null;

    const purchase = await prisma.purchase.create({
      data: {
        productId: product.id,
        price: parsed.data.price,
        quantity: parsed.data.quantity,
        datePurchased: parseDateOnly(parsed.data.datePurchased),
        dateEnded,
        notes,
      },
    });

    return { ok: true, data: { id: purchase.id } };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return { ok: false, error: "Потрібно увійти." };
    }
    console.error("createPurchase", error);
    return { ok: false, error: "Не вдалося додати покупку." };
  }
}

/** Update a purchase if its product belongs to the current user. */
export async function updatePurchase(input: unknown): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const parsed = updatePurchaseSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: formatZodError(parsed.error) };
    }

    const existing = await findOwnedPurchase(parsed.data.purchaseId, userId);
    if (!existing) {
      return { ok: false, error: "Покупку не знайдено." };
    }

    const notes =
      parsed.data.notes === undefined
        ? undefined
        : parsed.data.notes?.trim() || null;

    const dateEnded =
      parsed.data.dateEnded === undefined
        ? undefined
        : parsed.data.dateEnded
          ? parseDateOnly(parsed.data.dateEnded)
          : null;

    await prisma.purchase.update({
      where: { id: existing.id },
      data: {
        price: parsed.data.price,
        quantity: parsed.data.quantity,
        datePurchased: parseDateOnly(parsed.data.datePurchased),
        ...(dateEnded !== undefined ? { dateEnded } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
    });

    return { ok: true, data: undefined };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return { ok: false, error: "Потрібно увійти." };
    }
    console.error("updatePurchase", error);
    return { ok: false, error: "Не вдалося оновити покупку." };
  }
}

/** Set or clear dateEnded on an owned purchase. */
export async function setPurchaseDateEnded(
  input: unknown,
): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const parsed = setDateEndedSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: formatZodError(parsed.error) };
    }

    const existing = await findOwnedPurchase(parsed.data.purchaseId, userId);
    if (!existing) {
      return { ok: false, error: "Покупку не знайдено." };
    }

    await prisma.purchase.update({
      where: { id: existing.id },
      data: {
        dateEnded: parsed.data.dateEnded
          ? parseDateOnly(parsed.data.dateEnded)
          : null,
      },
    });

    return { ok: true, data: undefined };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return { ok: false, error: "Потрібно увійти." };
    }
    console.error("setPurchaseDateEnded", error);
    return { ok: false, error: "Не вдалося оновити дату закінчення." };
  }
}

/** Delete a purchase if its product belongs to the current user. */
export async function deletePurchase(input: unknown): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const parsed = purchaseIdSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: formatZodError(parsed.error) };
    }

    const existing = await findOwnedPurchase(parsed.data.purchaseId, userId);
    if (!existing) {
      return { ok: false, error: "Покупку не знайдено." };
    }

    await prisma.purchase.delete({ where: { id: existing.id } });
    return { ok: true, data: undefined };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return { ok: false, error: "Потрібно увійти." };
    }
    console.error("deletePurchase", error);
    return { ok: false, error: "Не вдалося видалити покупку." };
  }
}
