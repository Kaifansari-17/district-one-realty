import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { formatArea, formatIndianPrice } from "@district-one/shared-utils";
import type { PropertyListItem } from "@/types/api";
import { StatusPill } from "@/components/common/StatusPill";

export function PropertyCard({ property }: { property: PropertyListItem }) {
  const heading = property.bedrooms ? `${property.bedrooms} BHK • ${property.location.name}` : property.title;

  return (
    <Link
      to={`/properties/${property.slug}`}
      className="group block overflow-hidden rounded-xl border border-border bg-white transition-all duration-300 hover:-translate-y-1 hover:border-gold-light hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-grey-light">
        {property.primaryImage ? (
          <img
            src={property.primaryImage.url}
            alt={property.primaryImage.alt ?? property.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-text-muted">No image available</div>
        )}
        <div className="absolute left-3 top-3">
          <StatusPill status={property.status} />
        </div>
      </div>

      <div className="space-y-1.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-lg leading-snug text-navy">{heading}</h3>
          <ArrowUpRight size={16} className="mt-1 shrink-0 text-text-muted transition group-hover:text-gold" />
        </div>
        {(property.project?.name || property.builder?.name) && (
          <p className="text-xs text-text-muted">{property.project?.name ?? property.builder?.name}</p>
        )}
        <p className="text-sm text-text-secondary">
          <span className="font-medium text-text-primary">{formatIndianPrice(Number(property.price))}</span>
          {property.carpetArea && <> &middot; {formatArea(property.carpetArea)}</>}
        </p>
      </div>
    </Link>
  );
}
