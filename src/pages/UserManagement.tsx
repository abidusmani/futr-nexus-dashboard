import { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Plant } from '@/components/DashboardLayout'; // Adjust path
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge"; // Import Badge for permissions

// --- Type Definitions for a User ---
// ✅ FIX 1: Update the User interface to include all attributes from your API
interface User {
  userId: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

interface UserApiResponse {
  success: boolean;
  data: User[];
}

interface OutletContext {
  selectedPlant: Plant | null;
}

// --- Component ---
export default function UserManagementPage() {
  const { selectedPlant } = useOutletContext<OutletContext>();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadUsers = async () => {
      if (!selectedPlant?.plantId) {
        setUsers([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Authentication token not found.");

        const apiUrl = `http://localhost:3000/api/detaileRole?plantId=${selectedPlant.plantId}`;

        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error(`API request failed with status ${response.status}`);

        const data: UserApiResponse = await response.json();
        setUsers(data.data || []);

      } catch (err: any) {
        console.error("Failed to fetch users:", err);
        setError("Could not load members for this plant.");
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [selectedPlant]);

  if (!selectedPlant) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
        <h2 className="text-xl font-semibold mb-2">No Plant Selected</h2>
        <p className="text-sm">Please select a Plant from the search bar to view its members.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">
            User Management for {selectedPlant.plantName}
          </h1>
          <Button onClick={() => navigate('/management/user-management/add')}>
            Add Member
          </Button>
        </div>
        
        <div className="p-4">
          {isLoading ? (
            <div className="text-center p-8">Loading members...</div>
          ) : error ? (
            <div className="text-center p-8 text-destructive">{error}</div>
          ) : (
            <Table>
              {/* ✅ FIX 2: Update Table Headers to include all attributes */}
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"><Checkbox /></TableHead>
                  <TableHead>NAME</TableHead>
                  <TableHead>EMAIL</TableHead>
                  <TableHead>ROLE</TableHead>
                  <TableHead>PERMISSIONS</TableHead>
                  <TableHead className="text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map(user => (
                    // ✅ FIX 3: Update key and render all new data cells
                    <TableRow key={user.userId}> 
                      <TableCell><Checkbox /></TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell className="text-muted-foreground">{user.role}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.permissions.map(permission => (
                            <Badge key={permission} variant="secondary">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">...</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">No members found for this plant.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}