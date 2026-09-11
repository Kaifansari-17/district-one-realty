import { prisma } from "@/config/prisma";
import { ApiError } from "@/utils/ApiError";
import { generateUniqueSlug } from "@/utils/generateUniqueSlug";
import { buildPaginationMeta, parsePagination } from "@/utils/pagination";
import { listMedia } from "@/services/media.service";

export async function listPublicBlogs(query: { page?: unknown; limit?: unknown }) {
  const { page, limit, skip, take } = parsePagination(query);
  const where = { isPublished: true };

  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
      where,
      include: { author: { select: { id: true, name: true } } },
      orderBy: { publishedAt: "desc" },
      skip,
      take,
    }),
    prisma.blog.count({ where }),
  ]);

  const items = await Promise.all(
    blogs.map(async (blog) => ({ ...blog, featuredImage: (await listMedia("BLOG_FEATURED_IMAGE", blog.id))[0] ?? null }))
  );

  return { items, pagination: buildPaginationMeta(page, limit, total) };
}

export async function getBlogBySlug(slug: string) {
  const blog = await prisma.blog.findUnique({
    where: { slug },
    include: { author: { select: { id: true, name: true } } },
  });
  if (!blog || !blog.isPublished) throw ApiError.notFound("Blog post not found");

  const featuredImage = (await listMedia("BLOG_FEATURED_IMAGE", blog.id))[0] ?? null;
  return { ...blog, featuredImage };
}

export async function listAdminBlogs(query: { page?: unknown; limit?: unknown; isPublished?: unknown }) {
  const { page, limit, skip, take } = parsePagination(query);
  const where: Record<string, unknown> = {};
  if (query.isPublished === "true") where.isPublished = true;
  if (query.isPublished === "false") where.isPublished = false;

  const [items, total] = await Promise.all([
    prisma.blog.findMany({
      where,
      include: { author: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.blog.count({ where }),
  ]);

  return { items, pagination: buildPaginationMeta(page, limit, total) };
}

export async function getAdminBlogById(id: string) {
  const blog = await prisma.blog.findUnique({ where: { id }, include: { author: { select: { id: true, name: true } } } });
  if (!blog) throw ApiError.notFound("Blog post not found");
  const featuredImage = (await listMedia("BLOG_FEATURED_IMAGE", blog.id))[0] ?? null;
  return { ...blog, featuredImage };
}

interface BlogInput {
  title: string;
  excerpt?: string;
  content: string;
  isPublished?: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

export async function createBlog(data: BlogInput, authorId: string) {
  const slug = await generateUniqueSlug(data.title, async (candidate) => {
    const existing = await prisma.blog.findUnique({ where: { slug: candidate } });
    return Boolean(existing);
  });

  return prisma.blog.create({
    data: { ...data, slug, authorId, publishedAt: data.isPublished ? new Date() : undefined },
  });
}

export async function updateBlog(id: string, data: Partial<BlogInput>) {
  const existing = await prisma.blog.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound("Blog post not found");

  let slug: string | undefined;
  if (data.title) {
    slug = await generateUniqueSlug(data.title, async (candidate) => {
      const other = await prisma.blog.findUnique({ where: { slug: candidate } });
      return Boolean(other && other.id !== id);
    });
  }

  const justPublished = data.isPublished === true && !existing.isPublished;

  return prisma.blog.update({
    where: { id },
    data: { ...data, ...(slug ? { slug } : {}), ...(justPublished ? { publishedAt: new Date() } : {}) },
  });
}

export async function deleteBlog(id: string) {
  const existing = await prisma.blog.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound("Blog post not found");
  await prisma.blog.delete({ where: { id } });
}
