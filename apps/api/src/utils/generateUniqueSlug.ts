import { slugify } from "@district-one/shared-utils";

/**
 * Appends -2, -3, ... until `exists` reports no collision. `exists` should
 * exclude `excludeId` (the record being updated, if any) from its lookup.
 */
export async function generateUniqueSlug(
  name: string,
  exists: (slug: string) => Promise<boolean>
): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  let suffix = 2;

  while (await exists(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}
