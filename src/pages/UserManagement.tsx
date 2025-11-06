"use client";

import { useEffect, useState } from 'react';
import { withApi } from '@/lib/api';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Plant } from '@/components/DashboardLayout'; // Adjust path
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRoleId, setEditRoleId] = useState('');
  const [availableRoles, setAvailableRoles] = useState<Array<{ _id: string; name: string }>>([]);
  const [isUpdating, setIsUpdating] = useState(false);

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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => {
                                // open update dialog
                                setEditingUser(user);
                                setEditName(user.name);
                                setEditEmail(user.email);
                                setEditRoleId('');
                                setIsUpdateOpen(true);
                                // fetch roles for this plant and set selected role id
                                (async () => {
                                  try {
                                    const token = localStorage.getItem('token');
                                    if (!token) return;
                                    const res = await fetch(withApi(`/users/roles/getRolePlId?plantId=${selectedPlant?.plantId}`), {
                                      headers: { Authorization: `Bearer ${token}` }
                                    });
                                    if (!res.ok) {
                                      console.error('Failed to fetch roles for update dialog, status', res.status);
                                      return;
                                    }
                                    const json = await res.json();
                                    const roles = json.roles || json.data || [];
                                    setAvailableRoles(roles);
                                    // try to match user's current role to a role _id (by id or name)
                                    const match = roles.find((r: any) => r._id === user.role || r.name === user.role);
                                    setEditRoleId(match?._id ?? '');
                                  } catch (e) {
                                    console.error('Failed to fetch roles for update dialog', e);
                                  }
                                })();
                              }}>
                                Update
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => { setUserToDelete(user.userId); setIsAlertOpen(true); }}>
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
              {/* Delete confirmation dialog */}
              <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the user from this plant.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700"
                      onClick={async () => {
                        if (!userToDelete) return;
                        setSubmitError(null);
                        const token = localStorage.getItem('token');
                        if (!token) { setSubmitError('Not authenticated'); setIsAlertOpen(false); return; }
                        try {
                          const res = await fetch(withApi('/detaileRole/deleteRole'), {
                            method: 'DELETE',
                            headers: {
                              Authorization: `Bearer ${token}`,
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ userId: userToDelete, plantId: selectedPlant?.plantId }),
                          });
                          const data = await res.json().catch(() => ({}));
                          if (!res.ok) throw new Error(data.message || 'Failed to delete user');
                          // remove from UI
                          setUsers(prev => prev.filter(u => u.userId !== userToDelete));
                          toast.success('User deleted');
                        } catch (err: any) {
                          console.error('Delete user failed', err);
                          setSubmitError(err.message || 'Failed to delete user');
                          toast.error(err.message || 'Failed to delete user');
                        } finally {
                          setIsAlertOpen(false);
                          setUserToDelete(null);
                        }
                      }}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              {/* Update User Dialog */}
              <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update User</DialogTitle>
                    <DialogDescription>Update user's name, email and role.</DialogDescription>
                  </DialogHeader>

                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Name</label>
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Role</label>
                      <select className="w-full px-3 py-2 border rounded-md" value={editRoleId} onChange={(e) => setEditRoleId(e.target.value)}>
                        <option value="">Select role</option>
                        {availableRoles.map(r => (
                          <option key={r._id} value={r._id}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                    <DialogFooter>
                    <Button variant="outline" onClick={() => setIsUpdateOpen(false)}>Cancel</Button>
                    <Button onClick={async () => {
                      if (!editingUser) return;
                      setIsUpdating(true);
                      const token = localStorage.getItem('token');
                      if (!token) { toast.error('Not authenticated'); setIsUpdating(false); return; }
                      try {
                        const payload = { userId: editingUser.userId, name: editName, email: editEmail, roleId: editRoleId, plantId: selectedPlant?.plantId };
                          const url = withApi('/detaileRole/updateRole');
                          // Log URL and payload to help debug CORS / wrong-host issues in dev
                          console.debug('Updating user — URL:', url, 'payload:', payload);
                          // Use PATCH for update to avoid servers that do not accept PATCH in CORS preflight
                          const res = await fetch(url, {
                            method: 'PATCH',
                            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                          });
                        const text = await res.text();
                        let data: any = {};
                        try { data = JSON.parse(text); } catch (e) { data = { message: text }; }
                        if (!res.ok) {
                          console.error('Update failed', res.status, data);
                          // surface backend message in toast for local debugging
                          throw new Error(data.message || `Update failed with status ${res.status}`);
                        }
                        // update UI: display role name if possible
                        const updatedRoleName = (availableRoles.find(r => r._id === editRoleId)?.name) ?? editRoleId;
                        setUsers(prev => prev.map(u => u.userId === editingUser.userId ? { ...u, name: editName, email: editEmail, role: updatedRoleName } : u));
                        toast.success('User updated');
                        setIsUpdateOpen(false);
                        setEditingUser(null);
                      } catch (err: any) {
                        console.error('Update user failed', err);
                        toast.error(err.message || 'Failed to update user');
                      } finally {
                        setIsUpdating(false);
                      }
                    }} disabled={isUpdating}>{isUpdating ? 'Updating...' : 'Update'}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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