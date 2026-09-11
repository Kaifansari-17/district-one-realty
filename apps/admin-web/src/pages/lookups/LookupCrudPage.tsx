import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useCrudResource } from "@/lib/useCrudResource";
import { useToast } from "@/components/ui/Toast";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { SearchInput } from "@/components/ui/SearchInput";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FormField, TextInput, TextArea } from "@/components/ui/FormField";

interface LookupItem {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  isActive: boolean;
}

interface LookupCrudPageProps {
  title: string;
  /** Singular form for buttons/dialogs, e.g. "Amenity" for title="Amenities" — English pluralization isn't a simple suffix strip, so this is spelled out explicitly rather than guessed. */
  singularLabel: string;
  basePath: string;
  resourceKey: string;
  fields?: Array<"icon" | "description">;
}

export function LookupCrudPage({ title, singularLabel, basePath, resourceKey, fields = [] }: LookupCrudPageProps) {
  const { user } = useAuth();
  const isStaff = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";
  const toast = useToast();

  const { useList, useCreate, useUpdate, useRemove } = useCrudResource<LookupItem>(basePath, resourceKey);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useList({ q: search || undefined, limit: 50 });

  const createMutation = useCreate();
  const updateMutation = useUpdate();
  const removeMutation = useRemove();

  const [editing, setEditing] = useState<LookupItem | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<LookupItem | null>(null);

  const [form, setForm] = useState({ name: "", icon: "", description: "", isActive: true });

  function openCreate() {
    setEditing(null);
    setForm({ name: "", icon: "", description: "", isActive: true });
    setFormOpen(true);
  }

  function openEdit(item: LookupItem) {
    setEditing(item);
    setForm({ name: item.name, icon: item.icon ?? "", description: item.description ?? "", isActive: item.isActive });
    setFormOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name,
      isActive: form.isActive,
      ...(fields.includes("icon") ? { icon: form.icon || undefined } : {}),
      ...(fields.includes("description") ? { description: form.description || undefined } : {}),
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, input: payload });
        toast.success(`${singularLabel} updated`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(`${singularLabel} created`);
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
      toast.success("Deleted successfully");
      setDeleting(null);
    } catch {
      toast.error("Failed to delete — it may still be in use.");
    }
  }

  const columns: Column<LookupItem>[] = [
    { key: "name", header: "Name", render: (item) => <span className="font-medium">{item.name}</span> },
    { key: "slug", header: "Slug", render: (item) => <span className="text-text-muted">{item.slug}</span> },
    {
      key: "isActive",
      header: "Status",
      render: (item) => (
        <span className={item.isActive ? "text-green-700" : "text-text-muted"}>{item.isActive ? "Active" : "Inactive"}</span>
      ),
    },
    ...(isStaff
      ? [
          {
            key: "actions",
            header: "",
            render: (item: LookupItem) => (
              <div className="flex justify-end gap-2">
                <button onClick={() => openEdit(item)} className="rounded p-1.5 text-text-secondary hover:bg-grey-light hover:text-navy">
                  <Pencil size={14} />
                </button>
                <button onClick={() => setDeleting(item)} className="rounded p-1.5 text-text-secondary hover:bg-red-50 hover:text-red-600">
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
          <h1 className="font-serif text-2xl text-navy">{title}</h1>
          <p className="text-sm text-text-secondary">Manage {title.toLowerCase()} available across properties and projects.</p>
        </div>
        {isStaff && (
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-md bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-secondary"
          >
            <Plus size={16} /> Add {singularLabel}
          </button>
        )}
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder={`Search ${title.toLowerCase()}...`} />

      <DataTable columns={columns} rows={data?.items ?? []} rowKey={(item) => item.id} isLoading={isLoading} />

      <Modal isOpen={isFormOpen} onClose={() => setFormOpen(false)} title={editing ? `Edit ${singularLabel}` : `Add ${singularLabel}`} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Name" htmlFor="name" required>
            <TextInput id="name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </FormField>

          {fields.includes("icon") && (
            <FormField label="Icon" htmlFor="icon" hint="Icon name or emoji shown in listings">
              <TextInput id="icon" value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} />
            </FormField>
          )}

          {fields.includes("description") && (
            <FormField label="Description" htmlFor="description">
              <TextArea id="description" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </FormField>
          )}

          <label className="flex items-center gap-2 text-sm text-text-primary">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
            Active
          </label>

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
        title={`Delete ${singularLabel}`}
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
