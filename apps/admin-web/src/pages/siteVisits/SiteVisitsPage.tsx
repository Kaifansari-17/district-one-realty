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
import { FormField, Select, TextInput } from "@/components/ui/FormField";

const STATUS_OPTIONS = ["REQUESTED", "CONFIRMED", "COMPLETED", "CANCELLED", "RESCHEDULED"];

interface SiteVisit {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  message?: string | null;
  status: string;
  agentId?: string | null;
  agent?: { id: string; name: string } | null;
  property?: { id: string; title: string } | null;
  project?: { id: string; name: string } | null;
  preferredDate: string;
  preferredTime: string;
}

interface Agent {
  id: string;
  name: string;
}

export function SiteVisitsPage() {
  const { user } = useAuth();
  const isStaff = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";
  const toast = useToast();
  const queryClient = useQueryClient();

  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { useList } = useCrudResource<SiteVisit>("/admin/site-visits", "site-visits");
  const { data, isLoading } = useList({ page, limit: 10, status: status || undefined });

  const { data: agents = [] } = useQuery({
    queryKey: ["agents", "active-for-assign"],
    queryFn: async () => (await apiClient.get<{ data: { items: Agent[] } }>("/admin/agents", { params: { limit: 100 } })).data.data.items,
    enabled: isStaff,
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: visit } = useQuery({
    queryKey: ["site-visits", "detail", selectedId],
    queryFn: async () => (await apiClient.get<{ data: SiteVisit }>(`/admin/site-visits/${selectedId}`)).data.data,
    enabled: Boolean(selectedId),
  });

  const updateMutation = useMutation({
    mutationFn: async (input: Partial<Pick<SiteVisit, "status" | "agentId" | "preferredDate" | "preferredTime">>) =>
      apiClient.put(`/admin/site-visits/${selectedId}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-visits"] });
      toast.success("Site visit updated");
    },
    onError: (err) => toast.error(getErrorMessage(err, "Failed to update")),
  });

  const columns: Column<SiteVisit>[] = [
    {
      key: "name",
      header: "Customer",
      render: (v) => (
        <div>
          <p className="font-medium">{v.name}</p>
          <p className="text-xs text-text-muted">{v.phone}</p>
        </div>
      ),
    },
    { key: "interest", header: "Property / Project", render: (v) => v.property?.title ?? v.project?.name ?? "—" },
    {
      key: "when",
      header: "Preferred Visit",
      render: (v) => (
        <span>
          {new Date(v.preferredDate).toLocaleDateString()} &middot; {v.preferredTime}
        </span>
      ),
    },
    { key: "status", header: "Status", render: (v) => <StatusBadge status={v.status} /> },
    { key: "agent", header: "Agent", render: (v) => v.agent?.name ?? "Unassigned" },
    {
      key: "actions",
      header: "",
      render: (v) => (
        <button onClick={() => setSelectedId(v.id)} className="rounded p-1.5 text-text-secondary hover:bg-grey-light hover:text-navy">
          <Eye size={14} />
        </button>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl text-navy">Site Visits</h1>
        <p className="text-sm text-text-secondary">{isStaff ? "All requested site visits." : "Site visits assigned to you."}</p>
      </div>

      <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-auto">
        <option value="">All Statuses</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </Select>

      <div className="rounded-lg border border-border bg-white">
        <DataTable columns={columns} rows={data?.items ?? []} rowKey={(v) => v.id} isLoading={isLoading} emptyMessage="No site visits yet." />
        {data && <Pagination pagination={data.pagination} onPageChange={setPage} />}
      </div>

      <Modal isOpen={Boolean(selectedId)} onClose={() => setSelectedId(null)} title="Site Visit Details" size="md">
        {visit && (
          <div className="space-y-5">
            <div>
              <p className="text-xs text-text-muted">Customer</p>
              <p className="font-medium">{visit.name}</p>
              <p className="text-sm text-text-secondary">{visit.phone}</p>
              {visit.email && <p className="text-sm text-text-secondary">{visit.email}</p>}
            </div>

            <div>
              <p className="text-xs text-text-muted">Interested In</p>
              <p className="font-medium">{visit.property?.title ?? visit.project?.name ?? "—"}</p>
            </div>

            {visit.message && (
              <div>
                <p className="text-xs text-text-muted">Message</p>
                <p className="text-sm text-text-primary">{visit.message}</p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Preferred Date" htmlFor="date">
                <TextInput
                  id="date"
                  type="date"
                  defaultValue={visit.preferredDate.slice(0, 10)}
                  onBlur={(e) => e.target.value && updateMutation.mutate({ preferredDate: new Date(e.target.value).toISOString() })}
                />
              </FormField>
              <FormField label="Preferred Time" htmlFor="time">
                <TextInput
                  id="time"
                  defaultValue={visit.preferredTime}
                  onBlur={(e) => e.target.value && updateMutation.mutate({ preferredTime: e.target.value })}
                />
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Status" htmlFor="status">
                <Select id="status" value={visit.status} onChange={(e) => updateMutation.mutate({ status: e.target.value })}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </FormField>
              {isStaff && (
                <FormField label="Assigned Agent" htmlFor="agent">
                  <Select
                    id="agent"
                    value={visit.agentId ?? ""}
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
          </div>
        )}
      </Modal>
    </div>
  );
}
