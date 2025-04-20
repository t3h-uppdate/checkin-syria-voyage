
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHotelList from '@/components/Dashboard/DashboardHotelList';
import DashboardEmpty from '@/components/Dashboard/DashboardEmpty';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Hotel, Calendar } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    window.scrollTo(0, 0);
  }, [user, navigate]);

  if (!user) {
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
              <DashboardHotelList />
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
