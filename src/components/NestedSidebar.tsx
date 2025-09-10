import { 
  Map, 
  Layers, 
  Building2, 
  Layout, 
  Zap as ZapIcon,
  FileText,
  Package,
  Upload,
  Wrench,
  Shield,
  DollarSign,
  BarChart3,
  Settings,
  Gauge,
  FileSpreadsheet
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NestedSidebarProps {
  activeMenu: string | null;
  activeSubmenu: string | null;
  onSubmenuClick: (submenu: string | null) => void;
  collapsed: boolean;
}

const submenuItems = {
  "Digitization": [
    { title: "Geo Layouts", icon: Map },
    { title: "Merged Geo Layouts", icon: Layers },
    { title: "Plant Digitization", icon: Building2 },
    { title: "Layout Digitize", icon: Layout },
    { title: "Inverter DC Capacity", icon: ZapIcon },
  ],
  "Library": [
    { title: "Plant Details", icon: Building2 },
    { title: "Component Categories", icon: Package },
    { title: "Components", icon: Settings },
    { title: "Import Components", icon: Upload },
    { title: "Equipment Types", icon: Wrench },
    { title: "Equipment Warranty", icon: Shield },
    { title: "Equipment Insurance", icon: DollarSign },
    { title: "Update DC Load", icon: BarChart3 },
    { title: "Plant Design Tree", icon: Layout },
    { title: "Inverter", icon: ZapIcon },
    { title: "Meter", icon: Gauge },
    { title: "Work Order Template Bulk Update", icon: FileSpreadsheet },
  ]
};

export function NestedSidebar({ activeMenu, activeSubmenu, onSubmenuClick, collapsed }: NestedSidebarProps) {
  const items = activeMenu ? submenuItems[activeMenu as keyof typeof submenuItems] || [] : [];
  const shouldShow = activeMenu && !collapsed && items.length > 0;

  return (
    <div className={cn(
      "bg-card border-r border-border transition-all duration-300 ease-in-out flex flex-col",
      shouldShow ? "w-64 translate-x-0" : "w-0 -translate-x-full overflow-hidden"
    )}>
      {shouldShow && (
        <>
          {/* Header */}
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">{activeMenu}</h3>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {items.map((item) => (
              <button
                key={item.title}
                onClick={() => onSubmenuClick(activeSubmenu === item.title ? null : item.title)}
                className={cn(
                  "flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  "hover:bg-secondary hover:text-secondary-foreground",
                  activeSubmenu === item.title 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="ml-3 truncate">{item.title}</span>
              </button>
            ))}
          </nav>
        </>
      )}
    </div>
  );
}