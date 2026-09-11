import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  Landmark,
  MapPin,
  Sparkles,
  ListChecks,
  Users,
  UserSquare2,
  CalendarCheck,
  Newspaper,
  MessageSquare,
  BarChart3,
  Settings,
  ScrollText,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface NavItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
  /** Omit to show for every authenticated role. */
  staffOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Properties", path: "/properties", icon: Building2 },
  { label: "Projects", path: "/projects", icon: FolderKanban },
  { label: "Builders", path: "/builders", icon: Landmark },
  { label: "Locations", path: "/locations", icon: MapPin },
  { label: "Amenities", path: "/amenities", icon: Sparkles },
  { label: "Features", path: "/features", icon: ListChecks },
  { label: "Agents", path: "/agents", icon: UserSquare2, staffOnly: true },
  { label: "Leads", path: "/leads", icon: Users },
  { label: "Site Visits", path: "/site-visits", icon: CalendarCheck },
  { label: "Blogs", path: "/blogs", icon: Newspaper, staffOnly: true },
  { label: "Messages", path: "/messages", icon: MessageSquare, staffOnly: true },
  { label: "Reports", path: "/reports", icon: BarChart3, staffOnly: true },
  { label: "Settings", path: "/settings", icon: Settings },
  { label: "Activity Logs", path: "/activity-logs", icon: ScrollText, staffOnly: true },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { user } = useAuth();
  const isStaff = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";
  const items = NAV_ITEMS.filter((item) => !item.staffOnly || isStaff);

  const content = (
    <>
      <div className="flex items-center justify-between px-6 py-6">
        <div>
          <div className="flex items-center gap-2">
            <img src="/logo.jpeg" alt="District One Realty" className="h-9 w-9 rounded-md object-cover" />
            <p className="font-semibold leading-tight">
              District One <span className="text-gold">Realty</span>
            </p>
          </div>
          <p className="mt-1 text-xs uppercase tracking-wide text-white/50">Admin Panel</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="flex h-8 w-8 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white md:hidden"
        >
          <X size={18} />
        </button>
      </div>
      <nav className="flex flex-col gap-1 px-3 pb-6">
        {items.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={label}
            to={path}
            end={path === "/"}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition ${
                isActive ? "bg-white/10 text-gold-light" : "text-white/80 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-border bg-navy text-white md:block">
        {content}
      </aside>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${isOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!isOpen}
      >
        <div
          className={`absolute inset-0 bg-navy/50 backdrop-blur-sm transition-opacity ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={onClose}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto bg-navy text-white shadow-xl transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {content}
        </aside>
      </div>
    </>
  );
}
