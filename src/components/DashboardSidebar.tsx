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
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const navigationItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Digitization", url: "/digitization", icon: Zap },
  { title: "Library", url: "/library", icon: Library },
  { title: "Scada Settings", url: "/scada-settings", icon: Settings },
  { title: "Forecasting", url: "/forecasting", icon: TrendingUp },
  { title: "Models", url: "/models", icon: Cpu },
  { title: "Performance Monitoring", url: "/performance", icon: Activity },
  { title: "Maintenance", url: "/maintenance", icon: Wrench },
  { title: "Management", url: "/management", icon: Users },
  { title: "Warranty Management", url: "/warranty", icon: Shield },
  { title: "Platform Options", url: "/platform", icon: Sliders },
  { title: "Data Points", url: "/data-points", icon: Database },
  { title: "Equipment Audit", url: "/audit", icon: ClipboardCheck },
];

export function DashboardSidebar({ collapsed, onToggleCollapse }: DashboardSidebarProps) {
  return (
    <div className={cn(
      "bg-card border-r border-border transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="ml-3 text-xl font-bold text-foreground">Futr</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
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
        ))}
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
              <ChevronLeft className="w-4 h-4" />
              <span className="ml-2">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}