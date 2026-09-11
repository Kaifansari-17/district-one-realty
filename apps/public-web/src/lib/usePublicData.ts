import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

/** Thin wrapper: every public GET returns { success, data }, unwrap to just `data`. */
async function get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const res = await apiClient.get<{ data: T }>(path, { params });
  return res.data.data;
}

export function usePublicList<T>(key: string, path: string, params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: [key, params],
    queryFn: () => get<T>(path, params),
  });
}

export function usePublicDetail<T>(key: string, path: string, slug: string | undefined) {
  return useQuery({
    queryKey: [key, "detail", slug],
    queryFn: () => get<T>(`${path}/${slug}`),
    enabled: Boolean(slug),
  });
}
