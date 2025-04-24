
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Ban,
  CheckCircle,
  Search,
  User,
  UserX,
  Eye,
  Filter,
  Loader2,
  RefreshCcw,
  AlertOctagon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "admin" | "owner" | "guest";
  created_at: string;
  is_banned?: boolean;
  email_verified?: boolean;
  reports_count?: number;
  last_login?: string;
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [unbanDialogOpen, setUnbanDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("profiles").select("*");

      if (error) throw error;

      // Add additional properties for demonstration purposes
      const usersWithDetails = data.map(user => ({
        ...user,
        is_banned: false, // Default value since we don't have this column yet
        email_verified: true, // Default value for demonstration
        reports_count: Math.floor(Math.random() * 5), // Random value for demonstration
        last_login: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString() // Random date within last 30 days
      }));

      setUsers(usersWithDetails);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        user =>
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.first_name && user.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.last_name && user.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Filter by status
    if (statusFilter === "banned") {
      filtered = filtered.filter(user => user.is_banned);
    } else if (statusFilter === "active") {
      filtered = filtered.filter(user => !user.is_banned);
    }

    setFilteredUsers(filtered);
  };

  const handleBanUser = async () => {
    if (!selectedUser) return;

    try {
      // In a real implementation, you would update the user's status in the database
      // For now, we'll just update the local state
      const updatedUsers = users.map(user =>
        user.id === selectedUser.id ? { ...user, is_banned: true } : user
      );
      
      setUsers(updatedUsers);
      
      toast({
        title: "User Banned",
        description: `${selectedUser.email} has been banned from the platform.`,
      });
      
      setBanDialogOpen(false);
    } catch (error) {
      console.error("Error banning user:", error);
      toast({
        title: "Error",
        description: "Failed to ban user",
        variant: "destructive"
      });
    }
  };

  const handleUnbanUser = async () => {
    if (!selectedUser) return;

    try {
      // In a real implementation, you would update the user's status in the database
      // For now, we'll just update the local state
      const updatedUsers = users.map(user =>
        user.id === selectedUser.id ? { ...user, is_banned: false } : user
      );
      
      setUsers(updatedUsers);
      
      toast({
        title: "User Unbanned",
        description: `${selectedUser.email} has been unbanned.`,
      });
      
      setUnbanDialogOpen(false);
    } catch (error) {
      console.error("Error unbanning user:", error);
      toast({
        title: "Error",
        description: "Failed to unban user",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage all users of the platform</CardDescription>
            </div>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={fetchUsers}
            >
              <RefreshCcw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by email or name..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 flex-col sm:flex-row">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Role: {roleFilter === "all" ? "All" : roleFilter}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Status: {statusFilter === "all" ? "All" : statusFilter}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Users Found</h3>
              <p className="text-muted-foreground mt-2">
                Try adjusting your filters or search term
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Reports</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {user.first_name || user.last_name
                                ? `${user.first_name || ""} ${user.last_name || ""}`
                                : "Anonymous User"}
                            </div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          user.role === 'admin' ? 'default' :
                          user.role === 'owner' ? 'outline' : 'secondary'
                        }>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.is_banned ? (
                          <Badge variant="destructive">Banned</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.email_verified ? (
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-xs">Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <AlertOctagon className="h-4 w-4 text-amber-500 mr-1" />
                            <span className="text-xs">Unverified</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.reports_count ? "outline" : "secondary"} className={user.reports_count > 2 ? "bg-red-50 text-red-700 border-red-200" : ""}>
                          {user.reports_count || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell>{user.last_login ? formatDate(user.last_login) : "Never"}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                // View user profile functionality would go here
                                toast({
                                  title: "View Profile",
                                  description: `Viewing ${user.email}'s profile`,
                                });
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              <span>View Profile</span>
                            </DropdownMenuItem>
                            {user.is_banned ? (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setUnbanDialogOpen(true);
                                }}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                <span>Unban User</span>
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setBanDialogOpen(true);
                                }}
                                className="text-red-500 focus:text-red-500"
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                <span>Ban User</span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ban User Dialog */}
      <AlertDialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to ban this user? They will no longer be able to access the platform.
              <div className="mt-4 p-4 bg-muted rounded-md">
                <p className="font-medium">{selectedUser?.email}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedUser?.first_name} {selectedUser?.last_name}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBanUser}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Ban User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unban User Dialog */}
      <AlertDialog open={unbanDialogOpen} onOpenChange={setUnbanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unban User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unban this user? They will regain access to the platform.
              <div className="mt-4 p-4 bg-muted rounded-md">
                <p className="font-medium">{selectedUser?.email}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedUser?.first_name} {selectedUser?.last_name}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnbanUser}>
              Unban User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagement;
