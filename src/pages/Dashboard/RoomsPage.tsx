
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { Hotel } from '@/types';
import RoomManagement from '@/components/Dashboard/RoomManagement';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Hotel as HotelIcon, LayoutDashboard } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Card, CardContent } from '@/components/ui/card';

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
    } else {
      // If no hotel is selected, redirect to hotels page
      toast.error('Please select a hotel first');
      navigate('/dashboard/hotels');
    }
  }, [navigate]);
  
  return (
    <DashboardLayout>
      <div className="py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="mb-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard/hotels')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Hotels
              </Button>
            </div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <HotelIcon className="h-7 w-7 text-primary" />
              Room Management
              {selectedHotel && (
                <span className="text-xl font-normal text-muted-foreground">
                  for {selectedHotel.name}
                </span>
              )}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your hotel rooms, add new rooms, and update their availability
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')} 
              className="flex items-center gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          </div>
        </div>

        {selectedHotel ? (
          <RoomManagement hotel={selectedHotel} />
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="mx-auto rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mb-4">
                <HotelIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Hotel Selected</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Please select a hotel from the hotels page to manage its rooms.
              </p>
              <Button onClick={() => navigate('/dashboard/hotels')}>
                Go to Hotels
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
