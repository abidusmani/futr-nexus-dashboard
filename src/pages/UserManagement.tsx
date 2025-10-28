"use client";

import { useEffect, useState } from 'react';
import { withApi } from '@/lib/api';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Plant } from '@/components/DashboardLayout'; // Adjust path
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

// --- Type Definitions ---
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

// --- Avatar Component ---
const AvatarImage = ({ seed }: { seed: string }) => {
  const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}`;
  return (
    <img
      src={avatarUrl}
      alt={`${seed} avatar`}
      className="w-8 h-8 rounded-full inline-block mr-2"
    />
  );
};

// --- Main Component ---
export default function UserManagementPage() {
  const { selectedPlant } = useOutletContext<OutletContext>();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---  pagination state ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Show 5 users per page

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

  const apiUrl = withApi(`/detaileRole?plantId=${selectedPlant.plantId}`);

  const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error(`API request failed with status ${response.status}`);

        const data: UserApiResponse = await response.json();
        setUsers(data.data || []);
        setCurrentPage(1); // Reset to the first page when data changes

      } catch (err: any) {
        console.error("Failed to fetch users:", err);
        setError("Could not load members for this plant.");
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [selectedPlant]);
  
  // --- pagination logic ---
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = users.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };
  
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };
  // --- end pagination logic ---

  if (!selectedPlant) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-10">
        <img
          src="https://d1gcht66xunowl.cloudfront.net/assets/visualai-app-admin/production/public/images/no-result.png"
          alt="No result found"
          className="w-70 h-48 mb-4 object-contain"
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
            <>
              <Table>
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
                  {currentUsers.length > 0 ? (
                    currentUsers.map(user => (
                      <TableRow key={user.userId}>
                        <TableCell><Checkbox /></TableCell>
                        <TableCell className="font-medium flex items-center">
                          <AvatarImage seed={user.name} />
                          {user.name}
                        </TableCell>
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

              {/* --- pagination controls --- */}
              {totalPages > 1 && (
                <div className="flex items-center justify-end space-x-4 py-4">
                    <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
              )}
              {/* --- end pagination controls --- */}
            </>
          )}
        </div>
      </div>
    </div>
  );
}