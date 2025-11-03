import { useEffect, useState } from "react";
// ✨ 1. Import useOutletContext
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
// import { withApi } from "@/lib/api"; // <-- Removed this line due to resolution error
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { withApi } from "@/lib/api";

// --- Type Definitions ---
interface Permission {
  _id: string;
  name: string;
  description: string;
}

interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: Permission[] | string[]; // Can be populated objects or just IDs
}

interface Plant {
  plantId: string;
  plantName: string;
}

interface OutletContext {
  selectedPlant: Plant | null;
}

// --- Component ---
export default function UpdateRolePage() {
  const navigate = useNavigate();
  const { id: roleId } = useParams<{ id: string }>(); // This is the roleId from the URL
  const { selectedPlant } = useOutletContext<OutletContext>();

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<string>>(
    new Set()
  );

  // Loading and error state
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null); // Separate error for submit

  // 1. Fetch data on component mount
  useEffect(() => {
    const plantId = selectedPlant?.plantId;

    if (!roleId) {
      setError("No Role ID provided.");
      setIsLoading(false);
      return;
    }

    if (!plantId) {
      // Don't set an error immediately, just wait for context to provide the plant
      setIsLoading(true); // Keep loading until plant is selected
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found.");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch both the role details and the full list of permissions
        const [roleResponse, permsResponse] = await Promise.all([
          // This call uses your GET handler in createRole/route.ts
          fetch(withApi(`/users/createRole?roleId=${roleId}&plantId=${plantId}`), {
            headers: { Authorization: `Bearer ${token}` },
          }),
          
          // This call uses your GET handler in roles/getAllpermission/route.ts
          fetch(withApi('/users/roles/getAllpermission'), {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Process role data
        if (!roleResponse.ok) {
           const errData = await roleResponse.json();
           throw new Error(errData.message || "Failed to fetch role data.");
        }
        
        let roleData: Role;
        const rawRoleData = await roleResponse.json();
        
        // This logic handles various ways the API might return the data
        if (rawRoleData.role) roleData = rawRoleData.role; 
        else if (rawRoleData.data) roleData = rawRoleData.data;
        else roleData = rawRoleData; // Assumes it returns the role object directly

        if (!roleData) {
          throw new Error("Role data format from API is unexpected.");
        }

        setName(roleData.name);
        setDescription(roleData.description);

        // Check if roleData.permissions is an array of objects or strings
        const currentPermIds = new Set(
          Array.isArray(roleData.permissions)
            ? roleData.permissions.map((p) => (typeof p === 'string' ? p : p._id))
            : []
        );
        setSelectedPermissionIds(currentPermIds);

        // Process all permissions data
        if (!permsResponse.ok) {
           const permsErrData = await permsResponse.json();
           throw new Error(permsErrData.message || "Failed to fetch permissions list.");
        }
        
        const rawPermsData = await permsResponse.json();
        let permsList: Permission[] = [];
        
        if (rawPermsData.permissions) permsList = rawPermsData.permissions;
        else if (rawPermsData.data) permsList = rawPermsData.data;
        else if (Array.isArray(rawPermsData)) permsList = rawPermsData;
        
        setAllPermissions(permsList || []);
        
      } catch (err: any) {
        console.error("Failed to load data:", err);
        if (err instanceof SyntaxError) {
             setError("Failed to read server response. One of the API endpoints may be down or incorrect.");
        } else {
             setError(err.message || "Could not load data.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [roleId, selectedPlant]);

  // 2. Handle checkbox changes
  const handlePermissionChange = (permissionId: string) => {
    setSelectedPermissionIds((currentIds) => {
      const newIds = new Set(currentIds);
      if (newIds.has(permissionId)) {
        newIds.delete(permissionId);
      } else {
        newIds.add(permissionId);
      }
      return newIds;
    });
  };

  // 3. Handle form submission to UPDATE the role
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null); // Clear previous submit errors
    const token = localStorage.getItem("token");
    
    if (!token) {
      setSubmitError("Authentication token not found. Please log in again.");
      setIsSubmitting(false);
      return;
    }

    // 1. Create the payload YOUR API expects for a PUT request
    const payload = {
      roleId: roleId, // Your API expects 'roleId' in the body
      name: name,
      description: description,
      permissionIds: Array.from(selectedPermissionIds),
    };

    try {
      // 2. Send the PUT request to YOUR API endpoint
      // This path is correct as it matches your working PUT API
      const response = await fetch(withApi(`/users/createRole`), {
        method: "PUT", // It uses the PUT method
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload), // It sends the data with roleId
      });

      const data = await response.json();
      if (!response.ok) {
        // This will show errors from your API (e.g., "Role not found", "Duplicate name")
        throw new Error(data.message || `API Error: ${response.status}`);
      }

      // 3. Success!
      alert("Role updated successfully!"); // You can replace this with a toast notification
      navigate("/management/roles-management"); // Navigate back
    } catch (err: any) {
      console.error("Failed to update role:", err);
       if (err instanceof SyntaxError) {
             setSubmitError("Failed to read server response. The API endpoint may be down or incorrect.");
        } else {
             setSubmitError(err.message || "Failed to update role.");
        }
    } finally {
      setIsSubmitting(false); // Stop submitting
    }
  };

  // --- Render Logic ---
  if (isLoading) {
    return <div className="p-8 text-center">Loading role details...</div>;
  }
  
  if (!selectedPlant) {
      return <div className="p-8 text-center text-destructive">Please select a plant to edit its roles.</div>;
  }
  
  // Show data-loading error
  if (error) {
    return <div className="p-8 text-center text-destructive">{error}</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Update Role
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <Label htmlFor="roleName" className="font-medium">
              Role Name
            </Label>
            <Input
              id="roleName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          {/* Description */}
          <div>
            <Label htmlFor="roleDescription" className="font-medium">
              Description
            </Label>
            <Textarea
              id="roleDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          {/* Permissions */}
          <div>
            <Label className="font-medium">Permissions</Label>
            <div className="mt-2 space-y-2 rounded-md border p-4 max-h-60 overflow-y-auto">
              {Array.isArray(allPermissions) && allPermissions.length > 0 ? (
                allPermissions.map((permission) => (
                  <div key={permission._id} className="flex items-center gap-2">
                    <Checkbox
                      id={permission._id}
                      checked={selectedPermissionIds.has(permission._id)}
                      onCheckedChange={() =>
                        handlePermissionChange(permission._id)
                      }
                    />
                    <Label
                      htmlFor={permission._id}
                      className="font-normal cursor-pointer"
                    >
                      {permission.name}
                    </Label>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">
                  No permissions available or found.
                </div>
              )}
            </div>
          </div>

          {/* Show submit error */}
          {submitError && <p className="text-sm text-destructive">{submitError}</p>}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/management/roles-management")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

