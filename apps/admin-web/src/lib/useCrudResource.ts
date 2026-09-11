import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PaginatedResult } from "@district-one/shared-types";
import { apiClient } from "@/lib/api-client";

/**
 * One hook factory covering the list/create/update/delete pattern every
 * admin resource page repeats. `basePath` is the admin API path, e.g.
 * `/admin/amenities` or `/admin/builders`.
 */
export function useCrudResource<TItem, TCreateInput = Partial<TItem>, TUpdateInput = Partial<TItem>>(
  basePath: string,
  resourceKey: string
) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [resourceKey] });

  function useList(params: Record<string, unknown> = {}) {
    return useQuery({
      queryKey: [resourceKey, "list", params],
      queryFn: async () =>
        (await apiClient.get<{ data: PaginatedResult<TItem> }>(basePath, { params })).data.data,
    });
  }

  function useActiveList() {
    return useQuery({
      queryKey: [resourceKey, "active"],
      queryFn: async () => (await apiClient.get<{ data: TItem[] }>(`${basePath}/active`)).data.data,
    });
  }

  function useDetail(id: string | undefined) {
    return useQuery({
      queryKey: [resourceKey, "detail", id],
      queryFn: async () => (await apiClient.get<{ data: TItem }>(`${basePath}/${id}`)).data.data,
      enabled: Boolean(id),
    });
  }

  function useCreate() {
    return useMutation({
      mutationFn: async (input: TCreateInput) => (await apiClient.post<{ data: TItem }>(basePath, input)).data.data,
      onSuccess: invalidate,
    });
  }

  function useUpdate() {
    return useMutation({
      mutationFn: async ({ id, input }: { id: string; input: TUpdateInput }) =>
        (await apiClient.put<{ data: TItem }>(`${basePath}/${id}`, input)).data.data,
      onSuccess: invalidate,
    });
  }

  function useRemove() {
    return useMutation({
      mutationFn: async (id: string) => apiClient.delete(`${basePath}/${id}`),
      onSuccess: invalidate,
    });
  }

  return { useList, useActiveList, useDetail, useCreate, useUpdate, useRemove };
}
