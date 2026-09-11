import { UserRole } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { ApiError } from "@/utils/ApiError";
import { generateOpaqueToken, hashPassword } from "@/utils/hash";
import { buildPaginationMeta, parsePagination } from "@/utils/pagination";

const STAFF_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  designation: true,
  bio: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function listStaff(query: { page?: unknown; limit?: unknown; role?: unknown; isActive?: unknown; q?: unknown }) {
  const { page, limit, skip, take } = parsePagination(query);
  // Staff accounts (Admin + Agent) live in the same table as Super Admin — this list only ever
  // shows manageable staff, never other Super Admins.
  const where: Record<string, unknown> = { role: { not: UserRole.SUPER_ADMIN } };

  if (query.role === UserRole.ADMIN || query.role === UserRole.AGENT) where.role = query.role;
  if (query.isActive === "true") where.isActive = true;
  if (query.isActive === "false") where.isActive = false;
  if (typeof query.q === "string" && query.q.trim()) {
    where.OR = [{ name: { contains: query.q.trim() } }, { email: { contains: query.q.trim() } }];
  }

  const [items, total] = await Promise.all([
    prisma.user.findMany({ where, select: STAFF_SELECT, skip, take, orderBy: { name: "asc" } }),
    prisma.user.count({ where }),
  ]);

  return { items, pagination: buildPaginationMeta(page, limit, total) };
}

export async function getStaffById(id: string) {
  const user = await prisma.user.findUnique({ where: { id }, select: STAFF_SELECT });
  if (!user) throw ApiError.notFound("Staff member not found");
  return user;
}

interface CreateStaffInput {
  name: string;
  email: string;
  phone?: string;
  designation?: string;
  bio?: string;
  role: UserRole;
  password?: string;
}

export async function createStaff(data: CreateStaffInput) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw ApiError.conflict("A user with this email already exists");

  const temporaryPassword = data.password ?? generateOpaqueToken().slice(0, 16);
  const passwordHash = await hashPassword(temporaryPassword);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      designation: data.designation,
      bio: data.bio,
      role: data.role,
      passwordHash,
    },
    select: STAFF_SELECT,
  });

  return { user, temporaryPassword: data.password ? undefined : temporaryPassword };
}

interface UpdateStaffInput {
  name?: string;
  phone?: string;
  designation?: string;
  bio?: string;
  isActive?: boolean;
}

export async function updateStaff(id: string, data: UpdateStaffInput) {
  await getStaffById(id);
  return prisma.user.update({ where: { id }, data, select: STAFF_SELECT });
}

export async function setStaffActive(id: string, isActive: boolean) {
  await getStaffById(id);
  const user = await prisma.user.update({ where: { id }, data: { isActive }, select: STAFF_SELECT });

  if (!isActive) {
    // Deactivation should end active sessions immediately, not just block new logins.
    await prisma.refreshToken.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } });
  }

  return user;
}

export async function resetStaffPassword(id: string): Promise<string> {
  await getStaffById(id);
  const newPassword = generateOpaqueToken().slice(0, 16);
  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({ where: { id }, data: { passwordHash } }),
    prisma.refreshToken.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } }),
  ]);

  return newPassword;
}

export async function getAgentAssignments(agentId: string) {
  const [properties, projects, leadCount, siteVisitCount] = await Promise.all([
    prisma.propertyAgent.findMany({ where: { agentId }, include: { property: true } }),
    prisma.projectAgent.findMany({ where: { agentId }, include: { project: true } }),
    prisma.lead.count({ where: { agentId } }),
    prisma.siteVisit.count({ where: { agentId } }),
  ]);

  return {
    properties: properties.map((p) => p.property),
    projects: projects.map((p) => p.project),
    leadCount,
    siteVisitCount,
  };
}
