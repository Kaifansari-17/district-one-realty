import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useCrudResource } from "@/lib/useCrudResource";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { useToast } from "@/components/ui/Toast";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { SearchInput } from "@/components/ui/SearchInput";
import { Pagination } from "@/components/ui/Pagination";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FormField, TextInput, TextArea, Select } from "@/components/ui/FormField";
import { MediaManager } from "@/components/ui/MediaManager";

interface City {
  id: string;
  name: string;
  state: { name: string };
}

interface Location {
  id: string;
  name: string;
  slug: string;
  cityId: string;
  city: City;
  description?: string | null;
  pincode?: string | null;
  isActive: boolean;
  _count?: { properties: number; projects: number };
}

const EMPTY_FORM = { name: "", cityId: "", description: "", pincode: "", isActive: true };

export function LocationsPage() {
  const { user } = useAuth();
  const isStaff = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";
  const toast = useToast();

  const { data: cities = [] } = useQuery({
    queryKey: ["cities"],
    queryFn: async () => (await apiClient.get<{ data: City[] }>("/admin/cities")).data.data,
  });

  const { useList, useCreate, useUpdate, useRemove } = useCrudResource<Location>("/admin/locations", "locations");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useList({ q: search || undefined, page, limit: 10 });

  const createMutation = useCreate();
  const updateMutation = useUpdate();
  const removeMutation = useRemove();

  const [editing, setEditing] = useState<Location | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Location | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, cityId: cities[0]?.id ?? "" });
    setFormOpen(true);
  }

  function openEdit(location: Location) {
    setEditing(location);
    setForm({
      name: location.name,
      cityId: location.cityId,
      description: location.description ?? "",
      pincode: location.pincode ?? "",
      isActive: location.isActive,
    });
    setFormOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name,
      cityId: form.cityId,
      description: form.description || undefined,
      pincode: form.pincode || undefined,
      isActive: form.isActive,
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, input: payload });
        toast.success("Location updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Location created");
      }
      setFormOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await removeMutation.mutateAsync(deleting.id);
      toast.success("Location deleted");
      setDeleting(null);
    } catch {
      toast.error("Failed to delete — this location may have properties assigned.");
    }
  }

  const columns: Column<Location>[] = [
    { key: "name", header: "Name", render: (l) => <span className="font-medium">{l.name}</span> },
    { key: "city", header: "City", render: (l) => l.city?.name ?? "—" },
    { key: "pincode", header: "Pincode", render: (l) => l.pincode ?? "—" },
    { key: "status", header: "Status", render: (l) => (l.isActive ? "Active" : "Inactive") },
    ...(isStaff
      ? [
          {
            key: "actions",
            header: "",
            render: (l: Location) => (
              <div className="flex justify-end gap-2">
                <button onClick={() => openEdit(l)} className="rounded p-1.5 text-text-secondary hover:bg-grey-light hover:text-navy">
                  <Pencil size={14} />
                </button>
                <button onClick={() => setDeleting(l)} className="rounded p-1.5 text-text-secondary hover:bg-red-50 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            ),
            className: "text-right",
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-navy">Locations</h1>
          <p className="text-sm text-text-secondary">Manage localities available for property and project discovery.</p>
        </div>
        {isStaff && (
          <button onClick={openCreate} className="flex items-center gap-1.5 rounded-md bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-secondary">
            <Plus size={16} /> Add Location
          </button>
        )}
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Search locations..." />

      <div className="rounded-lg border border-border bg-white">
        <DataTable columns={columns} rows={data?.items ?? []} rowKey={(l) => l.id} isLoading={isLoading} />
        {data && <Pagination pagination={data.pagination} onPageChange={setPage} />}
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit Location" : "Add Location"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Name" htmlFor="name" required>
              <TextInput id="name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </FormField>
            <FormField label="City" htmlFor="cityId" required>
              <Select id="cityId" required value={form.cityId} onChange={(e) => setForm((f) => ({ ...f, cityId: e.target.value }))}>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}, {city.state.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Pincode" htmlFor="pincode">
              <TextInput id="pincode" value={form.pincode} onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))} />
            </FormField>
          </div>
          <FormField label="Description" htmlFor="description">
            <TextArea id="description" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </FormField>

          <label className="flex items-center gap-2 text-sm text-text-primary">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
            Active
          </label>

          {editing && (
            <div className="border-t border-border pt-4">
              <MediaManager basePath={`/admin/locations/${editing.id}/media`} label="Location Image" />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setFormOpen(false)} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-grey-light">
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="rounded-md bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-secondary disabled:opacity-60"
            >
              {editing ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        title="Delete Location"
        message={`Are you sure you want to delete "${deleting?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        isDanger
        isLoading={removeMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
