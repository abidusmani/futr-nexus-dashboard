// src/components/DashboardLayout.jsx

import { useState } from "react";
import { Outlet } from "react-router-dom"; // <-- Import Outlet
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import { NestedSidebar } from "./NestedSidebar";
import { TopNavigation } from "./TopNavigation";

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [nestedCollapsed, setNestedCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          activeMenu={activeMenu}
          onMenuClick={setActiveMenu}
        />

        <NestedSidebar
          activeMenu={activeMenu}
          activeSubmenu={activeSubmenu}
          onSubmenuClick={setActiveSubmenu}
          collapsed={sidebarCollapsed}
          nestedCollapsed={nestedCollapsed}
          onNestedToggle={() => setNestedCollapsed(!nestedCollapsed)}
        />

        <div className="flex-1 flex flex-col">
          <TopNavigation />
          {/* Main content area that will render the nested route */}
          <main className="flex-1 p-6 bg-white overflow-auto">
            <Outlet /> {/* <-- This is where your page content will be rendered */}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}