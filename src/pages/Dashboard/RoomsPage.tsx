
import React from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import RoomManagement from '@/components/Dashboard/RoomManagement';
import HotelSelector from '@/components/Dashboard/HotelSelector';
import { useHotelSelection } from '@/hooks/useHotelSelection';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardRoomsPage() {
  const navigate = useNavigate();
  const { 
    hotels, 
    selectedHotel, 
    setSelectedHotel, 
    isLoading, 
    hasNoHotels,
    isMultipleHotels 
  } = useHotelSelection();

  const handleHotelChange = (hotelId: string) => {
    const hotel = hotels.find(h => h.id === hotelId) || null;
    setSelectedHotel(hotel);
  };

  if (hasNoHotels && !isLoading) {
    return (
      <DashboardLayout>
        <div className="py-6">
          <h1 className="text-2xl font-bold mb-6">Room Management</h1>
          <div className="p-8 text-center bg-background border rounded-lg">
            <p className="mb-4">You don't have any hotels yet. Please add a hotel before managing rooms.</p>
            <button 
              className="text-primary hover:underline" 
              onClick={() => navigate('/dashboard/hotels')}
            >
              Go to Hotels
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Room Management</h1>
          {isMultipleHotels && (
            <HotelSelector 
              hotels={hotels} 
              selectedHotel={selectedHotel} 
              onHotelChange={handleHotelChange} 
            />
          )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          selectedHotel && <RoomManagement hotel={selectedHotel} />
        )}
      </div>
    </DashboardLayout>
  );
}
