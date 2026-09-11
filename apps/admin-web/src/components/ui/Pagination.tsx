import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationMeta } from "@district-one/shared-types";

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, totalPages, total, hasPrevPage, hasNextPage } = pagination;

  if (total === 0) return null;

  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-text-secondary">
      <span>
        Page {page} of {totalPages} &middot; {total} total
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage}
          className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-grey-light"
        >
          <ChevronLeft size={14} /> Prev
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-grey-light"
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
