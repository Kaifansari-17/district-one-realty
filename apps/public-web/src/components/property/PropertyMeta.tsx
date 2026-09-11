import type { LucideIcon } from "lucide-react";
import { BedDouble, Bath, Ruler, Building2, Car, Compass, Sofa, CalendarClock, ShieldCheck, LandPlot } from "lucide-react";
import { formatArea, formatPossessionDate } from "@district-one/shared-utils";
import type { PropertyDetail } from "@/types/api";

interface MetaItem {
  icon: LucideIcon;
  label: string;
  value: string;
}

function humanize(value?: string | null): string | undefined {
  return value ? value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : undefined;
}

export function PropertyMeta({ property }: { property: PropertyDetail }) {
  const items: MetaItem[] = [];

  if (property.bedrooms) items.push({ icon: BedDouble, label: "Bedrooms", value: String(property.bedrooms) });
  if (property.bathrooms) items.push({ icon: Bath, label: "Bathrooms", value: String(property.bathrooms) });
  if (property.carpetArea) items.push({ icon: Ruler, label: "Carpet Area", value: formatArea(property.carpetArea) });
  if (property.builtUpArea) items.push({ icon: LandPlot, label: "Built-up Area", value: formatArea(property.builtUpArea) });
  if (property.floorNumber !== undefined && property.floorNumber !== null)
    items.push({ icon: Building2, label: "Floor", value: property.totalFloors ? `${property.floorNumber} of ${property.totalFloors}` : String(property.floorNumber) });
  if (property.parking) items.push({ icon: Car, label: "Parking", value: String(property.parking) });
  if (property.facing) items.push({ icon: Compass, label: "Facing", value: humanize(property.facing)! });
  if (property.furnishing) items.push({ icon: Sofa, label: "Furnishing", value: humanize(property.furnishing)! });
  if (property.possessionDate) items.push({ icon: CalendarClock, label: "Possession", value: formatPossessionDate(property.possessionDate) });
  if (property.reraNumber) items.push({ icon: ShieldCheck, label: "RERA", value: property.reraNumber });

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-border px-3 py-3 text-center">
          <item.icon size={18} className="mx-auto mb-1.5 text-navy" />
          <p className="text-sm font-medium text-text-primary">{item.value}</p>
          <p className="text-[11px] text-text-muted">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
