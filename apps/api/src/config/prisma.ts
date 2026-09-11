import { PrismaClient } from "@prisma/client";
import { isDevelopment } from "./env";
import { logger } from "@/utils/logger";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
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
