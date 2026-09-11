import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useJsonLd } from "@/lib/useJsonLd";
import { env } from "@/config/env";

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const allCrumbs = [{ label: "Home", href: "/" }, ...items];

  useJsonLd("breadcrumbs", {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: allCrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      item: crumb.href ? `${env.siteUrl}${crumb.href}` : undefined,
    })),
  });

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
      <Link to="/" className="hover:text-navy">
        Home
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight size={12} />
          {item.href ? (
            <Link to={item.href} className="hover:text-navy">
              {item.label}
            </Link>
          ) : (
            <span className="text-text-secondary">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
