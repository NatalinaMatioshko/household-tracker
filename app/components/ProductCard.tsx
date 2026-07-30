"use client";

import React, { useId, useState } from "react";
import type { Product, ProductCategory, Purchase, NewPurchaseForm } from "./types";
import {
  ACCENT_SWATCHES,
  CATEGORY_OPTIONS,
  defaultAccentForCategory,
  emptyNewPurchase,
  formatDateUk,
  formatPrice,
  optionalText,
} from "./types";
import DatePicker from "./DatePicker";
import ImageUploadField from "./ImageUploadField";

interface ProductCardProps {
  product: Product;
  onDelete: (productId: string) => void;
  onEditProduct: (product: Product) => void;
  onUpdateProduct: (productId: string, patch: Partial<Product>) => void;
  onEditPurchase: (product: Product, purchase: Purchase) => void;
  onDeletePurchase: (productId: string, purchaseId: string) => void;
  onFixDateEnded: (
    productId: string,
    purchaseId: string,
    dateEnded: string,
  ) => void;
  onAddPurchase: (productId: string, purchase: Purchase) => void;
}

function purchaseCountLabel(count: number): string {
  if (count === 0) return "Покупок ще немає";
  if (count === 1) return "1 покупка";
  if (count < 5) return `${count} покупки`;
  return `${count} покупок`;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onDelete,
  onEditProduct,
  onUpdateProduct,
  onEditPurchase,
  onDeletePurchase,
  onFixDateEnded,
  onAddPurchase,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [newPurchase, setNewPurchase] =
    useState<NewPurchaseForm>(emptyNewPurchase);
  const panelId = useId();

  const accent =
    product.accentColor ?? defaultAccentForCategory(product.category);
  const canAddPurchase =
    Boolean(newPurchase.datePurchased) && newPurchase.price > 0;

  const addPurchase = () => {
    if (!canAddPurchase) return;

    const lastPurchase = product.purchases.slice(-1)[0];
    const dateEnded = newPurchase.dateEnded || lastPurchase?.dateEnded || null;

    const purchase: Purchase = {
      id: crypto.randomUUID(),
      datePurchased: newPurchase.datePurchased,
      dateEnded,
      price: newPurchase.price,
      quantity: newPurchase.quantity || 1,
      store: optionalText(newPurchase.store),
      notes: optionalText(newPurchase.notes),
    };

    onAddPurchase(product.id, purchase);
    setNewPurchase(emptyNewPurchase());
  };

  const purchasesNewestFirst = [...product.purchases].reverse();
  const latestId = product.purchases[product.purchases.length - 1]?.id;
  const latestPurchase = product.purchases[product.purchases.length - 1];

  const setCategory = (category: ProductCategory) => {
    if (category === product.category) return;
    onUpdateProduct(product.id, {
      category,
      accentColor: product.accentColor ?? defaultAccentForCategory(category),
    });
  };

  return (
    <article
      className={`product-card fob-card section-surface h-full overflow-hidden transition-[border-color,box-shadow] duration-300 ${expanded ? "is-expanded" : ""}`}
      style={{ "--fob-accent": accent } as React.CSSProperties}
    >
      <div className="fob-card-body">
        <div className="fob-card-top">
          <ImageUploadField
            variant="slot"
            value={product.image}
            onChange={(image) => onUpdateProduct(product.id, { image })}
            id={`photo-${product.id}`}
          />

          <div className="fob-card-controls">
            <h3 className="fob-card-title">{product.name}</h3>
            <div className="fob-card-subtitle">
              {product.brand ? (
                <span className="fob-card-brand">{product.brand}</span>
              ) : null}
              <span
                className="category-chip"
                data-category={product.category}
              >
                {product.category}
              </span>
            </div>

            {!expanded && latestPurchase ? (
              <p className="fob-card-meta-line">
                {formatDateUk(latestPurchase.datePurchased)}
                {" · "}
                {formatPrice(latestPurchase.price)}
                {latestPurchase.store ? ` · ${latestPurchase.store}` : ""}
              </p>
            ) : null}
            {!expanded && !latestPurchase ? (
              <p className="fob-card-meta-line is-muted">
                Немає покупок — відкрийте деталі
              </p>
            ) : null}

            {expanded ? (
              <>
                <div className="fob-control-block">
                  <span className="fob-control-label">Категорія:</span>
                  <div
                    className="pill-group pill-group-scroll fob-pill-group"
                    role="group"
                  >
                    {CATEGORY_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`pill-option fob-pill${product.category === option ? " is-selected" : ""}`}
                        aria-pressed={product.category === option}
                        onClick={() => setCategory(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="fob-control-block">
                  <span className="fob-control-label">Колір:</span>
                  <div
                    className="fob-swatch-row fob-swatch-row-touch"
                    role="radiogroup"
                    aria-label="Колір акценту"
                  >
                    {ACCENT_SWATCHES.map((swatch) => {
                      const selected =
                        accent.toLowerCase() === swatch.toLowerCase();
                      return (
                        <button
                          key={swatch}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          className={`fob-swatch${selected ? " is-selected" : ""}`}
                          style={{ backgroundColor: swatch }}
                          onClick={() =>
                            onUpdateProduct(product.id, {
                              accentColor: swatch,
                            })
                          }
                          title={swatch}
                        />
                      );
                    })}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className="fob-divider" />

        <div className="fob-meta-rows">
          {expanded ? (
            latestPurchase ? (
              <div className="fob-meta-row is-active">
                <span className="fob-radio is-on" aria-hidden="true" />
                <div className="fob-meta-row-main">
                  <span className="fob-meta-row-label">Остання покупка</span>
                  <span className="fob-meta-row-detail">
                    {formatDateUk(latestPurchase.datePurchased)}
                    {latestPurchase.store
                      ? ` · ${latestPurchase.store}`
                      : ""}
                    {" · "}
                    {purchaseCountLabel(product.purchases.length)}
                  </span>
                </div>
                <div className="fob-meta-row-price">
                  <span className="fob-meta-qty">
                    {latestPurchase.quantity} шт
                  </span>
                  <span className="fob-meta-amount">
                    {formatPrice(latestPurchase.price)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="fob-meta-row is-active">
                <span className="fob-radio is-on" aria-hidden="true" />
                <div className="fob-meta-row-main">
                  <span className="fob-meta-row-label">Немає покупок</span>
                  <span className="fob-meta-row-detail">
                    Додайте першу покупку нижче
                  </span>
                </div>
              </div>
            )
          ) : null}

          <div
            className={`fob-meta-row fob-meta-row-ended${latestPurchase?.dateEnded ? " is-active" : ""}`}
          >
            <span
              className={`fob-radio${latestPurchase?.dateEnded ? " is-on" : ""}`}
              aria-hidden="true"
            />
            <div className="fob-meta-row-main">
              <span className="fob-meta-row-label">Дата закінчення</span>
              {!latestPurchase ? (
                <span className="fob-meta-row-detail">
                  Доступно після першої покупки
                </span>
              ) : null}
            </div>
            {latestPurchase ? (
              <DatePicker
                id={`summary-ended-${product.id}`}
                variant="pill"
                className="fob-ended-picker"
                value={latestPurchase.dateEnded || ""}
                onChange={(dateEnded) =>
                  onFixDateEnded(product.id, latestPurchase.id, dateEnded)
                }
                allowClear
                placeholder="Вказати дату"
                aria-label="Дата закінчення засобу"
              />
            ) : (
              <span className="fob-ended-pill is-disabled" aria-hidden="true">
                Вказати дату
              </span>
            )}
          </div>
        </div>

        <div className="fob-divider" />

        <button
          type="button"
          className="fob-expand-btn"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => setExpanded((open) => !open)}
        >
          <span className="fob-expand-chevron" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
              <path
                d="M2.25 4.25L6 8l3.75-3.75"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="fob-expand-label">
            {expanded ? "Згорнути" : "Деталі"}
          </span>
        </button>
      </div>

      <div
        id={panelId}
        className={`product-card-panel${expanded ? " is-open" : ""}`}
      >
        <div className="product-card-panel-inner">
          <div className="product-card-panel-content">
            <div className="product-card-toolbar">
              <button
                type="button"
                className="btn btn-secondary touch-btn"
                onClick={() => onEditProduct(product)}
              >
                Редагувати
              </button>
              <button
                type="button"
                className="btn btn-danger touch-btn"
                onClick={() => {
                  if (
                    window.confirm(
                      `Видалити «${product.name}» разом з усією історією покупок?`,
                    )
                  ) {
                    onDelete(product.id);
                  }
                }}
              >
                Видалити
              </button>
            </div>

            <section
              aria-labelledby={`repurchase-${product.id}`}
              className="product-card-section"
            >
              <div className="mb-4 text-left">
                <p className="hero-eyebrow mb-2">Повторна покупка</p>
                <h4
                  id={`repurchase-${product.id}`}
                  className="fob-section-heading"
                >
                  Нова покупка
                </h4>
                <p className="mt-1 text-sm text-ink-muted">
                  Ціна, кількість, магазин і дати.
                </p>
              </div>

              <div className="form-stack">
                <div>
                  <label
                    className="label"
                    htmlFor={`np-date-${product.id}`}
                  >
                    Дата покупки
                  </label>
                  <DatePicker
                    id={`np-date-${product.id}`}
                    value={newPurchase.datePurchased}
                    onChange={(datePurchased) =>
                      setNewPurchase({ ...newPurchase, datePurchased })
                    }
                    placeholder="Оберіть дату"
                  />
                </div>

                <div>
                  <label
                    className="label"
                    htmlFor={`np-ended-${product.id}`}
                  >
                    Дата закінчення
                  </label>
                  <DatePicker
                    id={`np-ended-${product.id}`}
                    value={newPurchase.dateEnded}
                    onChange={(dateEnded) =>
                      setNewPurchase({ ...newPurchase, dateEnded })
                    }
                    allowClear
                    placeholder="Необовʼязково"
                  />
                </div>

                <div>
                  <label
                    className="label"
                    htmlFor={`np-price-${product.id}`}
                  >
                    Ціна (₴)
                  </label>
                  <input
                    id={`np-price-${product.id}`}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    className="field"
                    placeholder="450"
                    value={newPurchase.price || ""}
                    onChange={(e) =>
                      setNewPurchase({
                        ...newPurchase,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div>
                  <label
                    className="label"
                    htmlFor={`np-qty-${product.id}`}
                  >
                    Кількість
                  </label>
                  <input
                    id={`np-qty-${product.id}`}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    className="field"
                    placeholder="1"
                    value={newPurchase.quantity || ""}
                    onChange={(e) =>
                      setNewPurchase({
                        ...newPurchase,
                        quantity: parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />
                </div>

                <div>
                  <label
                    className="label"
                    htmlFor={`np-store-${product.id}`}
                  >
                    Де куплено
                  </label>
                  <input
                    id={`np-store-${product.id}`}
                    type="text"
                    className="field"
                    placeholder="Напр. АТБ"
                    value={newPurchase.store}
                    onChange={(e) =>
                      setNewPurchase({
                        ...newPurchase,
                        store: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label
                    className="label"
                    htmlFor={`np-notes-${product.id}`}
                  >
                    Примітка
                  </label>
                  <input
                    id={`np-notes-${product.id}`}
                    type="text"
                    className="field"
                    placeholder="Необовʼязково"
                    value={newPurchase.notes}
                    onChange={(e) =>
                      setNewPurchase({
                        ...newPurchase,
                        notes: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary mt-5 w-full"
                onClick={addPurchase}
                disabled={!canAddPurchase}
              >
                Додати — покупку
              </button>
            </section>

            {product.purchases.length > 0 && (
              <section aria-labelledby={`history-${product.id}`}>
                <div className="mb-4">
                  <p className="hero-eyebrow mb-2">Історія</p>
                  <h4
                    id={`history-${product.id}`}
                    className="fob-section-heading"
                  >
                    Історія покупок
                  </h4>
                </div>

                <ul className="pl-0 sm:pl-1">
                  {purchasesNewestFirst.map((purchase) => {
                    const isLatest = purchase.id === latestId;
                    return (
                      <li
                        key={purchase.id}
                        className={`history-row ${isLatest ? "is-latest" : ""}`}
                      >
                        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                            <span className="fob-section-heading text-xl">
                              {formatPrice(purchase.price)}
                            </span>
                            <span className="text-sm text-ink-muted">
                              · {purchase.quantity} шт
                            </span>
                            {isLatest && (
                              <span className="rounded-full bg-[var(--mint)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink">
                                остання
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="btn btn-secondary touch-btn"
                              onClick={() =>
                                onEditPurchase(product, purchase)
                              }
                            >
                              Редагувати
                            </button>
                            {product.purchases.length > 1 && (
                              <button
                                type="button"
                                className="btn btn-danger touch-btn"
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      "Видалити цей запис покупки?",
                                    )
                                  ) {
                                    onDeletePurchase(
                                      product.id,
                                      purchase.id,
                                    );
                                  }
                                }}
                              >
                                Видалити
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="form-stack">
                          <div>
                            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                              Дата покупки
                            </div>
                            <div className="mt-1 text-[15px] font-medium text-ink">
                              {formatDateUk(purchase.datePurchased)}
                            </div>
                          </div>

                          <div>
                            <label
                              className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted"
                              htmlFor={`ended-${purchase.id}`}
                            >
                              {purchase.dateEnded
                                ? "Дата закінчення"
                                : "Вказати дату закінчення"}
                            </label>
                            <DatePicker
                              id={`ended-${purchase.id}`}
                              className="mt-1"
                              value={purchase.dateEnded || ""}
                              onChange={(dateEnded) =>
                                onFixDateEnded(
                                  product.id,
                                  purchase.id,
                                  dateEnded,
                                )
                              }
                              allowClear
                              placeholder="Не вказано"
                            />
                          </div>
                        </div>

                        {(purchase.store || purchase.notes) && (
                          <div className="mt-3 space-y-1 text-sm leading-relaxed text-ink-soft">
                            {purchase.store ? (
                              <p>
                                <span className="text-ink-muted">
                                  Де куплено:
                                </span>{" "}
                                {purchase.store}
                              </p>
                            ) : null}
                            {purchase.notes ? <p>{purchase.notes}</p> : null}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
