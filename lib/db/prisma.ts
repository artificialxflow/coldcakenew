import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

let prismaInstance: PrismaClient;

try {
  prismaInstance =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });

  // Don't connect at import time so build/prerender doesn't require DB
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prismaInstance;
  }
} catch (error) {
  console.error('❌ [DEPLOY] Failed to initialize Prisma Client');
  console.error('❌ [DEPLOY] Error:', error instanceof Error ? error.message : String(error));
  throw error;
}

export const prisma = prismaInstance;
