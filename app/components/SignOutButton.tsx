"use client";

import { logout } from "@/app/actions/auth";

/** Client wrapper: form + server action (works inside HouseholdTracker). */
export default function SignOutButton() {
  return (
    <form action={logout}>
      <button type="submit" className="btn btn-secondary site-nav-cta">
        Вийти
      </button>
    </form>
  );
}
