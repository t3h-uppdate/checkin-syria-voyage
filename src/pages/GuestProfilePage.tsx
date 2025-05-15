
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Mail, Phone, User, MapPin, Flag, Home, BadgeCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  display_name: string | null;
  nationality: string | null;
  address_street: string | null;
  address_city: string | null;
  address_postal_code: string | null;
  address_country: string | null;
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

  const getNationalityLabel = (code: string | null) => {
    if (!code) return null;
    
    const countries: Record<string, string> = {
      us: 'United States',
      uk: 'United Kingdom',
      ca: 'Canada',
      au: 'Australia',
      fr: 'France',
      de: 'Germany',
      it: 'Italy',
      es: 'Spain',
      jp: 'Japan',
      cn: 'China',
      br: 'Brazil',
      mx: 'Mexico',
      in: 'India',
      ru: 'Russia',
      za: 'South Africa',
      sg: 'Singapore',
      ae: 'United Arab Emirates',
      sa: 'Saudi Arabia',
      tr: 'Turkey',
      sy: 'Syria',
      lb: 'Lebanon',
      jo: 'Jordan',
      iq: 'Iraq',
    };
    
    return countries[code.toLowerCase()] || code;
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
              <CardTitle className="text-2xl">
                {profile.display_name || `${profile.first_name} ${profile.last_name}`}
              </CardTitle>
              <div className="flex items-center justify-center mt-2 gap-2">
                <Badge variant="role" className="capitalize">
                  {profile.role}
                </Badge>
                {profile.nationality && (
                  <Badge variant="nationality" className="capitalize">
                    {profile.nationality.toUpperCase()}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="font-medium text-lg">Contact Information</h3>
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
              </div>

              {/* Personal Information */}
              <div className="space-y-3">
                <h3 className="font-medium text-lg">Personal Information</h3>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Name</div>
                    <div>{profile.first_name} {profile.last_name}</div>
                  </div>
                </div>
                
                {profile.display_name && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                    <BadgeCheck className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Display Name</div>
                      <div>{profile.display_name}</div>
                    </div>
                  </div>
                )}
                
                {profile.nationality && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                    <Flag className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Nationality</div>
                      <div className="flex items-center gap-2">
                        {getNationalityLabel(profile.nationality)}
                        <Badge variant="country">{profile.nationality.toUpperCase()}</Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Address Information - only show if at least one address field is present */}
              {(profile.address_street || profile.address_city || profile.address_postal_code || profile.address_country) && (
                <div className="space-y-3">
                  <h3 className="font-medium text-lg">Address</h3>
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-md">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      {profile.address_street && <div>{profile.address_street}</div>}
                      {profile.address_city && profile.address_postal_code && (
                        <div>{profile.address_city}, {profile.address_postal_code}</div>
                      )}
                      {profile.address_city && !profile.address_postal_code && <div>{profile.address_city}</div>}
                      {!profile.address_city && profile.address_postal_code && <div>{profile.address_postal_code}</div>}
                      {profile.address_country && (
                        <div className="flex items-center gap-2 mt-1">
                          {getNationalityLabel(profile.address_country)}
                          <Badge variant="country">{profile.address_country.toUpperCase()}</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* User ID */}
              <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                <Home className="h-5 w-5 text-muted-foreground" />
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
