// src/layouts/DashboardLayout.tsx

import { useState } from "react";
import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { NestedSidebar } from "@/components/NestedSidebar";
import { TopNavigation } from "@/components/TopNavigation";

// Define an interface for your Plant object to be used across components
export interface Plant {
  plantId: string;
  plantName: string;
}

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [nestedCollapsed, setNestedCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>("Home");
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  // This state is the "source of truth" for the currently selected plant
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);

  return (
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
        <TopNavigation 
          activeMenu={activeMenu} 
          selectedPlant={selectedPlant}
          onSelectPlant={setSelectedPlant} // Pass the setter function
        />
        
        <main className="flex-1 p-6 overflow-auto">
          {/* Pass the state down to the page components via context */}
          <Outlet context={{ selectedPlant, setSelectedPlant }} />
        </main>
      </div>
    </div>
  );
}