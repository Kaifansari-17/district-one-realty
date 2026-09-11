import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
}

export function SectionHeader({ title, subtitle, viewAllHref }: SectionHeaderProps) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="font-serif text-3xl text-navy md:text-4xl">{title}</h2>
        {subtitle && <p className="mt-2 text-sm text-text-secondary">{subtitle}</p>}
      </div>
      {viewAllHref && (
        <Link
          to={viewAllHref}
          className="group flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-navy transition hover:text-gold"
        >
          View All
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
