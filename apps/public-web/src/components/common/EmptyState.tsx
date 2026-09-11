import type { LucideIcon } from "lucide-react";
import { SearchX } from "lucide-react";

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: LucideIcon;
}

export function EmptyState({ title, message, icon: Icon = SearchX }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-warm-white px-6 py-16 text-center">
      <Icon size={28} className="mb-4 text-text-muted" />
      <p className="font-serif text-lg text-navy">{title}</p>
      {message && <p className="mt-2 max-w-sm text-sm text-text-secondary">{message}</p>}
    </div>
  );
}
