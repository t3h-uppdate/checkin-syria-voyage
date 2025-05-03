
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import { Hotel } from '@/types';
import HotelServices from '@/components/Dashboard/HotelServices';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHotels } from '@/hooks/useHotels';

export default function DashboardServicesPage() {
  const { data: hotels, isLoading } = useHotels();
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  
  useEffect(() => {
    if (hotels && hotels.length > 0) {
      setSelectedHotel(hotels[0]);
    }
  }, [hotels]);
  
  const handleHotelChange = (hotelId: string) => {
    const hotel = hotels?.find(h => h.id === hotelId) || null;
    setSelectedHotel(hotel);
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6">Service Management</h1>
        
        {/* Hotel Selector */}
        {hotels && hotels.length > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="font-medium">Select Hotel:</div>
                <Select
                  value={selectedHotel?.id}
                  onValueChange={handleHotelChange}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full max-w-xs">
                    <SelectValue placeholder="Select Hotel" />
                  </SelectTrigger>
                  <SelectContent>
                    {hotels.map((hotel) => (
                      <SelectItem key={hotel.id} value={hotel.id}>
                        {hotel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}
        
        <HotelServices hotel={selectedHotel} />
      </div>
    </DashboardLayout>
  );
}
