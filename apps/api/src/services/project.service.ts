import { Prisma, PublishStatus } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { ApiError } from "@/utils/ApiError";
import { generateUniqueSlug } from "@/utils/generateUniqueSlug";
import { buildPaginationMeta, parsePagination } from "@/utils/pagination";
import { getPrimaryImagesForOwners, listMedia } from "@/services/media.service";
import { assertCanAccessProject, isStaff } from "@/utils/ownership";
import type { AuthenticatedUser } from "@/types/express";

const PUBLIC_INCLUDE = { builder: true, location: { include: { city: true } } } satisfies Prisma.ProjectInclude;

export async function listPublicProjects(query: { location?: string; builder?: string; featured?: string; page?: unknown; limit?: unknown }) {
  const { page, limit, skip, take } = parsePagination(query);
  const where: Prisma.ProjectWhereInput = { isPublished: true };

  if (query.location) where.location = { slug: query.location };
  if (query.builder) where.builder = { slug: query.builder };
  if (query.featured === "true") where.isFeatured = true;

  const [projects, total] = await Promise.all([
    prisma.project.findMany({ where, include: PUBLIC_INCLUDE, orderBy: { createdAt: "desc" }, skip, take }),
    prisma.project.count({ where }),
  ]);

  const imageMap = await getPrimaryImagesForOwners("PROJECT_GALLERY", projects.map((p) => p.id));
  const items = projects.map((p) => ({ ...p, primaryImage: imageMap.get(p.id) ?? null }));

  return { items, pagination: buildPaginationMeta(page, limit, total) };
}

/** Powers the homepage's "Our Developer Network" location tabs — one project per locality, dynamically. */
export async function listPublicProjectsGroupedByLocation() {
  const locations = await prisma.location.findMany({
    where: { isActive: true, projects: { some: { isPublished: true } } },
    orderBy: { name: "asc" },
  });

  const grouped = await Promise.all(
    locations.map(async (location) => {
      const projects = await prisma.project.findMany({
        where: { locationId: location.id, isPublished: true },
        include: PUBLIC_INCLUDE,
        orderBy: { createdAt: "desc" },
        take: 8,
      });
      const imageMap = await getPrimaryImagesForOwners("PROJECT_GALLERY", projects.map((p) => p.id));
      return {
        location: { id: location.id, name: location.name, slug: location.slug },
        projects: projects.map((p) => ({ ...p, primaryImage: imageMap.get(p.id) ?? null })),
      };
    })
  );

  return grouped.filter((g) => g.projects.length > 0);
}

export async function getProjectBySlug(slug: string) {
  const project = await prisma.project.findUnique({
    where: { slug },
    include: { ...PUBLIC_INCLUDE, amenities: { include: { amenity: true } } },
  });

  if (!project || !project.isPublished) throw ApiError.notFound("Project not found");

  const [gallery, brochure, masterPlan, availableUnits] = await Promise.all([
    listMedia("PROJECT_GALLERY", project.id),
    listMedia("PROJECT_BROCHURE", project.id),
    listMedia("PROJECT_MASTER_PLAN", project.id),
    prisma.property.findMany({
      where: { projectId: project.id, publishStatus: PublishStatus.PUBLISHED },
      include: { propertyType: true, category: true, purpose: true },
      orderBy: { price: "asc" },
    }),
  ]);

  const unitImageMap = await getPrimaryImagesForOwners("PROPERTY_IMAGE", availableUnits.map((u) => u.id));

  return {
    ...project,
    amenities: project.amenities.map((a) => a.amenity),
    gallery,
    brochure: brochure[0] ?? null,
    masterPlan: masterPlan[0] ?? null,
    availableUnits: availableUnits.map((u) => ({ ...u, primaryImage: unitImageMap.get(u.id) ?? null })),
  };
}

export async function listAdminProjects(query: Record<string, unknown>, user: AuthenticatedUser) {
  const { page, limit, skip, take } = parsePagination(query);
  const where: Prisma.ProjectWhereInput = {};

  if (!isStaff(user)) where.agents = { some: { agentId: user.id } };
  if (query.isPublished === "true") where.isPublished = true;
  if (query.isPublished === "false") where.isPublished = false;
  if (query.locationId) where.locationId = String(query.locationId);
  if (query.builderId) where.builderId = String(query.builderId);
  if (typeof query.q === "string" && query.q.trim()) where.name = { contains: query.q.trim() };

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      include: { builder: true, location: true, agents: { include: { agent: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.project.count({ where }),
  ]);

  return { items: projects, pagination: buildPaginationMeta(page, limit, total) };
}

export async function getAdminProjectById(id: string, user: AuthenticatedUser) {
  await assertCanAccessProject(user, id);

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      builder: true,
      location: true,
      amenities: { include: { amenity: true } },
      agents: { include: { agent: true } },
      properties: true,
    },
  });
  if (!project) throw ApiError.notFound("Project not found");

  const [gallery, brochure, masterPlan] = await Promise.all([
    listMedia("PROJECT_GALLERY", project.id),
    listMedia("PROJECT_BROCHURE", project.id),
    listMedia("PROJECT_MASTER_PLAN", project.id),
  ]);

  return {
    ...project,
    amenities: project.amenities.map((a) => a.amenity),
    gallery,
    brochure: brochure[0] ?? null,
    masterPlan: masterPlan[0] ?? null,
  };
}

