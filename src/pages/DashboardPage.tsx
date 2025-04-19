
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHotelList from '@/components/Dashboard/DashboardHotelList';
import DashboardEmpty from '@/components/Dashboard/DashboardEmpty';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      navigate('/login');
      return;
    }

    // Fetch owner's hotels
    const fetchHotels = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('hotels')
          .select('*')
          .eq('owner_id', user.id);

        if (error) throw error;
        setHotels(data || []);
      } catch (error) {
        console.error('Error fetching hotels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
    
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, [user, navigate]);

  return (
    <MainLayout>
      <div className="pt-24 pb-12 min-h-[80vh]">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Hotellägare Dashboard</h1>

          <Tabs defaultValue="hotels">
            <TabsList>
              <TabsTrigger value="hotels">Mina Hotell</TabsTrigger>
              <TabsTrigger value="bookings">Bokningar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="hotels" className="mt-6">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : hotels.length > 0 ? (
                <DashboardHotelList hotels={hotels} />
              ) : (
                <DashboardEmpty />
              )}
            </TabsContent>
            
            <TabsContent value="bookings" className="mt-6">
              <div className="p-8 bg-muted rounded-lg text-center">
                <h3 className="text-xl font-medium mb-2">Bokningshantering</h3>
                <p>Här kommer du kunna hantera alla bokningar för dina hotell.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
