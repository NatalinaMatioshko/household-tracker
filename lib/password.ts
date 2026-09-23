import bcrypt from "bcryptjs";

/** Hash a plain password for storage on User.passwordHash. */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/** Compare a plain password with a stored hash. */
export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}
