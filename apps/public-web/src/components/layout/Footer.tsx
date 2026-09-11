import { Link } from "react-router-dom";
import { env } from "@/config/env";

const FOOTER_LINKS = [
  { label: "Properties", to: "/properties" },
  { label: "Projects", to: "/projects" },
  { label: "Builders", to: "/builders" },
  { label: "Locations", to: "/locations" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-navy text-white">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <img src="/logo.jpeg" alt="District One Realty" className="h-10 w-10 rounded-md object-cover" />
              <p className="font-serif text-xl">
                District One <span className="text-gold">Realty</span>
              </p>
            </div>
            <p className="mt-3 max-w-xs text-sm text-white/70">
              Helping You Find Exceptional Properties Across Navi Mumbai
            </p>
          </div>

          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-gold">Explore</p>
            <ul className="mt-4 space-y-2">
              {FOOTER_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-white/80 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-gold">Contact</p>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              <li>{env.contactPhone}</li>
              <li>{env.contactEmail}</li>
              <li>Navi Mumbai, Maharashtra, India</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/60 md:flex-row">
          <p>&copy; {new Date().getFullYear()} District One Realty. All Rights Reserved.</p>
          <p>
            Website Designed, Developed &amp; Maintained by{" "}
            <a
              href="https://codesniffs.com"
              target="_blank"
              rel="noreferrer noopener"
              className="text-gold-light hover:text-gold"
            >
              CodeSniffs
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
