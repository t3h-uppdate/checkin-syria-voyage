import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHotelList from '@/components/Dashboard/DashboardHotelList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Hotel, Calendar, Bed } from 'lucide-react';
import RoomManagement from '@/components/Dashboard/RoomManagement';
import BookingRequestsList from '@/components/Dashboard/BookingRequestsList';
import { Hotel as HotelType } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedHotel, setSelectedHotel] = useState<HotelType | null>(null);
  const [activeTab, setActiveTab] = useState<string>("hotels");
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const handleSelectHotelForRooms = (hotel: HotelType) => {
    setSelectedHotel(hotel);
    setActiveTab("rooms");
  };

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (profile.role !== 'owner' && profile.role !== 'admin') {
          toast({
            title: "Åtkomst nekad",
            description: "Du måste vara hotellägare eller administratör för att komma åt denna sida.",
            variant: "destructive"
          });
          navigate('/');
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Error checking user role:', error);
        toast({
          title: "Ett fel uppstod",
          description: "Kunde inte verifiera din behörighet.",
          variant: "destructive"
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [user, navigate, toast]);

  if (loading) {
    return (
      <MainLayout>
        <div className="pt-24 pb-12 min-h-[80vh]">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <MainLayout>
      <div className="pt-24 pb-12 min-h-[80vh]">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Hotel className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="hotels" className="flex items-center gap-2">
                <Hotel className="h-4 w-4" />
                <span>Mina Hotell</span>
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Bokningar</span>
              </TabsTrigger>
              <TabsTrigger value="rooms" className="flex items-center gap-2">
                <Bed className="h-4 w-4" />
                <span>Rumhantering</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="hotels">
              <DashboardHotelList onSelectHotelForRooms={handleSelectHotelForRooms} />
            </TabsContent>

            <TabsContent value="bookings">
              <BookingRequestsList />
            </TabsContent>

            <TabsContent value="rooms">
              {selectedHotel ? (
                <RoomManagement hotel={selectedHotel} />
              ) : (
                <div className="p-8 bg-muted rounded-lg text-center border-2 border-dashed border-muted">
                  <Bed className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">Rumhantering</h3>
                  <p className="text-muted-foreground">Välj ett hotell från fliken 'Mina Hotell' och klicka på 'Hantera Rum' för att se och redigera rummen.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
