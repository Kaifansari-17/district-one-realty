import { SectionHeader } from "@/components/common/SectionHeader";
import { Carousel } from "@/components/common/Carousel";
import { PropertyCard } from "@/components/property/PropertyCard";
import { SkeletonRow } from "@/components/common/SkeletonCard";
import { EmptyState } from "@/components/common/EmptyState";
import { FadeIn } from "@/components/common/FadeIn";
import { usePublicList } from "@/lib/usePublicData";
import type { Paginated, PropertyListItem } from "@/types/api";

export function HandpickedResidences() {
  const { data, isLoading } = usePublicList<Paginated<PropertyListItem>>("handpicked", "/properties", {
    sort: "latest",
    limit: 8,
  });

  const properties = data?.items ?? [];

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <FadeIn>
        <SectionHeader title="Handpicked Residences" subtitle="Navi Mumbai • Selected for you" viewAllHref="/properties" />
      </FadeIn>

      {isLoading ? (
        <SkeletonRow />
      ) : properties.length === 0 ? (
        <EmptyState title="No residences available yet" message="Check back soon as we add new listings." />
      ) : (
        <FadeIn delay={0.1}>
          <Carousel items={properties} itemKey={(p) => p.id} renderItem={(p) => <PropertyCard property={p} />} />
        </FadeIn>
      )}
    </section>
  );
}
