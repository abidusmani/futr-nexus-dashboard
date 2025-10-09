import { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

// --- Type Definitions ---
interface Plant {
  plantId: string;
  plantName: string;
}

interface Permission {
  _id: string;
  name: string;
  description: string;
}

interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

interface ApiResponse {
  roles: Role[];
}

interface OutletContext {
  selectedPlant: Plant | null;
}

// --- Component ---
export default function RolesManagementPage() {
  const navigate = useNavigate();
  const { selectedPlant } = useOutletContext<OutletContext>();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ 1. State for managing selected rows
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  useEffect(() => {
    // Reset selections when plant changes
    setSelectedRoleIds([]);

    const loadRoles = async () => {
      if (!selectedPlant?.plantId) {
        setRoles([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token not found.");

        const apiUrl = `http://localhost:3000/api/users/roles/getRolePlId?plantId=${selectedPlant.plantId}`;

        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok)
          throw new Error(`API request failed with status ${response.status}`);

        const data: ApiResponse = await response.json();
        setRoles(data.roles || []);
      } catch (err: any) {
        console.error("Failed to fetch roles:", err);
        setError(err.message || "Could not load roles for this plant.");
      } finally {
        setIsLoading(false);
      }
    };

    loadRoles();
  }, [selectedPlant]);

  const handleSelectAll = (checked: boolean) => {
    setSelectedRoleIds(checked ? roles.map((role) => role._id) : []);
  };

  const handleSelectRow = (checked: boolean, roleId: string) => {
    setSelectedRoleIds((prev) =>
      checked ? [...prev, roleId] : prev.filter((id) => id !== roleId)
    );
  };

  if (!selectedPlant) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-10">
        {/* Image added here */}
        <img
          src="https://d1gcht66xunowl.cloudfront.net/assets/visualai-app-admin/production/public/images/no-result.png"
          alt="No result found"
          className="w-48 h-48 mb-4 object-contain" // Tailwind classes for sizing and presentation
        />
        <h2 className="text-xl font-semibold mb-2">No plant selected.</h2>
        <p className="text-sm">
          Please select a Plant from the search bar above to view its details.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h1 className="text-lg font-semibold text-gray-800">
            Existing Roles for {selectedPlant.plantName}
          </h1>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="text-center p-8">Loading roles...</div>
          ) : error ? (
            <div className="text-center p-8 text-destructive">{error}</div>
          ) : (
            <>
              {/* ✅ 2. Action Bar - Placed here to show only with the table */}
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="outline"
                  disabled={selectedRoleIds.length === 0}
                >
                  Delete
                </Button>
                <Button
                  onClick={() => navigate("/management/roles-management/add")}
                >
                  Add role
                </Button>
                <Button>Update Global Roles</Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedRoleIds.length === roles.length &&
                          roles.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>ROLE NAME</TableHead>
                    <TableHead>DESCRIPTION</TableHead>
                    <TableHead>TOTAL ACCESSES</TableHead>
                    <TableHead>ASSIGNED PERMISSIONS</TableHead>
                    <TableHead className="text-right">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.length > 0 ? (
                    roles.map((role) => (
                      <TableRow key={role._id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedRoleIds.includes(role._id)}
                            onCheckedChange={(checked: boolean) =>
                              handleSelectRow(checked, role._id)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {role.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {role.description}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {role.permissions.length}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.map((permission) => (
                              <Badge key={permission._id} variant="secondary">
                                {permission.name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            ...
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">
                        No roles found for this plant.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
