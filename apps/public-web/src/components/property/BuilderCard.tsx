import { Link } from "react-router-dom";
import { Landmark } from "lucide-react";
import type { Builder } from "@/types/api";

export function BuilderCard({ builder }: { builder: Builder }) {
  return (
    <Link
      to={`/builders/${builder.slug}`}
      className="group flex h-24 items-center justify-center rounded-xl border border-border bg-white px-6 transition hover:border-gold-light hover:shadow-md"
    >
      {builder.logo ? (
        <img
          src={builder.logo.url}
          alt={builder.name}
          loading="lazy"
          className="max-h-12 max-w-full object-contain grayscale transition group-hover:grayscale-0"
        />
      ) : (
        <div className="flex items-center gap-2 text-text-secondary">
          <Landmark size={18} />
          <span className="font-medium">{builder.name}</span>
        </div>
      )}
    </Link>
  );
}