interface ProjectInput {
  name: string;
  builderId: string;
  locationId: string;
  status: string;
  description?: string;
  reraNumber?: string;
  launchDate?: string;
  possessionDate?: string;
  startingPrice?: number;
  configurations?: string[];
  totalTowers?: number;
  totalFloors?: number;
  totalUnits?: number;
  latitude?: number;
  longitude?: number;
  metaTitle?: string;
  metaDescription?: string;
  isFeatured?: boolean;
  isPublished?: boolean;
  amenityIds?: string[];
  agentIds?: string[];
}

async function assertReferencesExist(data: Partial<ProjectInput>) {
  const [builder, location] = await Promise.all([
    data.builderId ? prisma.builder.findUnique({ where: { id: data.builderId } }) : undefined,
    data.locationId ? prisma.location.findUnique({ where: { id: data.locationId } }) : undefined,
  ]);
  if (data.builderId && !builder) throw ApiError.badRequest("Invalid builderId");
  if (data.locationId && !location) throw ApiError.badRequest("Invalid locationId");
}

function extractRelationInput({ amenityIds, agentIds, ...rest }: ProjectInput) {
  return { rest, amenityIds, agentIds };
}

// Project creation is Admin/Super Admin only (enforced at the route level), same as properties.
export async function createProject(data: ProjectInput): Promise<{ id: string }> {
  await assertReferencesExist(data);

  const slug = await generateUniqueSlug(data.name, async (candidate) => {
    const existing = await prisma.project.findUnique({ where: { slug: candidate } });
    return Boolean(existing);
  });

  const { rest, amenityIds, agentIds } = extractRelationInput(data);

  return prisma.project.create({
    data: {
      ...rest,
      slug,
      configurations: rest.configurations as Prisma.InputJsonValue | undefined,
      launchDate: rest.launchDate ? new Date(rest.launchDate) : undefined,
      possessionDate: rest.possessionDate ? new Date(rest.possessionDate) : undefined,
      amenities: amenityIds ? { create: amenityIds.map((amenityId) => ({ amenityId })) } : undefined,
      agents: agentIds ? { create: agentIds.map((agentId) => ({ agentId })) } : undefined,
    } as Prisma.ProjectUncheckedCreateInput,
  });
}

export async function updateProject(id: string, data: Partial<ProjectInput>, user: AuthenticatedUser) {
  await assertCanAccessProject(user, id);
  await assertReferencesExist(data);

  if (data.agentIds && !isStaff(user)) {
    throw ApiError.forbidden("Only Admin/Super Admin can reassign agents on a project");
  }
  if (data.isFeatured !== undefined && !isStaff(user)) {
    throw ApiError.forbidden("Only Admin/Super Admin can feature a project");
  }

  const { rest, amenityIds, agentIds } = extractRelationInput(data as ProjectInput);

  if (amenityIds) await prisma.projectAmenity.deleteMany({ where: { projectId: id } });
  if (agentIds) await prisma.projectAgent.deleteMany({ where: { projectId: id } });

  let slug: string | undefined;
  if (rest.name) {
    slug = await generateUniqueSlug(rest.name, async (candidate) => {
      const existing = await prisma.project.findUnique({ where: { slug: candidate } });
      return Boolean(existing && existing.id !== id);
    });
  }

  return prisma.project.update({
    where: { id },
    data: {
      ...rest,
      ...(slug ? { slug } : {}),
      configurations: rest.configurations as Prisma.InputJsonValue | undefined,
      launchDate: rest.launchDate ? new Date(rest.launchDate) : undefined,
      possessionDate: rest.possessionDate ? new Date(rest.possessionDate) : undefined,
      amenities: amenityIds ? { create: amenityIds.map((amenityId) => ({ amenityId })) } : undefined,
      agents: agentIds ? { create: agentIds.map((agentId) => ({ agentId })) } : undefined,
    } as Prisma.ProjectUncheckedUpdateInput,
  });
}

async function setPublished(id: string, user: AuthenticatedUser, isPublished: boolean) {
  await assertCanAccessProject(user, id);
  return prisma.project.update({ where: { id }, data: { isPublished } });
}

export const publishProject = (id: string, user: AuthenticatedUser) => setPublished(id, user, true);
export const unpublishProject = (id: string, user: AuthenticatedUser) => setPublished(id, user, false);

export async function setProjectFeatured(id: string, isFeatured: boolean) {
  return prisma.project.update({ where: { id }, data: { isFeatured } });
}

/** Admin/Super Admin only. */
export async function deleteProject(id: string) {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw ApiError.notFound("Project not found");
  const propertyCount = await prisma.property.count({ where: { projectId: id } });
  if (propertyCount > 0) {
    throw ApiError.conflict("This project has properties assigned and cannot be deleted");
  }
  await prisma.project.delete({ where: { id } });
}
