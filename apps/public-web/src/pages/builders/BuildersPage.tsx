import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { usePublicList } from "@/lib/usePublicData";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { BuilderCard } from "@/components/property/BuilderCard";
import { SkeletonRow } from "@/components/common/SkeletonCard";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { StaggerGrid, StaggerItem } from "@/components/common/StaggerGrid";
import type { Builder } from "@/types/api";

export function BuildersPage() {
  useDocumentMeta("Builders", "Explore trusted real estate developers across Navi Mumbai.");

  const { data: builders, isLoading, isError } = usePublicList<Builder[]>("builders-active", "/builders");

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <Breadcrumbs items={[{ label: "Builders" }]} />

      <div className="mt-4">
        <h1 className="font-serif text-3xl text-navy md:text-4xl">Our Developer Network</h1>
        <p className="mt-1 text-sm text-text-secondary">Trusted development partners building across Navi Mumbai.</p>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <SkeletonRow />
        ) : isError ? (
          <ErrorState message="We couldn't load builders right now. Please refresh the page or try again shortly." />
        ) : !builders || builders.length === 0 ? (
          <EmptyState title="No builders added yet" />
        ) : (
          <StaggerGrid className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {builders.map((builder) => (
              <StaggerItem key={builder.id}>
                <BuilderCard builder={builder} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        )}
      </div>
    </div>
  );
}
