import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useRealtimeSync } from "@/lib/useRealtimeSync";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AdminLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  useRealtimeSync();

  return (
    <div className="flex min-h-screen bg-grey-light">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
