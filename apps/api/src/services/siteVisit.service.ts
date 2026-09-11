import { LeadSource, Prisma, SiteVisitStatus } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { ApiError } from "@/utils/ApiError";
import { buildPaginationMeta, parsePagination } from "@/utils/pagination";
import { assertOwnsAssignment, isStaff } from "@/utils/ownership";
import type { AuthenticatedUser } from "@/types/express";

interface CreateSiteVisitInput {
  name: string;
  phone: string;
  email?: string;
  propertyId?: string;
  projectId?: string;
  preferredDate: string;
  preferredTime: string;
  message?: string;
  website?: string; // honeypot
}

/** A public site-visit request also creates its own Lead so it shows up in the funnel. */
export async function createSiteVisit(data: CreateSiteVisitInput): Promise<void> {
  if (data.website) return;

  if (data.propertyId) {
    const property = await prisma.property.findUnique({ where: { id: data.propertyId } });
    if (!property) throw ApiError.badRequest("Invalid propertyId");
  }
  if (data.projectId) {
    const project = await prisma.project.findUnique({ where: { id: data.projectId } });
    if (!project) throw ApiError.badRequest("Invalid projectId");
  }

  await prisma.$transaction(async (tx) => {
    const lead = await tx.lead.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        propertyId: data.propertyId,
        projectId: data.projectId,
        message: data.message,
        source: LeadSource.SITE_VISIT,
      },
    });

    await tx.siteVisit.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        propertyId: data.propertyId,
        projectId: data.projectId,
        preferredDate: new Date(data.preferredDate),
        preferredTime: data.preferredTime,
        message: data.message,
        leadId: lead.id,
      },
    });
  });
}

export async function listSiteVisits(query: Record<string, unknown>, user: AuthenticatedUser) {
  const { page, limit, skip, take } = parsePagination(query);
  const where: Prisma.SiteVisitWhereInput = {};

  if (!isStaff(user)) where.agentId = user.id;
  else if (query.agentId) where.agentId = String(query.agentId);
  if (query.status) where.status = query.status as Prisma.EnumSiteVisitStatusFilter["equals"];

  const [items, total] = await Promise.all([
    prisma.siteVisit.findMany({
      where,
      include: { property: true, project: true, agent: { select: { id: true, name: true } } },
      orderBy: { preferredDate: "asc" },
      skip,
      take,
    }),
    prisma.siteVisit.count({ where }),
  ]);

  return { items, pagination: buildPaginationMeta(page, limit, total) };
}

export async function getSiteVisitById(id: string, user: AuthenticatedUser) {
  const visit = await prisma.siteVisit.findUnique({
    where: { id },
    include: { property: true, project: true, agent: { select: { id: true, name: true } }, lead: true },
  });
  if (!visit) throw ApiError.notFound("Site visit not found");
  assertOwnsAssignment(user, visit.agentId);
  return visit;
}

interface UpdateSiteVisitInput {
  status?: SiteVisitStatus;
  agentId?: string | null;
  preferredDate?: string;
  preferredTime?: string;
}

export async function updateSiteVisit(id: string, data: UpdateSiteVisitInput, user: AuthenticatedUser) {
  const visit = await prisma.siteVisit.findUnique({ where: { id } });
  if (!visit) throw ApiError.notFound("Site visit not found");
  assertOwnsAssignment(user, visit.agentId);

  if (data.agentId !== undefined && !isStaff(user)) {
    throw ApiError.forbidden("Only Admin/Super Admin can assign or reassign site visits");
  }

  if (data.agentId) {
    const agent = await prisma.user.findUnique({ where: { id: data.agentId } });
    if (!agent || !agent.isActive) throw ApiError.badRequest("Invalid agentId");
  }

  return prisma.siteVisit.update({
    where: { id },
    data: {
      ...data,
      preferredDate: data.preferredDate ? new Date(data.preferredDate) : undefined,
    },
  });
}
