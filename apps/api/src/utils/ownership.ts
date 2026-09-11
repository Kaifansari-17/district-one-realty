import { UserRole } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { ApiError } from "@/utils/ApiError";
import type { AuthenticatedUser } from "@/types/express";

const STAFF_ROLES: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.ADMIN];

export function isStaff(user: AuthenticatedUser): boolean {
  return STAFF_ROLES.includes(user.role);
}

/** Throws 403 unless the requester is Admin/Super Admin or an agent assigned to the property. */
export async function assertCanAccessProperty(user: AuthenticatedUser, propertyId: string): Promise<void> {
  if (isStaff(user)) return;

  const assignment = await prisma.propertyAgent.findUnique({
    where: { propertyId_agentId: { propertyId, agentId: user.id } },
  });
  if (!assignment) {
    throw ApiError.forbidden("You are not assigned to this property");
  }
}

export async function assertCanAccessProject(user: AuthenticatedUser, projectId: string): Promise<void> {
  if (isStaff(user)) return;

  const assignment = await prisma.projectAgent.findUnique({
    where: { projectId_agentId: { projectId, agentId: user.id } },
  });
  if (!assignment) {
    throw ApiError.forbidden("You are not assigned to this project");
  }
}

/** Leads/site visits carry a direct `agentId`, so ownership is a simple equality check. */
export function assertOwnsAssignment(user: AuthenticatedUser, assignedAgentId: string | null): void {
  if (isStaff(user)) return;
  if (assignedAgentId !== user.id) {
    throw ApiError.forbidden("You are not assigned to this record");
  }
}
