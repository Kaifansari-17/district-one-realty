import { Prisma, PublishStatus } from "@prisma/client";
import type { PropertyFilterQuery } from "@district-one/shared-types";
import { prisma } from "@/config/prisma";
import { ApiError } from "@/utils/ApiError";
import { generateUniqueSlug } from "@/utils/generateUniqueSlug";
import { buildPaginationMeta, parsePagination } from "@/utils/pagination";
import { toQueryArray } from "@/utils/queryArray";
import { getPrimaryImagesForOwners, listMedia } from "@/services/media.service";
import { assertCanAccessProperty, isStaff } from "@/utils/ownership";
import type { AuthenticatedUser } from "@/types/express";

const PUBLIC_INCLUDE = {
  location: { include: { city: true } },
  builder: true,
  project: true,
  propertyType: true,
  category: true,
  purpose: true,
} satisfies Prisma.PropertyInclude;

function buildPublicWhere(query: Record<string, unknown>): Prisma.PropertyWhereInput {
  const where: Prisma.PropertyWhereInput = { publishStatus: PublishStatus.PUBLISHED };

  if (query.purpose) where.purpose = { slug: String(query.purpose) };
  if (query.location) where.location = { slug: String(query.location) };
  if (query.builder) where.builder = { slug: String(query.builder) };
  if (query.project) where.project = { slug: String(query.project) };
  if (query.propertyType) where.propertyType = { slug: String(query.propertyType) };
  if (query.category) where.category = { slug: String(query.category) };
  if (query.status) where.status = query.status as Prisma.EnumPropertyStatusFilter["equals"];
  if (query.furnishing) where.furnishing = query.furnishing as Prisma.EnumFurnishingTypeNullableFilter["equals"];
  if (query.featured === "true") where.featured = true;
  if (query.rera === "true") where.reraNumber = { not: null };

  const bhkValues = toQueryArray(query.bhk).map(Number).filter(Number.isFinite);
  if (bhkValues.length > 0) where.bedrooms = { in: bhkValues };

  const amenitySlugs = toQueryArray(query.amenities);
  if (amenitySlugs.length > 0) {
    where.amenities = { some: { amenity: { slug: { in: amenitySlugs } } } };
  }

  const minPrice = query.minPrice ? Number(query.minPrice) : undefined;
  const maxPrice = query.maxPrice ? Number(query.maxPrice) : undefined;
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = { ...(minPrice !== undefined ? { gte: minPrice } : {}), ...(maxPrice !== undefined ? { lte: maxPrice } : {}) };
  }

  const minArea = query.minArea ? Number(query.minArea) : undefined;
  const maxArea = query.maxArea ? Number(query.maxArea) : undefined;
  if (minArea !== undefined || maxArea !== undefined) {
    where.carpetArea = { ...(minArea !== undefined ? { gte: minArea } : {}), ...(maxArea !== undefined ? { lte: maxArea } : {}) };
  }

  if (query.possession) {
    const year = Number(query.possession);
    if (Number.isFinite(year)) {
      where.possessionDate = { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) };
    }
  }

  if (typeof query.q === "string" && query.q.trim()) {
    const search = query.q.trim();
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { location: { name: { contains: search } } },
      { builder: { name: { contains: search } } },
      { project: { name: { contains: search } } },
    ];
  }

  return where;
}

function buildOrderBy(sort: string | undefined): Prisma.PropertyOrderByWithRelationInput {
  switch (sort) {
    case "price_asc":
      return { price: "asc" };
    case "price_desc":
      return { price: "desc" };
    case "area_asc":
      return { carpetArea: "asc" };
    case "area_desc":
      return { carpetArea: "desc" };
    default:
      return { createdAt: "desc" };
  }
}

export async function listPublicProperties(query: PropertyFilterQuery & Record<string, unknown>) {
  const { page, limit, skip, take } = parsePagination(query);
  const where = buildPublicWhere(query);
  const orderBy = buildOrderBy(query.sort as string | undefined);

  const [properties, total] = await Promise.all([
    prisma.property.findMany({ where, include: PUBLIC_INCLUDE, orderBy, skip, take }),
    prisma.property.count({ where }),
  ]);

  const imageMap = await getPrimaryImagesForOwners("PROPERTY_IMAGE", properties.map((p) => p.id));

  const items = properties.map((property) => ({ ...property, primaryImage: imageMap.get(property.id) ?? null }));

  return { items, pagination: buildPaginationMeta(page, limit, total) };
}

