
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, Users, Hotel, User, Building, PenSquare, 
  Trash2, Shield, Ban, Check, Flag, AlertTriangle 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { UserRole } from "@/types";
import { 
  Dialog,
  DialogContent, 
  DialogDescription, 
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone_number: string | null;
  profile_picture: string | null;
  role: UserRole;
  is_banned?: boolean;
  email_verified?: boolean;
  id_verified?: boolean;
};

type HotelCount = {
  [userId: string]: number;
};

type UserReport = {
  id: string;
  reported_user_id: string;
  reporter_id: string;
  report_type: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
  reporter_name?: string;
};

const AdminDashboardPage = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [owners, setOwners] = useState<Profile[]>([]);
  const [guests, setGuests] = useState<Profile[]>([]);
  const [hotelCounts, setHotelCounts] = useState<HotelCount>({});
  const [userReports, setUserReports] = useState<UserReport[]>([]);
  
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [openUserId, setOpenUserId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);
  const [reportStatusFilter, setReportStatusFilter] = useState<string>("all");

  useEffect(() => {
    const checkIfAdmin = async () => {
      if (!user) {
        console.log("No user found, redirecting to login");
        navigate("/login");
        return;
      }
      
      console.log("Checking if user is admin... Current role from context:", userRole);
      
      if (userRole === 'admin') {
        console.log("User confirmed as admin via context");
        setIsAdmin(true);
        setLoading(false);
        return;
      }
      
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          throw error;
        }

        console.log("User profile retrieved from database:", profile);
        if (!profile || profile.role !== "admin") {
          console.log("User is not an admin, role:", profile?.role);
          toast({
            title: "Access denied",
            description: "You must be an administrator to access this page.",
            variant: "destructive"
          });
          navigate("/");
          return;
        }

        console.log("User is admin, allowing access");
        setIsAdmin(true);
      } catch (error) {
        console.error("Error checking admin status:", error);
        toast({
          title: "An error occurred",
          description: "Could not verify your permissions.",
          variant: "destructive"
        });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    checkIfAdmin();
  }, [user, navigate, toast, userRole]);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        // Extend the profiles query to include additional user status information
        const { data, error } = await supabase
          .from("profiles")
          .select("*");

        if (error) throw error;

        // Simulate some verification data (in a real app, this would come from the database)
        const enhancedData = (data || []).map(profile => ({
          ...profile,
          is_banned: profile.is_banned || false,
          email_verified: true, // This would come from auth.users in a real implementation
          id_verified: Math.random() > 0.5 // Just for demo purposes
        }));

        setOwners(enhancedData.filter(p => p.role === "owner"));
        setGuests(enhancedData.filter(p => p.role === "guest"));
        
        const { data: hotels, error: hotelsError } = await supabase
          .from("hotels")
          .select("owner_id");
        
        if (hotelsError) throw hotelsError;
        
        const counts: HotelCount = {};
        (hotels ?? []).forEach(hotel => {
          if (hotel.owner_id) {
            counts[hotel.owner_id] = (counts[hotel.owner_id] || 0) + 1;
          }
        });
        
        setHotelCounts(counts);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Kunde inte hämta användare",
          description: String(error),
          variant: "destructive",
        });
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [isAdmin, toast]);

  // Fetch user reports
  useEffect(() => {
    if (!isAdmin) return;

    const fetchUserReports = async () => {
      setLoadingReports(true);
      try {
        // In a real implementation, you would have a user_reports table
        // This is simulated for demo purposes
        const mockReports: UserReport[] = [
          {
            id: '1',
            reported_user_id: owners[0]?.id || 'unknown',
            reporter_id: guests[0]?.id || 'unknown',
            report_type: 'inappropriate_behavior',
            description: 'This host was rude and unprofessional during my stay',
            status: 'pending',
            created_at: new Date().toISOString(),
            reporter_name: `${guests[0]?.first_name || 'Guest'} ${guests[0]?.last_name || 'User'}`
          },
          {
            id: '2',
            reported_user_id: guests[1]?.id || 'unknown',
            reporter_id: owners[1]?.id || 'unknown',
            report_type: 'damage',
            description: 'This guest damaged property during their stay',
            status: 'reviewed',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            reporter_name: `${owners[0]?.first_name || 'Host'} ${owners[0]?.last_name || 'User'}`
          },
          {
            id: '3',
            reported_user_id: guests[2]?.id || 'unknown',
            reporter_id: owners[0]?.id || 'unknown',
            report_type: 'fraud',
            description: 'Attempted to use fake payment information',
            status: 'resolved',
            created_at: new Date(Date.now() - 172800000).toISOString(),
            reporter_name: `${owners[1]?.first_name || 'Host'} ${owners[1]?.last_name || 'User'}`
          }
        ];

        setUserReports(mockReports);
      } catch (error) {
        console.error("Error fetching user reports:", error);
        toast({
          title: "Kunde inte hämta användarrapporter",
          description: String(error),
          variant: "destructive"
        });
      } finally {
        setLoadingReports(false);
      }
    };

    if (owners.length > 0 && guests.length > 0) {
      fetchUserReports();
    }
  }, [isAdmin, owners, guests, toast]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);
      
      if (error) throw error;
      
      toast({
        title: "Roll uppdaterad",
        description: `Användarens roll har ändrats till ${newRole}.`,
      });
      
      if (newRole === "owner") {
        setGuests(prev => prev.filter(g => g.id !== userId));
        const user = guests.find(g => g.id === userId);
        if (user) setOwners(prev => [...prev, {...user, role: "owner"}]);
      } else if (newRole === "guest") {
        setOwners(prev => prev.filter(o => o.id !== userId));
        const user = owners.find(o => o.id !== userId);
        if (user) setGuests(prev => [...prev, {...user, role: "guest"}]);
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Kunde inte uppdatera roll",
        description: String(error),
        variant: "destructive",
      });
    }
  };

  const toggleUserBanStatus = async (userId: string, currentStatus: boolean) => {
    try {
      // In a real implementation, you would update the ban status in the database
      // For this demo, we're just updating the local state
      const newBanStatus = !currentStatus;
      
      const updateOwners = owners.map(owner => 
        owner.id === userId ? { ...owner, is_banned: newBanStatus } : owner
      );
      
      const updateGuests = guests.map(guest => 
        guest.id === userId ? { ...guest, is_banned: newBanStatus } : guest
      );
      
      setOwners(updateOwners);
      setGuests(updateGuests);
      
      toast({
        title: newBanStatus ? "Användare blockerad" : "Användare avblockerad",
        description: `Användaren har ${newBanStatus ? "blockerats" : "avblockerats"} från plattformen.`,
      });
    } catch (error) {
      console.error("Error updating ban status:", error);
      toast({
        title: "Kunde inte uppdatera blockerings-status",
        description: String(error),
        variant: "destructive",
      });
    }
  };

  const handleReportStatusChange = (reportId: string, status: 'pending' | 'reviewed' | 'resolved') => {
    // In a real implementation, you would update the report status in the database
    setUserReports(reports => 
      reports.map(report => 
        report.id === reportId ? { ...report, status } : report
      )
    );
    
    toast({
      title: "Rapportstatus uppdaterad",
      description: `Rapporten har markerats som ${status}.`,
    });
    
    setSelectedReport(null);
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkRoleChange = async (newRole: UserRole) => {
    if (!selectedUsers.length) return;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .in("id", selectedUsers);
      
      if (error) throw error;
      
      toast({
        title: "Roller uppdaterade",
        description: `${selectedUsers.length} användare har fått rollen ${newRole}.`,
      });
      
      setLoadingUsers(true);
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("*");
      
      if (fetchError) throw fetchError;
      
      setOwners((data ?? []).filter(p => p.role === "owner"));
      setGuests((data ?? []).filter(p => p.role === "guest"));
      setSelectedUsers([]);
      setLoadingUsers(false);
    } catch (error) {
      console.error("Error updating roles:", error);
      toast({
        title: "Kunde inte uppdatera roller",
        description: String(error),
        variant: "destructive",
      });
    }
  };

  const handleBulkBanAction = async (banAction: boolean) => {
    if (!selectedUsers.length) return;
    
    try {
      // In a real implementation, you would update the ban status in the database
      // For this demo, we're just updating the local state
      const updateOwners = owners.map(owner => 
        selectedUsers.includes(owner.id) ? { ...owner, is_banned: banAction } : owner
      );
      
      const updateGuests = guests.map(guest => 
        selectedUsers.includes(guest.id) ? { ...guest, is_banned: banAction } : guest
      );
      
      setOwners(updateOwners);
      setGuests(updateGuests);
      
      toast({
        title: banAction ? "Användare blockerade" : "Användare avblockerade",
        description: `${selectedUsers.length} användare har ${banAction ? "blockerats" : "avblockerats"}.`,
      });
      
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error updating ban status:", error);
      toast({
        title: "Kunde inte uppdatera blockerings-status",
        description: String(error),
        variant: "destructive",
      });
    }
  };

  const toggleUserDetails = (userId: string) => {
    setOpenUserId(openUserId === userId ? null : userId);
  };

  const getFilteredUsers = (users: Profile[]) => {
    if (!searchTerm) return users;
    
    return users.filter(user => 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.first_name && user.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.last_name && user.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const getFilteredReports = () => {
    if (reportStatusFilter === 'all') return userReports;
    return userReports.filter(report => report.status === reportStatusFilter);
  };

  const findUserNameById = (userId: string): string => {
    const user = [...owners, ...guests].find(u => u.id === userId);
    if (!user) return "Unknown User";
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="pt-24 pb-12 min-h-[80vh] flex justify-center items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-2">Verifying admin access...</p>
        </div>
      </MainLayout>
    );
  }

  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="pt-24 pb-12 min-h-[80vh] flex flex-col justify-center items-center">
          <Shield className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You must have admin privileges to access this page.</p>
          <Button onClick={() => navigate("/")}>Return to Home</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="pt-24 pb-12 min-h-[80vh]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative w-full md:w-64">
                <Input
                  type="text"
                  placeholder="Sök användare..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
                <User className="absolute left-2.5 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>

          {selectedUsers.length > 0 && (
            <Card className="mb-6 bg-muted/40">
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-medium">{selectedUsers.length} användare valda</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleBulkRoleChange("owner")}
                  >
                    <Hotel className="mr-2 h-4 w-4" />
                    Gör till Ägare
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleBulkRoleChange("guest")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Gör till Gäst
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkBanAction(true)}
                    className="text-destructive border-destructive hover:bg-destructive/10"
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Blockera
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkBanAction(false)}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Avblockera
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setSelectedUsers([])}
                  >
                    Avmarkera alla
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Tabs defaultValue="owners" className="space-y-6">
            <TabsList>
              <TabsTrigger value="owners" className="flex items-center gap-2">
                <Hotel className="h-4 w-4" />
                <span>Hotel Owners ({owners.length})</span>
              </TabsTrigger>
              <TabsTrigger value="guests" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Guests ({guests.length})</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <Flag className="h-4 w-4" />
                <span>User Reports ({userReports.length})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="owners">
              {loadingUsers ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : getFilteredUsers(owners).length ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox 
                            checked={getFilteredUsers(owners).length > 0 && getFilteredUsers(owners).every(owner => selectedUsers.includes(owner.id))}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedUsers(prev => [...prev, ...getFilteredUsers(owners).map(u => u.id)]);
                              } else {
                                setSelectedUsers(prev => prev.filter(id => !getFilteredUsers(owners).find(u => u.id === id)));
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Namn</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Verifiering</TableHead>
                        <TableHead>Hotell</TableHead>
                        <TableHead className="text-right">Åtgärder</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredUsers(owners).map((owner) => (
                        <Collapsible key={owner.id} open={openUserId === owner.id}>
                          <TableRow className={`cursor-pointer ${owner.is_banned ? 'bg-red-50' : ''}`} onClick={() => toggleUserDetails(owner.id)}>
                            <TableCell className="py-2" onClick={(e) => e.stopPropagation()}>
                              <Checkbox 
                                checked={selectedUsers.includes(owner.id)}
                                onCheckedChange={() => toggleUserSelection(owner.id)}
                              />
                            </TableCell>
                            <TableCell>
                              {owner.is_banned ? (
                                <Badge variant="destructive" className="flex items-center gap-1">
                                  <Ban className="h-3 w-3" />
                                  Banned
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
                                  <Check className="h-3 w-3" />
                                  Active
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              {owner.first_name} {owner.last_name}
                            </TableCell>
                            <TableCell>{owner.email}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {owner.email_verified ? (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Email</Badge>
                                ) : null}
                                {owner.id_verified ? (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">ID</Badge>
                                ) : null}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="flex items-center gap-1">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                {hotelCounts[owner.id] || 0}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRoleChange(owner.id, "guest");
                                  }}
                                >
                                  <User className="h-4 w-4 mr-2" />
                                  Gör till Gäst
                                </Button>
                                <Button
                                  variant={owner.is_banned ? "outline" : "ghost"}
                                  size="sm"
                                  className={owner.is_banned ? "" : "hover:bg-red-100 hover:text-red-700"}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleUserBanStatus(owner.id, owner.is_banned || false);
                                  }}
                                >
                                  {owner.is_banned ? (
                                    <>
                                      <Check className="h-4 w-4 mr-2" />
                                      Avblockera
                                    </>
                                  ) : (
                                    <>
                                      <Ban className="h-4 w-4 mr-2" />
                                      Blockera
                                    </>
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          <CollapsibleContent>
                            <TableRow className="bg-muted/30">
                              <TableCell colSpan={7} className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Kontaktinformation</h4>
                                    <div className="space-y-1 text-sm">
                                      <p><span className="font-medium">Email:</span> {owner.email}</p>
                                      <p><span className="font-medium">Telefon:</span> {owner.phone_number || "Ej angiven"}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Hotell</h4>
                                    <div className="text-sm">
                                      {hotelCounts[owner.id] ? (
                                        <p>{hotelCounts[owner.id]} hotell registrerade</p>
                                      ) : (
                                        <p>Inga hotell registrerade</p>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Verifieringsstatus</h4>
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <Label htmlFor={`email-verified-${owner.id}`}>Email verifierad</Label>
                                        <Switch 
                                          id={`email-verified-${owner.id}`}
                                          checked={owner.email_verified} 
                                          disabled
                                        />
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <Label htmlFor={`id-verified-${owner.id}`}>ID verifierad</Label>
                                        <Switch 
                                          id={`id-verified-${owner.id}`}
                                          checked={owner.id_verified}
                                          // In a real app, you'd update this in the database
                                          onCheckedChange={(checked) => {
                                            setOwners(owners.map(o => 
                                              o.id === owner.id ? {...o, id_verified: checked} : o
                                            ));
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 border rounded-md bg-muted/20">
                  <p className="text-muted-foreground">Inga hotellägare hittades{searchTerm ? " som matchar sökningen" : ""}.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="guests">
              {loadingUsers ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : getFilteredUsers(guests).length ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox 
                            checked={getFilteredUsers(guests).length > 0 && getFilteredUsers(guests).every(guest => selectedUsers.includes(guest.id))}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedUsers(prev => [...prev, ...getFilteredUsers(guests).map(u => u.id)]);
                              } else {
                                setSelectedUsers(prev => prev.filter(id => !getFilteredUsers(guests).find(u => u.id === id)));
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Namn</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Verifiering</TableHead>
                        <TableHead className="text-right">Åtgärder</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredUsers(guests).map((guest) => (
                        <Collapsible key={guest.id} open={openUserId === guest.id}>
                          <TableRow className={`cursor-pointer ${guest.is_banned ? 'bg-red-50' : ''}`} onClick={() => toggleUserDetails(guest.id)}>
                            <TableCell className="py-2" onClick={(e) => e.stopPropagation()}>
                              <Checkbox 
                                checked={selectedUsers.includes(guest.id)}
                                onCheckedChange={() => toggleUserSelection(guest.id)}
                              />
                            </TableCell>
                            <TableCell>
                              {guest.is_banned ? (
                                <Badge variant="destructive" className="flex items-center gap-1">
                                  <Ban className="h-3 w-3" />
                                  Banned
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
                                  <Check className="h-3 w-3" />
                                  Active
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              {guest.first_name} {guest.last_name}
                            </TableCell>
                            <TableCell>{guest.email}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {guest.email_verified ? (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Email</Badge>
                                ) : null}
                                {guest.id_verified ? (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">ID</Badge>
                                ) : null}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRoleChange(guest.id, "owner");
                                  }}
                                >
                                  <Hotel className="h-4 w-4 mr-2" />
                                  Gör till Ägare
                                </Button>
                                <Button
                                  variant={guest.is_banned ? "outline" : "ghost"}
                                  size="sm"
                                  className={guest.is_banned ? "" : "hover:bg-red-100 hover:text-red-700"}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleUserBanStatus(guest.id, guest.is_banned || false);
                                  }}
                                >
                                  {guest.is_banned ? (
                                    <>
                                      <Check className="h-4 w-4 mr-2" />
                                      Avblockera
                                    </>
                                  ) : (
                                    <>
                                      <Ban className="h-4 w-4 mr-2" />
                                      Blockera
                                    </>
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          <CollapsibleContent>
                            <TableRow className="bg-muted/30">
                              <TableCell colSpan={6} className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Kontaktinformation</h4>
                                    <div className="space-y-1 text-sm">
                                      <p><span className="font-medium">Email:</span> {guest.email}</p>
                                      <p><span className="font-medium">Telefon:</span> {guest.phone_number || "Ej angiven"}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Verifieringsstatus</h4>
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <Label htmlFor={`email-verified-${guest.id}`}>Email verifierad</Label>
                                        <Switch 
                                          id={`email-verified-${guest.id}`}
                                          checked={guest.email_verified}
                                          disabled
                                        />
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <Label htmlFor={`id-verified-${guest.id}`}>ID verifierad</Label>
                                        <Switch 
                                          id={`id-verified-${guest.id}`}
                                          checked={guest.id_verified}
                                          // In a real app, you'd update this in the database
                                          onCheckedChange={(checked) => {
                                            setGuests(guests.map(g => 
                                              g.id === guest.id ? {...g, id_verified: checked} : g
                                            ));
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 border rounded-md bg-muted/20">
                  <p className="text-muted-foreground">Inga gäster hittades{searchTerm ? " som matchar sökningen" : ""}.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="reports">
              <div className="mb-4 flex flex-col sm:flex-row gap-4 justify-between">
                <div>
                  <h3 className="text-lg font-medium mb-1">Användarrapporter</h3>
                  <p className="text-sm text-muted-foreground">Hantera rapporter och klagomål från användare</p>
                </div>
                <Select
                  value={reportStatusFilter}
                  onValueChange={(value) => setReportStatusFilter(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrera efter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alla rapporter</SelectItem>
                    <SelectItem value="pending">Väntar på behandling</SelectItem>
                    <SelectItem value="reviewed">Under granskning</SelectItem>
                    <SelectItem value="resolved">Löst</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {loadingReports ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : getFilteredReports().length ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Rapporterad användare</TableHead>
                        <TableHead>Typ</TableHead>
                        <TableHead>Rapporterad av</TableHead>
                        <TableHead>Datum</TableHead>
                        <TableHead className="text-right">Åtgärder</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredReports().map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>
                            {report.status === 'pending' && (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                Väntar
                              </Badge>
                            )}
                            {report.status === 'reviewed' && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                Under granskning
                              </Badge>
                            )}
                            {report.status === 'resolved' && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Löst
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {findUserNameById(report.reported_user_id)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-normal">
                              {report.report_type === 'inappropriate_behavior' && 'Olämpligt beteende'}
                              {report.report_type === 'damage' && 'Skada på egendom'}
                              {report.report_type === 'fraud' && 'Bedrägeri'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {report.reporter_name || findUserNameById(report.reporter_id)}
                          </TableCell>
                          <TableCell>
                            {new Date(report.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedReport(report)}>
                                  <PenSquare className="h-4 w-4 mr-2" />
                                  Hantera
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                  <DialogTitle>Användarrapport</DialogTitle>
                                  <DialogDescription>
                                    Granska och hantera denna användarrapport
                                  </DialogDescription>
                                </DialogHeader>
                                
                                {selectedReport && (
                                  <div className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                      <h4 className="text-sm font-medium">Rapporttyp</h4>
                                      <Badge className="font-normal">
                                        {selectedReport.report_type === 'inappropriate_behavior' && 'Olämpligt beteende'}
                                        {selectedReport.report_type === 'damage' && 'Skada på egendom'}
                                        {selectedReport.report_type === 'fraud' && 'Bedrägeri'}
                                      </Badge>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <h4 className="text-sm font-medium">Beskrivning</h4>
                                      <p className="text-sm border rounded-md p-3 bg-muted/20">
                                        {selectedReport.description}
                                      </p>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <h4 className="text-sm font-medium">Rapporterad användare</h4>
                                        <p className="text-sm">
                                          {findUserNameById(selectedReport.reported_user_id)}
                                        </p>
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <h4 className="text-sm font-medium">Rapporterad av</h4>
                                        <p className="text-sm">
                                          {selectedReport.reporter_name || findUserNameById(selectedReport.reporter_id)}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <h4 className="text-sm font-medium">Status</h4>
                                      <RadioGroup 
                                        value={selectedReport.status} 
                                        onValueChange={(value: 'pending' | 'reviewed' | 'resolved') => {
                                          setSelectedReport({
                                            ...selectedReport,
                                            status: value
                                          });
                                        }}
                                      >
                                        <div className="flex items-center space-x-2">
                                          <RadioGroupItem value="pending" id="pending" />
                                          <Label htmlFor="pending">Väntar på behandling</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <RadioGroupItem value="reviewed" id="reviewed" />
                                          <Label htmlFor="reviewed">Under granskning</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <RadioGroupItem value="resolved" id="resolved" />
                                          <Label htmlFor="resolved">Löst</Label>
                                        </div>
                                      </RadioGroup>
                                    </div>
                                  </div>
                                )}
                                
                                <DialogFooter>
                                  <Button 
                                    variant="outline" 
                                    onClick={() => setSelectedReport(null)}
                                  >
                                    Avbryt
                                  </Button>
                                  <Button 
                                    onClick={() => {
                                      if (selectedReport) {
                                        handleReportStatusChange(
                                          selectedReport.id,
                                          selectedReport.status
                                        );
                                      }
                                    }}
                                  >
                                    Spara ändringar
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 border rounded-md bg-muted/20">
                  <p className="text-muted-foreground">Inga rapporter hittades{reportStatusFilter !== 'all' ? " med den valda statusen" : ""}.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboardPage;
