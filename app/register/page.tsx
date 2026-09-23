"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register, type AuthFormState } from "@/app/actions/auth";

const initialState: AuthFormState = {};

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(register, initialState);

  return (
    <main className="auth-shell">
      <div className="auth-card section-surface">
        <p className="hero-eyebrow">Реєстрація</p>
        <h1 className="auth-title font-serif font-semibold text-ink">
          Створити акаунт
        </h1>
        <p className="auth-lead">
          Email і пароль — цього достатньо для MVP. Далі зможете вести свій
          список засобів.
        </p>

        <form action={formAction} className="auth-form">
          <div>
            <label className="label" htmlFor="name">
              Імʼя (необовʼязково)
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="field"
              autoComplete="name"
            />
          </div>
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
              autoComplete="new-password"
              minLength={8}
              required
            />
            <p className="auth-hint">Мінімум 8 символів.</p>
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
            {pending ? "Створення…" : "Зареєструватися"}
          </button>
        </form>

        <p className="auth-footer">
          Уже є акаунт?{" "}
          <Link href="/login" className="auth-link">
            Увійти
          </Link>
        </p>
      </div>
    </main>
  );
}
