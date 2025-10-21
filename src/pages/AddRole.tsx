import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft } from 'lucide-react';

// --- Type Definitions ---
interface Plant {
  plantId: string;
  plantName: string;
}

interface Permission {
  _id: string;
  name: string;
}

interface PermissionsApiResponse {
  success: boolean;
  data: Permission[];
}

interface OutletContext {
  selectedPlant: Plant | null;
}

export default function AddRolePage() {
  const navigate = useNavigate();
  const { selectedPlant } = useOutletContext<OutletContext>();
  
  // State for form inputs
  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');

  // State for permissions logic
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  
  // State for loading and error feedback
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetches all available permissions when the component first loads
  useEffect(() => {
    const fetchPermissions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Authentication token not found.");

        const response = await fetch('https://os.dsenergize.com/api/users/roles/getAllpermission', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch permissions');

        const data: PermissionsApiResponse = await response.json();
        
        // Access the 'data' property from the response object
        setAvailablePermissions(data.data || []);

      } catch (err: any) {
        setError(err.message || 'Could not load permissions.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, []); // The empty array [] ensures this effect runs only once

  // Toggles a permission's selected state
  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissionIds(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  // Handles the form submission to create the new role
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedPlant) {
      setError("No plant selected. Please go back and select a plant first.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Not authenticated");

      // Construct the payload with the correct property names
      const newRole = { 
        name: roleName, 
        description, 
        permissionIds: selectedPermissionIds, // Corrected property name
        plantId: selectedPlant.plantId
      };

      // Ensure this is your correct endpoint for creating a role
      const response = await fetch('https://os.dsenergize.com/api/users/createRole', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRole),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create role');
      }
      
      // Navigate back to the roles list on success
      navigate('/management/roles-management');

    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the role.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle case where user navigates here directly without selecting a plant
  if (!selectedPlant) {
    return (
        <div className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">No Plant Selected</h2>
            <p className="text-muted-foreground mb-4">Please go back and select a plant before adding a role.</p>
            <Button onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
            </Button>
        </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50">
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold text-gray-800">Add Role for {selectedPlant.plantName}</h1>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Add role'}
          </Button>
        </div>

        {/* Form Fields */}
        <div className="bg-white p-6 rounded-lg border mb-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
              <Input id="name" value={roleName} onChange={(e) => setRoleName(e.target.value)} placeholder="Enter role name" required />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter description..." required />
            </div>
          </div>
        </div>

        {/* Permissions Section */}
        <div className="bg-blue-100 text-blue-800 p-4 rounded-lg text-sm mb-6">
          Please select some permissions from below table.
        </div>
        
        <div className="bg-white rounded-lg border">
          <div className="p-4">
            {isLoading ? (
              <p>Loading permissions...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              availablePermissions.map(permission => (
                <div key={permission._id} className="flex items-center space-x-3 p-3 border-b">
                  <Checkbox 
                    id={`perm-${permission._id}`}
                    checked={selectedPermissionIds.includes(permission._id)}
                    onCheckedChange={() => handlePermissionToggle(permission._id)}
                  />
                  <label htmlFor={`perm-${permission._id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {permission.name}
                  </label>
                </div>
              ))
            )}
          </div>
        </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </form>
    </div>
  );
}