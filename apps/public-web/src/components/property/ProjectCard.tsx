import { Link } from "react-router-dom";
import { MapPin, Building2, CalendarClock, HardHat } from "lucide-react";
import { formatIndianPrice, formatPossessionDate } from "@district-one/shared-utils";
import type { ProjectListItem } from "@/types/api";
import { StatusPill } from "@/components/common/StatusPill";

export function ProjectCard({ project }: { project: ProjectListItem }) {
  const configurations = project.configurations?.join(" & ");

  return (
    <Link
      to={`/projects/${project.slug}`}
      className="group block w-full shrink-0 overflow-hidden rounded-xl border border-border bg-white transition-all duration-300 hover:-translate-y-1 hover:border-gold-light hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-grey-light">
        {project.primaryImage ? (
          <img
            src={project.primaryImage.url}
            alt={project.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-text-muted">No image available</div>
        )}
        <div className="absolute left-3 top-3">
          <StatusPill status={project.status} />
        </div>
      </div>

      <div className="space-y-3 p-5">
        <div>
          <h3 className="font-serif text-xl text-navy">{project.name}</h3>
          {configurations && <p className="text-sm text-text-secondary">{configurations} Residences</p>}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <p className="flex items-center gap-1 text-xs text-text-muted">
            <MapPin size={12} /> {project.location?.name}
          </p>
          {project.startingPrice && (
            <p className="text-sm">
              <span className="font-medium text-navy">{formatIndianPrice(Number(project.startingPrice))}</span>{" "}
              <span className="text-xs text-text-muted">Onwards</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-border pt-3 text-center text-[11px] text-text-muted">
          <div className="flex flex-col items-center gap-1">
            <Building2 size={14} className="text-navy/70" />
            {configurations ?? "Configurations TBA"}
          </div>
          <div className="flex flex-col items-center gap-1">
            <CalendarClock size={14} className="text-navy/70" />
            {formatPossessionDate(project.possessionDate) || "TBA"}
          </div>
          <div className="flex flex-col items-center gap-1">
            <HardHat size={14} className="text-navy/70" />
            {project.builder?.name}
          </div>
        </div>
      </div>
    </Link>
  );
}
