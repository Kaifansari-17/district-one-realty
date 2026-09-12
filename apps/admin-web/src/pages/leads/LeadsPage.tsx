import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useCrudResource } from "@/lib/useCrudResource";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { useToast } from "@/components/ui/Toast";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FormField, Select, TextArea } from "@/components/ui/FormField";

const STATUS_OPTIONS = ["NEW", "CONTACTED", "FOLLOW_UP", "SITE_VISIT_SCHEDULED", "NEGOTIATION", "CONVERTED", "CLOSED", "NOT_INTERESTED"];
const SOURCE_OPTIONS = ["PROPERTY", "PROJECT", "CONTACT", "WEBSITE", "WHATSAPP", "SITE_VISIT"];
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH"];

interface LeadNote {
  id: string;
  text: string;
  createdAt: string;
  createdBy: { id: string; name: string };
}

interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  message?: string | null;
  status: string;
  source: string;
  priority: string;
  agentId?: string | null;
  agent?: { id: string; name: string } | null;
  property?: { id: string; title: string } | null;
  project?: { id: string; name: string } | null;
  createdAt: string;
  notes?: LeadNote[];
}

interface Agent {
  id: string;
  name: string;
}

export function LeadsPage() {
  const { user } = useAuth();
  const isStaff = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";
  const toast = useToast();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({ status: "", source: "", priority: "" });
  const [page, setPage] = useState(1);

  const { useList } = useCrudResource<Lead>("/admin/leads", "leads");
  const { data, isLoading } = useList({
    page,
    limit: 10,
    status: filters.status || undefined,
    source: filters.source || undefined,
    priority: filters.priority || undefined,
  });

  const { data: agents = [] } = useQuery({
    queryKey: ["agents", "active-for-assign"],
    queryFn: async () => (await apiClient.get<{ data: { items: Agent[] } }>("/admin/agents", { params: { limit: 100 } })).data.data.items,
    enabled: isStaff,
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: selectedLead } = useQuery({
    queryKey: ["leads", "detail", selectedId],
    queryFn: async () => (await apiClient.get<{ data: Lead }>(`/admin/leads/${selectedId}`)).data.data,
    enabled: Boolean(selectedId),
  });

  const [noteText, setNoteText] = useState("");

  const updateMutation = useMutation({
    mutationFn: async (input: Partial<Pick<Lead, "status" | "priority" | "agentId">>) =>
      apiClient.put(`/admin/leads/${selectedId}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead updated");
    },
    onError: (err) => toast.error(getErrorMessage(err, "Failed to update lead")),
  });

  const noteMutation = useMutation({
    mutationFn: async (text: string) => apiClient.post(`/admin/leads/${selectedId}/notes`, { text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads", "detail", selectedId] });
      setNoteText("");
    },
    onError: (err) => toast.error(getErrorMessage(err, "Failed to add note")),
  });

  const columns: Column<Lead>[] = [
    {
      key: "name",
      header: "Customer",
      render: (l) => (
        <div>
          <p className="font-medium">{l.name}</p>
          <p className="text-xs text-text-muted">{l.phone}</p>
        </div>
      ),
    },
    { key: "interest", header: "Interested In", render: (l) => l.property?.title ?? l.project?.name ?? "—" },
    { key: "source", header: "Source", render: (l) => l.source.replace("_", " ") },
    { key: "status", header: "Status", render: (l) => <StatusBadge status={l.status} /> },
    { key: "priority", header: "Priority", render: (l) => <StatusBadge status={l.priority} /> },
    { key: "agent", header: "Agent", render: (l) => l.agent?.name ?? "Unassigned" },
    {
      key: "actions",
      header: "",
      render: (l) => (
        <button onClick={() => setSelectedId(l.id)} className="rounded p-1.5 text-text-secondary hover:bg-grey-light hover:text-navy">
          <Eye size={14} />
        </button>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl text-navy">Leads</h1>
        <p className="text-sm text-text-secondary">
          {isStaff ? "Every inquiry across the platform." : "Leads assigned to you."}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} className="w-auto">
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
        </Select>
        <Select value={filters.source} onChange={(e) => setFilters((f) => ({ ...f, source: e.target.value }))} className="w-auto">
          <option value="">All Sources</option>
          {SOURCE_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
        </Select>
        <Select value={filters.priority} onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))} className="w-auto">
          <option value="">All Priorities</option>
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </Select>
      </div>

      <div className="rounded-lg border border-border bg-white">
        <DataTable columns={columns} rows={data?.items ?? []} rowKey={(l) => l.id} isLoading={isLoading} emptyMessage="No leads yet." />
        {data && <Pagination pagination={data.pagination} onPageChange={setPage} />}
      </div>

      <Modal isOpen={Boolean(selectedId)} onClose={() => setSelectedId(null)} title="Lead Details" size="lg">
        {selectedLead && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-text-muted">Customer</p>
                <p className="font-medium">{selectedLead.name}</p>
                <p className="text-sm text-text-secondary">{selectedLead.phone}</p>
                {selectedLead.email && <p className="text-sm text-text-secondary">{selectedLead.email}</p>}
              </div>
              <div>
                <p className="text-xs text-text-muted">Interested In</p>
                <p className="font-medium">{selectedLead.property?.title ?? selectedLead.project?.name ?? "General inquiry"}</p>
                <p className="text-sm text-text-secondary">Source: {selectedLead.source.replace("_", " ")}</p>
              </div>
            </div>

            {selectedLead.message && (
              <div>
                <p className="text-xs text-text-muted">Message</p>
                <p className="text-sm text-text-primary">{selectedLead.message}</p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label="Status" htmlFor="status">
                <Select
                  id="status"
                  value={selectedLead.status}
                  onChange={(e) => updateMutation.mutate({ status: e.target.value })}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.replace("_", " ")}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Priority" htmlFor="priority">
                <Select
                  id="priority"
                  value={selectedLead.priority}
                  onChange={(e) => updateMutation.mutate({ priority: e.target.value })}
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </Select>
              </FormField>
              {isStaff && (
                <FormField label="Assigned Agent" htmlFor="agent">
                  <Select
                    id="agent"
                    value={selectedLead.agentId ?? ""}
                    onChange={(e) => updateMutation.mutate({ agentId: e.target.value || null })}
                  >
                    <option value="">Unassigned</option>
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </Select>
                </FormField>
              )}
            </div>

            <div className="border-t border-border pt-4">
              <p className="mb-2 text-sm font-medium text-text-primary">Follow-up Notes</p>
              <div className="space-y-3">
                {(selectedLead.notes ?? []).length === 0 && <p className="text-sm text-text-muted">No notes yet.</p>}
                {(selectedLead.notes ?? []).map((note) => (
                  <div key={note.id} className="rounded-md bg-grey-light px-3 py-2 text-sm">
                    <p className="text-text-primary">{note.text}</p>
                    <p className="mt-1 text-xs text-text-muted">
                      {note.createdBy.name} &middot; {new Date(note.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <TextArea rows={2} value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add a follow-up note..." />
              </div>
              <button
                onClick={() => noteText.trim() && noteMutation.mutate(noteText.trim())}
                disabled={noteMutation.isPending || !noteText.trim()}
                className="mt-2 rounded-md bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-secondary disabled:opacity-60"
              >
                Add Note
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