export async function getPropertyBySlug(slug: string) {
  const property = await prisma.property.findUnique({
    where: { slug },
    include: {
      ...PUBLIC_INCLUDE,
      amenities: { include: { amenity: true } },
      features: { include: { feature: true } },
    },
  });

  if (!property || property.publishStatus !== PublishStatus.PUBLISHED) {
    throw ApiError.notFound("Property not found");
  }

  const [images, videos, floorPlans, documents, similar] = await Promise.all([
    listMedia("PROPERTY_IMAGE", property.id),
    listMedia("PROPERTY_VIDEO", property.id),
    listMedia("PROPERTY_FLOOR_PLAN", property.id),
    listMedia("PROPERTY_DOCUMENT", property.id),
    prisma.property.findMany({
      where: {
        id: { not: property.id },
        publishStatus: PublishStatus.PUBLISHED,
        locationId: property.locationId,
        propertyTypeId: property.propertyTypeId,
      },
      include: PUBLIC_INCLUDE,
      take: 4,
    }),
  ]);

  const similarImageMap = await getPrimaryImagesForOwners("PROPERTY_IMAGE", similar.map((p) => p.id));

  return {
    ...property,
    amenities: property.amenities.map((a) => a.amenity),
    features: property.features.map((f) => f.feature),
    images,
    videos,
    floorPlans,
    documents,
    similarProperties: similar.map((p) => ({ ...p, primaryImage: similarImageMap.get(p.id) ?? null })),
  };
}

export async function listAdminProperties(query: Record<string, unknown>, user: AuthenticatedUser) {
  const { page, limit, skip, take } = parsePagination(query);
  const where: Prisma.PropertyWhereInput = {};

  if (!isStaff(user)) {
    where.agents = { some: { agentId: user.id } };
  }

  if (query.status) where.status = query.status as Prisma.EnumPropertyStatusFilter["equals"];
  if (query.publishStatus) where.publishStatus = query.publishStatus as Prisma.EnumPublishStatusFilter["equals"];
  if (query.locationId) where.locationId = String(query.locationId);
  if (query.builderId) where.builderId = String(query.builderId);
  if (query.projectId) where.projectId = String(query.projectId);
  if (typeof query.q === "string" && query.q.trim()) where.title = { contains: query.q.trim() };

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: { location: true, builder: true, project: true, agents: { include: { agent: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.property.count({ where }),
  ]);

  const imageMap = await getPrimaryImagesForOwners("PROPERTY_IMAGE", properties.map((p) => p.id));
  const items = properties.map((p) => ({ ...p, primaryImage: imageMap.get(p.id) ?? null }));

  return { items, pagination: buildPaginationMeta(page, limit, total) };
}

export async function getAdminPropertyById(id: string, user: AuthenticatedUser) {
  await assertCanAccessProperty(user, id);

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      location: true,
      builder: true,
      project: true,
      propertyType: true,
      category: true,
      purpose: true,
      amenities: { include: { amenity: true } },
      features: { include: { feature: true } },
      agents: { include: { agent: true } },
    },
  });

  if (!property) throw ApiError.notFound("Property not found");

  const [images, videos, floorPlans, documents] = await Promise.all([
    listMedia("PROPERTY_IMAGE", property.id),
    listMedia("PROPERTY_VIDEO", property.id),
    listMedia("PROPERTY_FLOOR_PLAN", property.id),
    listMedia("PROPERTY_DOCUMENT", property.id),
  ]);

  return {
    ...property,
    amenities: property.amenities.map((a) => a.amenity),
    features: property.features.map((f) => f.feature),
    images,
    videos,
    floorPlans,
    documents,
  };
}

interface PropertyInput {
  title: string;
  projectId?: string;
  builderId?: string;
  locationId: string;
  propertyTypeId: string;
  categoryId: string;
  purposeId: string;
  description?: string;
  price: number;
  priceUnit?: string;
  carpetArea?: number;
  builtUpArea?: number;
  superBuiltUpArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  balconies?: number;
  floorNumber?: number;
  totalFloors?: number;
  parking?: number;
  facing?: string;
  furnishing?: string;
  propertyAge?: number;
  possessionDate?: string;
  reraNumber?: string;
  status: string;
  publishStatus?: string;
  featured?: boolean;
  verified?: boolean;
  latitude?: number;
  longitude?: number;
  metaTitle?: string;
  metaDescription?: string;
  amenityIds?: string[];
  featureIds?: string[];
  agentIds?: string[];
}

async function assertReferencesExist(data: Partial<PropertyInput>) {
  const [location, propertyType, category, purpose, project, builder] = await Promise.all([
    data.locationId ? prisma.location.findUnique({ where: { id: data.locationId } }) : undefined,
    data.propertyTypeId ? prisma.propertyType.findUnique({ where: { id: data.propertyTypeId } }) : undefined,
    data.categoryId ? prisma.propertyCategory.findUnique({ where: { id: data.categoryId } }) : undefined,
    data.purposeId ? prisma.purpose.findUnique({ where: { id: data.purposeId } }) : undefined,
    data.projectId ? prisma.project.findUnique({ where: { id: data.projectId } }) : undefined,
    data.builderId ? prisma.builder.findUnique({ where: { id: data.builderId } }) : undefined,
  ]);

  if (data.locationId && !location) throw ApiError.badRequest("Invalid locationId");
  if (data.propertyTypeId && !propertyType) throw ApiError.badRequest("Invalid propertyTypeId");
  if (data.categoryId && !category) throw ApiError.badRequest("Invalid categoryId");
  if (data.purposeId && !purpose) throw ApiError.badRequest("Invalid purposeId");
  if (data.projectId && !project) throw ApiError.badRequest("Invalid projectId");
  if (data.builderId && !builder) throw ApiError.badRequest("Invalid builderId");
}

