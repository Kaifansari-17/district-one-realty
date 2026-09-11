import { SectionHeader } from "@/components/common/SectionHeader";
import { LocationCard } from "@/components/property/LocationCard";
import { SkeletonRow } from "@/components/common/SkeletonCard";
import { EmptyState } from "@/components/common/EmptyState";
import { FadeIn } from "@/components/common/FadeIn";
import { StaggerGrid, StaggerItem } from "@/components/common/StaggerGrid";
import { usePublicList } from "@/lib/usePublicData";
import type { LocationSummary } from "@/types/api";

export function ExploreLocalities() {
  const { data: locations, isLoading } = usePublicList<LocationSummary[]>("locations-active", "/locations");

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <FadeIn>
        <SectionHeader title="Explore Localities" subtitle="Discover properties across Navi Mumbai" viewAllHref="/locations" />
      </FadeIn>

      {isLoading ? (
        <SkeletonRow />
      ) : !locations || locations.length === 0 ? (
        <EmptyState title="No localities added yet" />
      ) : (
        <StaggerGrid className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
          {locations.slice(0, 8).map((location) => (
            <StaggerItem key={location.id}>
              <LocationCard location={location} />
            </StaggerItem>
          ))}
        </StaggerGrid>
      )}
    </section>
  );
}
