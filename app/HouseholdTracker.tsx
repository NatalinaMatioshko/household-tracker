"use client";

import React, { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { NewProductInput, Product, Purchase } from "./components/types";
import { optionalText, sortProductsByPurchaseDate } from "./components/types";
import type { AddPurchaseInput } from "./components/ProductCard";
import {
  createProduct,
  deleteProduct as deleteProductAction,
  updateProduct as updateProductAction,
} from "@/app/actions/products";
import {
  createPurchase,
  deletePurchase as deletePurchaseAction,
  setPurchaseDateEnded,
  updatePurchase as updatePurchaseAction,
} from "@/app/actions/purchases";
import AddProductForm, {
  type AddProductFormHandle,
} from "./components/AddProductForm";
import ProductCard from "./components/ProductCard";
import EditProductModal, {
  emptyEditingProduct,
  type EditingProductState,
} from "./components/EditProductModal";
import EditPurchaseModal, {
  emptyEditingPurchase,
  type EditingPurchaseState,
} from "./components/EditPurchaseModal";
import SignOutButton from "./components/SignOutButton";

type HouseholdTrackerProps = {
  initialProducts: Product[];
  userLabel?: string;
  loadError?: string | null;
};

const HouseholdTracker: React.FC<HouseholdTrackerProps> = ({
  initialProducts,
  userLabel,
  loadError,
}) => {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const products = sortProductsByPurchaseDate(initialProducts);
  const addFormRef = useRef<AddProductFormHandle>(null);

  const [addError, setAddError] = useState<string | null>(null);
  const [productError, setProductError] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [productPending, setProductPending] = useState(false);
  const [purchasePending, setPurchasePending] = useState(false);

  const refresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const openAddForm = (event?: React.MouseEvent<HTMLAnchorElement>) => {
    event?.preventDefault();
    addFormRef.current?.open();
  };

  const [editingProduct, setEditingProduct] =
    useState<EditingProductState>(emptyEditingProduct);
  const [editingPurchase, setEditingPurchase] =
    useState<EditingPurchaseState>(emptyEditingPurchase);

  const addProduct = async (input: NewProductInput) => {
    setAddError(null);

    const productResult = await createProduct({
      name: input.name,
      ...(input.brand ? { brand: input.brand } : {}),
      category: input.category,
    });
    if (!productResult.ok) {
      setAddError(productResult.error);
      throw new Error(productResult.error);
    }

    const purchaseResult = await createPurchase({
      productId: productResult.data.id,
      datePurchased: input.datePurchased,
      price: input.price,
      quantity: input.quantity,
      ...(input.store ? { store: input.store } : {}),
      ...(input.notes ? { notes: input.notes } : {}),
    });
    if (!purchaseResult.ok) {
      setAddError(purchaseResult.error);
      throw new Error(purchaseResult.error);
    }

    refresh();
  };

  const addPurchaseToProduct = async (
    productId: string,
    purchase: AddPurchaseInput,
  ) => {
    const result = await createPurchase({
      productId,
      datePurchased: purchase.datePurchased,
      ...(purchase.dateEnded ? { dateEnded: purchase.dateEnded } : {}),
      price: purchase.price,
      quantity: purchase.quantity,
      ...(purchase.store ? { store: purchase.store } : {}),
      ...(purchase.notes ? { notes: purchase.notes } : {}),
    });
    if (!result.ok) {
      throw new Error(result.error);
    }
    refresh();
  };

  const fixDateEnded = (
    _productId: string,
    purchaseId: string,
    dateEnded: string,
  ) => {
    void (async () => {
      const result = await setPurchaseDateEnded({
        purchaseId,
        dateEnded: dateEnded || null,
      });
      if (!result.ok) {
        window.alert(result.error);
        return;
      }
      refresh();
    })();
  };

  const removeProduct = (id: string) => {
    void (async () => {
      const result = await deleteProductAction({ productId: id });
      if (!result.ok) {
        window.alert(result.error);
        return;
      }
      refresh();
    })();
  };

  const removePurchase = (_productId: string, purchaseId: string) => {
    void (async () => {
      const result = await deletePurchaseAction({ purchaseId });
      if (!result.ok) {
        window.alert(result.error);
        return;
      }
      refresh();
    })();
  };

  const openEditProduct = (product: Product) => {
    setProductError(null);
    setEditingProduct({
      isOpen: true,
      productId: product.id,
      name: product.name,
      brand: product.brand || "",
      category: product.category,
    });
  };

  const saveEditProduct = () => {
    if (!editingProduct.productId || !editingProduct.name.trim()) return;

    void (async () => {
      setProductPending(true);
      setProductError(null);
      try {
        const result = await updateProductAction({
          productId: editingProduct.productId,
          name: editingProduct.name.trim(),
          brand: optionalText(editingProduct.brand) ?? null,
          category: editingProduct.category,
        });
        if (!result.ok) {
          setProductError(result.error);
          return;
        }
        setEditingProduct(emptyEditingProduct());
        refresh();
      } finally {
        setProductPending(false);
      }
    })();
  };

  const openEditPurchase = (_product: Product, purchase: Purchase) => {
    setPurchaseError(null);
    setEditingPurchase({
      isOpen: true,
      productId: _product.id,
      purchaseId: purchase.id,
      datePurchased: purchase.datePurchased,
      dateEnded: purchase.dateEnded || "",
      price: purchase.price,
      quantity: purchase.quantity,
      store: purchase.store || "",
      notes: purchase.notes || "",
    });
  };

  const saveEditPurchase = () => {
    if (
      !editingPurchase.purchaseId ||
      !editingPurchase.datePurchased ||
      editingPurchase.price <= 0
    )
      return;

    void (async () => {
      setPurchasePending(true);
      setPurchaseError(null);
      try {
        const result = await updatePurchaseAction({
          purchaseId: editingPurchase.purchaseId,
          datePurchased: editingPurchase.datePurchased,
          dateEnded: editingPurchase.dateEnded || null,
          price: editingPurchase.price,
          quantity: editingPurchase.quantity || 1,
          store: optionalText(editingPurchase.store) ?? null,
          notes: optionalText(editingPurchase.notes) ?? null,
        });
        if (!result.ok) {
          setPurchaseError(result.error);
          return;
        }
        setEditingPurchase(emptyEditingPurchase());
        refresh();
      } finally {
        setPurchasePending(false);
      }
    })();
  };

  return (
    <div className="app-shell relative min-h-screen">
      <header className="site-nav animate-fade">
        <div className="site-nav-inner">
          <div className="site-nav-side is-left">
            <a href="#products" className="site-nav-link">
              Засоби
            </a>
          </div>
          <a href="#top" className="site-nav-brand">
            household <span>—</span> tracker
          </a>
          <div className="site-nav-side is-right site-nav-actions">
            {userLabel ? (
              <span className="site-nav-user" title={userLabel}>
                {userLabel}
              </span>
            ) : null}
            <a
              href="#add-product"
              className="btn btn-primary site-nav-cta"
              onClick={openAddForm}
            >
              Додати
            </a>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div id="top" className="page-main">
        <section className="hero-block animate-rise">
          <p className="hero-eyebrow mb-2 sm:mb-3">Ваш домашній список</p>
          <h1 className="hero-title font-serif font-semibold tracking-tight text-ink">
            Ось ваш список засобів
          </h1>
          <p className="hero-lead">
            Покупки, ціни й коли що закінчилося — у спокійному порядку.
          </p>
        </section>

        {loadError ? (
          <p className="auth-error mb-6" role="alert">
            {loadError}
          </p>
        ) : null}

        <div className="space-y-8 sm:space-y-12 md:space-y-14">
          <AddProductForm
            ref={addFormRef}
            onAdd={addProduct}
            error={addError}
          />

          <section
            id="products"
            aria-labelledby="products-heading"
            className="animate-rise animate-delay-2 scroll-mt-16 sm:scroll-mt-20"
          >
            <div className="mb-5 text-center sm:mb-8">
              <p className="hero-eyebrow mb-2 sm:mb-3">У вашому списку</p>
              <h2
                id="products-heading"
                className="font-serif text-[clamp(1.65rem,5vw,2.5rem)] font-semibold tracking-tight text-ink"
              >
                Ваші засоби
              </h2>
              <p className="mt-2 text-sm text-ink-muted">
                {products.length === 0
                  ? "Список порожній — натисніть «Новий запис», щоб додати перший засіб"
                  : `${products.length} ${products.length === 1 ? "засіб" : products.length < 5 ? "засоби" : "засобів"} у списку`}
              </p>
            </div>

            {products.length === 0 ? (
              <div className="animate-fade section-surface px-5 py-12 text-center sm:px-6 sm:py-16">
                <p className="font-serif text-[1.65rem] font-semibold tracking-tight text-ink sm:text-[1.9rem]">
                  Список поки порожній
                </p>
                <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-ink-muted">
                  Відкрийте форму «Новий запис» — далі зручно фіксувати повторні
                  покупки та дату закінчення.
                </p>
              </div>
            ) : (
              <div className="fob-product-grid">
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    className="animate-rise"
                    style={{ animationDelay: `${0.06 * Math.min(index, 6)}s` }}
                  >
                    <ProductCard
                      product={product}
                      onDelete={removeProduct}
                      onEditProduct={openEditProduct}
                      onEditPurchase={openEditPurchase}
                      onDeletePurchase={removePurchase}
                      onFixDateEnded={fixDateEnded}
                      onAddPurchase={addPurchaseToProduct}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <EditProductModal
        editingProduct={editingProduct}
        onChange={setEditingProduct}
        onSave={saveEditProduct}
        onCancel={() => setEditingProduct(emptyEditingProduct())}
        pending={productPending}
        error={productError}
      />

      <EditPurchaseModal
        editingPurchase={editingPurchase}
        onChange={setEditingPurchase}
        onSave={saveEditPurchase}
        onCancel={() => setEditingPurchase(emptyEditingPurchase())}
        pending={purchasePending}
        error={purchaseError}
      />
    </div>
  );
};

export default HouseholdTracker;
