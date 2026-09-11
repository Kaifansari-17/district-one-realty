import { PublishStatus } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { ApiError } from "@/utils/ApiError";
import { generateUniqueSlug } from "@/utils/generateUniqueSlug";
import { buildPaginationMeta, parsePagination } from "@/utils/pagination";
import { attachPrimaryImages, listMedia } from "@/services/media.service";

export async function listPublicBuilders() {
  const builders = await prisma.builder.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  return Promise.all(
    builders.map(async (builder) => ({
      ...builder,
      logo: (await listMedia("BUILDER_LOGO", builder.id))[0] ?? null,
    }))
  );
}

export async function getBuilderBySlug(slug: string) {
  const builder = await prisma.builder.findUnique({ where: { slug } });
  if (!builder || !builder.isActive) throw ApiError.notFound("Builder not found");

  const [logo, projectsRaw, propertyCount] = await Promise.all([
    listMedia("BUILDER_LOGO", builder.id).then((m) => m[0] ?? null),
    prisma.project.findMany({
      where: { builderId: builder.id, isPublished: true },
      include: { location: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.property.count({ where: { builderId: builder.id, publishStatus: PublishStatus.PUBLISHED } }),
  ]);

  // Every project here already belongs to `builder` — attach it directly instead of re-querying.
  const projectsWithBuilder = projectsRaw.map((project) => ({ ...project, builder }));
  const projects = await attachPrimaryImages(projectsWithBuilder, "PROJECT_GALLERY");

  return { ...builder, logo, projects, propertyCount };
}

export async function listAdminBuilders(query: { page?: unknown; limit?: unknown; isActive?: unknown; q?: unknown }) {
  const { page, limit, skip, take } = parsePagination(query);
  const where: Record<string, unknown> = {};
  if (query.isActive === "true") where.isActive = true;
  if (query.isActive === "false") where.isActive = false;
  if (typeof query.q === "string" && query.q.trim()) where.name = { contains: query.q.trim() };

  const [items, total] = await Promise.all([
    prisma.builder.findMany({
      where,
      skip,
      take,
      orderBy: { name: "asc" },
      include: { _count: { select: { properties: true, projects: true } } },
    }),
    prisma.builder.count({ where }),
  ]);

  return { items, pagination: buildPaginationMeta(page, limit, total) };
}

export async function getAdminBuilderById(id: string) {
  const builder = await prisma.builder.findUnique({ where: { id } });
  if (!builder) throw ApiError.notFound("Builder not found");
  return builder;
}

interface BuilderInput {
  name: string;
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  establishedYear?: number;
  metaTitle?: string;
  metaDescription?: string;
  isActive?: boolean;
}

export async function createBuilder(data: BuilderInput) {
  const slug = await generateUniqueSlug(data.name, async (candidate) => {
    const existing = await prisma.builder.findUnique({ where: { slug: candidate } });
    return Boolean(existing);
  });
  return prisma.builder.create({ data: { ...data, slug } });
}

export async function updateBuilder(id: string, data: Partial<BuilderInput>) {
  await getAdminBuilderById(id);

  let slug: string | undefined;
  if (data.name) {
    slug = await generateUniqueSlug(data.name, async (candidate) => {
      const existing = await prisma.builder.findUnique({ where: { slug: candidate } });
      return Boolean(existing && existing.id !== id);
    });
  }

  return prisma.builder.update({ where: { id }, data: { ...data, ...(slug ? { slug } : {}) } });
}

export async function deleteBuilder(id: string) {
  await getAdminBuilderById(id);
  const usageCount = await prisma.property.count({ where: { builderId: id } });
  if (usageCount > 0) {
    throw ApiError.conflict("This builder has properties assigned and cannot be deleted");
  }
  await prisma.builder.delete({ where: { id } });
}
