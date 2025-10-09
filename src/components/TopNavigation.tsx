import { useState, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Bell, Plus, Sun, Moon, Map, User, LogOut, Package, Users 
} from "lucide-react";
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

// ✅ FIX 1: Update the Plant interface to match your API response
interface Plant {
  plantId: string;
  plantName: string;
  // You can add other properties like dcCapacity if needed
}

interface TopNavigationProps {
  activeMenu: string | null;
  selectedPlant: Plant | null;
  onSelectPlant: (plant: Plant | null) => void;
}

export function TopNavigation({ activeMenu, selectedPlant, onSelectPlant }: TopNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Plant[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  useEffect(() => {
    // Use 'plantName' for the display value
    setSearchQuery(selectedPlant?.plantName || "");
  }, [selectedPlant]);

  useEffect(() => {
    if (!searchQuery || (selectedPlant && searchQuery === selectedPlant.plantName)) {
      setSearchResults([]);
      return;
    }

    const timerId = setTimeout(() => {
      const token = localStorage.getItem('token');
      if (!token) return;

      setIsLoadingSearch(true);
      fetch(`http://localhost:3000/api/plants?search=${searchQuery}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        // The API returns the array inside a 'data' property
        const plantsArray = data.data;
        setSearchResults(plantsArray || []);
      })
      .catch(console.error)
      .finally(() => setIsLoadingSearch(false));
    }, 500);

    return () => clearTimeout(timerId);
  }, [searchQuery, selectedPlant]);

  const handlePlantSelect = (plant: Plant) => {
    onSelectPlant(plant);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return (
    <header className="bg-card border-b border-border px-6 py-5">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {activeMenu === 'Management' ? (
            <div className="relative">
              <input 
                type="text"
                placeholder="Search Solar Plant"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (selectedPlant) onSelectPlant(null);
                  setIsDropdownOpen(true);
                }}
                onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                onFocus={() => { if (searchQuery) setIsDropdownOpen(true); }}
                className="bg-input border border-border rounded-md px-3 py-2 text-sm w-48"
              />
              
              {isDropdownOpen && (isLoadingSearch || searchResults.length > 0) && (
                <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-md shadow-lg z-10">
                  {isLoadingSearch ? (
                     <div className="p-2 text-sm text-muted-foreground">Searching...</div>
                  ) : (
                    searchResults.map(plant => (
                      <div 
                        // ✅ FIX 2: Use 'plantId' for the unique key
                        key={plant.plantId} 
                        onMouseDown={() => handlePlantSelect(plant)}
                        className="p-2 text-sm hover:bg-secondary cursor-pointer"
                      >
                        {/* ✅ FIX 3: Use 'plantName' to display the name */}
                        {plant.plantName}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            <h1 className="text-lg font-semibold text-foreground">{activeMenu || 'Dashboard'}</h1>
          )}
        </div>

        {/* Right side */}
         <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => setIsDarkMode(!isDarkMode)} className="p-2">
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          {/* <Button variant="ghost" size="sm" className="p-2 relative">
            <Bell className="w-4 h-4" />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground">3</Badge>
          </Button> */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2"><Plus className="w-4 h-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="end">
              <DropdownMenuItem onClick={() => navigate('/plant-registration')}><Package className="mr-2 h-4 w-4" /><span>Plant Registration</span></DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/client-registration')}><Users className="mr-2 h-4 w-4" /><span>Client Registration</span></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* <div className="flex items-center space-x-2">
            <Map className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Show Map</span>
            <Switch checked={showMap} onCheckedChange={setShowMap} />
          </div> */}
          <div className="flex items-center space-x-3 pl-4 border-l border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="User Avatar" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">FA</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem onClick={() => navigate('/profile')}><User className="mr-2 h-4 w-4" /><span>Profile</span></DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                    localStorage.removeItem('token');
                    navigate('/login');
                }}><LogOut className="mr-2 h-4 w-4" /><span>Logout</span></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="text-sm font-medium text-foreground">DS Energize Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}