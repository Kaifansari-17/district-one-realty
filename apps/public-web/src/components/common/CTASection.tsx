import { useState } from "react";
import { Phone, MessageCircle, PhoneCall } from "lucide-react";
import { buildTelLink, buildWhatsAppLink } from "@district-one/shared-utils";
import { env } from "@/config/env";
import { RequestCallbackModal } from "@/components/common/RequestCallbackModal";
import { FadeIn } from "@/components/common/FadeIn";

export function CTASection() {
  const [isCallbackOpen, setCallbackOpen] = useState(false);

  return (
    <section className="bg-navy py-20 text-white">
      <FadeIn className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="font-serif text-3xl md:text-4xl">Looking for the right property in Navi Mumbai?</h2>
        <p className="mt-4 text-white/70">Our experts are here to help — no obligation, just honest guidance.</p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href={buildTelLink(env.contactPhone)}
            className="flex items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-medium text-navy transition hover:bg-gold-soft"
          >
            <Phone size={16} /> Call Now
          </a>
          <a
            href={buildWhatsAppLink(env.whatsappNumber)}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-2 rounded-md border border-white/30 px-6 py-3 text-sm font-medium text-white transition hover:border-white hover:bg-white/10"
          >
            <MessageCircle size={16} /> WhatsApp
          </a>
          <button
            onClick={() => setCallbackOpen(true)}
            className="flex items-center gap-2 rounded-md border border-white/30 px-6 py-3 text-sm font-medium text-white transition hover:border-white hover:bg-white/10"
          >
            <PhoneCall size={16} /> Request a Callback
          </button>
        </div>
      </FadeIn>

      <RequestCallbackModal isOpen={isCallbackOpen} onClose={() => setCallbackOpen(false)} />
    </section>
  );
}
