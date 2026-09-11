import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, MailOpen } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useCrudResource } from "@/lib/useCrudResource";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Select } from "@/components/ui/FormField";

interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function MessagesPage() {
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { useList } = useCrudResource<ContactMessage>("/admin/messages", "messages");
  const { data, isLoading } = useList({ page, limit: 10, isRead: filter || undefined });

  const toggleReadMutation = useMutation({
    mutationFn: async ({ id, isRead }: { id: string; isRead: boolean }) => apiClient.patch(`/admin/messages/${id}/read`, { isRead }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["messages"] }),
  });

  const columns: Column<ContactMessage>[] = [
    {
      key: "name",
      header: "From",
      render: (m) => (
        <div className={!m.isRead ? "font-semibold" : ""}>
          <p>{m.name}</p>
          <p className="text-xs text-text-muted">{m.phone}{m.email ? ` · ${m.email}` : ""}</p>
        </div>
      ),
    },
    { key: "message", header: "Message", render: (m) => <span className="line-clamp-2 max-w-md text-text-secondary">{m.message}</span> },
    { key: "date", header: "Received", render: (m) => new Date(m.createdAt).toLocaleString() },
    {
      key: "actions",
      header: "",
      render: (m) => (
        <button
          onClick={() => toggleReadMutation.mutate({ id: m.id, isRead: !m.isRead })}
          title={m.isRead ? "Mark as unread" : "Mark as read"}
          className="rounded p-1.5 text-text-secondary hover:bg-grey-light hover:text-navy"
        >
          {m.isRead ? <MailOpen size={14} /> : <Mail size={14} />}
        </button>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl text-navy">Messages</h1>
        <p className="text-sm text-text-secondary">Submissions from the public contact form.</p>
      </div>

      <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-auto">
        <option value="">All Messages</option>
        <option value="false">Unread</option>
        <option value="true">Read</option>
      </Select>

      <div className="rounded-lg border border-border bg-white">
        <DataTable columns={columns} rows={data?.items ?? []} rowKey={(m) => m.id} isLoading={isLoading} emptyMessage="No messages yet." />
        {data && <Pagination pagination={data.pagination} onPageChange={setPage} />}
      </div>
    </div>
  );
}
