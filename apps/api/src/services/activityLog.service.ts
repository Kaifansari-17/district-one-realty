import { prisma } from "@/config/prisma";
import { toJsonColumn } from "@/utils/jsonColumn";

export async function logActivity(
  userId: string,
  action: string,
  entity: string,
  entityId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await prisma.activityLog.create({
    data: { userId, action, entity, entityId, metadata: toJsonColumn(metadata) },
  });
}
