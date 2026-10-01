import Link from "next/link";
import ImportJsonForm from "@/app/components/ImportJsonForm";

export default function ImportPage() {
  return (
    <main className="auth-shell">
      <div className="auth-card section-surface" style={{ maxWidth: "40rem" }}>
        <p className="hero-eyebrow">Одноразовий імпорт</p>
        <h1 className="auth-title font-serif font-semibold text-ink">
          Імпорт зі старого JSON
        </h1>
        <p className="auth-lead">
          Вставте масив із ключа{" "}
          <code className="text-[13px]">householdProducts</code>. Дані
          потраплять лише у ваш поточний акаунт. Імпорт не запускається
          автоматично.
        </p>

        <ImportJsonForm />

        <p className="auth-footer mt-6">
          <Link href="/" className="auth-link">
            ← На головну
          </Link>
        </p>
      </div>
    </main>
  );
}
