import { ApiError } from "@/utils/ApiError";
import { generateUniqueSlug } from "@/utils/generateUniqueSlug";
import { buildPaginationMeta, parsePagination } from "@/utils/pagination";

/**
 * Minimal shape every lookup-table Prisma delegate satisfies (Amenity, Feature,
 * PropertyCategory, Purpose, PropertyType, ...). Kept intentionally loose —
 * this factory exists to eliminate near-identical CRUD boilerplate across
 * five simple `{ name, slug, isActive }`-shaped tables, not to fully
 * re-derive Prisma's generic typing.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface LookupDelegate<T> {
  findMany: (args: any) => Promise<T[]>;
  count: (args: any) => Promise<number>;
  findUnique: (args: any) => Promise<T | null>;
  create: (args: any) => Promise<T>;
  update: (args: any) => Promise<T>;
  delete: (args: any) => Promise<T>;
}

interface LookupRecord {
  id: string;
  slug: string;
}

export function createLookupService<T extends LookupRecord>(
  delegate: LookupDelegate<T>,
  entityLabel: string
) {
  async function list(query: { page?: unknown; limit?: unknown; isActive?: unknown; q?: unknown }) {
    const { page, limit, skip, take } = parsePagination(query);
    const where: Record<string, unknown> = {};

    if (query.isActive === "true") where.isActive = true;
    if (query.isActive === "false") where.isActive = false;
    if (typeof query.q === "string" && query.q.trim()) {
      where.name = { contains: query.q.trim() };
    }

    const [items, total] = await Promise.all([
      delegate.findMany({ where, skip, take, orderBy: { name: "asc" } }),
      delegate.count({ where }),
    ]);

    return { items, pagination: buildPaginationMeta(page, limit, total) };
  }

  async function listActive() {
    return delegate.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  }

  async function getById(id: string): Promise<T> {
    const record = await delegate.findUnique({ where: { id } });
    if (!record) throw ApiError.notFound(`${entityLabel} not found`);
    return record;
  }

  async function create(data: Record<string, unknown>): Promise<T> {
    if (typeof data.name !== "string" || !data.name.trim()) {
      throw ApiError.badRequest("name is required");
    }
    const slug = await generateUniqueSlug(data.name, async (candidate) => {
      const existing = await delegate.findUnique({ where: { slug: candidate } });
      return Boolean(existing);
    });
    return delegate.create({ data: { ...data, slug } });
  }

  async function update(id: string, data: Record<string, unknown>): Promise<T> {
    await getById(id);

    let slug: string | undefined;
    if (typeof data.name === "string") {
      slug = await generateUniqueSlug(data.name, async (candidate) => {
        const existing = (await delegate.findUnique({ where: { slug: candidate } })) as LookupRecord | null;
        return Boolean(existing && existing.id !== id);
      });
    }

    return delegate.update({ where: { id }, data: { ...data, ...(slug ? { slug } : {}) } });
  }

  async function remove(id: string): Promise<void> {
    await getById(id);
    await delegate.delete({ where: { id } });
  }

  return { list, listActive, getById, create, update, remove };
}
