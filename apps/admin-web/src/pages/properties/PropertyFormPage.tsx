import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useCrudResource } from "@/lib/useCrudResource";
import { useToast } from "@/components/ui/Toast";
import { FormField, TextInput, TextArea, Select } from "@/components/ui/FormField";
import { MediaManager } from "@/components/ui/MediaManager";

interface Option {
  id: string;
  name: string;
}
interface Agent {
  id: string;
  name: string;
}

interface PropertyDetail {
  id: string;
  title: string;
  projectId?: string | null;
  builderId?: string | null;
  locationId: string;
  propertyTypeId: string;
  categoryId: string;
  purposeId: string;
  description?: string | null;
  price: string | number;
  priceUnit: string;
  carpetArea?: number | null;
  builtUpArea?: number | null;
  superBuiltUpArea?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  balconies?: number | null;
  floorNumber?: number | null;
  totalFloors?: number | null;
  parking?: number | null;
  facing?: string | null;
  furnishing?: string | null;
  propertyAge?: number | null;
  possessionDate?: string | null;
  reraNumber?: string | null;
  status: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  amenities: Option[];
  features: Option[];
  agents: { agent: Agent }[];
}

const FACING_OPTIONS = ["NORTH", "SOUTH", "EAST", "WEST", "NORTH_EAST", "NORTH_WEST", "SOUTH_EAST", "SOUTH_WEST"];
const FURNISHING_OPTIONS = ["UNFURNISHED", "SEMI_FURNISHED", "FULLY_FURNISHED"];
const STATUS_OPTIONS = ["UNDER_CONSTRUCTION", "READY_TO_MOVE", "NEW_LAUNCH", "PRE_LAUNCH", "RESALE"];

const EMPTY_FORM = {
  title: "",
  projectId: "",
  builderId: "",
  locationId: "",
  propertyTypeId: "",
  categoryId: "",
  purposeId: "",
  description: "",
  price: "",
  priceUnit: "TOTAL",
  carpetArea: "",
  builtUpArea: "",
  superBuiltUpArea: "",
  bedrooms: "",
  bathrooms: "",
  balconies: "",
  floorNumber: "",
  totalFloors: "",
  parking: "",
  facing: "",
  furnishing: "",
  propertyAge: "",
  possessionDate: "",
  reraNumber: "",
  status: "READY_TO_MOVE",
  metaTitle: "",
  metaDescription: "",
  amenityIds: [] as string[],
  featureIds: [] as string[],
  agentIds: [] as string[],
};

function useActiveOptions(path: string, key: string) {
  return useQuery({
    queryKey: [key, "active"],
    queryFn: async () => (await apiClient.get<{ data: Option[] }>(`${path}/active`)).data.data,
  });
}

