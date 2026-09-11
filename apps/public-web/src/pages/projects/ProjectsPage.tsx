import { useSearchParams } from "react-router-dom";
import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { usePublicList } from "@/lib/usePublicData";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { ProjectCard } from "@/components/property/ProjectCard";
import { SkeletonRow } from "@/components/common/SkeletonCard";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { StaggerGrid, StaggerItem } from "@/components/common/StaggerGrid";
import type { Paginated, ProjectListItem, LocationSummary } from "@/types/api";

export function ProjectsPage() {
  useDocumentMeta("Projects", "Explore residential and commercial projects across Navi Mumbai.");

  const [searchParams, setSearchParams] = useSearchParams();
  const location = searchParams.get("location") ?? "";
  const page = searchParams.get("page") ?? "1";

  const { data: locations } = usePublicList<LocationSummary[]>("locations-active", "/locations");
  const { data, isLoading, isError } = usePublicList<Paginated<ProjectListItem>>("projects", "/projects", {
    location: location || undefined,
    page,
    limit: 12,
  });

  function setLocation(slug: string) {
    setSearchParams(slug ? { location: slug } : {}, { replace: true });
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <Breadcrumbs items={[{ label: "Projects" }]} />

      <div className="mt-4">
        <h1 className="font-serif text-3xl text-navy md:text-4xl">Projects</h1>
        <p className="mt-1 text-sm text-text-secondary">Ongoing and upcoming developments from our trusted partners.</p>
      </div>

      {locations && locations.length > 0 && (
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setLocation("")}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition ${
              !location ? "border-navy bg-navy text-white" : "border-border text-text-secondary hover:border-navy"
            }`}
          >
            All Locations
          </button>
          {locations.map((l) => (
            <button
              key={l.id}
              onClick={() => setLocation(l.slug)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                location === l.slug ? "border-navy bg-navy text-white" : "border-border text-text-secondary hover:border-navy"
              }`}
            >
              {l.name}
            </button>
          ))}
        </div>
      )}

      <div className="mt-8">
        {isLoading ? (
          <SkeletonRow />
        ) : isError ? (
          <ErrorState message="We couldn't load projects right now. Please refresh the page or try again shortly." />
        ) : !data || data.items.length === 0 ? (
          <EmptyState title="No projects found" message="Try a different location or check back soon." />
        ) : (
          <>
            <StaggerGrid key={page} className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {data.items.map((project) => (
                <StaggerItem key={project.id}>
                  <ProjectCard project={project} />
                </StaggerItem>
              ))}
            </StaggerGrid>

            {data.pagination.totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  disabled={!data.pagination.hasPrevPage}
                  onClick={() => setSearchParams((prev) => { const p = new URLSearchParams(prev); p.set("page", String(data.pagination.page - 1)); return p; })}
                  className="rounded-md border border-border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-text-secondary">Page {data.pagination.page} of {data.pagination.totalPages}</span>
                <button
                  disabled={!data.pagination.hasNextPage}
                  onClick={() => setSearchParams((prev) => { const p = new URLSearchParams(prev); p.set("page", String(data.pagination.page + 1)); return p; })}
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
  );
}
