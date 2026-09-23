"use server";

import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { signIn, signOut } from "@/lib/auth";

export type AuthFormState = {
  error?: string;
};

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** Create a new user, then sign them in (JWT cookie). */
export async function register(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = getString(formData, "name");
  const email = getString(formData, "email").toLowerCase();
  const password = getString(formData, "password");

  if (!email || !email.includes("@")) {
    return { error: "Вкажіть коректний email." };
  }
  if (password.length < 8) {
    return { error: "Пароль має містити щонайменше 8 символів." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Користувач з таким email уже існує." };
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.create({
    data: {
      email,
      name: name || null,
      passwordHash,
    },
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Акаунт створено, але вхід не вдався. Спробуйте увійти." };
    }
    throw error;
  }

  return {};
}

/** Sign in with email + password. */
export async function login(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = getString(formData, "email").toLowerCase();
  const password = getString(formData, "password");

  if (!email || !password) {
    return { error: "Вкажіть email і пароль." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Невірний email або пароль." };
    }
    throw error;
  }

  return {};
}

/** Clear the session cookie and go to login. */
export async function logout() {
  await signOut({ redirectTo: "/login" });
}
