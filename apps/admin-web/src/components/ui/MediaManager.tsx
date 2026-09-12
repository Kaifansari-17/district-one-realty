import { useRef } from "react";
import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, Trash2, Upload, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import type { MediaAsset } from "@district-one/shared-types";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";

interface MediaManagerProps {
  /** e.g. `/admin/properties/${id}/media` — must already exist as a server resource. */
  basePath: string;
  label?: string;
  accept?: string;
}

export function MediaManager({ basePath, label = "Images", accept = "image/jpeg,image/jpg,image/png,image/webp" }: MediaManagerProps) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryKey = ["media", basePath];

  const { data: media = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => (await apiClient.get<{ data: MediaAsset[] }>(basePath)).data.data,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      await apiClient.post(basePath, formData, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: () => {
      invalidate();
      toast.success("Uploaded successfully");
    },
    onError: () => toast.error("Upload failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (mediaId: string) => apiClient.delete(`${basePath}/${mediaId}`),
    onSuccess: () => {
      invalidate();
      toast.success("Removed");
    },
    onError: (error: unknown) => {
      // A 404 here means the item was already deleted (e.g. a duplicate click before the
      // button's disabled state took effect) — the end state the user wanted is already true.
      if (isAxiosError(error) && error.response?.status === 404) {
        invalidate();
        return;
      }
      toast.error("Failed to remove");
    },
  });

  const primaryMutation = useMutation({
    mutationFn: async (mediaId: string) => apiClient.patch(`${basePath}/${mediaId}/primary`),
    onSuccess: () => invalidate(),
    onError: () => toast.error("Failed to update"),
  });

  const reorderMutation = useMutation({
    mutationFn: async (orderedIds: string[]) => apiClient.patch(`${basePath}/reorder`, { orderedIds }),
    onSuccess: () => invalidate(),
    onError: () => toast.error("Failed to reorder"),
  });

  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => uploadMutation.mutate(file));
  }

  function move(index: number, direction: -1 | 1) {
    const next = [...media];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= next.length) return;
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    reorderMutation.mutate(next.map((m) => m.id));
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-navy hover:bg-grey-light disabled:opacity-60"
        >
          {uploadMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          Upload
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple
          hidden
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-text-muted">Loading media...</p>
      ) : media.length === 0 ? (
        <p className="rounded-md border border-dashed border-border py-8 text-center text-sm text-text-muted">No media uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {media.map((item, index) => (
            <div key={item.id} className="group relative overflow-hidden rounded-md border border-border">
              <img src={item.url} alt={item.alt ?? ""} className="h-28 w-full object-cover" />
              {item.isPrimary && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-gold px-2 py-0.5 text-[10px] font-medium text-white">
                  Primary
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-navy/80 px-1.5 py-1 opacity-0 transition group-hover:opacity-100">
                <button
                  type="button"
                  title="Move left"
                  onClick={() => move(index, -1)}
                  className="rounded p-1 text-white hover:bg-white/20"
                >
                  <ArrowLeft size={12} />
                </button>
                <button
                  type="button"
                  title="Set as primary"
                  onClick={() => primaryMutation.mutate(item.id)}
                  className="rounded p-1 text-white hover:bg-white/20"
                >
                  <Star size={12} />
                </button>
                <button
                  type="button"
                  title="Move right"
                  onClick={() => move(index, 1)}
                  className="rounded p-1 text-white hover:bg-white/20"
                >
                  <ArrowRight size={12} />
                </button>
                <button
                  type="button"
                  title="Delete"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(item.id)}
                  className="rounded p-1 text-white hover:bg-red-500/80 disabled:opacity-50"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
