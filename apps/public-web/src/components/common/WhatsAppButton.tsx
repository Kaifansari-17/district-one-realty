import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@district-one/shared-utils";
import { env } from "@/config/env";

interface WhatsAppButtonProps {
  propertyName?: string;
  location?: string;
  floating?: boolean;
}

export function WhatsAppButton({ propertyName, location, floating }: WhatsAppButtonProps) {
  const href = buildWhatsAppLink(env.whatsappNumber, { propertyName, location });

  if (floating) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105"
      >
        <MessageCircle size={26} fill="white" className="text-[#25D366]" />
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="flex items-center justify-center gap-2 rounded-md border border-border px-5 py-3 text-sm font-medium text-navy transition hover:border-navy"
    >
      <MessageCircle size={16} /> WhatsApp
    </a>
  );
}
