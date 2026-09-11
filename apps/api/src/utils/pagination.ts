import type { PaginationMeta } from "@district-one/shared-types";

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

export function parsePagination(query: { page?: unknown; limit?: unknown }): PaginationParams {
  const page = Math.max(1, Number.parseInt(String(query.page ?? "1"), 10) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number.parseInt(String(query.limit ?? String(DEFAULT_LIMIT)), 10) || DEFAULT_LIMIT));

  return { page, limit, skip: (page - 1) * limit, take: limit };
}

export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
