import { useState } from "react";
import { Bell, Plus, Sun, Moon, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export function TopNavigation() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMap, setShowMap] = useState(false);

  return (
    <header className="bg-card border-b border-border px-6 py-4">
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

          {/* Add/Create Button */}
          <Button variant="ghost" size="sm" className="p-2">
            <Plus className="w-4 h-4" />
          </Button>

          {/* Show Map Toggle */}
          <div className="flex items-center space-x-2">
            <Map className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Show Map</span>
            <Switch 
              checked={showMap}
              onCheckedChange={setShowMap}
            />
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-3 pl-4 border-l border-border">
            <Avatar className="w-8 h-8">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                FA
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground">DS Energize Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}