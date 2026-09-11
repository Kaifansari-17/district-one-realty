import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";
import type { LocationSummary } from "@/types/api";

export function LocationCard({ location }: { location: LocationSummary }) {
  return (
    <Link to={`/locations/${location.slug}`} className="group flex items-center gap-4 rounded-xl border border-transparent p-3 transition hover:border-border hover:bg-white">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-grey-light">
        {location.image ? (
          <img src={location.image.url} alt={location.name} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <Building2 size={24} className="text-gold" />
        )}
      </div>
      <div>
        <h3 className="font-serif text-lg text-navy">{location.name}</h3>
        <p className="text-xs text-text-muted">
          {location.propertyCount} {location.propertyCount === 1 ? "Property" : "Properties"} &middot; {location.city}
        </p>
      </div>
    </Link>
  );
}
