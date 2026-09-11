import { SectionHeader } from "@/components/common/SectionHeader";
import { BuilderCard } from "@/components/property/BuilderCard";
import { EmptyState } from "@/components/common/EmptyState";
import { FadeIn } from "@/components/common/FadeIn";
import { StaggerGrid, StaggerItem } from "@/components/common/StaggerGrid";
import { usePublicList } from "@/lib/usePublicData";
import type { Builder } from "@/types/api";

export function TrustedBuilders() {
  const { data: builders, isLoading } = usePublicList<Builder[]>("builders-active", "/builders");

  if (isLoading) return null;
  if (!builders || builders.length === 0) return null;

  return (
    <section className="bg-warm-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <FadeIn>
          <SectionHeader title="Trusted Developers" subtitle="Names Navi Mumbai homebuyers already know" viewAllHref="/builders" />
        </FadeIn>
        {builders.length === 0 ? (
          <EmptyState title="No builders added yet" />
        ) : (
          <StaggerGrid className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {builders.slice(0, 12).map((builder) => (
              <StaggerItem key={builder.id}>
                <BuilderCard builder={builder} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        )}
      </div>
    </section>
  );
}
