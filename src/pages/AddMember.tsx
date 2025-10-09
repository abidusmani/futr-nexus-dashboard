import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft } from 'lucide-react';
import { Plant } from '@/components/DashboardLayout';

// --- Type Definitions ---
interface Role {
  _id: string;
  name: string;
  description: string;
}

interface OutletContext {
  selectedPlant: Plant | null;
}

export default function AddMemberPage() {
  const navigate = useNavigate();
  const { selectedPlant } = useOutletContext<OutletContext>();
  
  // State for the form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  
  // State for fetching roles
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available roles for the selected plant to populate the list
  useEffect(() => {
    if (!selectedPlant?.plantId) return;

    const fetchRolesForPlant = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch(`http://localhost:3000/api/users/roles/getRolePlId?plantId=${selectedPlant.plantId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setAvailableRoles(data.roles || []);
        }
      } catch (err) {
        console.error("Failed to fetch roles for dropdown:", err);
      }
    };
    fetchRolesForPlant();
  }, [selectedPlant]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedPlant) {
      setError("No plant selected. Please go back.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Not authenticated");

      const newMember = {
        name,
        email,
        password,
        roleId: selectedRoleId,
        plantId: selectedPlant.plantId,
      };

      const response = await fetch('http://localhost:3000/api/addMember', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMember),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add member');
      }
      
      navigate('/management/user-management'); // Navigate back on success

    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!selectedPlant) {
    return (
        <div className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">No Plant Selected</h2>
            <p className="text-muted-foreground mb-4">Please go back and select a plant before adding a member.</p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
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
          <h1 className="text-xl font-bold text-gray-800">Add Member to {selectedPlant.plantName}</h1>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Add Member'}
          </Button>
        </div>

        {/* Form Fields */}
        <div className="bg-white p-6 rounded-lg border space-y-6">
          <div>
            <Label htmlFor="name">Name*</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter member's name" required />
          </div>
          <div>
            <Label htmlFor="email">Email*</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter member's email" required />
          </div>
          <div>
            <Label htmlFor="password">Password*</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter a temporary password" required />
          </div>
          
          {/* Custom Role Selection List */}
          <div className="bg-blue-100 text-blue-800 p-4 rounded-lg text-sm mb-6">
          Please select role from below table.
        </div>
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">Role*</Label>
            <div className="bg-white rounded-lg border">
              <div className="flex items-center px-4 py-2 border-b">
                <div className="w-10"></div> {/* Spacer */}
                <div className="w-1/3 text-xs font-semibold text-muted-foreground">Name</div>
                <div className="flex-1 text-xs font-semibold text-muted-foreground">Description</div>
              </div>
              <RadioGroup value={selectedRoleId} onValueChange={setSelectedRoleId} className="space-y-0">
                {availableRoles.map(role => (
                  <Label 
                    key={role._id} 
                    htmlFor={`role-${role._id}`}
                    className="flex items-center p-4 border-b last:border-b-0 cursor-pointer hover:bg-secondary"
                  >
                    <RadioGroupItem value={role._id} id={`role-${role._id}`} className="w-5 h-5" />
                    <div className="w-1/3 ml-4 font-medium">{role.name}</div>
                    <div className="flex-1 text-sm text-muted-foreground">{role.description}</div>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          </div>
        </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </form>
    </div>
  );
}