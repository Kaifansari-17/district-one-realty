import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Power, KeyRound } from "lucide-react";
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

interface Agent {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  designation?: string | null;
  bio?: string | null;
  role: "SUPER_ADMIN" | "ADMIN" | "AGENT";
  isActive: boolean;
  lastLoginAt?: string | null;
}

const EMPTY_FORM = { name: "", email: "", phone: "", designation: "", bio: "", role: "AGENT" as const };

export function AgentsPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const toast = useToast();
  const queryClient = useQueryClient();

  const { useList, useUpdate } = useCrudResource<Agent>("/admin/agents", "agents");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useList({ q: search || undefined, page, limit: 10 });

  const updateMutation = useUpdate();

  const createMutation = useMutation({
    mutationFn: async (input: typeof EMPTY_FORM) => (await apiClient.post<{ data: { user: Agent; temporaryPassword?: string } }>("/admin/agents", input)).data.data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["agents"] }),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, activate }: { id: string; activate: boolean }) =>
      apiClient.patch(`/admin/agents/${id}/${activate ? "activate" : "deactivate"}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["agents"] }),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (id: string) =>
      (await apiClient.post<{ data: { temporaryPassword: string } }>(`/admin/agents/${id}/reset-password`)).data.data,
  });

  const [editing, setEditing] = useState<Agent | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [deactivating, setDeactivating] = useState<Agent | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  }

  function openEdit(agent: Agent) {
    setEditing(agent);
    setForm({ name: agent.name, email: agent.email, phone: agent.phone ?? "", designation: agent.designation ?? "", bio: agent.bio ?? "", role: agent.role as "AGENT" });
    setFormOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editing) {
        await updateMutation.mutateAsync({
          id: editing.id,
          input: { name: form.name, phone: form.phone || undefined, designation: form.designation || undefined, bio: form.bio || undefined },
        });
        toast.success("Agent updated");
        setFormOpen(false);
      } else {
        const result = await createMutation.mutateAsync(form);
        toast.success("Agent account created");
        setFormOpen(false);
        if (result.temporaryPassword) setGeneratedPassword(result.temporaryPassword);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleToggleActive() {
    if (!deactivating) return;
    try {
      await toggleActiveMutation.mutateAsync({ id: deactivating.id, activate: !deactivating.isActive });
      toast.success(deactivating.isActive ? "Agent deactivated" : "Agent activated");
      setDeactivating(null);
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function handleResetPassword(id: string) {
    setResettingId(id);
    try {
      const result = await resetPasswordMutation.mutateAsync(id);
      setGeneratedPassword(result.temporaryPassword);
    } catch {
      toast.error("Failed to reset password");
    } finally {
      setResettingId(null);
    }
  }

  const columns: Column<Agent>[] = [
    { key: "name", header: "Name", render: (a) => <span className="font-medium">{a.name}</span> },
    { key: "email", header: "Email", render: (a) => a.email },
    { key: "role", header: "Role", render: (a) => a.role.replace("_", " ") },
    { key: "designation", header: "Designation", render: (a) => a.designation ?? "—" },
    { key: "status", header: "Status", render: (a) => (a.isActive ? <span className="text-green-700">Active</span> : <span className="text-text-muted">Inactive</span>) },
    {
      key: "actions",
      header: "",
      render: (a) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => openEdit(a)} title="Edit" className="rounded p-1.5 text-text-secondary hover:bg-grey-light hover:text-navy">
            <Pencil size={14} />
          </button>
          <button
            onClick={() => handleResetPassword(a.id)}
            disabled={resettingId === a.id}
            title="Reset password"
            className="rounded p-1.5 text-text-secondary hover:bg-grey-light hover:text-navy disabled:opacity-50"
          >
            <KeyRound size={14} />
          </button>
          {a.id !== user?.id && (
            <button onClick={() => setDeactivating(a)} title={a.isActive ? "Deactivate" : "Activate"} className="rounded p-1.5 text-text-secondary hover:bg-red-50 hover:text-red-600">
              <Power size={14} />
            </button>
          )}
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-navy">Agents</h1>
          <p className="text-sm text-text-secondary">Manage Admin and Agent accounts. No public registration.</p>
        </div>
        {isSuperAdmin && (
          <button onClick={openCreate} className="flex items-center gap-1.5 rounded-md bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-secondary">
            <Plus size={16} /> Add Account
          </button>
        )}
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Search agents..." />

      <div className="rounded-lg border border-border bg-white">
        <DataTable columns={columns} rows={data?.items ?? []} rowKey={(a) => a.id} isLoading={isLoading} />
        {data && <Pagination pagination={data.pagination} onPageChange={setPage} />}
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit Account" : "Add Account"} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Name" htmlFor="name" required>
              <TextInput id="name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </FormField>
            <FormField label="Email" htmlFor="email" required>
              <TextInput id="email" type="email" required disabled={Boolean(editing)} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </FormField>
            <FormField label="Phone" htmlFor="phone">
              <TextInput id="phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </FormField>
            <FormField label="Designation" htmlFor="designation">
              <TextInput id="designation" value={form.designation} onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))} />
            </FormField>
            {!editing && (
              <FormField label="Role" htmlFor="role" required>
                <Select id="role" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as "AGENT" }))}>
                  <option value="AGENT">Agent</option>
                  <option value="ADMIN">Admin</option>
                </Select>
              </FormField>
            )}
          </div>
          <FormField label="Bio" htmlFor="bio">
            <TextArea id="bio" rows={3} value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
          </FormField>

          {!editing && <p className="text-xs text-text-muted">A secure temporary password will be generated and shown once.</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setFormOpen(false)} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-grey-light">
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="rounded-md bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-secondary disabled:opacity-60"
            >
              {editing ? "Save Changes" : "Create Account"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={Boolean(generatedPassword)} onClose={() => setGeneratedPassword(null)} title="Temporary Password" size="sm">
        <p className="text-sm text-text-secondary">
          Share this temporary password securely with the account holder. It will not be shown again.
        </p>
        <p className="mt-4 rounded-md bg-grey-light px-4 py-3 text-center font-mono text-lg tracking-wide text-navy">{generatedPassword}</p>
        <button onClick={() => setGeneratedPassword(null)} className="mt-4 w-full rounded-md bg-navy py-2 text-sm font-medium text-white hover:bg-navy-secondary">
          Done
        </button>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deactivating)}
        title={deactivating?.isActive ? "Deactivate Account" : "Activate Account"}
        message={`Are you sure you want to ${deactivating?.isActive ? "deactivate" : "activate"} "${deactivating?.name}"?`}
        confirmLabel={deactivating?.isActive ? "Deactivate" : "Activate"}
        isDanger={deactivating?.isActive}
        isLoading={toggleActiveMutation.isPending}
        onConfirm={handleToggleActive}
        onCancel={() => setDeactivating(null)}
      />
    </div>
  );
}
