import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { usePublicList } from "@/lib/usePublicData";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { LocationCard } from "@/components/property/LocationCard";
import { SkeletonRow } from "@/components/common/SkeletonCard";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { StaggerGrid, StaggerItem } from "@/components/common/StaggerGrid";
import type { LocationSummary } from "@/types/api";

export function LocationsPage() {
  useDocumentMeta("Locations", "Discover properties across every locality we serve in Navi Mumbai.");

  const { data: locations, isLoading, isError } = usePublicList<LocationSummary[]>("locations-active", "/locations");

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <Breadcrumbs items={[{ label: "Locations" }]} />

      <div className="mt-4">
        <h1 className="font-serif text-3xl text-navy md:text-4xl">Explore Localities</h1>
        <p className="mt-1 text-sm text-text-secondary">Discover properties across Navi Mumbai.</p>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <SkeletonRow />
        ) : isError ? (
          <ErrorState message="We couldn't load localities right now. Please refresh the page or try again shortly." />
        ) : !locations || locations.length === 0 ? (
          <EmptyState title="No localities added yet" />
        ) : (
          <StaggerGrid className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            {locations.map((location) => (
              <StaggerItem key={location.id}>
                <LocationCard location={location} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        )}
      </div>
    </div>
  );
}
