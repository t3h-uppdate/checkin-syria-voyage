import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, Hotel, User, Building, PenSquare, Trash2, Shield } from "lucide-react";
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

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone_number: string | null;
  profile_picture: string | null;
  role: UserRole;
};

type HotelCount = {
  [userId: string]: number;
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
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [openUserId, setOpenUserId] = useState<string | null>(null);

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
        const { data, error } = await supabase
          .from("profiles")
          .select("*");

        if (error) throw error;

        setOwners((data ?? []).filter(p => p.role === "owner"));
        setGuests((data ?? []).filter(p => p.role === "guest"));
        
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
                        <TableHead>Namn</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Hotell</TableHead>
                        <TableHead className="text-right">Åtgärder</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredUsers(owners).map((owner) => (
                        <Collapsible key={owner.id} open={openUserId === owner.id}>
                          <TableRow className="cursor-pointer" onClick={() => toggleUserDetails(owner.id)}>
                            <TableCell className="py-2" onClick={(e) => e.stopPropagation()}>
                              <Checkbox 
                                checked={selectedUsers.includes(owner.id)}
                                onCheckedChange={() => toggleUserSelection(owner.id)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              {owner.first_name} {owner.last_name}
                            </TableCell>
                            <TableCell>{owner.email}</TableCell>
                            <TableCell>
                              <span className="flex items-center gap-1">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                {hotelCounts[owner.id] || 0}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
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
                            </TableCell>
                          </TableRow>
                          <CollapsibleContent>
                            <TableRow className="bg-muted/30">
                              <TableCell colSpan={5} className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <TableHead>Namn</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-right">Åtgärder</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredUsers(guests).map((guest) => (
                        <Collapsible key={guest.id} open={openUserId === guest.id}>
                          <TableRow className="cursor-pointer" onClick={() => toggleUserDetails(guest.id)}>
                            <TableCell className="py-2" onClick={(e) => e.stopPropagation()}>
                              <Checkbox 
                                checked={selectedUsers.includes(guest.id)}
                                onCheckedChange={() => toggleUserSelection(guest.id)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              {guest.first_name} {guest.last_name}
                            </TableCell>
                            <TableCell>{guest.email}</TableCell>
                            <TableCell className="text-right">
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
                            </TableCell>
                          </TableRow>
                          <CollapsibleContent>
                            <TableRow className="bg-muted/30">
                              <TableCell colSpan={4} className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Kontaktinformation</h4>
                                    <div className="space-y-1 text-sm">
                                      <p><span className="font-medium">Email:</span> {guest.email}</p>
                                      <p><span className="font-medium">Telefon:</span> {guest.phone_number || "Ej angiven"}</p>
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
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboardPage;
