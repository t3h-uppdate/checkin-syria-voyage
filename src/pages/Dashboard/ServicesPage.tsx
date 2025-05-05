
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import { Hotel } from '@/types';
import HotelServices from '@/components/Dashboard/HotelServices';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHotels } from '@/hooks/useHotels';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { Loader2 } from 'lucide-react';

export default function DashboardServicesPage() {
  const { user } = useAuth();
  const { data: hotels, isLoading, error } = useHotels({ ownerId: user?.id });
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  
  useEffect(() => {
    if (error) {
      toast.error("Failed to load hotels");
    }
  }, [error]);
  
  useEffect(() => {
    if (hotels && hotels.length > 0) {
      setSelectedHotel(hotels[0]);
    }
  }, [hotels]);
  
  const handleHotelChange = (hotelId: string) => {
    const hotel = hotels?.find(h => h.id === hotelId) || null;
    setSelectedHotel(hotel);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="py-6 flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (hotels?.length === 0) {
    return (
      <DashboardLayout>
        <div className="py-6">
          <h1 className="text-2xl font-bold mb-6">Service Management</h1>
          <Card>
            <CardContent className="p-8 text-center">
              <p>You don't have any hotels yet. Please add a hotel to manage services.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

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
