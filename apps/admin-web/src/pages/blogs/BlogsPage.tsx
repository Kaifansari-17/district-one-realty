import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useCrudResource } from "@/lib/useCrudResource";
import { useToast } from "@/components/ui/Toast";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Select } from "@/components/ui/FormField";

interface Blog {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  createdAt: string;
  author: { name: string };
}

export function BlogsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);

  const { useList, useRemove } = useCrudResource<Blog>("/admin/blogs", "blogs");
  const { data, isLoading } = useList({ page, limit: 10, isPublished: filter || undefined });
  const removeMutation = useRemove();
  const [deleting, setDeleting] = useState<Blog | null>(null);

  async function handleDelete() {
    if (!deleting) return;
    try {
      await removeMutation.mutateAsync(deleting.id);
      toast.success("Blog post deleted");
      setDeleting(null);
    } catch {
      toast.error("Failed to delete post");
    }
  }

  const columns: Column<Blog>[] = [
    { key: "title", header: "Title", render: (b) => <span className="font-medium">{b.title}</span> },
    { key: "author", header: "Author", render: (b) => b.author.name },
    { key: "status", header: "Status", render: (b) => <StatusBadge status={b.isPublished ? "PUBLISHED" : "DRAFT"} /> },
    { key: "date", header: "Created", render: (b) => new Date(b.createdAt).toLocaleDateString() },
    {
      key: "actions",
      header: "",
      render: (b) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => navigate(`/blogs/${b.id}/edit`)} className="rounded p-1.5 text-text-secondary hover:bg-grey-light hover:text-navy">
            <Pencil size={14} />
          </button>
          <button onClick={() => setDeleting(b)} className="rounded p-1.5 text-text-secondary hover:bg-red-50 hover:text-red-600">
            <Trash2 size={14} />
          </button>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-navy">Blogs</h1>
          <p className="text-sm text-text-secondary">Editorial content for the public /blog section.</p>
        </div>
        <button onClick={() => navigate("/blogs/new")} className="flex items-center gap-1.5 rounded-md bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-secondary">
          <Plus size={16} /> New Post
        </button>
      </div>

      <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-auto">
        <option value="">All Posts</option>
        <option value="true">Published</option>
        <option value="false">Draft</option>
      </Select>

      <div className="rounded-lg border border-border bg-white">
        <DataTable columns={columns} rows={data?.items ?? []} rowKey={(b) => b.id} isLoading={isLoading} emptyMessage="No blog posts yet." />
        {data && <Pagination pagination={data.pagination} onPageChange={setPage} />}
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        title="Delete Blog Post"
        message={`Are you sure you want to delete "${deleting?.title}"?`}
        confirmLabel="Delete"
        isDanger
        isLoading={removeMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
