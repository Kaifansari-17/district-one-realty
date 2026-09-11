import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useCrudResource } from "@/lib/useCrudResource";
import { useToast } from "@/components/ui/Toast";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { SearchInput } from "@/components/ui/SearchInput";
import { Pagination } from "@/components/ui/Pagination";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FormField, TextInput, TextArea } from "@/components/ui/FormField";
import { MediaManager } from "@/components/ui/MediaManager";

interface Builder {
  id: string;
  name: string;
  slug: string;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  establishedYear?: number | null;
  description?: string | null;
  isActive: boolean;
  _count?: { properties: number; projects: number };
}

const EMPTY_FORM = {
  name: "",
  website: "",
  email: "",
  phone: "",
  address: "",
  establishedYear: "",
  description: "",
  isActive: true,
};

export function BuildersPage() {
  const { user } = useAuth();
  const isStaff = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";
  const toast = useToast();

  const { useList, useCreate, useUpdate, useRemove } = useCrudResource<Builder>("/admin/builders", "builders");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useList({ q: search || undefined, page, limit: 10 });

  const createMutation = useCreate();
  const updateMutation = useUpdate();
  const removeMutation = useRemove();

  const [editing, setEditing] = useState<Builder | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Builder | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  }

  function openEdit(builder: Builder) {
    setEditing(builder);
    setForm({
      name: builder.name,
      website: builder.website ?? "",
      email: builder.email ?? "",
      phone: builder.phone ?? "",
      address: builder.address ?? "",
      establishedYear: builder.establishedYear ? String(builder.establishedYear) : "",
      description: builder.description ?? "",
      isActive: builder.isActive,
    });
    setFormOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name,
      website: form.website || undefined,
      email: form.email || undefined,
      phone: form.phone || undefined,
      address: form.address || undefined,
      establishedYear: form.establishedYear ? Number(form.establishedYear) : undefined,
      description: form.description || undefined,
      isActive: form.isActive,
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, input: payload });
        toast.success("Builder updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Builder created");
      }
      setFormOpen(false);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await removeMutation.mutateAsync(deleting.id);
      toast.success("Builder deleted");
      setDeleting(null);
    } catch {
      toast.error("Failed to delete — this builder may have properties or projects assigned.");
    }
  }

  const columns: Column<Builder>[] = [
    { key: "name", header: "Name", render: (b) => <span className="font-medium">{b.name}</span> },
    { key: "phone", header: "Phone", render: (b) => b.phone ?? "—" },
    { key: "established", header: "Established", render: (b) => b.establishedYear ?? "—" },
    { key: "status", header: "Status", render: (b) => (b.isActive ? "Active" : "Inactive") },
    ...(isStaff
      ? [
          {
            key: "actions",
            header: "",
            render: (b: Builder) => (
              <div className="flex justify-end gap-2">
                <button onClick={() => openEdit(b)} className="rounded p-1.5 text-text-secondary hover:bg-grey-light hover:text-navy">
                  <Pencil size={14} />
                </button>
                <button onClick={() => setDeleting(b)} className="rounded p-1.5 text-text-secondary hover:bg-red-50 hover:text-red-600">
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
          <h1 className="font-serif text-2xl text-navy">Builders</h1>
          <p className="text-sm text-text-secondary">Manage the trusted developer network shown on the public site.</p>
        </div>
        {isStaff && (
          <button onClick={openCreate} className="flex items-center gap-1.5 rounded-md bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-secondary">
            <Plus size={16} /> Add Builder
          </button>
        )}
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Search builders..." />

      <div className="rounded-lg border border-border bg-white">
        <DataTable columns={columns} rows={data?.items ?? []} rowKey={(b) => b.id} isLoading={isLoading} />
        {data && <Pagination pagination={data.pagination} onPageChange={setPage} />}
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit Builder" : "Add Builder"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Name" htmlFor="name" required>
              <TextInput id="name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </FormField>
            <FormField label="Established Year" htmlFor="year">
              <TextInput id="year" type="number" value={form.establishedYear} onChange={(e) => setForm((f) => ({ ...f, establishedYear: e.target.value }))} />
            </FormField>
            <FormField label="Website" htmlFor="website">
              <TextInput id="website" type="url" placeholder="https://" value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} />
            </FormField>
            <FormField label="Email" htmlFor="email">
              <TextInput id="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </FormField>
            <FormField label="Phone" htmlFor="phone">
              <TextInput id="phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </FormField>
          </div>
          <FormField label="Address" htmlFor="address">
            <TextInput id="address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
          </FormField>
          <FormField label="Description" htmlFor="description">
            <TextArea id="description" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </FormField>

          <label className="flex items-center gap-2 text-sm text-text-primary">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
            Active
          </label>

          {editing && (
            <div className="border-t border-border pt-4">
              <MediaManager basePath={`/admin/builders/${editing.id}/media`} label="Logo" />
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
        title="Delete Builder"
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
