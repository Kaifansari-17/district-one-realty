import { useSearchParams } from "react-router-dom";
import { useCallback, useMemo } from "react";

const FILTER_KEYS = [
  "purpose",
  "location",
  "builder",
  "project",
  "propertyType",
  "category",
  "bhk",
  "minPrice",
  "maxPrice",
  "minArea",
  "maxArea",
  "furnishing",
  "status",
  "rera",
  "amenities",
  "q",
  "sort",
  "page",
] as const;

export type PropertyFilters = Partial<Record<(typeof FILTER_KEYS)[number], string>>;

export function usePropertyFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<PropertyFilters>(() => {
    const result: PropertyFilters = {};
    for (const key of FILTER_KEYS) {
      const value = searchParams.get(key);
      if (value) result[key] = value;
    }
    return result;
  }, [searchParams]);

  const setFilter = useCallback(
    (key: (typeof FILTER_KEYS)[number], value: string | undefined) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value) next.set(key, value);
          else next.delete(key);
          if (key !== "page") next.delete("page"); // any filter change resets pagination
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const clearAll = useCallback(() => setSearchParams({}, { replace: true }), [setSearchParams]);

  const activeCount = Object.keys(filters).filter((k) => k !== "page" && k !== "sort").length;

  return { filters, setFilter, clearAll, activeCount };
}
