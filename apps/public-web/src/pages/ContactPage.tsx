import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { Phone, Mail, MapPin, CheckCircle2 } from "lucide-react";
import { buildTelLink, buildWhatsAppLink } from "@district-one/shared-utils";
import { apiClient } from "@/lib/api-client";
import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { env } from "@/config/env";

export function ContactPage() {
  useDocumentMeta("Contact Us", "Get in touch with District One Realty for property inquiries in Navi Mumbai.");

  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "", website: "" });
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => apiClient.post("/contact", { ...form, email: form.email || undefined }),
    onSuccess: () => setSubmitted(true),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate();
  }

  const inputClass = "w-full rounded-md border border-border px-4 py-2.5 text-sm outline-none transition focus:border-navy";

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <Breadcrumbs items={[{ label: "Contact" }]} />

      <div className="mt-4">
        <h1 className="font-serif text-3xl text-navy md:text-4xl">Contact Us</h1>
        <p className="mt-1 max-w-lg text-sm text-text-secondary">
          Have a question about a property or need expert guidance? Reach out — we're here to help.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <a href={buildTelLink(env.contactPhone)} className="flex items-center gap-4 rounded-xl border border-border p-5 transition hover:border-navy">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-navy/5 text-navy">
              <Phone size={18} />
            </div>
            <div>
              <p className="font-medium text-navy">{env.contactPhone}</p>
              <p className="text-xs text-text-muted">Call us directly</p>
            </div>
          </a>

          <a href={buildWhatsAppLink(env.whatsappNumber)} target="_blank" rel="noreferrer noopener" className="flex items-center gap-4 rounded-xl border border-border p-5 transition hover:border-navy">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-navy/5 text-navy">
              <Phone size={18} />
            </div>
            <div>
              <p className="font-medium text-navy">Chat on WhatsApp</p>
              <p className="text-xs text-text-muted">Fastest way to reach us</p>
            </div>
          </a>

          <a href={`mailto:${env.contactEmail}`} className="flex items-center gap-4 rounded-xl border border-border p-5 transition hover:border-navy">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-navy/5 text-navy">
              <Mail size={18} />
            </div>
            <div>
              <p className="font-medium text-navy">{env.contactEmail}</p>
              <p className="text-xs text-text-muted">Email us</p>
            </div>
          </a>

          <div className="flex items-center gap-4 rounded-xl border border-border p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-navy/5 text-navy">
              <MapPin size={18} />
            </div>
            <div>
              <p className="font-medium text-navy">Navi Mumbai, Maharashtra, India</p>
              <p className="text-xs text-text-muted">Serving all localities across Navi Mumbai</p>
            </div>
          </div>

          <WhatsAppButton />
        </div>

        <div className="rounded-xl border border-border p-6">
          <h2 className="mb-4 font-serif text-xl text-navy">Send us a message</h2>

          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <CheckCircle2 className="text-navy" size={28} />
              <p className="font-serif text-lg text-navy">Message sent!</p>
              <p className="text-sm text-text-secondary">We'll get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" name="website" value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} className="hidden" tabIndex={-1} autoComplete="off" />
              <input type="text" required placeholder="Your Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputClass} />
              <input type="tel" required placeholder="Phone Number" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={inputClass} />
              <input type="email" placeholder="Email (optional)" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={inputClass} />
              <textarea rows={4} required placeholder="How can we help?" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} className={inputClass} />

              {mutation.isError && <p className="text-sm text-red-600">Something went wrong. Please try again.</p>}

              <button type="submit" disabled={mutation.isPending} className="w-full rounded-md bg-navy py-3 text-sm font-medium text-white hover:bg-navy-secondary disabled:opacity-60">
                {mutation.isPending ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
