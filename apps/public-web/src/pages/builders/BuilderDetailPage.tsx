import { useParams } from "react-router-dom";
import { Globe, Phone, Mail, MapPin, CalendarDays } from "lucide-react";
import { usePublicDetail } from "@/lib/usePublicData";
import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { ProjectCard } from "@/components/property/ProjectCard";
import { EmptyState } from "@/components/common/EmptyState";
import type { BuilderDetail } from "@/types/api";

export function BuilderDetailPage() {
  const { slug } = useParams();
  const { data: builder, isLoading, isError } = usePublicDetail<BuilderDetail>("builder", "/builders", slug);

  useDocumentMeta(builder?.name, builder?.description ?? undefined);

  if (isLoading) return <div className="mx-auto max-w-7xl px-6 py-20 text-center text-text-muted">Loading builder...</div>;

  if (isError || !builder) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20">
        <EmptyState title="Builder not found" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <Breadcrumbs items={[{ label: "Builders", href: "/builders" }, { label: builder.name }]} />

      <div className="mt-6 flex flex-col items-start gap-6 border-b border-border pb-8 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-border bg-white">
          {builder.logo ? (
            <img src={builder.logo.url} alt={builder.name} loading="eager" className="max-h-14 max-w-14 object-contain" />
          ) : (
            <span className="font-serif text-2xl text-navy">{builder.name[0]}</span>
          )}
        </div>
        <div>
          <h1 className="font-serif text-3xl text-navy">{builder.name}</h1>
          <p className="mt-1 text-sm text-text-secondary">{builder.propertyCount} properties &middot; {builder.projects.length} projects</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_300px]">
        <div>
          {builder.description && <p className="text-sm leading-relaxed text-text-secondary">{builder.description}</p>}

          {builder.projects.length > 0 ? (
            <div className="mt-10">
              <h2 className="mb-4 font-serif text-xl text-navy">Projects by {builder.name}</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {builder.projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-10">
              <EmptyState title="No published projects yet" />
            </div>
          )}
        </div>

        <aside className="space-y-3 rounded-xl border border-border p-5 text-sm">
          <p className="mb-2 font-medium text-navy">Builder Information</p>
          {builder.website && (
            <a href={builder.website} target="_blank" rel="noreferrer noopener" className="flex items-center gap-2 text-text-secondary hover:text-navy">
              <Globe size={14} /> {builder.website.replace(/^https?:\/\//, "")}
            </a>
          )}
          {builder.phone && (
            <p className="flex items-center gap-2 text-text-secondary">
              <Phone size={14} /> {builder.phone}
            </p>
          )}
          {builder.email && (
            <p className="flex items-center gap-2 text-text-secondary">
              <Mail size={14} /> {builder.email}
            </p>
          )}
          {builder.address && (
            <p className="flex items-center gap-2 text-text-secondary">
              <MapPin size={14} /> {builder.address}
            </p>
          )}
          {builder.establishedYear && (
            <p className="flex items-center gap-2 text-text-secondary">
              <CalendarDays size={14} /> Established {builder.establishedYear}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
