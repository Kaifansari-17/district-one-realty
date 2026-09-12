import { isAxiosError } from "axios";

/**
 * Extracts a user-facing message from a failed API call, preferring a Zod validation
 * detail (e.g. "Expected number, received null") over the generic top-level "Validation
 * failed" message, which by itself gives no clue which field or why.
 */
export function getErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (!isAxiosError(err)) return fallback;
  const data = err.response?.data as { message?: string; errors?: { body?: string[] } } | undefined;
  return data?.errors?.body?.[0] ?? data?.message ?? fallback;
}
