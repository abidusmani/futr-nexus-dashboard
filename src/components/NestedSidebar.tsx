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
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Users,
  FolderOpen,
  UserCog,
  Database,
  Activity,
  Thermometer,
  TestTube,
  Radio,
  Cpu,
  MapPin,
  Globe,
  Factory,
  Cog,
  FileCheck,
  HardDrive,
  Cloud
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NestedSidebarProps {
  activeMenu: string | null;
  activeSubmenu: string | null;
  onSubmenuClick: (submenu: string | null) => void;
  collapsed: boolean;
  nestedCollapsed: boolean;
  onNestedToggle: () => void;
}

const submenuItems = {
  "Digitization": [
    { title: "Geo Layouts", icon: Map },
    { title: "Merged Geo Layouts", icon: Layers },
    { title: "Plant Digitization", icon: Building2 },
    { title: "Layout Digitize", icon: Layout },
    { title: "Inverter DC Capacity", icon: ZapIcon },
  ],
  "Digital Twin": [
    { title: "Base Map", icon: MapPin },
    { title: "Serial No Scanning Map", icon: Radio },
    { title: "Strings Map", icon: Layout },
    { title: "App Digital Twin", icon: Cpu },
    { title: "App Digital Twin Update", icon: Settings },
    { title: "Plant Navigation Map", icon: Globe },
  ],
  "Serial No Scanning": [
    { title: "Serial No Scanning Report", icon: FileCheck },
    { title: "Serial No Update", icon: Settings },
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
  ],
  "Scada Settings": [
    { title: "Scada Config", icon: Settings },
    { title: "Scada Config equipments Map", icon: MapPin },
    { title: "String Input Keys Update", icon: FileText },
    { title: "Scada Jobs", icon: Activity },
    { title: "Clear Scada Jobs", icon: Settings },
    { title: "Global Scada Mapping", icon: Globe },
    { title: "Plant Scada Mapping", icon: Building2 },
    { title: "Custom Plant Mapping Jobs", icon: Wrench },
    { title: "Custom Mapping", icon: Map },
    { title: "Copy Scada Mapping To Prod", icon: Upload },
    { title: "Scaling Factor Model", icon: BarChart3 },
    { title: "Device Errors File", icon: FileText },
    { title: "Suryalog Collector", icon: Database },
    { title: "Integration", icon: Settings },
  ],
  "Equipment Audit": [
    { title: "Drone Thermography", icon: Thermometer },
    { title: "Drone Thermography Summary", icon: FileText },
    { title: "IV Testing", icon: TestTube },
    { title: "EL Testing", icon: Activity },
    { title: "Transmission Line", icon: Radio },
    { title: "Power Equipment", icon: ZapIcon },
    { title: "Structure", icon: Building2 },
    { title: "Tech DD Complied Report", icon: FileCheck },
  ],
  "Management": [
    { title: "User Management", icon: Users },
    { title: "File Manager", icon: FolderOpen },
    { title: "Team Management", icon: UserCog },
    { title: "Roles Management", icon: Shield },
    { title: "Warranty Management", icon: FileCheck },
    { title: "Insurance Management", icon: DollarSign },
  ],
  "Platform Options": [
    { title: "Business Unit", icon: Building2 },
    { title: "Plant Cluster", icon: Layers },
    { title: "Company Logos", icon: FileText },
    { title: "Update App Version", icon: Settings },
    { title: "User List", icon: Users },
    { title: "Data Extraction", icon: Database },
    { title: "Scada Data Params Update", icon: Settings },
    { title: "Manual Data Import", icon: Upload },
  ],
  "Futr Logger": [
    { title: "Futr Logger Devices", icon: HardDrive },
    { title: "Futr Logger Fireware", icon: Cloud },
  ],
  "Data Points": [
    { title: "Import Plant Pvsyst", icon: Upload },
    { title: "Import Plant Financial", icon: DollarSign },
    { title: "Import Plant Budgeted", icon: BarChart3 },
    { title: "Import Inverter Pvsyst", icon: ZapIcon },
    { title: "Shadow Map", icon: Map },
  ]
};

export function NestedSidebar({ 
  activeMenu, 
  activeSubmenu, 
  onSubmenuClick, 
  collapsed, 
  nestedCollapsed, 
  onNestedToggle 
}: NestedSidebarProps) {
  const items = activeMenu ? submenuItems[activeMenu as keyof typeof submenuItems] || [] : [];
  const shouldShow = activeMenu && !collapsed && items.length > 0;

  return (
    <div className={cn(
      "bg-card border-r border-border transition-all duration-300 ease-in-out flex flex-col",
      shouldShow 
        ? nestedCollapsed 
          ? "w-16 translate-x-0" 
          : "w-64 translate-x-0"
        : "w-0 -translate-x-full overflow-hidden"
    )}>
      {shouldShow && (
        <>
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            {!nestedCollapsed && (
              <h3 className="text-sm font-semibold text-foreground">{activeMenu}</h3>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onNestedToggle}
              className="flex-shrink-0"
            >
              {nestedCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
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
                    : "text-muted-foreground",
                  nestedCollapsed ? "justify-center" : ""
                )}
                title={nestedCollapsed ? item.title : undefined}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {!nestedCollapsed && (
                  <span className="ml-3 truncate">{item.title}</span>
                )}
              </button>
            ))}
          </nav>
        </>
      )}
    </div>
  );
}