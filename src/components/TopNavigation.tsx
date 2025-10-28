import { useState, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Plus, 
  Sun, 
  Moon, 
  Map, 
  User, 
  LogOut, 
  Package, 
  Users, 
  ChevronsUpDown, 
  Check 
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { withApi } from '@/lib/api';
import { Plant } from '@/components/DashboardLayout'; // Adjust path if needed

interface TopNavigationProps {
  activeMenu: string | null;
  selectedPlant: Plant | null;
  onSelectPlant: (plant: Plant | null) => void;
}

export function TopNavigation({ activeMenu, selectedPlant, onSelectPlant }: TopNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for UI controls
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // State for the Combobox
  const [allPlants, setAllPlants] = useState<Plant[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingPlants, setIsLoadingPlants] = useState(false);

  // Fetch all plants when the 'Management' menu is active
  useEffect(() => {
    if (activeMenu === 'Management') {
      const fetchAllPlants = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        setIsLoadingPlants(true);
        try {
          const response = await fetch(withApi('/plants'), {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setAllPlants(data.data || []);
          }
        } catch (error) {
          console.error("Failed to fetch all plants:", error);
        } finally {
          setIsLoadingPlants(false);
        }
      };
      fetchAllPlants();
    }
  }, [activeMenu]);

  // Effect to toggle dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return (
    <header className="bg-card border-b border-border px-6 py-5">
      <div className="flex items-center justify-between">
        {/* Left side - Conditional UI */}
        <div className="flex items-center space-x-4">
          {activeMenu === 'Management' ? (
            <Popover open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isDropdownOpen}
                  className="w-[200px] justify-between"
                >
                  {selectedPlant
                    ? allPlants.find((plant) => plant.plantId === selectedPlant.plantId)?.plantName
                    : "Select plant..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search plant..." />
                  <CommandEmpty>
                    {isLoadingPlants ? "Loading plants..." : "No plant found."}
                  </CommandEmpty>
                  <CommandGroup>
                    {allPlants.map((plant) => (
                      <CommandItem
                        key={plant.plantId}
                        value={plant.plantName}
                        onSelect={() => {
                          onSelectPlant(plant.plantId === selectedPlant?.plantId ? null : plant);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedPlant?.plantId === plant.plantId ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {plant.plantName}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          ) : (
            <h1 className="text-lg font-semibold text-foreground">{activeMenu || 'Dashboard'}</h1>
          )}
        </div>

        {/* Right side - Controls */}
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
                    navigate('/');
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