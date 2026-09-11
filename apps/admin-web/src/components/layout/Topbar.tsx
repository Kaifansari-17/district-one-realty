import { useNavigate } from "react-router-dom";
import { LogOut, Menu } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  AGENT: "Agent",
};

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  const initials = user?.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="flex h-16 items-center justify-between gap-3 border-b border-border bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-text-secondary transition hover:bg-grey-light hover:text-navy md:hidden"
        >
          <Menu size={18} />
        </button>
        <p className="truncate text-sm text-text-secondary">
          Welcome back, <span className="font-medium text-text-primary">{user?.name}</span>
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-text-primary">{user?.name}</p>
          <p className="text-xs text-text-muted">{user && ROLE_LABEL[user.role]}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white">
          {initials}
        </div>
        <button
          onClick={handleLogout}
          title="Sign out"
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition hover:bg-grey-light hover:text-navy"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
