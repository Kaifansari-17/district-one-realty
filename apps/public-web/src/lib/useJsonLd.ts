import { useEffect } from "react";

/**
 * Injects a JSON-LD <script> tag into <head>, keyed so multiple hooks on the same
 * page (e.g. a page's own schema + a shared BreadcrumbList) don't clobber each other.
 * Removes its tag on unmount/dependency change so stale schema never lingers across
 * client-side route changes in this SPA.
 */
export function useJsonLd(key: string, data: Record<string, unknown> | null) {
  useEffect(() => {
    if (!data) return;

    const id = `jsonld-${key}`;
    let script = document.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);

    return () => {
      document.getElementById(id)?.remove();
    };
  }, [key, data]);
}
