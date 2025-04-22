
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, Hotel, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone_number: string | null;
  profile_picture: string | null;
  role: string;
};

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [owners, setOwners] = useState<Profile[]>([]);
  const [guests, setGuests] = useState<Profile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    const checkIfAdmin = async () => {
      if (!user) {
        navigate("/login");
        return;
      }
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        if (profile.role !== "admin") {
          toast({
            title: "Åtkomst nekad",
            description: "Du måste vara administratör för att komma åt denna sida.",
            variant: "destructive"
          });
          navigate("/");
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        toast({
          title: "Ett fel uppstod",
          description: "Kunde inte verifiera din behörighet.",
          variant: "destructive"
        });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    checkIfAdmin();
  }, [user, navigate, toast]);

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
      } catch (error) {
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

  if (loading) {
    return (
      <MainLayout>
        <div className="pt-24 pb-12 min-h-[80vh] flex justify-center items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!isAdmin) return null;

  return (
    <MainLayout>
      <div className="pt-24 pb-12 min-h-[80vh]">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <Tabs defaultValue="owners" className="space-y-6">
            <TabsList>
              <TabsTrigger value="owners" className="flex items-center gap-2">
                <Hotel className="h-4 w-4" />
                <span>Hotel Owners</span>
              </TabsTrigger>
              <TabsTrigger value="guests" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Guests</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="owners">
              {loadingUsers ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : owners.length ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {owners.map(owner => (
                    <Card key={owner.id} className="p-4 flex flex-col gap-2">
                      <div className="font-bold">{owner.first_name} {owner.last_name}</div>
                      <div className="text-sm text-muted-foreground break-all">{owner.email}</div>
                      <div className="flex gap-2 text-xs mt-2">
                        <span className="bg-muted rounded px-2">{owner.role}</span>
                        {owner.phone_number && <span>{owner.phone_number}</span>}
                      </div>
                      {/* Actions for future */}
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground pt-4">No hotel owners found.</p>
              )}
            </TabsContent>

            <TabsContent value="guests">
              {loadingUsers ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : guests.length ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {guests.map(guest => (
                    <Card key={guest.id} className="p-4 flex flex-col gap-2">
                      <div className="font-bold">{guest.first_name} {guest.last_name}</div>
                      <div className="text-sm text-muted-foreground break-all">{guest.email}</div>
                      <div className="flex gap-2 text-xs mt-2">
                        <span className="bg-muted rounded px-2">{guest.role}</span>
                        {guest.phone_number && <span>{guest.phone_number}</span>}
                      </div>
                      {/* Actions for future */}
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground pt-4">No guests found.</p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboardPage;
