
import React from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import PromotionsManagement from '@/components/Dashboard/PromotionsManagement';
import HotelSelector from '@/components/Dashboard/HotelSelector';
import { useHotelSelection } from '@/hooks/useHotelSelection';
import { Loader2 } from 'lucide-react';

export default function DashboardPromotionsPage() {
  const { 
    hotels, 
    selectedHotel, 
    setSelectedHotel, 
    isLoading, 
    isMultipleHotels 
  } = useHotelSelection();

  const handleHotelChange = (hotelId: string) => {
    const hotel = hotels.find(h => h.id === hotelId) || null;
    setSelectedHotel(hotel);
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Promotions Management</h1>
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
          <PromotionsManagement hotel={selectedHotel} />
        )}
      </div>
    </DashboardLayout>
  );
}