export function PropertyFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const isStaff = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";

  const { useDetail, useCreate, useUpdate } = useCrudResource<PropertyDetail>("/admin/properties", "properties");
  const { data: property } = useDetail(id);
  const createMutation = useCreate();
  const updateMutation = useUpdate();

  const { data: locations = [] } = useQuery({
    queryKey: ["locations", "admin-options"],
    queryFn: async () => (await apiClient.get<{ data: { items: Option[] } }>("/admin/locations", { params: { limit: 200 } })).data.data.items,
  });
  const { data: builders = [] } = useQuery({
    queryKey: ["builders", "admin-options"],
    queryFn: async () => (await apiClient.get<{ data: { items: Option[] } }>("/admin/builders", { params: { limit: 200 } })).data.data.items,
  });
  const { data: projects = [] } = useQuery({
    queryKey: ["projects", "admin-options"],
    queryFn: async () => (await apiClient.get<{ data: { items: Option[] } }>("/admin/projects", { params: { limit: 200 } })).data.data.items,
  });
  const { data: propertyTypes = [] } = useActiveOptions("/admin/property-types", "property-types");
  const { data: categories = [] } = useActiveOptions("/admin/property-categories", "property-categories");
  const { data: purposes = [] } = useActiveOptions("/admin/purposes", "purposes");
  const { data: amenities = [] } = useActiveOptions("/admin/amenities", "amenities");
  const { data: features = [] } = useActiveOptions("/admin/features", "features");
  const { data: agents = [] } = useQuery({
    queryKey: ["agents", "admin-options"],
    queryFn: async () => (await apiClient.get<{ data: { items: Agent[] } }>("/admin/agents", { params: { limit: 200 } })).data.data.items,
    enabled: isStaff,
  });

  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!property) return;
    setForm({
      title: property.title,
      projectId: property.projectId ?? "",
      builderId: property.builderId ?? "",
      locationId: property.locationId,
      propertyTypeId: property.propertyTypeId,
      categoryId: property.categoryId,
      purposeId: property.purposeId,
      description: property.description ?? "",
      price: String(property.price),
      priceUnit: property.priceUnit,
      carpetArea: property.carpetArea ? String(property.carpetArea) : "",
      builtUpArea: property.builtUpArea ? String(property.builtUpArea) : "",
      superBuiltUpArea: property.superBuiltUpArea ? String(property.superBuiltUpArea) : "",
      bedrooms: property.bedrooms ? String(property.bedrooms) : "",
      bathrooms: property.bathrooms ? String(property.bathrooms) : "",
      balconies: property.balconies ? String(property.balconies) : "",
      floorNumber: property.floorNumber ? String(property.floorNumber) : "",
      totalFloors: property.totalFloors ? String(property.totalFloors) : "",
      parking: property.parking ? String(property.parking) : "",
      facing: property.facing ?? "",
      furnishing: property.furnishing ?? "",
      propertyAge: property.propertyAge ? String(property.propertyAge) : "",
      possessionDate: property.possessionDate ? property.possessionDate.slice(0, 10) : "",
      reraNumber: property.reraNumber ?? "",
      status: property.status,
      metaTitle: property.metaTitle ?? "",
      metaDescription: property.metaDescription ?? "",
      amenityIds: property.amenities.map((a) => a.id),
      featureIds: property.features.map((f) => f.id),
      agentIds: property.agents.map((a) => a.agent.id),
    });
  }, [property]);

  function toggleId(field: "amenityIds" | "featureIds" | "agentIds", id: string) {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(id) ? f[field].filter((x) => x !== id) : [...f[field], id],
    }));
  }

  function numberOrUndefined(value: string): number | undefined {
    return value === "" ? undefined : Number(value);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      title: form.title,
      projectId: form.projectId || undefined,
      builderId: form.builderId || undefined,
      locationId: form.locationId,
      propertyTypeId: form.propertyTypeId,
      categoryId: form.categoryId,
      purposeId: form.purposeId,
      description: form.description || undefined,
      price: Number(form.price),
      priceUnit: form.priceUnit,
      carpetArea: numberOrUndefined(form.carpetArea),
      builtUpArea: numberOrUndefined(form.builtUpArea),
      superBuiltUpArea: numberOrUndefined(form.superBuiltUpArea),
      bedrooms: numberOrUndefined(form.bedrooms),
      bathrooms: numberOrUndefined(form.bathrooms),
      balconies: numberOrUndefined(form.balconies),
      floorNumber: numberOrUndefined(form.floorNumber),
      totalFloors: numberOrUndefined(form.totalFloors),
      parking: numberOrUndefined(form.parking),
      facing: form.facing || undefined,
      furnishing: form.furnishing || undefined,
      propertyAge: numberOrUndefined(form.propertyAge),
      possessionDate: form.possessionDate ? new Date(form.possessionDate).toISOString() : undefined,
      reraNumber: form.reraNumber || undefined,
      status: form.status,
      metaTitle: form.metaTitle || undefined,
      metaDescription: form.metaDescription || undefined,
      amenityIds: form.amenityIds,
      featureIds: form.featureIds,
      ...(isStaff ? { agentIds: form.agentIds } : {}),
    };

    try {
      if (isEditing && id) {
        await updateMutation.mutateAsync({ id, input: payload });
        toast.success("Property updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Property created");
      }
      navigate("/properties");
    } catch {
      toast.error("Something went wrong. Please check the form and try again.");
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="font-serif text-2xl text-navy">{isEditing ? "Edit Property" : "Add Property"}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="space-y-4 rounded-lg border border-border bg-white p-6">
          <h2 className="text-sm font-semibold text-text-primary">Basic Information</h2>
          <FormField label="Title" htmlFor="title" required>
            <TextInput id="title" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Location" htmlFor="locationId" required>
              <Select id="locationId" required value={form.locationId} onChange={(e) => setForm((f) => ({ ...f, locationId: e.target.value }))}>
                <option value="">Select location</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Builder" htmlFor="builderId">
              <Select id="builderId" value={form.builderId} onChange={(e) => setForm((f) => ({ ...f, builderId: e.target.value }))}>
                <option value="">None</option>
                {builders.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Project" htmlFor="projectId">
              <Select id="projectId" value={form.projectId} onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))}>
                <option value="">Standalone (no project)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
            </FormField>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Property Type" htmlFor="propertyTypeId" required>
              <Select id="propertyTypeId" required value={form.propertyTypeId} onChange={(e) => setForm((f) => ({ ...f, propertyTypeId: e.target.value }))}>
                <option value="">Select type</option>
                {propertyTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Category" htmlFor="categoryId" required>
              <Select id="categoryId" required value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Purpose" htmlFor="purposeId" required>
              <Select id="purposeId" required value={form.purposeId} onChange={(e) => setForm((f) => ({ ...f, purposeId: e.target.value }))}>
                <option value="">Select purpose</option>
                {purposes.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
            </FormField>
          </div>
          <FormField label="Description" htmlFor="description">
            <TextArea id="description" rows={4} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </FormField>
        </section>

        <section className="space-y-4 rounded-lg border border-border bg-white p-6">
          <h2 className="text-sm font-semibold text-text-primary">Pricing &amp; Area</h2>
          <div className="grid gap-4 sm:grid-cols-4">
            <FormField label="Price (₹)" htmlFor="price" required>
              <TextInput id="price" type="number" required value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
            </FormField>
            <FormField label="Price Unit" htmlFor="priceUnit">
              <Select id="priceUnit" value={form.priceUnit} onChange={(e) => setForm((f) => ({ ...f, priceUnit: e.target.value }))}>
                <option value="TOTAL">Total</option>
                <option value="PER_SQFT">Per Sq.ft.</option>
              </Select>
            </FormField>
            <FormField label="Carpet Area (sq.ft.)" htmlFor="carpetArea">
              <TextInput id="carpetArea" type="number" value={form.carpetArea} onChange={(e) => setForm((f) => ({ ...f, carpetArea: e.target.value }))} />
            </FormField>
            <FormField label="Built-up Area" htmlFor="builtUpArea">
              <TextInput id="builtUpArea" type="number" value={form.builtUpArea} onChange={(e) => setForm((f) => ({ ...f, builtUpArea: e.target.value }))} />
            </FormField>
          </div>
        </section>

        <section className="space-y-4 rounded-lg border border-border bg-white p-6">
          <h2 className="text-sm font-semibold text-text-primary">Configuration</h2>
          <div className="grid gap-4 sm:grid-cols-4">
            <FormField label="Bedrooms" htmlFor="bedrooms">
              <TextInput id="bedrooms" type="number" value={form.bedrooms} onChange={(e) => setForm((f) => ({ ...f, bedrooms: e.target.value }))} />
            </FormField>
            <FormField label="Bathrooms" htmlFor="bathrooms">
              <TextInput id="bathrooms" type="number" value={form.bathrooms} onChange={(e) => setForm((f) => ({ ...f, bathrooms: e.target.value }))} />
            </FormField>
            <FormField label="Balconies" htmlFor="balconies">
              <TextInput id="balconies" type="number" value={form.balconies} onChange={(e) => setForm((f) => ({ ...f, balconies: e.target.value }))} />
            </FormField>
            <FormField label="Parking" htmlFor="parking">
              <TextInput id="parking" type="number" value={form.parking} onChange={(e) => setForm((f) => ({ ...f, parking: e.target.value }))} />
            </FormField>
            <FormField label="Floor" htmlFor="floorNumber">
              <TextInput id="floorNumber" type="number" value={form.floorNumber} onChange={(e) => setForm((f) => ({ ...f, floorNumber: e.target.value }))} />
            </FormField>
            <FormField label="Total Floors" htmlFor="totalFloors">
              <TextInput id="totalFloors" type="number" value={form.totalFloors} onChange={(e) => setForm((f) => ({ ...f, totalFloors: e.target.value }))} />
            </FormField>
            <FormField label="Facing" htmlFor="facing">
              <Select id="facing" value={form.facing} onChange={(e) => setForm((f) => ({ ...f, facing: e.target.value }))}>
                <option value="">Not specified</option>
                {FACING_OPTIONS.map((f) => (
                  <option key={f} value={f}>{f.replace("_", " ")}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Furnishing" htmlFor="furnishing">
              <Select id="furnishing" value={form.furnishing} onChange={(e) => setForm((f) => ({ ...f, furnishing: e.target.value }))}>
                <option value="">Not specified</option>
                {FURNISHING_OPTIONS.map((f) => (
                  <option key={f} value={f}>{f.replace("_", " ")}</option>
                ))}
              </Select>
            </FormField>
          </div>
        </section>

        <section className="space-y-4 rounded-lg border border-border bg-white p-6">
          <h2 className="text-sm font-semibold text-text-primary">Possession &amp; Status</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Status" htmlFor="status" required>
              <Select id="status" required value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Possession Date" htmlFor="possessionDate">
              <TextInput id="possessionDate" type="date" value={form.possessionDate} onChange={(e) => setForm((f) => ({ ...f, possessionDate: e.target.value }))} />
            </FormField>
            <FormField label="RERA Number" htmlFor="reraNumber">
              <TextInput id="reraNumber" value={form.reraNumber} onChange={(e) => setForm((f) => ({ ...f, reraNumber: e.target.value }))} />
            </FormField>
          </div>
        </section>

        <section className="space-y-4 rounded-lg border border-border bg-white p-6">
          <h2 className="text-sm font-semibold text-text-primary">Amenities &amp; Features</h2>
          <div>
            <p className="mb-2 text-xs font-medium text-text-muted">Amenities</p>
            <div className="flex flex-wrap gap-2">
              {amenities.map((a) => (
                <label key={a.id} className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs ${form.amenityIds.includes(a.id) ? "border-navy bg-navy text-white" : "border-border text-text-secondary"}`}>
                  <input type="checkbox" className="hidden" checked={form.amenityIds.includes(a.id)} onChange={() => toggleId("amenityIds", a.id)} />
                  {a.name}
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-text-muted">Features</p>
            <div className="flex flex-wrap gap-2">
              {features.map((f) => (
                <label key={f.id} className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs ${form.featureIds.includes(f.id) ? "border-navy bg-navy text-white" : "border-border text-text-secondary"}`}>
                  <input type="checkbox" className="hidden" checked={form.featureIds.includes(f.id)} onChange={() => toggleId("featureIds", f.id)} />
                  {f.name}
                </label>
              ))}
            </div>
          </div>
        </section>

        {isStaff && (
          <section className="space-y-4 rounded-lg border border-border bg-white p-6">
            <h2 className="text-sm font-semibold text-text-primary">Assigned Agents</h2>
            <div className="flex flex-wrap gap-2">
              {agents.map((a) => (
                <label key={a.id} className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs ${form.agentIds.includes(a.id) ? "border-navy bg-navy text-white" : "border-border text-text-secondary"}`}>
                  <input type="checkbox" className="hidden" checked={form.agentIds.includes(a.id)} onChange={() => toggleId("agentIds", a.id)} />
                  {a.name}
                </label>
              ))}
              {agents.length === 0 && <p className="text-sm text-text-muted">No agents yet.</p>}
            </div>
          </section>
        )}

        <section className="space-y-4 rounded-lg border border-border bg-white p-6">
          <h2 className="text-sm font-semibold text-text-primary">SEO</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="SEO Title" htmlFor="metaTitle">
              <TextInput id="metaTitle" value={form.metaTitle} onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))} />
            </FormField>
            <FormField label="SEO Description" htmlFor="metaDescription">
              <TextInput id="metaDescription" value={form.metaDescription} onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))} />
            </FormField>
          </div>
        </section>

        {isEditing && id && (
          <section className="space-y-6 rounded-lg border border-border bg-white p-6">
            <h2 className="text-sm font-semibold text-text-primary">Media</h2>
            <MediaManager basePath={`/admin/properties/${id}/media`} label="Images" />
            <MediaManager basePath={`/admin/properties/${id}/floor-plans`} label="Floor Plans" accept="image/jpeg,image/png,image/webp,application/pdf" />
            <MediaManager basePath={`/admin/properties/${id}/documents`} label="Documents" accept="image/jpeg,image/png,image/webp,application/pdf" />
          </section>
        )}

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate("/properties")} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-grey-light">
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="rounded-md bg-navy px-6 py-2 text-sm font-medium text-white hover:bg-navy-secondary disabled:opacity-60"
          >
            {isEditing ? "Save Changes" : "Create Property"}
          </button>
        </div>
      </form>
    </div>
  );
}
