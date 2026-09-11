import { LeadStatus, PublishStatus, SiteVisitStatus } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { isStaff } from "@/utils/ownership";
import type { AuthenticatedUser } from "@/types/express";

const THIRTY_DAYS_AGO = () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

export async function getDashboardStats(user: AuthenticatedUser) {
  const staff = isStaff(user);
  const propertyScope = staff ? {} : { agents: { some: { agentId: user.id } } };
  const leadScope = staff ? {} : { agentId: user.id };
  const siteVisitScope = staff ? {} : { agentId: user.id };
  const projectScope = staff ? {} : { agents: { some: { agentId: user.id } } };

  const [
    totalProperties,
    activeProperties,
    totalProjects,
    totalBuilders,
    totalAgents,
    newLeadsCount,
    upcomingSiteVisits,
    leadsOverTime,
    propertyInventoryByStatus,
    leadCountByAgent,
    recentLeads,
    recentProperties,
  ] = await Promise.all([
    prisma.property.count({ where: propertyScope }),
    prisma.property.count({ where: { ...propertyScope, publishStatus: PublishStatus.PUBLISHED } }),
    prisma.project.count({ where: projectScope }),
    staff ? prisma.builder.count() : Promise.resolve(undefined),
    staff ? prisma.user.count({ where: { role: "AGENT" } }) : Promise.resolve(undefined),
    prisma.lead.count({ where: { ...leadScope, status: LeadStatus.NEW } }),
    prisma.siteVisit.findMany({
      where: {
        ...siteVisitScope,
        preferredDate: { gte: new Date() },
        status: { in: [SiteVisitStatus.REQUESTED, SiteVisitStatus.CONFIRMED] },
      },
      include: { property: true, project: true },
      orderBy: { preferredDate: "asc" },
      take: 10,
    }),
    prisma.lead.groupBy({
      by: ["createdAt"],
      where: { ...leadScope, createdAt: { gte: THIRTY_DAYS_AGO() } },
      _count: { _all: true },
    }),
    prisma.property.groupBy({ by: ["status"], where: propertyScope, _count: { _all: true } }),
    staff
      ? prisma.lead.groupBy({ by: ["agentId"], where: { agentId: { not: null } }, _count: { _all: true } })
      : Promise.resolve([]),
    prisma.lead.findMany({ where: leadScope, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.property.findMany({
      where: propertyScope,
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { location: true },
    }),
  ]);

  // Group lead counts by calendar day — groupBy on a DateTime column groups by the exact
  // timestamp, not by day, so bucket in application code instead.
  const leadsByDay = new Map<string, number>();
  for (const row of leadsOverTime) {
    const day = row.createdAt.toISOString().slice(0, 10);
    leadsByDay.set(day, (leadsByDay.get(day) ?? 0) + row._count._all);
  }

  const agentIds = leadCountByAgent.map((row) => row.agentId).filter((id): id is string => Boolean(id));
  const agents = agentIds.length > 0 ? await prisma.user.findMany({ where: { id: { in: agentIds } }, select: { id: true, name: true } }) : [];
  const agentNameById = new Map(agents.map((a) => [a.id, a.name]));

  return {
    cards: {
      totalProperties,
      activeProperties,
      totalProjects,
      totalBuilders,
      totalAgents,
      newLeads: newLeadsCount,
      upcomingSiteVisitsCount: upcomingSiteVisits.length,
    },
    charts: {
      leadsOverTime: Array.from(leadsByDay.entries()).map(([date, count]) => ({ date, count })),
      propertyInventoryByStatus: propertyInventoryByStatus.map((row) => ({ status: row.status, count: row._count._all })),
      agentPerformance: leadCountByAgent.map((row) => ({
        agentId: row.agentId,
        agentName: row.agentId ? (agentNameById.get(row.agentId) ?? "Unknown") : "Unassigned",
        leadCount: row._count._all,
      })),
    },
    recentActivity: {
      newLeads: recentLeads,
      upcomingSiteVisits,
      recentProperties,
    },
  };
}
