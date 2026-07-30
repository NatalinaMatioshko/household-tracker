"use client";

import React from "react";
import Modal from "./Modal";
import DatePicker from "./DatePicker";

export interface EditingPurchaseState {
  isOpen: boolean;
  productId: string | null;
  purchaseId: string | null;
  datePurchased: string;
  dateEnded: string;
  price: number;
  quantity: number;
  store: string;
  notes: string;
}

export const emptyEditingPurchase = (): EditingPurchaseState => ({
  isOpen: false,
  productId: null,
  purchaseId: null,
  datePurchased: "",
  dateEnded: "",
  price: 0,
  quantity: 1,
  store: "",
  notes: "",
});

interface EditPurchaseModalProps {
  editingPurchase: EditingPurchaseState;
  onChange: (state: EditingPurchaseState) => void;
  onSave: () => void;
  onCancel: () => void;
}

const EditPurchaseModal: React.FC<EditPurchaseModalProps> = ({
  editingPurchase,
  onChange,
  onSave,
  onCancel,
}) => {
  if (!editingPurchase.isOpen) return null;

  const canSave = Boolean(editingPurchase.datePurchased);

  return (
    <Modal title="Редагувати покупку" onClose={onCancel} wide>
      <div className="form-stack">
        <div>
          <label className="label" htmlFor="edit-purchase-date">
            Дата покупки
          </label>
          <DatePicker
            id="edit-purchase-date"
            value={editingPurchase.datePurchased}
            onChange={(datePurchased) =>
              onChange({ ...editingPurchase, datePurchased })
            }
            placeholder="Оберіть дату"
          />
        </div>

        <div>
          <label className="label" htmlFor="edit-purchase-ended">
            Дата закінчення
          </label>
          <DatePicker
            id="edit-purchase-ended"
            value={editingPurchase.dateEnded}
            onChange={(dateEnded) =>
              onChange({ ...editingPurchase, dateEnded })
            }
            allowClear
            placeholder="Необовʼязково"
          />
        </div>

        <div>
          <label className="label" htmlFor="edit-purchase-price">
            Ціна (₴)
          </label>
          <input
            id="edit-purchase-price"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            className="field"
            value={editingPurchase.price || ""}
            onChange={(e) =>
              onChange({
                ...editingPurchase,
                price: parseFloat(e.target.value) || 0,
              })
            }
          />
        </div>

        <div>
          <label className="label" htmlFor="edit-purchase-qty">
            Кількість
          </label>
          <input
            id="edit-purchase-qty"
            type="number"
            inputMode="numeric"
            min={1}
            className="field"
            value={editingPurchase.quantity || ""}
            onChange={(e) =>
              onChange({
                ...editingPurchase,
                quantity: parseInt(e.target.value, 10) || 0,
              })
            }
          />
        </div>

        <div>
          <label className="label" htmlFor="edit-purchase-store">
            Де куплено
          </label>
          <input
            id="edit-purchase-store"
            type="text"
            className="field"
            value={editingPurchase.store}
            onChange={(e) =>
              onChange({
                ...editingPurchase,
                store: e.target.value,
              })
            }
            placeholder="Напр. АТБ, Rozetka"
          />
        </div>

        <div>
          <label className="label" htmlFor="edit-purchase-notes">
            Примітка
          </label>
          <input
            id="edit-purchase-notes"
            type="text"
            className="field"
            value={editingPurchase.notes}
            onChange={(e) =>
              onChange({
                ...editingPurchase,
                notes: e.target.value,
              })
            }
            placeholder="Необовʼязково"
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

export default EditPurchaseModal;
