"use client";

import React from "react";
import type { ProductCategory } from "./types";
import {
  ACCENT_SWATCHES,
  CATEGORY_OPTIONS,
  defaultAccentForCategory,
} from "./types";
import Modal from "./Modal";
import ImageUploadField from "./ImageUploadField";

export interface EditingProductState {
  isOpen: boolean;
  productId: string | null;
  name: string;
  category: ProductCategory;
  brand: string;
  image?: string;
  accentColor: string;
}

export const emptyEditingProduct = (): EditingProductState => ({
  isOpen: false,
  productId: null,
  name: "",
  category: "Гігієна",
  brand: "",
  image: undefined,
  accentColor: ACCENT_SWATCHES[2],
});

interface EditProductModalProps {
  editingProduct: EditingProductState;
  onChange: (state: EditingProductState) => void;
  onSave: () => void;
  onCancel: () => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  editingProduct,
  onChange,
  onSave,
  onCancel,
}) => {
  if (!editingProduct.isOpen) return null;

  const canSave = Boolean(editingProduct.name.trim());

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

        <ImageUploadField
          id="edit-product-image"
          value={editingProduct.image}
          onChange={(image) => onChange({ ...editingProduct, image })}
        />

        <div>
          <span className="label" id="edit-product-category-label">
            Категорія
          </span>
          <div
            className="pill-group pill-group-scroll"
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
                    accentColor:
                      editingProduct.accentColor ===
                        defaultAccentForCategory(editingProduct.category)
                        ? defaultAccentForCategory(option)
                        : editingProduct.accentColor,
                  })
                }
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="label" id="edit-product-accent-label">
            Колір акценту
          </span>
          <div
            className="fob-swatch-row fob-swatch-row-touch"
            role="radiogroup"
            aria-labelledby="edit-product-accent-label"
          >
            {ACCENT_SWATCHES.map((swatch) => {
              const selected =
                editingProduct.accentColor.toLowerCase() ===
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
                    onChange({ ...editingProduct, accentColor: swatch })
                  }
                  title={swatch}
                />
              );
            })}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="edit-product-brand">
            Бренд
          </label>
          <input
            id="edit-product-brand"
            type="text"
            className="field"
            placeholder="Напр. L'Oreal"
            value={editingProduct.brand}
            onChange={(e) =>
              onChange({ ...editingProduct, brand: e.target.value })
            }
          />
        </div>
      </div>

      <div className="modal-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Скасувати
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onSave}
          disabled={!canSave}
        >
          Зберегти
        </button>
      </div>
    </Modal>
  );
};

export default EditProductModal;
