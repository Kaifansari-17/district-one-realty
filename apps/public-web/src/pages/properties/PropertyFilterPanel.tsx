import { usePublicList } from "@/lib/usePublicData";
import type { LocationSummary, Builder, PropertyType, Amenity } from "@/types/api";
import type { PropertyFilters } from "@/pages/properties/usePropertyFilters";

interface PropertyFilterPanelProps {
  filters: PropertyFilters;
  setFilter: (key: keyof PropertyFilters, value: string | undefined) => void;
  clearAll: () => void;
}

const BHK_OPTIONS = [1, 2, 3, 4, 5];
const FURNISHING_OPTIONS = [
  { value: "UNFURNISHED", label: "Unfurnished" },
  { value: "SEMI_FURNISHED", label: "Semi-furnished" },
  { value: "FULLY_FURNISHED", label: "Fully furnished" },
];
const STATUS_OPTIONS = [
  { value: "UNDER_CONSTRUCTION", label: "Under Construction" },
  { value: "READY_TO_MOVE", label: "Ready to Move" },
  { value: "NEW_LAUNCH", label: "New Launch" },
  { value: "PRE_LAUNCH", label: "Pre-Launch" },
  { value: "RESALE", label: "Resale" },
];

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border py-5 first:pt-0">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-muted">{title}</p>
      {children}
    </div>
  );
}

export function PropertyFilterPanel({ filters, setFilter, clearAll }: PropertyFilterPanelProps) {
  const { data: locations } = usePublicList<LocationSummary[]>("locations-active", "/locations");
  const { data: builders } = usePublicList<Builder[]>("builders-active", "/builders");
  const { data: propertyTypes } = usePublicList<PropertyType[]>("property-types-active", "/property-types");
  const { data: amenities } = usePublicList<Amenity[]>("amenities-active", "/amenities");

  const selectedAmenities = filters.amenities ? filters.amenities.split(",") : [];

  function toggleAmenity(slug: string) {
    const next = selectedAmenities.includes(slug)
      ? selectedAmenities.filter((s) => s !== slug)
      : [...selectedAmenities, slug];
    setFilter("amenities", next.length > 0 ? next.join(",") : undefined);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-lg text-navy">Filters</h2>
        <button onClick={clearAll} className="text-xs font-medium text-text-muted hover:text-navy">
          Clear all
        </button>
      </div>

      <FilterGroup title="Purpose">
        <div className="flex gap-2">
          {(["buy", "rent", "lease"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setFilter("purpose", filters.purpose === p ? undefined : p)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition ${
                filters.purpose === p ? "border-navy bg-navy text-white" : "border-border text-text-secondary hover:border-navy"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="BHK">
        <div className="flex flex-wrap gap-2">
          {BHK_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => setFilter("bhk", filters.bhk === String(n) ? undefined : String(n))}
              className={`h-8 w-8 rounded-full border text-xs font-medium transition ${
                filters.bhk === String(n) ? "border-navy bg-navy text-white" : "border-border text-text-secondary hover:border-navy"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Location">
        <select
          value={filters.location ?? ""}
          onChange={(e) => setFilter("location", e.target.value || undefined)}
          className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-navy"
        >
          <option value="">All Locations</option>
          {locations?.map((l) => (
            <option key={l.id} value={l.slug}>{l.name}</option>
          ))}
        </select>
      </FilterGroup>

      <FilterGroup title="Builder">
        <select
          value={filters.builder ?? ""}
          onChange={(e) => setFilter("builder", e.target.value || undefined)}
          className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-navy"
        >
          <option value="">All Builders</option>
          {builders?.map((b) => (
            <option key={b.id} value={b.slug}>{b.name}</option>
          ))}
        </select>
      </FilterGroup>

      <FilterGroup title="Property Type">
        <select
          value={filters.propertyType ?? ""}
          onChange={(e) => setFilter("propertyType", e.target.value || undefined)}
          className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-navy"
        >
          <option value="">All Types</option>
          {propertyTypes?.map((t) => (
            <option key={t.id} value={t.slug}>{t.name}</option>
          ))}
        </select>
      </FilterGroup>

      <FilterGroup title="Budget (₹)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={filters.minPrice}
            onBlur={(e) => setFilter("minPrice", e.target.value || undefined)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-navy"
          />
          <span className="text-text-muted">–</span>
          <input
            type="number"
            placeholder="Max"
            defaultValue={filters.maxPrice}
            onBlur={(e) => setFilter("maxPrice", e.target.value || undefined)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-navy"
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Carpet Area (sq.ft.)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={filters.minArea}
            onBlur={(e) => setFilter("minArea", e.target.value || undefined)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-navy"
          />
          <span className="text-text-muted">–</span>
          <input
            type="number"
            placeholder="Max"
            defaultValue={filters.maxArea}
            onBlur={(e) => setFilter("maxArea", e.target.value || undefined)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-navy"
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Construction Status">
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => setFilter("status", filters.status === s.value ? undefined : s.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                filters.status === s.value ? "border-navy bg-navy text-white" : "border-border text-text-secondary hover:border-navy"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Furnishing">
        <div className="flex flex-wrap gap-2">
          {FURNISHING_OPTIONS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter("furnishing", filters.furnishing === f.value ? undefined : f.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                filters.furnishing === f.value ? "border-navy bg-navy text-white" : "border-border text-text-secondary hover:border-navy"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="RERA">
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={filters.rera === "true"}
            onChange={(e) => setFilter("rera", e.target.checked ? "true" : undefined)}
          />
          RERA registered only
        </label>
      </FilterGroup>

      {amenities && amenities.length > 0 && (
        <FilterGroup title="Amenities">
          <div className="flex flex-wrap gap-2">
            {amenities.slice(0, 8).map((a) => (
              <button
                key={a.id}
                onClick={() => toggleAmenity(a.slug)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  selectedAmenities.includes(a.slug) ? "border-navy bg-navy text-white" : "border-border text-text-secondary hover:border-navy"
                }`}
              >
                {a.name}
              </button>
            ))}
          </div>
        </FilterGroup>
      )}
    </div>
  );
}
