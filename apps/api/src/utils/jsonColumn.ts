/**
 * Manual JSON (de)serialization for columns stored as `String @db.LongText` instead of Prisma's
 * native `Json` type — see the comment on Project.configurations in schema.prisma for why.
 */

export function toJsonColumn<T>(value: T | undefined): string | undefined {
  return value === undefined ? undefined : JSON.stringify(value);
}

export function fromJsonColumn<T>(value: string | null): T | null {
  if (value === null) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}
