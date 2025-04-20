import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Mail, Phone, User } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';

// Define a type for the profile data
type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  profile_picture: string | null;
  role: string;
  created_at: string;
};

const GuestProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setError("No user ID provided.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) {
          if (profileError.code === 'PGRST116') { // PostgREST error code for "Not Found"
             setError("Guest profile not found.");
          } else {
            throw profileError;
          }
        } else if (data) {
          setProfile(data);
        } else {
           setError("Guest profile not found.");
        }

      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError(err.message || "Failed to fetch guest profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="pt-24 pb-12 min-h-[80vh] flex justify-center items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="pt-24 pb-12 container mx-auto px-4">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
           <div className="mt-4">
             <Link to="/dashboard">
               <Button variant="outline">Back to Dashboard</Button>
             </Link>
           </div>
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
     // This case should ideally be covered by the error state now
    return (
       <MainLayout>
         <div className="pt-24 pb-12 container mx-auto px-4">
           <p>Guest profile not found.</p>
           <div className="mt-4">
             <Link to="/dashboard">
               <Button variant="outline">Back to Dashboard</Button>
             </Link>
           </div>
         </div>
       </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary">
                <AvatarImage src={profile.profile_picture ?? undefined} alt={`${profile.first_name} ${profile.last_name}`} />
                <AvatarFallback className="text-3xl">
                  {getInitials(profile.first_name, profile.last_name)}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl">{profile.first_name} {profile.last_name}</CardTitle>
              <p className="text-muted-foreground capitalize">{profile.role}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <a href={`mailto:${profile.email}`} className="text-primary hover:underline">
                  {profile.email}
                </a>
              </div>
              {profile.phone_number && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <span>{profile.phone_number}</span>
                </div>
              )}
               <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                 <User className="h-5 w-5 text-muted-foreground" />
                 <span>User ID: {profile.id}</span>
               </div>
               <div className="text-center mt-6">
                 <Link to="/dashboard">
                   <Button variant="outline">Back to Dashboard</Button>
                 </Link>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default GuestProfilePage;
