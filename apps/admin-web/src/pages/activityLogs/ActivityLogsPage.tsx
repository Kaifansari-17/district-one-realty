import { useState } from "react";
import { useCrudResource } from "@/lib/useCrudResource";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";

interface ActivityLog {
  id: string;
  action: string;
  entity: string;
  entityId?: string | null;
  createdAt: string;
  user: { id: string; name: string; role: string };
}

const ACTION_LABEL: Record<string, string> = {
  CREATE: "created",
  UPDATE: "updated",
  DELETE: "deleted",
  PUBLISH: "published",
  UNPUBLISH: "unpublished",
  ARCHIVE: "archived",
  SET_FEATURED: "changed featured status of",
  SET_VERIFIED: "changed verified status of",
  ACTIVATE: "activated",
  DEACTIVATE: "deactivated",
  RESET_PASSWORD: "reset password for",
  MARK_READ: "marked message read for",
  LOGIN: "logged in",
};

export function ActivityLogsPage() {
  const [page, setPage] = useState(1);
  const { useList } = useCrudResource<ActivityLog>("/admin/activity-logs", "activity-logs");
  const { data, isLoading } = useList({ page, limit: 20 });

  const columns: Column<ActivityLog>[] = [
    { key: "user", header: "User", render: (l) => <span className="font-medium">{l.user.name}</span> },
    {
      key: "action",
      header: "Action",
      render: (l) => (
        <span>
          {ACTION_LABEL[l.action] ?? l.action.toLowerCase()} <span className="text-text-muted">{l.entity}</span>
        </span>
      ),
    },
    { key: "date", header: "When", render: (l) => new Date(l.createdAt).toLocaleString() },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl text-navy">Activity Logs</h1>
        <p className="text-sm text-text-secondary">A full audit trail of admin and agent actions.</p>
      </div>

      <div className="rounded-lg border border-border bg-white">
        <DataTable columns={columns} rows={data?.items ?? []} rowKey={(l) => l.id} isLoading={isLoading} emptyMessage="No activity recorded yet." />
        {data && <Pagination pagination={data.pagination} onPageChange={setPage} />}
      </div>
    </div>
  );
}
