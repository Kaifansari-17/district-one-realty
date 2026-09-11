import { useState } from "react";
import { SectionHeader } from "@/components/common/SectionHeader";
import { Carousel } from "@/components/common/Carousel";
import { ProjectCard } from "@/components/property/ProjectCard";
import { SkeletonRow } from "@/components/common/SkeletonCard";
import { EmptyState } from "@/components/common/EmptyState";
import { FadeIn } from "@/components/common/FadeIn";
import { usePublicList } from "@/lib/usePublicData";
import type { ProjectListItem } from "@/types/api";

interface LocationGroup {
  location: { id: string; name: string; slug: string };
  projects: ProjectListItem[];
}

export function DeveloperNetwork() {
  const { data: groups, isLoading } = usePublicList<LocationGroup[]>("projects-by-location", "/projects/by-location");
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const activeGroup = groups?.find((g) => g.location.slug === (activeSlug ?? groups[0]?.location.slug));

  return (
    <section className="bg-warm-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <FadeIn>
          <SectionHeader title="Our Developer Network" subtitle="Projects from our trusted development partners" viewAllHref="/projects" />
        </FadeIn>

        {isLoading ? (
          <SkeletonRow />
        ) : !groups || groups.length === 0 ? (
          <EmptyState title="No projects published yet" message="Our developer partnerships will appear here soon." />
        ) : (
          <>
            <div className="mb-8 flex gap-6 overflow-x-auto border-b border-border">
              {groups.map((group) => {
                const isActive = group.location.slug === (activeSlug ?? groups[0].location.slug);
                return (
                  <button
                    key={group.location.id}
                    onClick={() => setActiveSlug(group.location.slug)}
                    className={`shrink-0 whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition ${
                      isActive ? "border-gold text-navy" : "border-transparent text-text-secondary hover:text-navy"
                    }`}
                  >
                    {group.location.name}
                  </button>
                );
              })}
            </div>

            {activeGroup && (
              <Carousel
                items={activeGroup.projects}
                itemKey={(p) => p.id}
                slidesPerView={{ base: 1.1, sm: 1.5, md: 2.2, lg: 2.5 }}
                renderItem={(p) => <ProjectCard project={p} />}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}
