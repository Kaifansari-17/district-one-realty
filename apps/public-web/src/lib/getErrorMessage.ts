import { isAxiosError } from "axios";

interface ApiErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}

function getApiErrorBody(err: unknown): ApiErrorBody | undefined {
  return isAxiosError(err) ? (err.response?.data as ApiErrorBody | undefined) : undefined;
}

/**
 * Extracts a user-facing summary message from a failed API call. Prefer `getFieldErrors` to show
 * validation errors next to the specific field they're about — this is the fallback for an
 * overall message (a non-validation error, or a field this form doesn't render).
 */
export function getErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  const data = getApiErrorBody(err);
  const firstFieldError = data?.errors && Object.values(data.errors)[0]?.[0];
  return firstFieldError ?? data?.message ?? fallback;
}

/**
 * Maps each failed field to its first error message (e.g. `{ phone: "Enter a valid 10-digit
 * Indian phone number" }`), to render inline next to that field. Returns undefined when the API
 * didn't fail with field-level validation errors (a 500, a network error, or a rate limit) —
 * such cases should fall back to `getErrorMessage` as a general message instead.
 */
export function getFieldErrors(err: unknown): Record<string, string> | undefined {
  const data = getApiErrorBody(err);
  if (!data?.errors) return undefined;
  return Object.fromEntries(Object.entries(data.errors).map(([field, messages]) => [field, messages[0]]));
}
