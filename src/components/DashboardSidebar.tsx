import { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  Home, 
  Zap, 
  Library, 
  Settings, 
  TrendingUp, 
  Cpu, 
  Activity, 
  Wrench, 
  Users, 
  Shield, 
  Sliders, 
  Database,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  Radio,
  HardDrive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  activeMenu: string | null;
  onMenuClick: (menu: string | null) => void;
}

const navigationItems = [
  { title: "Home", url: "/HomePage", icon: Home, hasSubmenu: false },
  { title: "Digitization", url: "/digitization", icon: Zap, hasSubmenu: true },
  { title: "Digital Twin", url: "/digital-twin", icon: Cpu, hasSubmenu: true },
  { title: "Serial No Scanning", url: "/serial-no-scanning", icon: Radio, hasSubmenu: true },
  { title: "Library", url: "/library", icon: Library, hasSubmenu: true },
  { title: "RMS Settings", url: "/RMS-settings", icon: Settings, hasSubmenu: true },
  { title: "Forecasting", url: "/forecasting", icon: TrendingUp, hasSubmenu: true },
  { title: "Mapping", url: "/models", icon: Cpu, hasSubmenu: true },
  { title: "Performance Monitoring", url: "/performance", icon: Activity, hasSubmenu: true },
  { title: "Maintenance", url: "/maintenance", icon: Wrench, hasSubmenu: true },
  { title: "Management", url: "/management", icon: Users, hasSubmenu: true },
  { title: "Warranty Management", url: "/warranty", icon: Shield, hasSubmenu: true },
  { title: "Platform Options", url: "/platform", icon: Sliders, hasSubmenu: true },
  { title: "DSEnergize Logger", url: "/futr-logger", icon: HardDrive, hasSubmenu: true },
  { title: "Data Points", url: "/data-points", icon: Database, hasSubmenu: true },
  { title: "Equipment Audit", url: "/audit", icon: ClipboardCheck, hasSubmenu: true },
];

export function DashboardSidebar({ collapsed, onToggleCollapse, activeMenu, onMenuClick }: DashboardSidebarProps) {
  return (
    <div className={cn(
      "bg-card border-r border-border transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center">
          <div className="w-8 h-7 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="ml-3 text-xl font-bold text-foreground">DS Energize</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item) => {
          const handleClick = (e: React.MouseEvent) => {
            if (item.hasSubmenu) {
              e.preventDefault();
              onMenuClick(activeMenu === item.title ? null : item.title);
            } else {
              onMenuClick(null);
            }
          };

          return (
            <div key={item.title}>
              {item.hasSubmenu ? (
                <button
                  onClick={handleClick}
                  className={cn(
                    "flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    "hover:bg-secondary hover:text-secondary-foreground",
                    activeMenu === item.title 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="ml-3 truncate">{item.title}</span>
                  )}
                </button>
              ) : (
                <NavLink
                  to={item.url}
                  onClick={handleClick}
                  className={({ isActive }) => cn(
                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    "hover:bg-secondary hover:text-secondary-foreground",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="ml-3 truncate">{item.title}</span>
                  )}
                </NavLink>
              )}
            </div>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="w-full justify-center"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-4" />
              <span className="ml-2">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}