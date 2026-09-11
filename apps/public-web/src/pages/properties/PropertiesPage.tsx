import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { usePublicList } from "@/lib/usePublicData";
import { PropertyCard } from "@/components/property/PropertyCard";
import { SkeletonRow } from "@/components/common/SkeletonCard";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { StaggerGrid, StaggerItem } from "@/components/common/StaggerGrid";
import { usePropertyFilters } from "@/pages/properties/usePropertyFilters";
import { PropertyFilterPanel } from "@/pages/properties/PropertyFilterPanel";
import type { Paginated, PropertyListItem } from "@/types/api";

const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "area_asc", label: "Area: Low to High" },
  { value: "area_desc", label: "Area: High to Low" },
];

export function PropertiesPage() {
  useDocumentMeta("Properties", "Browse residential and commercial properties across Navi Mumbai.");

  const { filters, setFilter, clearAll, activeCount } = usePropertyFilters();
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const { data, isLoading, isError } = usePublicList<Paginated<PropertyListItem>>("properties", "/properties", {
    ...filters,
    limit: 12,
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <Breadcrumbs items={[{ label: "Properties" }]} />

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-navy md:text-4xl">Properties</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {data ? `${data.pagination.total} properties found` : "Discover residential and commercial properties across Navi Mumbai."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium text-navy lg:hidden"
          >
            <SlidersHorizontal size={15} /> Filters {activeCount > 0 && `(${activeCount})`}
          </button>

          <select
            value={filters.sort ?? "latest"}
            onChange={(e) => setFilter("sort", e.target.value)}
            className="rounded-md border border-border px-3 py-2.5 text-sm outline-none focus:border-navy"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <PropertyFilterPanel filters={filters} setFilter={setFilter} clearAll={clearAll} />
        </aside>

        <div>
          {isLoading ? (
            <SkeletonRow count={9} />
          ) : isError ? (
            <ErrorState message="We couldn't load properties right now. Please refresh the page or try again shortly." />
          ) : !data || data.items.length === 0 ? (
            <EmptyState title="No properties match your filters" message="Try adjusting or clearing your filters to see more results." />
          ) : (
            <>
              <StaggerGrid key={filters.page ?? "1"} className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {data.items.map((property) => (
                  <StaggerItem key={property.id}>
                    <PropertyCard property={property} />
                  </StaggerItem>
                ))}
              </StaggerGrid>

              {data.pagination.totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button
                    disabled={!data.pagination.hasPrevPage}
                    onClick={() => setFilter("page", String(data.pagination.page - 1))}
                    className="rounded-md border border-border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-text-secondary">
                    Page {data.pagination.page} of {data.pagination.totalPages}
                  </span>
                  <button
                    disabled={!data.pagination.hasNextPage}
                    onClick={() => setFilter("page", String(data.pagination.page + 1))}
                    className="rounded-md border border-border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto bg-white p-6 shadow-xl">
            <button onClick={() => setDrawerOpen(false)} aria-label="Close filters" className="absolute right-4 top-4">
              <X size={20} />
            </button>
            <PropertyFilterPanel filters={filters} setFilter={setFilter} clearAll={clearAll} />
            <button
              onClick={() => setDrawerOpen(false)}
              className="mt-4 w-full rounded-md bg-navy py-3 text-sm font-medium text-white"
            >
              Show Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
