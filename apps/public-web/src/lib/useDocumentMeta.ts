import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { env } from "@/config/env";

const SITE_NAME = "District One Realty";

function setMetaTag(name: string, content: string, attr: "name" | "property" = "name") {
  let tag = document.querySelector(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function setCanonicalLink(href: string) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
}

/** Sets document title, meta description, canonical URL, and Open Graph tags for the current page. No SSR here — a Vite SPA — so this runs client-side only. */
export function useDocumentMeta(title?: string, description?: string) {
  const location = useLocation();

  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Exceptional Properties Across Navi Mumbai`;

    const desc = description ?? "Discover exceptional residential and commercial properties across Navi Mumbai with District One Realty.";
    setMetaTag("description", desc);
    setMetaTag("og:title", document.title, "property");
    setMetaTag("og:description", desc, "property");
    setMetaTag("og:type", "website", "property");
    setMetaTag("og:url", `${env.siteUrl}${location.pathname}`, "property");
    setCanonicalLink(`${env.siteUrl}${location.pathname}`);
  }, [title, description, location.pathname]);
}
