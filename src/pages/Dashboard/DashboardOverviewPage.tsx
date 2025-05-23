
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Hotel as HotelIcon, Bed, Calendar, User } from 'lucide-react';
import { useHotels } from '@/hooks/useHotels';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

export default function DashboardOverviewPage() {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [totalRooms, setTotalRooms] = useState(0);
  const [recentBookings, setRecentBookings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [ownerHotels, setOwnerHotels] = useState([]);
  const { t } = useTranslation();

  // Additional access control check
  useEffect(() => {
    if (userRole !== 'owner' && userRole !== 'admin') {
      toast.error("You don't have permission to access this area");
      navigate('/');
    }
  }, [userRole, navigate]);

  useEffect(() => {
    const fetchOwnerHotels = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('hotels')
          .select('*')
          .eq('owner_id', user.id);
        
        if (error) {
          throw error;
        }
        
        setOwnerHotels(data || []);
        
        // Calculate total rooms (in a real app, you might fetch this from the rooms table)
        const roomsCount = await fetchTotalRooms(data?.map(hotel => hotel.id) || []);
        setTotalRooms(roomsCount);
        
        // Generate a random number of recent bookings for demo
        // In a real app, fetch from bookings table for these hotels
        setRecentBookings(Math.floor(Math.random() * 15) + 1);
      } catch (error) {
        console.error("Error fetching owner hotels:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOwnerHotels();
  }, [user?.id]);

  // Function to fetch total rooms for a set of hotels
  const fetchTotalRooms = async (hotelIds) => {
    if (hotelIds.length === 0) return 0;
    
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('id')
        .in('hotel_id', hotelIds);
        
      if (error) {
        throw error;
      }
      
      return data?.length || 0;
    } catch (error) {
      console.error("Error fetching rooms count:", error);
      return 0;
    }
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6">{t('dashboard.overview')}</h1>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-primary text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <HotelIcon className="h-5 w-5" /> {t('dashboard.hotelStats.hotels')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {isLoading ? '...' : ownerHotels?.length || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-secondary text-secondary-foreground">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bed className="h-5 w-5" /> {t('dashboard.hotelStats.rooms')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalRooms}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-accent text-accent-foreground">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" /> {t('dashboard.hotelStats.bookings')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{recentBookings}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" /> {t('dashboard.account')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium truncate">
                {user?.email || t('dashboard.hotelStats.notSignedIn')}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Welcome Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('dashboard.welcome')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t('dashboard.welcomeDescription')}
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
