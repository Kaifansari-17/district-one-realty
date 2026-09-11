import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Eye, EyeOff, Star } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useCrudResource } from "@/lib/useCrudResource";
import { useToast } from "@/components/ui/Toast";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface Project {
  id: string;
  name: string;
  status: string;
  isPublished: boolean;
  isFeatured: boolean;
  builder?: { name: string } | null;
  location?: { name: string } | null;
}

export function ProjectsPage() {
  const { user } = useAuth();
  const isStaff = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { useList, useRemove } = useCrudResource<Project>("/admin/projects", "projects");
  const { data, isLoading } = useList({ page, limit: 10, q: search || undefined });
  const removeMutation = useRemove();
  const [deleting, setDeleting] = useState<Project | null>(null);

  const actionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "publish" | "unpublish" }) => apiClient.patch(`/admin/projects/${id}/${action}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project updated");
    },
    onError: () => toast.error("Failed to update project"),
  });

  const featureMutation = useMutation({
    mutationFn: async ({ id, isFeatured }: { id: string; isFeatured: boolean }) => apiClient.patch(`/admin/projects/${id}/featured`, { isFeatured }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });

  async function handleDelete() {
    if (!deleting) return;
    try {
      await removeMutation.mutateAsync(deleting.id);
      toast.success("Project deleted");
      setDeleting(null);
    } catch {
      toast.error("Failed to delete — this project may have properties assigned.");
    }
  }

  const columns: Column<Project>[] = [
    { key: "name", header: "Project", render: (p) => <span className="font-medium">{p.name}</span> },
    { key: "builder", header: "Builder", render: (p) => p.builder?.name ?? "—" },
    { key: "location", header: "Location", render: (p) => p.location?.name ?? "—" },
    { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
    { key: "published", header: "Published", render: (p) => <StatusBadge status={p.isPublished ? "PUBLISHED" : "DRAFT"} /> },
    {
      key: "actions",
      header: "",
      render: (p) => (
        <div className="flex justify-end gap-1">
          {p.isPublished ? (
            <button onClick={() => actionMutation.mutate({ id: p.id, action: "unpublish" })} title="Unpublish" className="rounded p-1.5 text-text-secondary hover:bg-grey-light hover:text-navy">
              <EyeOff size={14} />
            </button>
          ) : (
            <button onClick={() => actionMutation.mutate({ id: p.id, action: "publish" })} title="Publish" className="rounded p-1.5 text-text-secondary hover:bg-grey-light hover:text-navy">
              <Eye size={14} />
            </button>
          )}
          {isStaff && (
            <button
              onClick={() => featureMutation.mutate({ id: p.id, isFeatured: !p.isFeatured })}
              title="Toggle featured"
              className={`rounded p-1.5 hover:bg-grey-light ${p.isFeatured ? "text-gold" : "text-text-secondary"}`}
            >
              <Star size={14} />
            </button>
          )}
          <button onClick={() => navigate(`/projects/${p.id}/edit`)} title="Edit" className="rounded p-1.5 text-text-secondary hover:bg-grey-light hover:text-navy">
            <Pencil size={14} />
          </button>
          {isStaff && (
            <button onClick={() => setDeleting(p)} title="Delete" className="rounded p-1.5 text-text-secondary hover:bg-red-50 hover:text-red-600">
              <Trash2 size={14} />
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
          <h1 className="font-serif text-2xl text-navy">Projects</h1>
          <p className="text-sm text-text-secondary">{isStaff ? "Every project." : "Projects assigned to you."}</p>
        </div>
        {isStaff && (
          <button onClick={() => navigate("/projects/new")} className="flex items-center gap-1.5 rounded-md bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-secondary">
            <Plus size={16} /> Add Project
          </button>
        )}
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Search projects..." />

      <div className="rounded-lg border border-border bg-white">
        <DataTable columns={columns} rows={data?.items ?? []} rowKey={(p) => p.id} isLoading={isLoading} emptyMessage="No projects yet." />
        {data && <Pagination pagination={data.pagination} onPageChange={setPage} />}
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        title="Delete Project"
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
