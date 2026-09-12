import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
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

interface ProjectDetail {
  id: string;
  name: string;
  builderId: string;
  locationId: string;
  status: string;
  description?: string | null;
  reraNumber?: string | null;
  launchDate?: string | null;
  possessionDate?: string | null;
  startingPrice?: string | number | null;
  configurations?: string[] | null;
  totalTowers?: number | null;
  totalFloors?: number | null;
  totalUnits?: number | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  amenities: Option[];
  agents: { agent: Agent }[];
}

const STATUS_OPTIONS = ["UNDER_CONSTRUCTION", "READY_TO_MOVE", "NEW_LAUNCH", "PRE_LAUNCH", "RESALE"];

const EMPTY_FORM = {
  name: "",
  builderId: "",
  locationId: "",
  status: "NEW_LAUNCH",
  description: "",
  reraNumber: "",
  launchDate: "",
  possessionDate: "",
  startingPrice: "",
  configurations: "",
  totalTowers: "",
  totalFloors: "",
  totalUnits: "",
  metaTitle: "",
  metaDescription: "",
  isFeatured: false,
  isPublished: false,
  amenityIds: [] as string[],
  agentIds: [] as string[],
};

export function ProjectFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const isStaff = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";

  const { useDetail, useCreate, useUpdate } = useCrudResource<ProjectDetail>("/admin/projects", "projects");
  const { data: project } = useDetail(id);
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
  const { data: amenities = [] } = useQuery({
    queryKey: ["amenities", "active"],
    queryFn: async () => (await apiClient.get<{ data: Option[] }>("/admin/amenities/active")).data.data,
  });
  const { data: agents = [] } = useQuery({
    queryKey: ["agents", "admin-options"],
    queryFn: async () => (await apiClient.get<{ data: { items: Agent[] } }>("/admin/agents", { params: { limit: 200 } })).data.data.items,
    enabled: isStaff,
  });

  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!project) return;
    setForm({
      name: project.name,
      builderId: project.builderId,
      locationId: project.locationId,
      status: project.status,
      description: project.description ?? "",
      reraNumber: project.reraNumber ?? "",
      launchDate: project.launchDate ? project.launchDate.slice(0, 10) : "",
      possessionDate: project.possessionDate ? project.possessionDate.slice(0, 10) : "",
      startingPrice: project.startingPrice ? String(project.startingPrice) : "",
      configurations: (project.configurations ?? []).join(", "),
      totalTowers: project.totalTowers ? String(project.totalTowers) : "",
      totalFloors: project.totalFloors ? String(project.totalFloors) : "",
      totalUnits: project.totalUnits ? String(project.totalUnits) : "",
      metaTitle: project.metaTitle ?? "",
      metaDescription: project.metaDescription ?? "",
      isFeatured: project.isFeatured,
      isPublished: project.isPublished,
      amenityIds: project.amenities.map((a) => a.id),
      agentIds: project.agents.map((a) => a.agent.id),
    });
  }, [project]);

  function toggleId(field: "amenityIds" | "agentIds", value: string) {
    setForm((f) => ({ ...f, [field]: f[field].includes(value) ? f[field].filter((x) => x !== value) : [...f[field], value] }));
  }

  function numberOrUndefined(value: string): number | undefined {
    // A native number input's value should only ever be "" or a valid numeric string, but some
    // browsers report "" via validity.badInput for an intermediate invalid state that isn't
    // reliably empty — guard with Number.isFinite so that can never silently become `NaN`,
    // which JSON.stringify serializes as `null` and the API correctly (but confusingly) rejects
    // as "expected number, received null" for what is meant to be an empty/omitted field.
    if (value === "") return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      name: form.name,
      builderId: form.builderId,
      locationId: form.locationId,
      status: form.status,
      description: form.description || undefined,
      reraNumber: form.reraNumber || undefined,
      launchDate: form.launchDate ? new Date(form.launchDate).toISOString() : undefined,
      possessionDate: form.possessionDate ? new Date(form.possessionDate).toISOString() : undefined,
      startingPrice: numberOrUndefined(form.startingPrice),
      configurations: form.configurations
        ? form.configurations.split(",").map((c) => c.trim()).filter(Boolean)
        : undefined,
      totalTowers: numberOrUndefined(form.totalTowers),
      totalFloors: numberOrUndefined(form.totalFloors),
      totalUnits: numberOrUndefined(form.totalUnits),
      metaTitle: form.metaTitle || undefined,
      metaDescription: form.metaDescription || undefined,
      isPublished: form.isPublished,
      amenityIds: form.amenityIds,
      ...(isStaff ? { isFeatured: form.isFeatured, agentIds: form.agentIds } : {}),
    };

    try {
      if (isEditing && id) {
        await updateMutation.mutateAsync({ id, input: payload });
        toast.success("Project updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Project created");
      }
      navigate("/projects");
    } catch (err) {
      // A Zod validation failure's `errors.body` (e.g. "Expected number, received null") is far
      // more actionable than the generic top-level "Validation failed" message alone.
      const data = isAxiosError(err) ? err.response?.data : undefined;
      const detail = data?.errors?.body?.[0] as string | undefined;
      toast.error(detail ?? data?.message ?? "Something went wrong. Please check the form and try again.");
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="font-serif text-2xl text-navy">{isEditing ? "Edit Project" : "Add Project"}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="space-y-4 rounded-lg border border-border bg-white p-6">
          <h2 className="text-sm font-semibold text-text-primary">Basic Information</h2>
          <FormField label="Project Name" htmlFor="name" required>
            <TextInput id="name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Builder" htmlFor="builderId" required>
              <Select id="builderId" required value={form.builderId} onChange={(e) => setForm((f) => ({ ...f, builderId: e.target.value }))}>
                <option value="">Select builder</option>
                {builders.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Location" htmlFor="locationId" required>
              <Select id="locationId" required value={form.locationId} onChange={(e) => setForm((f) => ({ ...f, locationId: e.target.value }))}>
                <option value="">Select location</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Status" htmlFor="status" required>
              <Select id="status" required value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                ))}
              </Select>
            </FormField>
          </div>
          <FormField label="Description" htmlFor="description">
            <TextArea id="description" rows={4} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </FormField>
        </section>

        <section className="space-y-4 rounded-lg border border-border bg-white p-6">
          <h2 className="text-sm font-semibold text-text-primary">Pricing &amp; Configuration</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Starting Price (₹)" htmlFor="startingPrice">
              <TextInput id="startingPrice" type="number" value={form.startingPrice} onChange={(e) => setForm((f) => ({ ...f, startingPrice: e.target.value }))} />
            </FormField>
            <FormField label="Configurations" htmlFor="configurations" hint="Comma-separated, e.g. 2 BHK, 3 BHK">
              <TextInput id="configurations" value={form.configurations} onChange={(e) => setForm((f) => ({ ...f, configurations: e.target.value }))} />
            </FormField>
            <FormField label="RERA Number" htmlFor="reraNumber">
              <TextInput id="reraNumber" value={form.reraNumber} onChange={(e) => setForm((f) => ({ ...f, reraNumber: e.target.value }))} />
            </FormField>
            <FormField label="Total Towers" htmlFor="totalTowers">
              <TextInput id="totalTowers" type="number" value={form.totalTowers} onChange={(e) => setForm((f) => ({ ...f, totalTowers: e.target.value }))} />
            </FormField>
            <FormField label="Total Floors" htmlFor="totalFloors">
              <TextInput id="totalFloors" type="number" value={form.totalFloors} onChange={(e) => setForm((f) => ({ ...f, totalFloors: e.target.value }))} />
            </FormField>
            <FormField label="Total Units" htmlFor="totalUnits">
              <TextInput id="totalUnits" type="number" value={form.totalUnits} onChange={(e) => setForm((f) => ({ ...f, totalUnits: e.target.value }))} />
            </FormField>
            <FormField label="Launch Date" htmlFor="launchDate">
              <TextInput id="launchDate" type="date" value={form.launchDate} onChange={(e) => setForm((f) => ({ ...f, launchDate: e.target.value }))} />
            </FormField>
            <FormField label="Possession Date" htmlFor="possessionDate">
              <TextInput id="possessionDate" type="date" value={form.possessionDate} onChange={(e) => setForm((f) => ({ ...f, possessionDate: e.target.value }))} />
            </FormField>
          </div>
        </section>

        <section className="space-y-4 rounded-lg border border-border bg-white p-6">
          <h2 className="text-sm font-semibold text-text-primary">Amenities</h2>
          <div className="flex flex-wrap gap-2">
            {amenities.map((a) => (
              <label key={a.id} className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs ${form.amenityIds.includes(a.id) ? "border-navy bg-navy text-white" : "border-border text-text-secondary"}`}>
                <input type="checkbox" className="hidden" checked={form.amenityIds.includes(a.id)} onChange={() => toggleId("amenityIds", a.id)} />
                {a.name}
              </label>
            ))}
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
            <label className="flex items-center gap-2 text-sm text-text-primary">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))} />
              Featured on homepage
            </label>
          </section>
        )}

        <section className="space-y-4 rounded-lg border border-border bg-white p-6">
          <h2 className="text-sm font-semibold text-text-primary">SEO &amp; Publishing</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="SEO Title" htmlFor="metaTitle">
              <TextInput id="metaTitle" value={form.metaTitle} onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))} />
            </FormField>
            <FormField label="SEO Description" htmlFor="metaDescription">
              <TextInput id="metaDescription" value={form.metaDescription} onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))} />
            </FormField>
          </div>
          <label className="flex items-center gap-2 text-sm text-text-primary">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))} />
            Published
          </label>
        </section>

        {isEditing && id && (
          <section className="space-y-6 rounded-lg border border-border bg-white p-6">
            <h2 className="text-sm font-semibold text-text-primary">Media</h2>
            <MediaManager basePath={`/admin/projects/${id}/gallery`} label="Gallery" />
            <MediaManager basePath={`/admin/projects/${id}/brochure`} label="Brochure" accept="application/pdf" />
            <MediaManager basePath={`/admin/projects/${id}/master-plan`} label="Master Plan" accept="image/jpeg,image/png,image/webp,application/pdf" />
          </section>
        )}

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate("/projects")} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-grey-light">
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="rounded-md bg-navy px-6 py-2 text-sm font-medium text-white hover:bg-navy-secondary disabled:opacity-60"
          >
            {isEditing ? "Save Changes" : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
}