function extractRelationInput({ amenityIds, featureIds, agentIds, ...rest }: PropertyInput) {
  return { rest, amenityIds, featureIds, agentIds };
}

// Property creation is Admin/Super Admin only (enforced at the route level) — agents receive
// properties via assignment, matching the spec's admin flow ("Add Property ... Assign to Agent").
export async function createProperty(data: PropertyInput): Promise<{ id: string }> {
  await assertReferencesExist(data);

  const slug = await generateUniqueSlug(data.title, async (candidate) => {
    const existing = await prisma.property.findUnique({ where: { slug: candidate } });
    return Boolean(existing);
  });

  const { rest, amenityIds, featureIds, agentIds } = extractRelationInput(data);

  const property = await prisma.property.create({
    data: {
      ...rest,
      slug,
      possessionDate: rest.possessionDate ? new Date(rest.possessionDate) : undefined,
      amenities: amenityIds ? { create: amenityIds.map((amenityId) => ({ amenityId })) } : undefined,
      features: featureIds ? { create: featureIds.map((featureId) => ({ featureId })) } : undefined,
      agents: agentIds ? { create: agentIds.map((agentId) => ({ agentId })) } : undefined,
    } as Prisma.PropertyUncheckedCreateInput,
  });

  return property;
}

export async function updateProperty(id: string, data: Partial<PropertyInput>, user: AuthenticatedUser) {
  await assertCanAccessProperty(user, id);
  await assertReferencesExist(data);

  if (data.agentIds && !isStaff(user)) {
    throw ApiError.forbidden("Only Admin/Super Admin can reassign agents on a property");
  }
  if ((data.verified !== undefined || data.featured !== undefined) && !isStaff(user)) {
    throw ApiError.forbidden("Only Admin/Super Admin can verify or feature a property");
  }

  const { rest, amenityIds, featureIds, agentIds } = extractRelationInput(data as PropertyInput);

  if (amenityIds) {
    await prisma.propertyAmenity.deleteMany({ where: { propertyId: id } });
  }
  if (featureIds) {
    await prisma.propertyFeature.deleteMany({ where: { propertyId: id } });
  }
  if (agentIds) {
    await prisma.propertyAgent.deleteMany({ where: { propertyId: id } });
  }

  let slug: string | undefined;
  if (rest.title) {
    slug = await generateUniqueSlug(rest.title, async (candidate) => {
      const existing = await prisma.property.findUnique({ where: { slug: candidate } });
      return Boolean(existing && existing.id !== id);
    });
  }

  return prisma.property.update({
    where: { id },
    data: {
      ...rest,
      ...(slug ? { slug } : {}),
      possessionDate: rest.possessionDate ? new Date(rest.possessionDate) : undefined,
      amenities: amenityIds ? { create: amenityIds.map((amenityId) => ({ amenityId })) } : undefined,
      features: featureIds ? { create: featureIds.map((featureId) => ({ featureId })) } : undefined,
      agents: agentIds ? { create: agentIds.map((agentId) => ({ agentId })) } : undefined,
    } as Prisma.PropertyUncheckedUpdateInput,
  });
}

async function setPublishStatus(id: string, user: AuthenticatedUser, status: PublishStatus) {
  await assertCanAccessProperty(user, id);
  return prisma.property.update({ where: { id }, data: { publishStatus: status } });
}

export const publishProperty = (id: string, user: AuthenticatedUser) => setPublishStatus(id, user, PublishStatus.PUBLISHED);
export const unpublishProperty = (id: string, user: AuthenticatedUser) => setPublishStatus(id, user, PublishStatus.DRAFT);
export const archiveProperty = (id: string, user: AuthenticatedUser) => setPublishStatus(id, user, PublishStatus.ARCHIVED);

export async function setPropertyFeatured(id: string, featured: boolean) {
  return prisma.property.update({ where: { id }, data: { featured } });
}

export async function setPropertyVerified(id: string, verified: boolean) {
  return prisma.property.update({ where: { id }, data: { verified } });
}

/** Admin/Super Admin only — deliberately not exposed to agents even for their own assigned properties. */
export async function deleteProperty(id: string) {
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) throw ApiError.notFound("Property not found");
  await prisma.property.delete({ where: { id } });
}
