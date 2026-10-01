"use client";

import React from "react";
import type { ProductCategory } from "./types";
import { CATEGORY_LABELS, CATEGORY_OPTIONS } from "./types";
import Modal from "./Modal";

export interface EditingProductState {
  isOpen: boolean;
  productId: string | null;
  name: string;
  brand: string;
  category: ProductCategory;
}

export const emptyEditingProduct = (): EditingProductState => ({
  isOpen: false,
  productId: null,
  name: "",
  brand: "",
  category: "HYGIENE",
});

interface EditProductModalProps {
  editingProduct: EditingProductState;
  onChange: (state: EditingProductState) => void;
  onSave: () => void;
  onCancel: () => void;
  pending?: boolean;
  error?: string | null;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  editingProduct,
  onChange,
  onSave,
  onCancel,
  pending = false,
  error,
}) => {
  if (!editingProduct.isOpen) return null;

  const canSave = Boolean(editingProduct.name.trim()) && !pending;

  return (
    <Modal title="Редагувати засіб" onClose={onCancel}>
      <div className="space-y-5">
        <div>
          <label className="label" htmlFor="edit-product-name">
            Назва
          </label>
          <input
            id="edit-product-name"
            type="text"
            className="field"
            value={editingProduct.name}
            onChange={(e) =>
              onChange({ ...editingProduct, name: e.target.value })
            }
          />
        </div>

        <div>
          <label className="label" htmlFor="edit-product-brand">
            Бренд
          </label>
          <input
            id="edit-product-brand"
            type="text"
            className="field"
            value={editingProduct.brand}
            onChange={(e) =>
              onChange({ ...editingProduct, brand: e.target.value })
            }
            placeholder="Необовʼязково"
          />
        </div>

        <div>
          <span className="label" id="edit-product-category-label">
            Категорія
          </span>
          <div
            className="pill-group"
            role="group"
            aria-labelledby="edit-product-category-label"
          >
            {CATEGORY_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={`pill-option${editingProduct.category === option ? " is-selected" : ""}`}
                aria-pressed={editingProduct.category === option}
                onClick={() =>
                  onChange({
                    ...editingProduct,
                    category: option,
                  })
                }
              >
                {CATEGORY_LABELS[option]}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <p className="auth-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div className="modal-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={pending}
        >
          Скасувати
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onSave}
          disabled={!canSave}
        >
          {pending ? "Збереження…" : "Зберегти"}
        </button>
      </div>
    </Modal>
  );
};

export default EditProductModal;
