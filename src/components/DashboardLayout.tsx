import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import { NestedSidebar } from "./NestedSidebar";
import { TopNavigation } from "./TopNavigation";
import { MainContent } from "./MainContent";

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
          <MainContent activeSubmenu={activeSubmenu} />
        </div>
      </div>
    </SidebarProvider>
  );
}