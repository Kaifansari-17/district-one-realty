import { useParams } from "react-router-dom";
import { usePublicDetail } from "@/lib/usePublicData";
import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { EmptyState } from "@/components/common/EmptyState";
import type { BlogDetail } from "@/types/api";

export function BlogDetailPage() {
  const { slug } = useParams();
  const { data: post, isLoading, isError } = usePublicDetail<BlogDetail>("blog-post", "/blog", slug);

  useDocumentMeta(post?.metaTitle ?? post?.title, post?.metaDescription ?? post?.excerpt ?? undefined);

  if (isLoading) return <div className="mx-auto max-w-3xl px-6 py-20 text-center text-text-muted">Loading article...</div>;

  if (isError || !post) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20">
        <EmptyState title="Article not found" />
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-6 py-10">
      <Breadcrumbs items={[{ label: "Blog", href: "/blog" }, { label: post.title }]} />

      <h1 className="mt-4 font-serif text-3xl text-navy md:text-4xl">{post.title}</h1>
      <p className="mt-2 text-sm text-text-muted">
        {post.publishedAt && new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        {" "}&middot; by {post.author.name}
      </p>

      {post.featuredImage && (
        <img src={post.featuredImage.url} alt={post.title} loading="eager" fetchPriority="high" className="mt-6 aspect-video w-full rounded-xl object-cover" />
      )}

      <div className="mt-8 whitespace-pre-line text-sm leading-relaxed text-text-secondary">{post.content}</div>
    </article>
  );
}
