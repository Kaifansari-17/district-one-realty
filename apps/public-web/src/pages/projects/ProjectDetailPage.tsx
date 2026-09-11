import { useParams, Link } from "react-router-dom";
import { FileDown, MapPin, Building2, ShieldCheck } from "lucide-react";
import { formatIndianPrice, formatPossessionDate } from "@district-one/shared-utils";
import { usePublicDetail } from "@/lib/usePublicData";
import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { useJsonLd } from "@/lib/useJsonLd";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { AmenityGrid } from "@/components/property/AmenityGrid";
import { PropertyCard } from "@/components/property/PropertyCard";
import { InquiryForm } from "@/components/common/InquiryForm";
import { StatusPill } from "@/components/common/StatusPill";
import { EmptyState } from "@/components/common/EmptyState";
import type { ProjectDetail } from "@/types/api";
import { env } from "@/config/env";

export function ProjectDetailPage() {
  const { slug } = useParams();
  const { data: project, isLoading, isError } = usePublicDetail<ProjectDetail>("project", "/projects", slug);

  useDocumentMeta(project?.name, project?.description ?? undefined);

  useJsonLd(
    "project",
    project
      ? {
          "@context": "https://schema.org",
          "@type": "ApartmentComplex",
          name: project.name,
          description: project.description ?? undefined,
          url: `${env.siteUrl}/projects/${project.slug}`,
          image: project.gallery.map((img) => img.url),
          numberOfAccommodationUnits: project.totalUnits ?? undefined,
          address: {
            "@type": "PostalAddress",
            addressLocality: project.location.name,
            addressRegion: "Maharashtra",
            addressCountry: "IN",
          },
        }
      : null
  );

  if (isLoading) return <div className="mx-auto max-w-7xl px-6 py-20 text-center text-text-muted">Loading project...</div>;

  if (isError || !project) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20">
        <EmptyState title="Project not found" message="This project may have been removed or unpublished." />
      </div>
    );
  }

  const heroImage = project.gallery[0];

  return (
    <div>
      <div className="relative h-[50vh] min-h-[360px] overflow-hidden bg-navy">
        {heroImage && (
          <img src={heroImage.url} alt={project.name} loading="eager" fetchPriority="high" className="h-full w-full object-cover opacity-90" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-6 pb-8">
          <StatusPill status={project.status} />
          <h1 className="mt-3 font-serif text-3xl text-white md:text-5xl">{project.name}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-white/80">
            <MapPin size={14} /> {project.location.name} &middot; by {project.builder.name}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <Breadcrumbs items={[{ label: "Projects", href: "/projects" }, { label: project.name }]} />

        <div className="mt-6 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="grid grid-cols-2 gap-4 border-b border-border pb-8 sm:grid-cols-4">
              {project.startingPrice && (
                <div>
                  <p className="font-serif text-xl text-navy">{formatIndianPrice(Number(project.startingPrice))}</p>
                  <p className="text-xs text-text-muted">Starting Price</p>
                </div>
              )}
              {project.configurations && project.configurations.length > 0 && (
                <div>
                  <p className="font-serif text-xl text-navy">{project.configurations.join(", ")}</p>
                  <p className="text-xs text-text-muted">Configurations</p>
                </div>
              )}
              {project.possessionDate && (
                <div>
                  <p className="font-serif text-xl text-navy">{formatPossessionDate(project.possessionDate)}</p>
                  <p className="text-xs text-text-muted">Possession</p>
                </div>
              )}
              {project.reraNumber && (
                <div>
                  <p className="flex items-center gap-1 font-serif text-sm text-navy">
                    <ShieldCheck size={14} /> {project.reraNumber}
                  </p>
                  <p className="text-xs text-text-muted">RERA</p>
                </div>
              )}
            </div>

            {project.description && (
              <div className="mt-8">
                <h2 className="mb-3 font-serif text-xl text-navy">About {project.name}</h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-text-secondary">{project.description}</p>
              </div>
            )}

            {project.amenities.length > 0 && (
              <div className="mt-10">
                <h2 className="mb-4 font-serif text-xl text-navy">Amenities</h2>
                <AmenityGrid amenities={project.amenities} />
              </div>
            )}

            {project.gallery.length > 1 && (
              <div className="mt-10">
                <h2 className="mb-4 font-serif text-xl text-navy">Gallery</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {project.gallery.map((img) => (
                    <img key={img.id} src={img.url} alt={project.name} loading="lazy" className="aspect-square rounded-lg object-cover" />
                  ))}
                </div>
              </div>
            )}

            {project.masterPlan && (
              <div className="mt-10">
                <h2 className="mb-4 font-serif text-xl text-navy">Master Plan</h2>
                <img src={project.masterPlan.url} alt="Master plan" loading="lazy" className="rounded-lg border border-border" />
              </div>
            )}

            {(project.latitude || project.longitude) && (
              <div className="mt-10">
                <h2 className="mb-4 font-serif text-xl text-navy">Location</h2>
                <iframe
                  title="Project location"
                  className="h-72 w-full rounded-lg border border-border"
                  loading="lazy"
                  src={`https://www.google.com/maps?q=${project.latitude},${project.longitude}&output=embed`}
                />
              </div>
            )}

            <div className="mt-10 flex items-center justify-between rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                <Building2 size={18} className="text-navy" />
                <div>
                  <p className="text-sm font-medium text-navy">{project.builder.name}</p>
                  <p className="text-xs text-text-muted">Developer</p>
                </div>
              </div>
              <Link to={`/builders/${project.builder.slug}`} className="text-xs font-medium text-navy hover:text-gold">
                View Builder →
              </Link>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="sticky top-24 space-y-6">
              {project.brochure && (
                <a
                  href={project.brochure.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center justify-center gap-2 rounded-md border border-border py-3 text-sm font-medium text-navy hover:border-navy"
                >
                  <FileDown size={16} /> Download Brochure
                </a>
              )}
              <div className="rounded-xl border border-border p-5">
                <p className="mb-3 text-sm font-medium text-navy">Enquire About {project.name}</p>
                <InquiryForm source="PROJECT" projectId={project.id} compact />
              </div>
            </div>
          </aside>
        </div>

        {project.availableUnits.length > 0 && (
          <div className="mt-16 border-t border-border pt-10">
            <h2 className="mb-6 font-serif text-2xl text-navy">Available Units</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {project.availableUnits.map((unit) => (
                <PropertyCard key={unit.id} property={unit} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
