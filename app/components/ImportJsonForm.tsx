"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CATEGORY_LABELS,
  formatDateUk,
  formatPrice,
} from "./types";
import {
  parseLegacyProductsJson,
  type ImportableProduct,
  type LegacyParseResult,
} from "@/lib/legacyImport";
import {
  importLocalProducts,
  type ImportLocalResult,
} from "@/app/actions/import";

type Step = "paste" | "preview" | "done";

const ImportJsonForm: React.FC = () => {
  const router = useRouter();
  const [rawJson, setRawJson] = useState("");
  const [step, setStep] = useState<Step>("paste");
  const [preview, setPreview] = useState<LegacyParseResult | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportLocalResult | null>(null);

  const products: ImportableProduct[] = preview?.products ?? [];

  const canImport = useMemo(
    () => Boolean(preview && preview.products.length > 0 && !preview.parseError),
    [preview],
  );

  const buildPreview = () => {
    setError(null);
    const parsed = parseLegacyProductsJson(rawJson);
    setPreview(parsed);
    if (parsed.parseError) {
      setError(parsed.parseError);
      setStep("paste");
      return;
    }
    if (parsed.products.length === 0) {
      setError(
        "Немає валідних засобів для імпорту (потрібні категорії «Гігієна» або «Догляд»).",
      );
      setStep("paste");
      return;
    }
    setStep("preview");
  };

  const runImport = async () => {
    if (!preview || preview.products.length === 0) return;
    setPending(true);
    setError(null);
    try {
      const response = await importLocalProducts({
        products: preview.products.map((product) => ({
          name: product.name,
          category: product.category,
          purchases: product.purchases.map((purchase) => ({
            datePurchased: purchase.datePurchased,
            dateEnded: purchase.dateEnded,
            price: purchase.price,
            quantity: purchase.quantity,
            notes: purchase.notes,
          })),
        })),
      });
      if (!response.ok) {
        setError(response.error);
        return;
      }
      setResult(response.data);
      setStep("done");
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-6">
      {step === "paste" ? (
        <>
          <div>
            <label className="label" htmlFor="legacy-json">
              JSON з localStorage (`householdProducts`)
            </label>
            <textarea
              id="legacy-json"
              className="field min-h-[220px] font-mono text-[13px] leading-relaxed"
              placeholder='[{"name":"Шампунь","category":"Гігієна","purchases":[…]}]'
              value={rawJson}
              onChange={(e) => setRawJson(e.target.value)}
              spellCheck={false}
            />
            <p className="mt-2 text-sm text-ink-muted">
              Імпортуються лише name, category, purchases (datePurchased,
              dateEnded, price, quantity, notes). Поля image, brand, store,
              accentColor ігноруються. Категорії поза «Гігієна» / «Догляд»
              пропускаються.
            </p>
          </div>

          {error ? (
            <p className="auth-error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-primary"
              onClick={buildPreview}
              disabled={!rawJson.trim()}
            >
              Переглянути
            </button>
            <Link href="/" className="btn btn-secondary">
              На головну
            </Link>
          </div>
        </>
      ) : null}

      {step === "preview" && preview ? (
        <>
          <div className="rounded-[14px] border border-[var(--stone-line)] bg-[color-mix(in_srgb,var(--cream)_70%,#fff)] px-4 py-4 text-sm text-ink-soft">
            <p>
              Засобів до імпорту: <strong>{preview.products.length}</strong>
            </p>
            <p>
              Покупок до імпорту: <strong>{preview.purchaseCount}</strong>
            </p>
            <p>
              Пропущено невалідних записів:{" "}
              <strong>{preview.skippedInvalidRecords}</strong>
              {preview.skippedInvalidRecords > 0
                ? ` (${preview.skippedProducts} засобів, ${preview.skippedPurchases} покупок)`
                : null}
            </p>
          </div>

          <ul className="max-h-[420px] space-y-3 overflow-y-auto">
            {products.map((product, index) => (
              <li
                key={`${product.name}-${product.category}-${index}`}
                className="rounded-[14px] border border-[var(--stone-line)] px-4 py-3"
              >
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="font-serif text-lg font-semibold text-ink">
                    {product.name}
                  </span>
                  <span className="text-sm text-ink-muted">
                    {CATEGORY_LABELS[product.category]}
                  </span>
                  <span className="text-sm text-ink-muted">
                    · {product.purchases.length} покупок
                  </span>
                </div>
                {product.purchases.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-sm text-ink-soft">
                    {product.purchases.slice(0, 5).map((purchase, pIndex) => (
                      <li key={`${purchase.datePurchased}-${pIndex}`}>
                        {formatDateUk(purchase.datePurchased)}
                        {" · "}
                        {formatPrice(purchase.price)}
                        {" · "}
                        {purchase.quantity} шт
                        {purchase.dateEnded
                          ? ` · до ${formatDateUk(purchase.dateEnded)}`
                          : ""}
                      </li>
                    ))}
                    {product.purchases.length > 5 ? (
                      <li className="text-ink-muted">
                        …і ще {product.purchases.length - 5}
                      </li>
                    ) : null}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>

          {error ? (
            <p className="auth-error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-primary"
              onClick={runImport}
              disabled={!canImport || pending}
            >
              {pending ? "Імпорт…" : "Імпортувати в мій акаунт"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setStep("paste");
                setError(null);
              }}
              disabled={pending}
            >
              Назад
            </button>
          </div>
        </>
      ) : null}

      {step === "done" && result ? (
        <>
          <div className="rounded-[14px] border border-[var(--stone-line)] bg-[color-mix(in_srgb,var(--mint)_18%,#fff)] px-4 py-4 text-[15px] leading-relaxed text-ink-soft">
            <p className="font-serif text-xl font-semibold text-ink">
              Імпорт завершено
            </p>
            <ul className="mt-3 space-y-1 text-sm">
              <li>Створено засобів: {result.productsCreated}</li>
              <li>Перевикористано наявних: {result.productsReused}</li>
              <li>Додано покупок: {result.purchasesCreated}</li>
              <li>Пропущено дублікатів покупок: {result.purchasesSkipped}</li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/" className="btn btn-primary">
              До списку засобів
            </Link>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setStep("paste");
                setPreview(null);
                setResult(null);
                setError(null);
              }}
            >
              Імпортувати ще
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ImportJsonForm;
