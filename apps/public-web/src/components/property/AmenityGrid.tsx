import { Sparkles } from "lucide-react";
import type { Amenity } from "@/types/api";

export function AmenityGrid({ amenities }: { amenities: Amenity[] }) {
  if (amenities.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {amenities.map((amenity) => (
        <div key={amenity.id} className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2.5 text-sm text-text-secondary">
          <Sparkles size={15} className="shrink-0 text-gold" />
          {amenity.name}
        </div>
      ))}
    </div>
  );
}
