"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, type AuthFormState } from "@/app/actions/auth";

const initialState: AuthFormState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <main className="auth-shell">
      <div className="auth-card section-surface">
        <p className="hero-eyebrow">Вхід</p>
        <h1 className="auth-title font-serif font-semibold text-ink">
          Увійти в Household Tracker
        </h1>
        <p className="auth-lead">
          Дані зберігаються у вашому акаунті — доступні з будь-якого браузера.
        </p>

        <form action={formAction} className="auth-form">
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="field"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Пароль
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="field"
              autoComplete="current-password"
              required
            />
          </div>

          {state.error ? (
            <p className="auth-error" role="alert">
              {state.error}
            </p>
          ) : null}

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={pending}
          >
            {pending ? "Вхід…" : "Увійти"}
          </button>
        </form>

        <p className="auth-footer">
          Немає акаунта?{" "}
          <Link href="/register" className="auth-link">
            Зареєструватися
          </Link>
        </p>
      </div>
    </main>
  );
}
