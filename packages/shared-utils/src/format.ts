/**
 * Formats a rupee amount using the Indian Cr/L convention used across
 * the District One Realty product surfaces (e.g. 21000000 -> "₹2.10 Cr").
 */
export function formatIndianPrice(amount?: number | null): string {
  if (amount === undefined || amount === null || Number.isNaN(amount)) return "Price on Request";

  if (amount >= 1_00_00_000) {
    return `₹${trimDecimal(amount / 1_00_00_000)} Cr`;
  }
  if (amount >= 1_00_000) {
    return `₹${trimDecimal(amount / 1_00_000)} L`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

function trimDecimal(value: number): string {
  return (Math.round(value * 100) / 100).toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
}

export function formatArea(area?: number | null, unit = "sq.ft."): string {
  if (!area) return "";
  return `${area.toLocaleString("en-IN")} ${unit}`;
}

export function formatAreaRange(min?: number | null, max?: number | null, unit = "sq.ft."): string {
  if (!min && !max) return "";
  if (min && max && min !== max) return `${min.toLocaleString("en-IN")} - ${max.toLocaleString("en-IN")} ${unit}`;
  return formatArea(min || max, unit);
}

export function formatPossessionDate(date?: string | Date | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}
