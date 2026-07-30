"use client";

import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import type { Product, ProductCategory } from "./types";
import {
  ACCENT_SWATCHES,
  CATEGORY_OPTIONS,
  defaultAccentForCategory,
  optionalText,
} from "./types";
import DatePicker from "./DatePicker";
import ImageUploadField from "./ImageUploadField";

export type AddProductFormHandle = {
  open: () => void;
};

interface AddProductFormProps {
  onAdd: (product: Product) => void;
  ref?: React.Ref<AddProductFormHandle>;
}

const emptyForm = () => ({
  name: "",
  category: "Гігієна" as ProductCategory,
  brand: "",
  image: undefined as string | undefined,
  accentColor: defaultAccentForCategory("Гігієна"),
  datePurchased: "",
  price: 0,
  quantity: 1,
  store: "",
  notes: "",
});

const AddProductForm: React.FC<AddProductFormProps> = ({ onAdd, ref }) => {
  const [open, setOpen] = useState(false);
  const [newProduct, setNewProduct] = useState(emptyForm);
  const sectionRef = useRef<HTMLElement>(null);
  const focusTimerRef = useRef<number | null>(null);

  const focusFirstField = () => {
    if (focusTimerRef.current != null) {
      window.clearTimeout(focusTimerRef.current);
    }
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    focusTimerRef.current = window.setTimeout(() => {
      const input = document.getElementById(
        "product-name",
      ) as HTMLInputElement | null;
      input?.focus({ preventScroll: true });
      focusTimerRef.current = null;
    }, 320);
  };

  const openForm = () => {
    setOpen(true);
    focusFirstField();
  };

  const closeForm = () => {
    setOpen(false);
  };

  useImperativeHandle(ref, () => ({
    open: openForm,
  }));

  useEffect(() => {
    return () => {
      if (focusTimerRef.current != null) {
        window.clearTimeout(focusTimerRef.current);
      }
    };
  }, []);

  const canSubmit =
    Boolean(newProduct.name.trim()) &&
    newProduct.price > 0 &&
    Boolean(newProduct.datePurchased);

  const addProduct = () => {
    if (!canSubmit) return;

    const product: Product = {
      id: crypto.randomUUID(),
      name: newProduct.name.trim(),
      category: newProduct.category,
      brand: optionalText(newProduct.brand),
      image: newProduct.image,
      accentColor: newProduct.accentColor,
      purchases: [
        {
          id: crypto.randomUUID(),
          datePurchased: newProduct.datePurchased,
          dateEnded: null,
          price: newProduct.price,
          quantity: newProduct.quantity || 1,
          store: optionalText(newProduct.store),
          notes: optionalText(newProduct.notes),
        },
      ],
    };

    onAdd(product);
    setNewProduct(emptyForm());
    setOpen(false);
  };

  return (
    <section
      ref={sectionRef}
      id="add-product"
      aria-labelledby="add-product-heading"
      className="add-form-shell animate-rise animate-delay-1 scroll-mt-16 sm:scroll-mt-20"
    >
      <div className={`add-form-trigger${open ? " is-hidden" : ""}`}>
        <button
          type="button"
          className="btn btn-primary add-form-trigger-btn"
          onClick={openForm}
          aria-expanded={open}
          aria-controls="add-product-panel"
        >
          <span aria-hidden="true">+</span>
          Новий запис
        </button>
      </div>

      <div
        id="add-product-panel"
        className={`add-form-panel${open ? " is-open" : ""}`}
        aria-hidden={!open}
        inert={open ? undefined : true}
      >
        <div className="add-form-panel-inner">
          <div className="section-surface add-form-compact overflow-hidden">
            <div className="add-form-header">
              <div className="add-form-header-row">
                <div className="add-form-header-copy">
                  <p className="hero-eyebrow">Новий запис</p>
                  <h2
                    id="add-product-heading"
                    className="add-form-title font-serif font-semibold text-ink"
                  >
                    Додати засіб
                  </h2>
                  <p className="add-form-lead">
                    Назва, категорія, фото, покупка, бренд і де куплено.
                  </p>
                </div>
                <button
                  type="button"
                  className="add-form-collapse-btn"
                  onClick={closeForm}
                  aria-label="Згорнути форму"
                >
                  <span className="add-form-collapse-icon" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2.25 7.75L6 4l3.75 3.75"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="add-form-collapse-label">Згорнути</span>
                </button>
              </div>
            </div>

            <div className="add-form-grid">
              <div className="add-form-span-2-desktop">
                <label className="label" htmlFor="product-name">
                  Назва
                </label>
                <input
                  id="product-name"
                  type="text"
                  className="field"
                  placeholder="Напр. Шампунь"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  autoComplete="off"
                  enterKeyHint="next"
                />
              </div>

              <div>
                <label className="label" htmlFor="product-brand">
                  Бренд
                </label>
                <input
                  id="product-brand"
                  type="text"
                  className="field"
                  placeholder="Напр. L'Oreal"
                  value={newProduct.brand}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, brand: e.target.value })
                  }
                  autoComplete="off"
                />
              </div>

              <div className="add-form-span-2">
                <span className="label" id="product-category-label">
                  Категорія
                </span>
                <div
                  className="pill-group pill-group-scroll"
                  role="group"
                  aria-labelledby="product-category-label"
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`pill-option${newProduct.category === option ? " is-selected" : ""}`}
                      aria-pressed={newProduct.category === option}
                      onClick={() =>
                        setNewProduct({
                          ...newProduct,
                          category: option,
                          accentColor:
                            newProduct.accentColor ===
                            defaultAccentForCategory(newProduct.category)
                              ? defaultAccentForCategory(option)
                              : newProduct.accentColor,
                        })
                      }
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="add-form-span-2">
                <ImageUploadField
                  id="product-image"
                  value={newProduct.image}
                  onChange={(image) => setNewProduct({ ...newProduct, image })}
                />
              </div>

              <div className="add-form-span-2">
                <span className="label" id="product-accent-label">
                  Колір акценту
                </span>
                <div
                  className="fob-swatch-row fob-swatch-row-touch"
                  role="radiogroup"
                  aria-labelledby="product-accent-label"
                >
                  {ACCENT_SWATCHES.map((swatch) => {
                    const selected =
                      newProduct.accentColor.toLowerCase() ===
                      swatch.toLowerCase();
                    return (
                      <button
                        key={swatch}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={`fob-swatch${selected ? " is-selected" : ""}`}
                        style={{ backgroundColor: swatch }}
                        onClick={() =>
                          setNewProduct({ ...newProduct, accentColor: swatch })
                        }
                        title={swatch}
                      />
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="label" htmlFor="product-date">
                  Дата покупки
                </label>
                <DatePicker
                  id="product-date"
                  value={newProduct.datePurchased}
                  onChange={(datePurchased) =>
                    setNewProduct({ ...newProduct, datePurchased })
                  }
                  placeholder="Оберіть дату"
                />
              </div>

              <div>
                <label className="label" htmlFor="product-price">
                  Ціна (₴)
                </label>
                <input
                  id="product-price"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  className="field"
                  placeholder="450"
                  value={newProduct.price || ""}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div>
                <label className="label" htmlFor="product-qty">
                  Кількість
                </label>
                <input
                  id="product-qty"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  className="field"
                  placeholder="1"
                  value={newProduct.quantity || ""}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      quantity: parseInt(e.target.value, 10) || 0,
                    })
                  }
                />
              </div>

              <div>
                <label className="label" htmlFor="product-store">
                  Де куплено
                </label>
                <input
                  id="product-store"
                  type="text"
                  className="field"
                  placeholder="Напр. АТБ, Rozetka"
                  value={newProduct.store}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, store: e.target.value })
                  }
                  autoComplete="off"
                />
              </div>

              <div className="add-form-span-2-desktop">
                <label className="label" htmlFor="product-notes">
                  Примітка
                </label>
                <input
                  id="product-notes"
                  type="text"
                  className="field"
                  placeholder="Необовʼязково"
                  value={newProduct.notes}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, notes: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="add-form-actions">
              <div className="add-form-actions-btns">
                <button
                  type="button"
                  className="btn btn-primary add-form-submit"
                  onClick={addProduct}
                  disabled={!canSubmit}
                >
                  Додати — засіб
                </button>
                <button
                  type="button"
                  className="btn btn-secondary add-form-cancel"
                  onClick={closeForm}
                >
                  Скасувати
                </button>
              </div>
              <p className="add-form-footnote">
                Дані зберігаються локально у вашому браузері.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AddProductForm;
