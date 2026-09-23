import { auth } from "@/lib/auth";

/**
 * Require a signed-in user with an id.
 * Why this file exists: one place for "who is calling this action?"
 */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }

  return userId;
}
