"use server";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import {
  createProductSchema,
  productIdSchema,
  updateProductSchema,
} from "@/lib/validators";

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function formatZodError(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? "Невалідні дані.";
}

/**
 * List products for the signed-in user (newest updated first).
 * Includes purchases for later UI wiring.
 */
export async function getProducts(): Promise<ActionResult<unknown>> {
  try {
    const userId = await requireUserId();
    const products = await prisma.product.findMany({
      where: { userId },
      include: {
        purchases: {
          orderBy: { datePurchased: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    return { ok: true, data: products };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return { ok: false, error: "Потрібно увійти." };
    }
    console.error("getProducts", error);
    return { ok: false, error: "Не вдалося завантажити засоби." };
  }
}

/** Create a product owned by the current user. */
export async function createProduct(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const userId = await requireUserId();
    const parsed = createProductSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: formatZodError(parsed.error) };
    }

    const product = await prisma.product.create({
      data: {
        userId,
        name: parsed.data.name,
        category: parsed.data.category,
      },
    });

    return { ok: true, data: { id: product.id } };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return { ok: false, error: "Потрібно увійти." };
    }
    console.error("createProduct", error);
    return { ok: false, error: "Не вдалося створити засіб." };
  }
}

/** Update name/category — only if the product belongs to the current user. */
export async function updateProduct(input: unknown): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const parsed = updateProductSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: formatZodError(parsed.error) };
    }

    const existing = await prisma.product.findFirst({
      where: { id: parsed.data.productId, userId },
      select: { id: true },
    });
    if (!existing) {
      return { ok: false, error: "Засіб не знайдено." };
    }

    await prisma.product.update({
      where: { id: existing.id },
      data: {
        name: parsed.data.name,
        category: parsed.data.category,
      },
    });

    return { ok: true, data: undefined };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return { ok: false, error: "Потрібно увійти." };
    }
    console.error("updateProduct", error);
    return { ok: false, error: "Не вдалося оновити засіб." };
  }
}

/** Delete a product (and cascaded purchases) owned by the current user. */
export async function deleteProduct(input: unknown): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const parsed = productIdSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: formatZodError(parsed.error) };
    }

    const existing = await prisma.product.findFirst({
      where: { id: parsed.data.productId, userId },
      select: { id: true },
    });
    if (!existing) {
      return { ok: false, error: "Засіб не знайдено." };
    }

    await prisma.product.delete({ where: { id: existing.id } });
    return { ok: true, data: undefined };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return { ok: false, error: "Потрібно увійти." };
    }
    console.error("deleteProduct", error);
    return { ok: false, error: "Не вдалося видалити засіб." };
  }
}
