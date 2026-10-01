import type { Product, ProductCategory, Purchase } from "@/app/components/types";
import { toDateOnlyString } from "@/lib/validators";

type DbPurchase = {
  id: string;
  price: number;
  quantity: number;
  datePurchased: Date;
  dateEnded: Date | null;
  store: string | null;
  notes: string | null;
};

type DbProduct = {
  id: string;
  name: string;
  brand: string | null;
  category: ProductCategory;
  purchases: DbPurchase[];
};

/** Convert Prisma product (+ purchases) into UI-friendly string dates. */
export function mapDbProductToUi(product: DbProduct): Product {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand ?? undefined,
    category: product.category,
    purchases: product.purchases.map(mapDbPurchaseToUi),
  };
}

export function mapDbPurchaseToUi(purchase: DbPurchase): Purchase {
  return {
    id: purchase.id,
    price: purchase.price,
    quantity: purchase.quantity,
    datePurchased: toDateOnlyString(purchase.datePurchased),
    dateEnded: purchase.dateEnded ? toDateOnlyString(purchase.dateEnded) : null,
    store: purchase.store ?? undefined,
    notes: purchase.notes ?? undefined,
  };
}
