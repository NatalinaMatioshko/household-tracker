"use client";

import { useSyncExternalStore } from "react";
import type { Product, ProductCategory, Purchase } from "./types";
import { CATEGORY_OPTIONS, optionalText } from "./types";

const STORAGE_KEY = "householdProducts";

type Listener = () => void;

let listeners: Listener[] = [];
let cachedRaw: string | null | undefined = undefined;
let cachedProducts: Product[] = [];

function isCategory(value: unknown): value is ProductCategory {
  return (
    typeof value === "string" &&
    (CATEGORY_OPTIONS as string[]).includes(value)
  );
}

function asId(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function normalizePurchase(raw: unknown): Purchase | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Record<string, unknown>;

  const id = asId(p.id);
  const datePurchased =
    typeof p.datePurchased === "string" ? p.datePurchased.trim() : "";
  if (!id || !datePurchased) return null;

  const price = typeof p.price === "number" ? p.price : Number(p.price) || 0;
  const quantity =
    typeof p.quantity === "number" ? p.quantity : Number(p.quantity) || 1;

  return {
    id,
    datePurchased,
    dateEnded:
      typeof p.dateEnded === "string" && p.dateEnded ? p.dateEnded : null,
    price,
    quantity: quantity > 0 ? quantity : 1,
    store: optionalText(typeof p.store === "string" ? p.store : undefined),
    notes: optionalText(typeof p.notes === "string" ? p.notes : undefined),
  };
}

function normalizeProduct(raw: unknown): Product | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Record<string, unknown>;

  const id = asId(p.id);
  const name = typeof p.name === "string" ? p.name.trim() : "";
  if (!id || !name) return null;

  // Keep unknown/legacy categories instead of dropping the whole product.
  const category: ProductCategory = isCategory(p.category)
    ? p.category
    : "Інше";

  const purchases = Array.isArray(p.purchases)
    ? p.purchases
        .map(normalizePurchase)
        .filter((purchase): purchase is Purchase => purchase !== null)
    : [];

  const image =
    typeof p.image === "string" && p.image.startsWith("data:image/")
      ? p.image
      : undefined;
  const accentColor =
    typeof p.accentColor === "string" && /^#[0-9A-Fa-f]{6}$/.test(p.accentColor)
      ? p.accentColor
      : undefined;

  return {
    id,
    name,
    category,
    brand: optionalText(typeof p.brand === "string" ? p.brand : undefined),
    image,
    accentColor,
    purchases,
  };
}

function parseProducts(raw: string | null): Product[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeProduct)
      .filter((product): product is Product => product !== null);
  } catch (error) {
    console.error("Failed to parse products from storage:", error);
    return [];
  }
}

function getClientSnapshot(): Product[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedProducts = parseProducts(raw);
  }
  return cachedProducts;
}

function getServerSnapshot(): Product[] {
  return [];
}

function subscribe(onStoreChange: Listener) {
  listeners = [...listeners, onStoreChange];
  return () => {
    listeners = listeners.filter((listener) => listener !== onStoreChange);
  };
}

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function writeProducts(products: Product[]) {
  try {
    const raw = JSON.stringify(products);
    localStorage.setItem(STORAGE_KEY, raw);
    cachedRaw = raw;
    cachedProducts = products;
    emitChange();
  } catch (error) {
    console.error("Failed to save products to storage:", error);
  }
}

export function useProducts() {
  const products = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const setProducts = (
    next: Product[] | ((prev: Product[]) => Product[]),
  ) => {
    const prev = getClientSnapshot();
    const value = typeof next === "function" ? next(prev) : next;
    writeProducts(value);
  };

  return { products, setProducts };
}
