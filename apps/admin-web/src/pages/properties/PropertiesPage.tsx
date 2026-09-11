import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Eye, EyeOff, Archive, Star, ShieldCheck } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useCrudResource } from "@/lib/useCrudResource";
import { useToast } from "@/components/ui/Toast";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Select } from "@/components/ui/FormField";
import { formatIndianPrice } from "@district-one/shared-utils";

interface Property {
  id: string;
  title: string;
  price: string | number;
  status: string;
  publishStatus: string;
  featured: boolean;
  verified: boolean;
  location?: { name: string } | null;
  builder?: { name: string } | null;
  primaryImage?: { url: string } | null;
  agents?: { agent: { name: string } }[];
}

const STATUS_OPTIONS = ["UNDER_CONSTRUCTION", "READY_TO_MOVE", "NEW_LAUNCH", "PRE_LAUNCH", "RESALE"];
const PUBLISH_OPTIONS = ["DRAFT", "PUBLISHED", "ARCHIVED"];

export function PropertiesPage() {
  const { user } = useAuth();
  const isStaff = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [publishStatus, setPublishStatus] = useState("");
  const [page, setPage] = useState(1);

  const { useList, useRemove } = useCrudResource<Property>("/admin/properties", "properties");
  const { data, isLoading } = useList({
    page,
    limit: 10,
    q: search || undefined,
    status: status || undefined,
    publishStatus: publishStatus || undefined,
  });

  const removeMutation = useRemove();
  const [deleting, setDeleting] = useState<Property | null>(null);

  const actionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "publish" | "unpublish" | "archive" }) =>
      apiClient.patch(`/admin/properties/${id}/${action}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast.success("Property updated");
    },
    onError: () => toast.error("Failed to update property"),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: "featured" | "verified"; value: boolean }) =>
      apiClient.patch(`/admin/properties/${id}/${field}`, { [field]: value }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["properties"] }),
    onError: () => toast.error("Failed to update"),
  });

  async function handleDelete() {
    if (!deleting) return;
    try {
      await removeMutation.mutateAsync(deleting.id);
      toast.success("Property deleted");
      setDeleting(null);
    } catch {
      toast.error("Failed to delete property");
    }
  }

  const columns: Column<Property>[] = [
    {
      key: "title",
      header: "Property",
      render: (p) => (
        <div className="flex items-center gap-3">
          {p.primaryImage ? (
            <img src={p.primaryImage.url} alt="" className="h-10 w-14 rounded object-cover" />
          ) : (
            <div className="h-10 w-14 rounded bg-grey-light" />
          )}
          <div>
            <p className="font-medium">{p.title}</p>
            <p className="text-xs text-text-muted">{p.location?.name}{p.builder ? ` · ${p.builder.name}` : ""}</p>
          </div>
        </div>
      ),
    },
    { key: "price", header: "Price", render: (p) => formatIndianPrice(Number(p.price)) },
    { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
    { key: "publishStatus", header: "Publish", render: (p) => <StatusBadge status={p.publishStatus} /> },
    {
      key: "flags",
      header: "Flags",
      render: (p) => (
        <div className="flex gap-1">
          {p.featured && <span className="rounded bg-gold-soft px-1.5 py-0.5 text-[10px] text-navy">Featured</span>}
          {p.verified && <span className="rounded bg-green-50 px-1.5 py-0.5 text-[10px] text-green-700">Verified</span>}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (p) => (
        <div className="flex justify-end gap-1">
          {p.publishStatus === "PUBLISHED" ? (
            <button onClick={() => actionMutation.mutate({ id: p.id, action: "unpublish" })} title="Unpublish" className="rounded p-1.5 text-text-secondary hover:bg-grey-light hover:text-navy">
              <EyeOff size={14} />
            </button>
          ) : (
            <button onClick={() => actionMutation.mutate({ id: p.id, action: "publish" })} title="Publish" className="rounded p-1.5 text-text-secondary hover:bg-grey-light hover:text-navy">
              <Eye size={14} />
            </button>
          )}
          <button onClick={() => actionMutation.mutate({ id: p.id, action: "archive" })} title="Archive" className="rounded p-1.5 text-text-secondary hover:bg-grey-light hover:text-navy">
            <Archive size={14} />
          </button>
          {isStaff && (
            <>
              <button
                onClick={() => toggleMutation.mutate({ id: p.id, field: "featured", value: !p.featured })}
                title="Toggle featured"
                className={`rounded p-1.5 hover:bg-grey-light ${p.featured ? "text-gold" : "text-text-secondary"}`}
              >
                <Star size={14} />
              </button>
              <button
                onClick={() => toggleMutation.mutate({ id: p.id, field: "verified", value: !p.verified })}
                title="Toggle verified"
                className={`rounded p-1.5 hover:bg-grey-light ${p.verified ? "text-green-600" : "text-text-secondary"}`}
              >
                <ShieldCheck size={14} />
              </button>
            </>
          )}
          <button onClick={() => navigate(`/properties/${p.id}/edit`)} title="Edit" className="rounded p-1.5 text-text-secondary hover:bg-grey-light hover:text-navy">
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
          <h1 className="font-serif text-2xl text-navy">Properties</h1>
          <p className="text-sm text-text-secondary">{isStaff ? "Every property listing." : "Properties assigned to you."}</p>
        </div>
        {isStaff && (
          <button onClick={() => navigate("/properties/new")} className="flex items-center gap-1.5 rounded-md bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-secondary">
            <Plus size={16} /> Add Property
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by title..." />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-auto">
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </Select>
        <Select value={publishStatus} onChange={(e) => setPublishStatus(e.target.value)} className="w-auto">
          <option value="">All Publish States</option>
          {PUBLISH_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </div>

      <div className="rounded-lg border border-border bg-white">
        <DataTable columns={columns} rows={data?.items ?? []} rowKey={(p) => p.id} isLoading={isLoading} emptyMessage="No properties yet." />
        {data && <Pagination pagination={data.pagination} onPageChange={setPage} />}
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        title="Delete Property"
        message={`Are you sure you want to delete "${deleting?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        isDanger
        isLoading={removeMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
