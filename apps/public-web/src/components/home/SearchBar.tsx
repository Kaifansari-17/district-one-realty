import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { usePublicList } from "@/lib/usePublicData";
import type { LocationSummary, Builder, PropertyType } from "@/types/api";

const BUDGET_OPTIONS = [
  { label: "Any Budget", min: undefined, max: undefined },
  { label: "Under ₹50 L", min: undefined, max: 5_000_000 },
  { label: "₹50 L - ₹1 Cr", min: 5_000_000, max: 10_000_000 },
  { label: "₹1 Cr - ₹2 Cr", min: 10_000_000, max: 20_000_000 },
  { label: "₹2 Cr - ₹5 Cr", min: 20_000_000, max: 50_000_000 },
  { label: "Above ₹5 Cr", min: 50_000_000, max: undefined },
];

const selectClass =
  "w-full appearance-none rounded-md border-0 bg-transparent py-3 pl-0 pr-6 text-sm text-navy outline-none focus:ring-0 md:border-r md:border-border md:pl-4";

export function SearchBar() {
  const navigate = useNavigate();
  const [purpose, setPurpose] = useState<"buy" | "rent">("buy");
  const [location, setLocation] = useState("");
  const [builder, setBuilder] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [budgetIndex, setBudgetIndex] = useState(0);

  const { data: locations } = usePublicList<LocationSummary[]>("locations-active", "/locations");
  const { data: builders } = usePublicList<Builder[]>("builders-active", "/builders");
  const { data: propertyTypes } = usePublicList<PropertyType[]>("property-types-active", "/property-types");

  function handleSearch() {
    const params = new URLSearchParams();
    params.set("purpose", purpose);
    if (location) params.set("location", location);
    if (builder) params.set("builder", builder);
    if (propertyType) params.set("propertyType", propertyType);

    const budget = BUDGET_OPTIONS[budgetIndex];
    if (budget.min) params.set("minPrice", String(budget.min));
    if (budget.max) params.set("maxPrice", String(budget.max));

    navigate(`/properties?${params.toString()}`);
  }

  return (
    <div className="w-full max-w-5xl rounded-xl border border-border bg-white p-3 shadow-xl md:rounded-full md:p-2">
      <div className="flex flex-col divide-y divide-border md:flex-row md:items-center md:divide-y-0">
        <div className="flex shrink-0 gap-1 rounded-full bg-grey-light p-1 md:mr-2">
          {(["buy", "rent"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPurpose(p)}
              className={`rounded-full px-4 py-2 text-xs font-medium uppercase tracking-wide transition ${
                purpose === p ? "bg-navy text-white" : "text-text-secondary"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex-1 py-1 md:py-0">
          <select value={location} onChange={(e) => setLocation(e.target.value)} className={selectClass}>
            <option value="">Location</option>
            {locations?.map((l) => (
              <option key={l.id} value={l.slug}>{l.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 py-1 md:py-0">
          <select value={builder} onChange={(e) => setBuilder(e.target.value)} className={selectClass}>
            <option value="">Builder</option>
            {builders?.map((b) => (
              <option key={b.id} value={b.slug}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 py-1 md:py-0">
          <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className={selectClass}>
            <option value="">Property Type</option>
            {propertyTypes?.map((t) => (
              <option key={t.id} value={t.slug}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 py-1 md:py-0 md:border-r md:border-border">
          <select
            value={budgetIndex}
            onChange={(e) => setBudgetIndex(Number(e.target.value))}
            className="w-full appearance-none rounded-md border-0 bg-transparent py-3 pl-0 pr-6 text-sm text-navy outline-none focus:ring-0 md:pl-4"
          >
            {BUDGET_OPTIONS.map((b, i) => (
              <option key={b.label} value={i}>{b.label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSearch}
          className="mt-2 flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-medium text-white transition hover:bg-navy-secondary md:mt-0 md:ml-2 md:shrink-0"
        >
          <Search size={16} /> Search
        </button>
      </div>
    </div>
  );
}
