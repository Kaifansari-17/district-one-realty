import { useParams } from "react-router-dom";
import { usePublicDetail } from "@/lib/usePublicData";
import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { ProjectCard } from "@/components/property/ProjectCard";
import { BuilderCard } from "@/components/property/BuilderCard";
import { EmptyState } from "@/components/common/EmptyState";
import type { LocationDetail } from "@/types/api";

export function LocationDetailPage() {
  const { slug } = useParams();
  const { data: location, isLoading, isError } = usePublicDetail<LocationDetail>("location", "/locations", slug);

  useDocumentMeta(location?.metaTitle ?? location?.name, location?.metaDescription ?? location?.description ?? undefined);

  if (isLoading) return <div className="mx-auto max-w-7xl px-6 py-20 text-center text-text-muted">Loading location...</div>;

  if (isError || !location) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20">
        <EmptyState title="Location not found" />
      </div>
    );
  }

  return (
    <div>
      <div className="relative h-[40vh] min-h-[280px] overflow-hidden bg-navy">
        {location.image && (
          <img src={location.image.url} alt={location.name} loading="eager" fetchPriority="high" className="h-full w-full object-cover opacity-90" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-6 pb-8">
          <h1 className="font-serif text-3xl text-white md:text-5xl">{location.name}</h1>
          <p className="mt-2 text-sm text-white/80">
            {location.city}, {location.state} &middot; {location.propertyCount} properties
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <Breadcrumbs items={[{ label: "Locations", href: "/locations" }, { label: location.name }]} />

        {location.description && <p className="mt-6 max-w-3xl text-sm leading-relaxed text-text-secondary">{location.description}</p>}

        {location.popularConfigurations.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-3">
            {location.popularConfigurations
              .filter((c) => c.bedrooms)
              .map((c) => (
                <span key={c.bedrooms} className="rounded-full border border-border px-4 py-1.5 text-xs text-text-secondary">
                  {c.bedrooms} BHK &middot; {c.count} available
                </span>
              ))}
          </div>
        )}

        {location.projects.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 font-serif text-xl text-navy">Projects in {location.name}</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {location.projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        )}

        {location.builders.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 font-serif text-xl text-navy">Builders active in {location.name}</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {location.builders.map((builder) => (
                <BuilderCard key={builder.id} builder={builder} />
              ))}
            </div>
          </div>
        )}

        {location.projects.length === 0 && location.builders.length === 0 && (
          <div className="mt-12">
            <EmptyState title="No listings here yet" message="Check back soon as we expand into this locality." />
          </div>
        )}
      </div>
    </div>
  );
}
