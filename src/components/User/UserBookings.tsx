import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CalendarRange } from 'lucide-react';
import { toast } from 'sonner';
import { BookingStatusBadge } from '../Dashboard/Bookings/BookingStatusBadge';

const UserBookings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: fetchError } = await supabase
          .from('booking_details_view')
          .select('*')
          .eq('user_id', user.id);
          
        if (fetchError) throw fetchError;
        
        setBookings(data || []);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings');
        toast.error(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [user, t]);

  const currentDate = new Date();
  const upcomingBookings = bookings.filter(booking => new Date(booking.check_in_date) >= currentDate);
  const pastBookings = bookings.filter(booking => new Date(booking.check_in_date) < currentDate);

  const handleViewDetails = (bookingId: string) => {
    navigate(`/confirmation/${bookingId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{error}</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="mt-2"
        >
          {t('dashboard.errors.tryAgain')}
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 text-center">
        <p>{t('dashboard.hotelStats.notSignedIn')}</p>
        <Button 
          onClick={() => navigate('/login')}
          className="mt-2"
        >
          {t('common.login')}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">{t('booking.myBookings')}</h1>

      <Tabs defaultValue="upcoming">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">
            {t('booking.upcomingBookings')} ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            {t('booking.pastBookings')} ({pastBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcomingBookings.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingBookings.map(booking => (
                <Card key={booking.booking_id}>
                  <CardHeader>
                    <CardTitle>{booking.hotel_name}</CardTitle>
                    <CardDescription>
                      {booking.room_name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <CalendarRange className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(new Date(booking.check_in_date), 'PP')} - {format(new Date(booking.check_out_date), 'PP')}
                        </span>
                      </div>
                      <p>
                        <strong>{t('booking.guests')}:</strong> {booking.guest_count}
                      </p>
                      <p>
                        <strong>{t('booking.total')}:</strong> ${booking.total_price}
                      </p>
                      <div className="mt-2">
                        <BookingStatusBadge status={booking.booking_status} />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={() => handleViewDetails(booking.booking_id)}
                      variant="outline" 
                      className="w-full"
                    >
                      {t('booking.viewBookingDetails')}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-muted rounded-lg">
              <p>{t('booking.noBookings')}</p>
              <Button 
                onClick={() => navigate('/hotels')}
                className="mt-4"
              >
                {t('common.hotels')}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {pastBookings.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastBookings.map(booking => (
                <Card key={booking.booking_id}>
                  <CardHeader>
                    <CardTitle>{booking.hotel_name}</CardTitle>
                    <CardDescription>
                      {booking.room_name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <CalendarRange className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(new Date(booking.check_in_date), 'PP')} - {format(new Date(booking.check_out_date), 'PP')}
                        </span>
                      </div>
                      <p>
                        <strong>{t('booking.guests')}:</strong> {booking.guest_count}
                      </p>
                      <p>
                        <strong>{t('booking.total')}:</strong> ${booking.total_price}
                      </p>
                      <div className="mt-2">
                        <BookingStatusBadge status={booking.booking_status} />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      onClick={() => handleViewDetails(booking.booking_id)}
                      variant="outline"
                    >
                      {t('booking.viewBookingDetails')}
                    </Button>
                    <Button 
                      onClick={() => navigate(`/review/${booking.hotel_id}`)}
                      variant="default"
                    >
                      {t('reviews.writeReview')}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-muted rounded-lg">
              <p>{t('booking.noBookings')}</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserBookings;
