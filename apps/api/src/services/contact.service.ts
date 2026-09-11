import { prisma } from "@/config/prisma";
import { ApiError } from "@/utils/ApiError";
import { buildPaginationMeta, parsePagination } from "@/utils/pagination";

interface ContactInput {
  name: string;
  phone: string;
  email?: string;
  message: string;
  website?: string; // honeypot
}

export async function createContactMessage(data: ContactInput): Promise<void> {
  if (data.website) return; // honeypot tripped — silently drop

  await prisma.contactMessage.create({
    data: { name: data.name, phone: data.phone, email: data.email, message: data.message },
  });
}

export async function listContactMessages(query: { page?: unknown; limit?: unknown; isRead?: unknown }) {
  const { page, limit, skip, take } = parsePagination(query);
  const where: Record<string, unknown> = {};
  if (query.isRead === "true") where.isRead = true;
  if (query.isRead === "false") where.isRead = false;

  const [items, total] = await Promise.all([
    prisma.contactMessage.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
    prisma.contactMessage.count({ where }),
  ]);

  return { items, pagination: buildPaginationMeta(page, limit, total) };
}

export async function markContactMessageRead(id: string, isRead: boolean) {
  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (!message) throw ApiError.notFound("Message not found");
  return prisma.contactMessage.update({ where: { id }, data: { isRead } });
}
