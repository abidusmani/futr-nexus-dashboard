import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Bell, Plus, Sun, Moon, Map, User, LogOut, Package, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopNavigation() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // This useEffect will apply or remove the 'dark' class from the <html> element.
  // Tailwind CSS uses this class to toggle dark mode styles.
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <header className="bg-card border-b border-border px-6 py-5">
      <div className="flex items-center justify-between">
        {/* Left side - can be used for breadcrumbs or title */}
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center space-x-4">
          {/* Dark/Light Mode Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="p-2 relative">
            <Bell className="w-4 h-4" />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground">
              3
            </Badge>
          </Button>

          {/* Add/Create Button with Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Plus className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="end">
              <DropdownMenuItem onClick={() => navigate('/plant-registration')}>
                <Package className="mr-2 h-4 w-4" />
                <span>Plant Registration</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/client-registration')}>
                <Users className="mr-2 h-4 w-4" />
                <span>Client Registration</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Show Map Toggle */}
          <div className="flex items-center space-x-2">
            <Map className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Show Map</span>
            <Switch
              checked={showMap}
              onCheckedChange={setShowMap}
            />
          </div>

          {/* User Profile with Dropdown */}
          <div className="flex items-center space-x-3 pl-4 border-l border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="User Avatar" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      FA
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem onClick={() => alert("Navigating to Profile...")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => alert("Logging out...")}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="text-sm font-medium text-foreground">DS Energize Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
