
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { Hotel } from '@/types';
import RoomManagement from '@/components/Dashboard/RoomManagement';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Hotel as HotelIcon } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

export default function DashboardRoomsPage() {
  const navigate = useNavigate();
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  
  useEffect(() => {
    // Get the selected hotel from session storage
    const hotelJson = sessionStorage.getItem('selectedHotel');
    if (hotelJson) {
      try {
        setSelectedHotel(JSON.parse(hotelJson));
      } catch (e) {
        toast.error('Failed to load hotel information');
        navigate('/dashboard/hotels');
      }
    }
  }, [navigate]);
  
  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard/hotels')}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Hotels
            </Button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <HotelIcon className="h-6 w-6 text-primary" />
              Room Management
              {selectedHotel && (
                <span className="text-lg font-normal text-muted-foreground">
                  for {selectedHotel.name}
                </span>
              )}
            </h1>
          </div>
        </div>

        {selectedHotel ? (
          <RoomManagement hotel={selectedHotel} />
        ) : (
          <div className="text-center p-8">
            <p>No hotel selected. Please select a hotel from the hotels page.</p>
            <Button onClick={() => navigate('/dashboard/hotels')} className="mt-4">
              Go to Hotels
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
