import { PublishStatus } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { ApiError } from "@/utils/ApiError";
import { generateUniqueSlug } from "@/utils/generateUniqueSlug";
import { buildPaginationMeta, parsePagination } from "@/utils/pagination";
import { attachBuilderLogos, attachPrimaryImages, listMedia } from "@/services/media.service";

const PUBLISHED_PROPERTY_WHERE = { publishStatus: PublishStatus.PUBLISHED };

export async function listPublicLocations() {
  const locations = await prisma.location.findMany({
    where: { isActive: true },
    include: { city: { include: { state: { include: { country: true } } } } },
    orderBy: { name: "asc" },
  });

  const counts = await prisma.property.groupBy({
    by: ["locationId"],
    where: PUBLISHED_PROPERTY_WHERE,
    _count: { _all: true },
  });
  const countMap = new Map(counts.map((c) => [c.locationId, c._count._all]));

  return Promise.all(
    locations.map(async (location) => ({
      id: location.id,
      name: location.name,
      slug: location.slug,
      description: location.description,
      image: (await listMedia("LOCATION_IMAGE", location.id))[0] ?? null,
      pincode: location.pincode,
      latitude: location.latitude,
      longitude: location.longitude,
      city: location.city.name,
      state: location.city.state.name,
      country: location.city.state.country.name,
      propertyCount: countMap.get(location.id) ?? 0,
    }))
  );
}

export async function getLocationBySlug(slug: string) {
  const location = await prisma.location.findUnique({
    where: { slug },
    include: { city: { include: { state: true } } },
  });

  if (!location || !location.isActive) {
    throw ApiError.notFound("Location not found");
  }

  const [image, propertyCount, projects, builders, popularConfigurations] = await Promise.all([
    listMedia("LOCATION_IMAGE", location.id).then((m) => m[0] ?? null),
    prisma.property.count({ where: { locationId: location.id, ...PUBLISHED_PROPERTY_WHERE } }),
    prisma.project.findMany({
      where: { locationId: location.id, isPublished: true },
      include: { builder: true, location: true },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.builder.findMany({
      where: { isActive: true, properties: { some: { locationId: location.id, ...PUBLISHED_PROPERTY_WHERE } } },
      take: 12,
    }),
    prisma.property.groupBy({
      by: ["bedrooms"],
      where: { locationId: location.id, ...PUBLISHED_PROPERTY_WHERE, bedrooms: { not: null } },
      _count: { _all: true },
      orderBy: { bedrooms: "asc" },
    }),
  ]);

  return {
    id: location.id,
    name: location.name,
    slug: location.slug,
    description: location.description,
    image,
    pincode: location.pincode,
    latitude: location.latitude,
    longitude: location.longitude,
    metaTitle: location.metaTitle,
    metaDescription: location.metaDescription,
    city: location.city.name,
    state: location.city.state.name,
    propertyCount,
    projects: await attachPrimaryImages(projects, "PROJECT_GALLERY"),
    builders: await attachBuilderLogos(builders),
    popularConfigurations: popularConfigurations.map((c) => ({ bedrooms: c.bedrooms, count: c._count._all })),
  };
}

export async function listAdminLocations(query: { page?: unknown; limit?: unknown; isActive?: unknown; q?: unknown }) {
  const { page, limit, skip, take } = parsePagination(query);
  const where: Record<string, unknown> = {};

  if (query.isActive === "true") where.isActive = true;
  if (query.isActive === "false") where.isActive = false;
  if (typeof query.q === "string" && query.q.trim()) where.name = { contains: query.q.trim() };

  const [items, total] = await Promise.all([
    prisma.location.findMany({
      where,
      skip,
      take,
      orderBy: { name: "asc" },
      include: { city: true, _count: { select: { properties: true, projects: true } } },
    }),
    prisma.location.count({ where }),
  ]);

  return { items, pagination: buildPaginationMeta(page, limit, total) };
}

export async function getAdminLocationById(id: string) {
  const location = await prisma.location.findUnique({ where: { id }, include: { city: true } });
  if (!location) throw ApiError.notFound("Location not found");
  return location;
}

interface LocationInput {
  name: string;
  cityId: string;
  description?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  metaTitle?: string;
  metaDescription?: string;
  isActive?: boolean;
}

export async function createLocation(data: LocationInput) {
  const city = await prisma.city.findUnique({ where: { id: data.cityId } });
  if (!city) throw ApiError.badRequest("Invalid cityId");

  const slug = await generateUniqueSlug(data.name, async (candidate) => {
    const existing = await prisma.location.findUnique({ where: { slug: candidate } });
    return Boolean(existing);
  });

  return prisma.location.create({ data: { ...data, slug } });
}

export async function updateLocation(id: string, data: Partial<LocationInput>) {
  await getAdminLocationById(id);

  if (data.cityId) {
    const city = await prisma.city.findUnique({ where: { id: data.cityId } });
    if (!city) throw ApiError.badRequest("Invalid cityId");
  }

  let slug: string | undefined;
  if (data.name) {
    slug = await generateUniqueSlug(data.name, async (candidate) => {
      const existing = await prisma.location.findUnique({ where: { slug: candidate } });
      return Boolean(existing && existing.id !== id);
    });
  }

  return prisma.location.update({ where: { id }, data: { ...data, ...(slug ? { slug } : {}) } });
}

export async function deleteLocation(id: string) {
  await getAdminLocationById(id);
  const usageCount = await prisma.property.count({ where: { locationId: id } });
  if (usageCount > 0) {
    throw ApiError.conflict("This location has properties assigned and cannot be deleted");
  }
  await prisma.location.delete({ where: { id } });
}
