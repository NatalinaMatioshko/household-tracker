"use client";

import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import type { NewProductInput, ProductCategory } from "./types";
import { CATEGORY_LABELS, CATEGORY_OPTIONS, optionalText } from "./types";
import DatePicker from "./DatePicker";

export type AddProductFormHandle = {
  open: () => void;
};

interface AddProductFormProps {
  onAdd: (input: NewProductInput) => Promise<void> | void;
  error?: string | null;
  ref?: React.Ref<AddProductFormHandle>;
}

const emptyForm = () => ({
  name: "",
  category: "HYGIENE" as ProductCategory,
  datePurchased: "",
  price: 0,
  quantity: 1,
  notes: "",
});

const AddProductForm: React.FC<AddProductFormProps> = ({
  onAdd,
  error,
  ref,
}) => {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
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
    Boolean(newProduct.datePurchased) &&
    !pending;

  const addProduct = async () => {
    if (!canSubmit) return;
    setPending(true);
    try {
      await onAdd({
        name: newProduct.name.trim(),
        category: newProduct.category,
        datePurchased: newProduct.datePurchased,
        price: newProduct.price,
        quantity: newProduct.quantity || 1,
        notes: optionalText(newProduct.notes),
      });
      setNewProduct(emptyForm());
      setOpen(false);
    } finally {
      setPending(false);
    }
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
        className="add-form-panel"
        aria-hidden={!open}
        inert={!open ? true : undefined}
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
                    Назва, категорія, дата покупки, ціна й кількість.
                  </p>
                </div>
                <button
                  type="button"
                  className="add-form-collapse-btn"
                  onClick={closeForm}
                  aria-label="Згорнути форму"
                >
                  <span className="add-form-collapse-label">Згорнути</span>
                </button>
              </div>
            </div>

            <div className="add-form-grid">
              <div className="add-form-span-2">
                <label className="label" htmlFor="product-name">
                  Назва
                </label>
                <input
                  id="product-name"
                  type="text"
                  className="field"
                  placeholder="Напр. Шампунь"
                  autoComplete="off"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                />
              </div>

              <div className="add-form-span-2">
                <span className="label" id="product-category-label">
                  Категорія
                </span>
                <div
                  className="pill-group"
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
                        setNewProduct({ ...newProduct, category: option })
                      }
                    >
                      {CATEGORY_LABELS[option]}
                    </button>
                  ))}
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

              <div className="add-form-span-2">
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

            {error ? (
              <p className="auth-error" role="alert" style={{ margin: "1rem" }}>
                {error}
              </p>
            ) : null}

            <div className="add-form-actions">
              <div className="add-form-actions-btns">
                <button
                  type="button"
                  className="btn btn-primary add-form-submit"
                  onClick={addProduct}
                  disabled={!canSubmit}
                >
                  {pending ? "Збереження…" : "Додати — засіб"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary add-form-cancel"
                  onClick={closeForm}
                  disabled={pending}
                >
                  Скасувати
                </button>
              </div>
              <p className="add-form-footnote">
                Дані зберігаються у вашому акаунті (PostgreSQL).
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AddProductForm;
