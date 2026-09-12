import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { getErrorMessage, getFieldErrors } from "@/lib/getErrorMessage";

interface InquiryFormProps {
  source: "PROPERTY" | "PROJECT" | "CONTACT" | "WEBSITE";
  propertyId?: string;
  projectId?: string;
  compact?: boolean;
}

export function InquiryForm({ source, propertyId, projectId, compact }: InquiryFormProps) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "", website: "" });
  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: async () =>
      apiClient.post("/inquiries", {
        ...form,
        email: form.email || undefined,
        message: form.message || undefined,
        propertyId,
        projectId,
        source,
      }),
    onSuccess: () => setSubmitted(true),
    onError: (err) => setFieldErrors(getFieldErrors(err) ?? {}),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    mutation.mutate();
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg bg-grey-light px-6 py-10 text-center">
        <CheckCircle2 className="text-navy" size={28} />
        <p className="font-serif text-lg text-navy">Thank you!</p>
        <p className="text-sm text-text-secondary">Our team will get back to you shortly.</p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-md border border-border px-4 py-2.5 text-sm outline-none transition focus:border-navy";

  return (
    <form onSubmit={handleSubmit} className={compact ? "space-y-3" : "space-y-4"}>
      {/* Honeypot field — hidden from real users, bots that fill every field trip this and get silently dropped server-side. */}
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      <div>
        <input
          type="text"
          required
          placeholder="Your Name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className={`${inputClass} ${fieldErrors.name ? "border-red-500" : ""}`}
        />
        {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
      </div>
      <div>
        <input
          type="tel"
          required
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          className={`${inputClass} ${fieldErrors.phone ? "border-red-500" : ""}`}
        />
        {fieldErrors.phone && <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>}
      </div>
      <div>
        <input
          type="email"
          placeholder="Email (optional)"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className={`${inputClass} ${fieldErrors.email ? "border-red-500" : ""}`}
        />
        {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
      </div>
      <div>
        <textarea
          rows={compact ? 2 : 3}
          placeholder="Message (optional)"
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          className={`${inputClass} ${fieldErrors.message ? "border-red-500" : ""}`}
        />
        {fieldErrors.message && <p className="mt-1 text-xs text-red-600">{fieldErrors.message}</p>}
      </div>

      {mutation.isError && !Object.keys(fieldErrors).length && (
        <p className="text-sm text-red-600">{getErrorMessage(mutation.error)}</p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full rounded-md bg-navy py-3 text-sm font-medium text-white transition hover:bg-navy-secondary disabled:opacity-60"
      >
        {mutation.isPending ? "Sending..." : "Submit Inquiry"}
      </button>
    </form>
  );
}
