import type { Product, ProductCategory, Purchase } from "@/app/components/types";
import { toDateOnlyString } from "@/lib/validators";

type DbPurchase = {
  id: string;
  price: number;
  quantity: number;
  datePurchased: Date;
  dateEnded: Date | null;
  notes: string | null;
};

type DbProduct = {
  id: string;
  name: string;
  category: ProductCategory;
  purchases: DbPurchase[];
};

/** Convert Prisma product (+ purchases) into UI-friendly string dates. */
export function mapDbProductToUi(product: DbProduct): Product {
  return {
    id: product.id,
    name: product.name,
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
    notes: purchase.notes ?? undefined,
  };
}
