/** Normalizes an Express query value (string | string[] | undefined) into a string array. */
export function toQueryArray(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value.map(String);
  return String(value)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}
