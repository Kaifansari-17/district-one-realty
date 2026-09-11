import { Link } from "react-router-dom";
import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { usePublicList } from "@/lib/usePublicData";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { SkeletonRow } from "@/components/common/SkeletonCard";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import type { BlogListItem, Paginated } from "@/types/api";

export function BlogPage() {
  useDocumentMeta("Blog", "Insights and updates on Navi Mumbai's real estate market from District One Realty.");

  const { data, isLoading, isError } = usePublicList<Paginated<BlogListItem>>("blog", "/blog", { limit: 12 });

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <Breadcrumbs items={[{ label: "Blog" }]} />

      <div className="mt-4">
        <h1 className="font-serif text-3xl text-navy md:text-4xl">Insights</h1>
        <p className="mt-1 text-sm text-text-secondary">News, guidance, and updates on Navi Mumbai real estate.</p>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <SkeletonRow />
        ) : isError ? (
          <ErrorState message="We couldn't load articles right now. Please refresh the page or try again shortly." />
        ) : !data || data.items.length === 0 ? (
          <EmptyState title="No articles published yet" message="Check back soon for real estate insights." />
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="group block">
                <div className="aspect-[3/2] overflow-hidden rounded-xl bg-grey-light">
                  {post.featuredImage && (
                    <img src={post.featuredImage.url} alt={post.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  )}
                </div>
                <p className="mt-4 text-xs text-text-muted">
                  {post.publishedAt && new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  {" "}&middot; {post.author.name}
                </p>
                <h2 className="mt-1 font-serif text-xl text-navy transition group-hover:text-gold">{post.title}</h2>
                {post.excerpt && <p className="mt-2 text-sm text-text-secondary line-clamp-2">{post.excerpt}</p>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
