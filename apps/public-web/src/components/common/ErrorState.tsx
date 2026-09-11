import { AlertTriangle } from "lucide-react";

/**
 * Distinct from EmptyState — this means the request itself failed (network/API error), not that
 * zero records matched. Conflating the two (rendering "no results" on a failed fetch) hides real
 * outages/misconfiguration behind what looks like an empty, working page.
 */
export function ErrorState({ message = "Something went wrong while loading this page. Please try again." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-red-200 bg-red-50/50 px-6 py-16 text-center">
      <AlertTriangle size={28} className="mb-4 text-red-500" />
      <p className="font-serif text-lg text-navy">We couldn't load this right now</p>
      <p className="mt-2 max-w-sm text-sm text-text-secondary">{message}</p>
    </div>
  );
}
