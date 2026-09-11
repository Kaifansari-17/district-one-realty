import { useJsonLd } from "@/lib/useJsonLd";
import { env } from "@/config/env";

/**
 * Site-wide RealEstateAgent structured data, mounted once in the Layout. Only verified,
 * admin-entered facts — no invented ratings, review counts, or awards (per spec).
 */
export function OrganizationJsonLd() {
  useJsonLd("organization", {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "District One Realty",
    url: env.siteUrl,
    telephone: env.contactPhone,
    email: env.contactEmail,
    areaServed: {
      "@type": "City",
      name: "Navi Mumbai",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Navi Mumbai",
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
  });

  return null;
}
