import { Prisma } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { ApiError } from "@/utils/ApiError";
import { buildPaginationMeta, parsePagination } from "@/utils/pagination";
import { assertOwnsAssignment, isStaff } from "@/utils/ownership";
import type { AuthenticatedUser } from "@/types/express";
import type { LeadSource } from "@prisma/client";

interface CreateInquiryInput {
  name: string;
  phone: string;
  email?: string;
  propertyId?: string;
  projectId?: string;
  message?: string;
  source: LeadSource;
  website?: string; // honeypot
}

export async function createInquiry(data: CreateInquiryInput): Promise<void> {
  // Honeypot: a real visitor never fills this hidden field in; a bot that autofills every
  // input will. Pretend success without writing anything, so the bot gets no signal.
  if (data.website) return;

  if (data.propertyId) {
    const property = await prisma.property.findUnique({ where: { id: data.propertyId } });
    if (!property) throw ApiError.badRequest("Invalid propertyId");
  }
  if (data.projectId) {
    const project = await prisma.project.findUnique({ where: { id: data.projectId } });
    if (!project) throw ApiError.badRequest("Invalid projectId");
  }

  await prisma.lead.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email,
      propertyId: data.propertyId,
      projectId: data.projectId,
      message: data.message,
      source: data.source,
    },
  });
}

export async function listLeads(query: Record<string, unknown>, user: AuthenticatedUser) {
  const { page, limit, skip, take } = parsePagination(query);
  const where: Prisma.LeadWhereInput = {};

  if (!isStaff(user)) where.agentId = user.id;
  else if (query.agentId) where.agentId = String(query.agentId);

  if (query.status) where.status = query.status as Prisma.EnumLeadStatusFilter["equals"];
  if (query.source) where.source = query.source as Prisma.EnumLeadSourceFilter["equals"];
  if (query.priority) where.priority = query.priority as Prisma.EnumLeadPriorityFilter["equals"];
  if (query.projectId) where.projectId = String(query.projectId);
  if (query.propertyId) where.propertyId = String(query.propertyId);

  const dateFrom = query.dateFrom ? new Date(String(query.dateFrom)) : undefined;
  const dateTo = query.dateTo ? new Date(String(query.dateTo)) : undefined;
  if (dateFrom || dateTo) {
    where.createdAt = { ...(dateFrom ? { gte: dateFrom } : {}), ...(dateTo ? { lte: dateTo } : {}) };
  }

  const [items, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: { property: true, project: true, agent: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.lead.count({ where }),
  ]);

  return { items, pagination: buildPaginationMeta(page, limit, total) };
}

export async function getLeadById(id: string, user: AuthenticatedUser) {
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      property: true,
      project: true,
      agent: { select: { id: true, name: true, email: true, phone: true } },
      notes: { include: { createdBy: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" } },
      siteVisits: true,
    },
  });
  if (!lead) throw ApiError.notFound("Lead not found");

  assertOwnsAssignment(user, lead.agentId);
  return lead;
}

interface UpdateLeadInput {
  status?: string;
  priority?: string;
  agentId?: string | null;
}

export async function updateLead(id: string, data: UpdateLeadInput, user: AuthenticatedUser) {
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) throw ApiError.notFound("Lead not found");
  assertOwnsAssignment(user, lead.agentId);

  if (data.agentId !== undefined && !isStaff(user)) {
    throw ApiError.forbidden("Only Admin/Super Admin can assign or reassign leads");
  }

  if (data.agentId) {
    const agent = await prisma.user.findUnique({ where: { id: data.agentId } });
    if (!agent || !agent.isActive) throw ApiError.badRequest("Invalid agentId");
  }

  return prisma.lead.update({ where: { id }, data: data as Prisma.LeadUncheckedUpdateInput });
}

export async function addLeadNote(id: string, text: string, user: AuthenticatedUser) {
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) throw ApiError.notFound("Lead not found");
  assertOwnsAssignment(user, lead.agentId);

  return prisma.leadNote.create({
    data: { leadId: id, text, createdById: user.id },
    include: { createdBy: { select: { id: true, name: true } } },
  });
}
