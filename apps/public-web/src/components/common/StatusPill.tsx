const LABEL: Record<string, string> = {
  NEW_LAUNCH: "New Launch",
  PRE_LAUNCH: "Pre-Launch",
  UNDER_CONSTRUCTION: "Under Construction",
  READY_TO_MOVE: "Ready to Move",
  RESALE: "Resale",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span className="rounded bg-navy/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-white backdrop-blur-sm">
      {LABEL[status] ?? status.replace(/_/g, " ")}
    </span>
  );
}
