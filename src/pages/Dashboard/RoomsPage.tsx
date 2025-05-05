
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import RoomManagement from '@/components/Dashboard/RoomManagement';
import { Hotel } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

export default function DashboardRoomsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const navigate = useNavigate();
  
  // Try to get the selected hotel from session storage first
  useEffect(() => {
    const storedHotel = sessionStorage.getItem('selectedHotel');
    
    if (storedHotel) {
      try {
        const hotel = JSON.parse(storedHotel);
        // Verify this hotel belongs to the current user
        if (hotel.ownerId === user?.id) {
          setSelectedHotel(hotel);
        } else {
          sessionStorage.removeItem('selectedHotel');
        }
      } catch (e) {
        console.error('Error parsing stored hotel:', e);
        sessionStorage.removeItem('selectedHotel');
      }
    }
  }, [user?.id]);
  
  // Fetch all hotels owned by the current user
  useEffect(() => {
    const fetchHotels = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('hotels')
          .select('*')
          .eq('owner_id', user.id);
          
        if (error) throw error;
        
        const mappedHotels = data.map(hotel => ({
          id: hotel.id,
          name: hotel.name,
          description: hotel.description,
          address: hotel.address || '',
          city: hotel.city,
          country: hotel.country,
          phoneNumber: hotel.phone_number || '',
          email: hotel.email,
          website: hotel.website,
          images: hotel.images || [],
          rating: hotel.rating || 0,
          reviewCount: hotel.review_count || 0,
          amenities: hotel.amenities || [],
          latitude: hotel.latitude || 0,
          longitude: hotel.longitude || 0,
          featuredImage: hotel.featured_image || '/placeholder.svg',
          pricePerNight: hotel.price_per_night || 0,
          featured: hotel.featured || false,
          ownerId: hotel.owner_id
        }));
        
        setHotels(mappedHotels);
        
        // If we don't have a selected hotel yet, select the first one
        if (!selectedHotel && mappedHotels.length > 0) {
          setSelectedHotel(mappedHotels[0]);
        }
      } catch (error) {
        console.error('Error fetching hotels:', error);
        toast.error('Failed to load hotels');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHotels();
  }, [user?.id, selectedHotel]);
  
  const handleHotelChange = (hotelId: string) => {
    const hotel = hotels.find(h => h.id === hotelId);
    if (hotel) {
      setSelectedHotel(hotel);
      sessionStorage.setItem('selectedHotel', JSON.stringify(hotel));
    }
  };
  
  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-6 flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }
  
  if (hotels.length === 0) {
    return (
      <DashboardLayout>
        <div className="py-6">
          <h1 className="text-2xl font-bold mb-6">Room Management</h1>
          <Card>
            <CardContent className="p-8 text-center">
              <p className="mb-4">You don't have any hotels yet. Please add a hotel before managing rooms.</p>
              <button 
                className="text-primary hover:underline" 
                onClick={() => navigate('/dashboard/hotels')}
              >
                Go to Hotels
              </button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6">Room Management</h1>
        
        {/* Hotel Selector */}
        {hotels.length > 1 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="font-medium">Select Hotel:</div>
                <Select
                  value={selectedHotel?.id}
                  onValueChange={handleHotelChange}
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
        
        {selectedHotel && <RoomManagement hotel={selectedHotel} />}
      </div>
    </DashboardLayout>
  );
}
