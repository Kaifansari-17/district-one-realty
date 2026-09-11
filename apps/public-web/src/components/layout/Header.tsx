import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";
import { buildTelLink } from "@district-one/shared-utils";
import { env } from "@/config/env";

const NAV_LINKS = [
  { label: "Properties", to: "/properties" },
  { label: "Projects", to: "/projects" },
  { label: "Builders", to: "/builders" },
  { label: "Locations", to: "/locations" },
  { label: "About", to: "/about" },
];

export function Header() {
  const [isScrolled, setScrolled] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
  }, [isMenuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "border-b border-border bg-white/95 shadow-sm backdrop-blur" : "border-b border-transparent bg-white/70 backdrop-blur"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
          <img src="/logo.jpeg" alt="District One Realty" className="h-10 w-10 rounded-md object-cover sm:h-11 sm:w-11" />
          <span className="font-serif text-lg font-semibold text-navy sm:text-xl">
            District One <span className="text-gold">Realty</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? "border-b-2 border-gold pb-1 text-navy" : "text-text-secondary hover:text-navy"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <Link
          to="/contact"
          className="hidden rounded-md bg-navy px-5 py-2.5 text-sm font-medium text-white transition hover:bg-navy-secondary lg:inline-block"
        >
          Talk to an Expert
        </Link>

        <div className="flex items-center gap-3 lg:hidden">
          <a href={buildTelLink(env.contactPhone)} aria-label="Call us" className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-navy">
            <Phone size={16} />
          </a>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-navy"
          >
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-border bg-white px-6 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2.5 text-sm font-medium ${isActive ? "bg-grey-light text-navy" : "text-text-secondary"}`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to="/contact"
              onClick={() => setMenuOpen(false)}
              className="mt-2 rounded-md bg-navy px-3 py-2.5 text-center text-sm font-medium text-white"
            >
              Talk to an Expert
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
