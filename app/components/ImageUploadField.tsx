"use client";

import React, { useId, useRef, useState } from "react";
import { fileToCompressedDataUrl } from "./imageUtils";

interface ImageUploadFieldProps {
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  /** Compact slot for product cards; default is form-friendly block */
  variant?: "field" | "slot";
  label?: string;
  id?: string;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  value,
  onChange,
  variant = "field",
  label = "Фото",
  id: idProp,
}) => {
  const generatedId = useId();
  const inputId = idProp ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickFile = () => {
    inputRef.current?.click();
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      onChange(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Помилка завантаження");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = () => {
    onChange(undefined);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const fileInput = (
    <input
      ref={inputRef}
      id={inputId}
      type="file"
      accept="image/*"
      className="sr-only"
      disabled={busy}
      onChange={(e) => void handleFile(e.target.files?.[0])}
    />
  );

  if (variant === "slot") {
    return (
      <div className="fob-image-slot">
        {fileInput}
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="fob-image-slot-img" />
            <div className="fob-image-slot-actions">
              <button
                type="button"
                className="fob-image-slot-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  pickFile();
                }}
                disabled={busy}
              >
                {busy ? "…" : "Змінити"}
              </button>
              <button
                type="button"
                className="fob-image-slot-btn is-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  remove();
                }}
                disabled={busy}
              >
                Прибрати
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            className="fob-image-placeholder"
            onClick={(e) => {
              e.stopPropagation();
              pickFile();
            }}
            disabled={busy}
            aria-label="Додати фото засобу"
          >
            <span className="fob-bottle-silhouette" aria-hidden="true" />
            <span className="fob-image-placeholder-label">
              {busy ? "Завантаження…" : "Додати фото"}
            </span>
            <span className="fob-image-placeholder-cta">
              Натисніть тут
            </span>
          </button>
        )}
        {error ? <p className="fob-image-error">{error}</p> : null}
      </div>
    );
  }

  return (
    <div>
      <span className="label" id={`${inputId}-label`}>
        {label}
      </span>
      {fileInput}
      <div className="image-upload-field" aria-labelledby={`${inputId}-label`}>
        {value ? (
          <div className="image-upload-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="image-upload-preview-img" />
            <div className="image-upload-preview-actions">
              <button
                type="button"
                className="btn btn-secondary min-h-9 px-3 text-[11px]"
                onClick={pickFile}
                disabled={busy}
              >
                {busy ? "Завантаження…" : "Змінити фото"}
              </button>
              <button
                type="button"
                className="btn btn-danger min-h-9 px-3 text-[11px]"
                onClick={remove}
                disabled={busy}
              >
                Прибрати
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="image-upload-empty"
            onClick={pickFile}
            disabled={busy}
          >
            <span className="fob-bottle-silhouette is-sm" aria-hidden="true" />
            <span className="image-upload-empty-text">
              {busy ? "Завантаження…" : "Додати фото"}
            </span>
            <span className="image-upload-empty-hint">
              Натисніть, щоб обрати з галереї
            </span>
          </button>
        )}
      </div>
      {error ? (
        <p className="mt-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
};

export default ImageUploadField;
