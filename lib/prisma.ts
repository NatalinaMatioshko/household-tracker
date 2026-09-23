import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton.
 * In Next.js dev, Hot Module Reload can create many clients without this guard.
 * Why this file exists: one shared DB connection helper for the whole app.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
