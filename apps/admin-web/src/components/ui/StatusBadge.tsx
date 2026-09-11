const TONE_CLASSES: Record<string, string> = {
  green: "bg-green-50 text-green-700 border-green-200",
  gold: "bg-gold-soft/60 text-navy border-gold-light",
  grey: "bg-grey-light text-text-secondary border-border",
  red: "bg-red-50 text-red-700 border-red-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
};

const STATUS_TONE: Record<string, keyof typeof TONE_CLASSES> = {
  PUBLISHED: "green",
  DRAFT: "grey",
  ARCHIVED: "red",
  READY_TO_MOVE: "green",
  UNDER_CONSTRUCTION: "gold",
  NEW_LAUNCH: "blue",
  PRE_LAUNCH: "blue",
  RESALE: "grey",
  NEW: "blue",
  CONTACTED: "gold",
  FOLLOW_UP: "gold",
  SITE_VISIT_SCHEDULED: "blue",
  NEGOTIATION: "gold",
  CONVERTED: "green",
  CLOSED: "grey",
  NOT_INTERESTED: "red",
  REQUESTED: "gold",
  CONFIRMED: "blue",
  COMPLETED: "green",
  CANCELLED: "red",
  RESCHEDULED: "gold",
  ACTIVE: "green",
  INACTIVE: "grey",
};

function humanize(status: string): string {
  return status
    .toLowerCase()
    .split("_")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

export function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONE[status] ?? "grey";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}>
      {humanize(status)}
    </span>
  );
}
