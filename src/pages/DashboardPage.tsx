
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHotelList from '@/components/Dashboard/DashboardHotelList';
// import DashboardEmpty from '@/components/Dashboard/DashboardEmpty'; // Not used currently
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Hotel, Calendar, Bed } from 'lucide-react'; // Added Bed icon
import RoomManagement from '@/components/Dashboard/RoomManagement'; // Import RoomManagement
import BookingRequestsList from '@/components/Dashboard/BookingRequestsList'; // Import BookingRequestsList
import { Hotel as HotelType } from '@/types'; // Import Hotel type

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedHotel, setSelectedHotel] = useState<HotelType | null>(null);
  const [activeTab, setActiveTab] = useState<string>("hotels");

  const handleSelectHotelForRooms = (hotel: HotelType) => {
    setSelectedHotel(hotel);
    setActiveTab("rooms"); // Switch to rooms tab when a hotel is selected
  };

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

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6"> {/* Control Tabs state */}
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
              {/* Pass the handler function to DashboardHotelList */}
              <DashboardHotelList onSelectHotelForRooms={handleSelectHotelForRooms} />
            </TabsContent>

            <TabsContent value="bookings">
              {/* Replace placeholder with the actual component */}
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
