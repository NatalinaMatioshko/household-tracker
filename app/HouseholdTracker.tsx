"use client";

import React, { useRef, useState } from "react";
import type { Product, Purchase } from "./components/types";
import { defaultAccentForCategory, optionalText } from "./components/types";
import { useProducts } from "./components/useProducts";
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

const HouseholdTracker: React.FC = () => {
  const { products, setProducts } = useProducts();
  const addFormRef = useRef<AddProductFormHandle>(null);

  const openAddForm = (event?: React.MouseEvent<HTMLAnchorElement>) => {
    event?.preventDefault();
    addFormRef.current?.open();
  };

  const [editingProduct, setEditingProduct] =
    useState<EditingProductState>(emptyEditingProduct);
  const [editingPurchase, setEditingPurchase] =
    useState<EditingPurchaseState>(emptyEditingPurchase);

  const addProduct = (product: Product) => {
    setProducts([...products, product]);
  };

  const addPurchaseToProduct = (productId: string, purchase: Purchase) => {
    setProducts(
      products.map((p) =>
        p.id === productId
          ? { ...p, purchases: [...p.purchases, purchase] }
          : p,
      ),
    );
  };

  const fixDateEnded = (
    productId: string,
    purchaseId: string,
    dateEnded: string,
  ) => {
    setProducts(
      products.map((p) =>
        p.id === productId
          ? {
              ...p,
              purchases: p.purchases.map((pk) =>
                pk.id === purchaseId
                  ? { ...pk, dateEnded: dateEnded || null }
                  : pk,
              ),
            }
          : p,
      ),
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const updateProduct = (productId: string, patch: Partial<Product>) => {
    setProducts(
      products.map((p) => (p.id === productId ? { ...p, ...patch } : p)),
    );
  };

  const deletePurchase = (productId: string, purchaseId: string) => {
    setProducts(
      products.map((p) =>
        p.id === productId
          ? {
              ...p,
              purchases: p.purchases.filter((pk) => pk.id !== purchaseId),
            }
          : p,
      ),
    );
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct({
      isOpen: true,
      productId: product.id,
      name: product.name,
      category: product.category,
      brand: product.brand || "",
      image: product.image,
      accentColor:
        product.accentColor ?? defaultAccentForCategory(product.category),
    });
  };

  const saveEditProduct = () => {
    if (!editingProduct.productId || !editingProduct.name.trim()) return;

    setProducts(
      products.map((p) =>
        p.id === editingProduct.productId
          ? {
              ...p,
              name: editingProduct.name.trim(),
              category: editingProduct.category,
              brand: optionalText(editingProduct.brand),
              image: editingProduct.image,
              accentColor: editingProduct.accentColor,
            }
          : p,
      ),
    );

    setEditingProduct(emptyEditingProduct());
  };

  const openEditPurchase = (product: Product, purchase: Purchase) => {
    setEditingPurchase({
      isOpen: true,
      productId: product.id,
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
      !editingPurchase.productId ||
      !editingPurchase.purchaseId ||
      !editingPurchase.datePurchased
    )
      return;

    setProducts(
      products.map((p) =>
        p.id === editingPurchase.productId
          ? {
              ...p,
              purchases: p.purchases.map((pk) =>
                pk.id === editingPurchase.purchaseId
                  ? {
                      ...pk,
                      datePurchased: editingPurchase.datePurchased,
                      dateEnded: editingPurchase.dateEnded || null,
                      price: editingPurchase.price,
                      quantity: editingPurchase.quantity,
                      store: optionalText(editingPurchase.store),
                      notes: optionalText(editingPurchase.notes),
                    }
                  : pk,
              ),
            }
          : p,
      ),
    );

    setEditingPurchase(emptyEditingPurchase());
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
          <div className="site-nav-side is-right">
            <a
              href="#add-product"
              className="btn btn-primary site-nav-cta"
              onClick={openAddForm}
            >
              Додати
            </a>
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

        <div className="space-y-8 sm:space-y-12 md:space-y-14">
          <AddProductForm ref={addFormRef} onAdd={addProduct} />

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
                      onDelete={deleteProduct}
                      onEditProduct={openEditProduct}
                      onUpdateProduct={updateProduct}
                      onEditPurchase={openEditPurchase}
                      onDeletePurchase={deletePurchase}
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
      />

      <EditPurchaseModal
        editingPurchase={editingPurchase}
        onChange={setEditingPurchase}
        onSave={saveEditPurchase}
        onCancel={() => setEditingPurchase(emptyEditingPurchase())}
      />
    </div>
  );
};

export default HouseholdTracker;
