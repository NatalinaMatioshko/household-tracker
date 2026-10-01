import { auth } from "@/lib/auth";
import { getProducts } from "@/app/actions/products";
import { mapDbProductToUi } from "@/lib/mapProduct";
import type { ProductCategory } from "./components/types";
import HouseholdTracker from "./HouseholdTracker";

export default async function Home() {
  const session = await auth();
  const userLabel =
    session?.user?.email ?? session?.user?.name ?? undefined;

  const productsResult = await getProducts();
  const loadError = productsResult.ok ? null : productsResult.error;
  const initialProducts = productsResult.ok
    ? (
        productsResult.data as Array<{
          id: string;
          name: string;
          brand: string | null;
          category: ProductCategory;
          purchases: Array<{
            id: string;
            price: number;
            quantity: number;
            datePurchased: Date;
            dateEnded: Date | null;
            store: string | null;
            notes: string | null;
          }>;
        }>
      ).map(mapDbProductToUi)
    : [];

  return (
    <main className="flex-1">
      <HouseholdTracker
        initialProducts={initialProducts}
        userLabel={userLabel}
        loadError={loadError}
      />
    </main>
  );
}
