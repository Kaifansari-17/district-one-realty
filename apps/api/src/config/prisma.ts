import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";
import { env, isDevelopment } from "./env";
import { logger } from "@/utils/logger";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Uses the mariadb driver adapter (JS-native, no Rust query engine binary) instead of the
// default library engine — the Rust engine's embedded tokio runtime panics with "PANIC: timer
// has gone away" on some CPU-throttled shared-hosting environments once its process is
// paused/resumed by the host's process manager.
const adapter = new PrismaMariaDb(env.DATABASE_URL);

export const prisma =
  global.__prisma ??
  new PrismaClient({
    adapter,
    log: isDevelopment ? ["warn", "error"] : ["error"],
  });

if (isDevelopment) {
  global.__prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  logger.info("MySQL connected via Prisma");
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
