import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { OrganizationJsonLd } from "@/components/common/OrganizationJsonLd";

// Property/project detail pages already carry their own contextual WhatsApp CTA (with the
// property/project name prefilled into the message) inline in their sidebar — the global
// floating button would sit directly on top of it in that corner on mobile. Suppress it there.
const ROUTES_WITH_OWN_WHATSAPP_CTA = [/^\/properties\/[^/]+$/, /^\/projects\/[^/]+$/];

export function Layout() {
  const { pathname } = useLocation();
  const hideFloatingWhatsApp = ROUTES_WITH_OWN_WHATSAPP_CTA.some((pattern) => pattern.test(pathname));

  return (
    <div className="flex min-h-screen flex-col">
      <OrganizationJsonLd />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {!hideFloatingWhatsApp && <WhatsAppButton floating />}
    </div>
  );
}
