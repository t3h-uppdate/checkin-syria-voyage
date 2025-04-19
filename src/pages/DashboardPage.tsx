
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHotelList from '@/components/Dashboard/DashboardHotelList';
import DashboardEmpty from '@/components/Dashboard/DashboardEmpty';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Hotel, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchHotels = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
          .from('hotels')
          .select('*')
          .eq('owner_id', user.id);

        if (error) throw error;
        setHotels(data || []);
      } catch (error) {
        console.error('Error fetching hotels:', error);
        setError('Kunde inte hämta hotellen. Försök igen senare.');
        toast.error('Kunde inte hämta hotellen');
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
    window.scrollTo(0, 0);
  }, [user, navigate]);

  if (error) {
    return (
      <MainLayout>
        <div className="pt-24 pb-12 min-h-[80vh]">
          <div className="container mx-auto px-4">
            <div className="text-center py-16">
              <p className="text-red-500">{error}</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="pt-24 pb-12 min-h-[80vh]">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Hotel className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Hotellägare Dashboard</h1>
          </div>

          <Tabs defaultValue="hotels" className="space-y-6">
            <TabsList>
              <TabsTrigger value="hotels" className="flex items-center gap-2">
                <Hotel className="h-4 w-4" />
                <span>Mina Hotell</span>
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Bokningar</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="hotels">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Laddar dina hotell...</p>
                  </div>
                </div>
              ) : hotels.length > 0 ? (
                <DashboardHotelList hotels={hotels} />
              ) : (
                <DashboardEmpty />
              )}
            </TabsContent>
            
            <TabsContent value="bookings">
              <div className="p-8 bg-muted rounded-lg text-center">
                <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">Bokningshantering</h3>
                <p className="text-muted-foreground">Här kommer du kunna hantera alla bokningar för dina hotell.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
