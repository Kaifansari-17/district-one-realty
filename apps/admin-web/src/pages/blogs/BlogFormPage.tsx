import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCrudResource } from "@/lib/useCrudResource";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { useToast } from "@/components/ui/Toast";
import { FormField, TextInput, TextArea } from "@/components/ui/FormField";
import { MediaManager } from "@/components/ui/MediaManager";

interface Blog {
  id: string;
  title: string;
  excerpt?: string | null;
  content: string;
  isPublished: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

const EMPTY_FORM = { title: "", excerpt: "", content: "", isPublished: false, metaTitle: "", metaDescription: "" };

export function BlogFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const { useDetail, useCreate, useUpdate } = useCrudResource<Blog>("/admin/blogs", "blogs");
  const { data: blog } = useDetail(id);
  const createMutation = useCreate();
  const updateMutation = useUpdate();

  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (blog) {
      setForm({
        title: blog.title,
        excerpt: blog.excerpt ?? "",
        content: blog.content,
        isPublished: blog.isPublished,
        metaTitle: blog.metaTitle ?? "",
        metaDescription: blog.metaDescription ?? "",
      });
    }
  }, [blog]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      title: form.title,
      excerpt: form.excerpt || undefined,
      content: form.content,
      isPublished: form.isPublished,
      metaTitle: form.metaTitle || undefined,
      metaDescription: form.metaDescription || undefined,
    };

    try {
      if (isEditing && id) {
        await updateMutation.mutateAsync({ id, input: payload });
        toast.success("Blog post updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Blog post created");
      }
      navigate("/blogs");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-navy">{isEditing ? "Edit Blog Post" : "New Blog Post"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-white p-6">
        <FormField label="Title" htmlFor="title" required>
          <TextInput id="title" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        </FormField>
        <FormField label="Excerpt" htmlFor="excerpt" hint="Shown on the blog listing card.">
          <TextArea id="excerpt" rows={2} value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} />
        </FormField>
        <FormField label="Content" htmlFor="content" required hint="At least 20 characters.">
          <TextArea id="content" rows={14} required value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="SEO Title" htmlFor="metaTitle">
            <TextInput id="metaTitle" value={form.metaTitle} onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))} />
          </FormField>
          <FormField label="SEO Description" htmlFor="metaDescription">
            <TextInput id="metaDescription" value={form.metaDescription} onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))} />
          </FormField>
        </div>

        <label className="flex items-center gap-2 text-sm text-text-primary">
          <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))} />
          Published
        </label>

        {isEditing && id && (
          <div className="border-t border-border pt-4">
            <MediaManager basePath={`/admin/blogs/${id}/featured-image`} label="Featured Image" />
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <button type="button" onClick={() => navigate("/blogs")} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-grey-light">
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="rounded-md bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-secondary disabled:opacity-60"
          >
            {isEditing ? "Save Changes" : "Create Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
