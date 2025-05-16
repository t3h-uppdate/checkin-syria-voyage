
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react'; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { BookingTable } from './Bookings/BookingTable';
import { BookingDetails } from './Bookings/types';
import { getNationalityLabelUtil } from './Bookings/utils';

const BookingRequestsList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetails | null>(null);

  const fetchBookingRequests = async () => {
    if (!user) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Query to get bookings along with user profile information
      const { data: bookingsWithProfiles, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          user_id,
          hotel_id,
          room_id,
          check_in_date,
          check_out_date,
          guest_count,
          total_price,
          status,
          special_requests,
          created_at,
          hotels!inner(id, name, owner_id),
          rooms!inner(id, name),
          profiles!inner(id, first_name, last_name, phone_number, nationality)
        `)
        .eq('hotels.owner_id', user.id)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Map the response to match our BookingDetails type
      const mappedBookings: BookingDetails[] = (bookingsWithProfiles || []).map((item: any) => ({
        booking_id: item.id,
        check_in_date: item.check_in_date,
        check_out_date: item.check_out_date,
        guest_count: item.guest_count,
        total_price: item.total_price,
        booking_status: item.status,
        special_requests: item.special_requests,
        booking_created_at: item.created_at,
        user_id: item.user_id,
        guest_first_name: item.profiles?.first_name,
        guest_last_name: item.profiles?.last_name,
        guest_phone: item.profiles?.phone_number,
        guest_nationality: item.profiles?.nationality,
        hotel_id: item.hotel_id,
        hotel_name: item.hotels?.name,
        owner_id: item.hotels?.owner_id,
        room_id: item.room_id,
        room_name: item.rooms?.name,
      }));

      setBookings(mappedBookings);
    } catch (err: any) {
      console.error("Error fetching booking details:", err);
      setError(err.message || "Failed to fetch booking requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingRequests();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleUpdateStatus = async (bookingId: string, newStatus: 'confirmed' | 'rejected') => {
    setUpdatingStatus(prev => ({ ...prev, [bookingId]: true }));

    try {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (updateError) throw updateError;

      // Update local state
      setBookings(currentBookings =>
        currentBookings.map(booking =>
          booking.booking_id === bookingId ? { ...booking, booking_status: newStatus } : booking
        )
      );

      toast({
        title: "Status Updated",
        description: `Booking status changed to ${newStatus}.`,
      });

    } catch (err: any) {
      console.error("Error updating booking status:", err);
      toast({
        title: "Update Failed",
        description: err.message || "Could not update booking status.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Booking Requests</h2>
      {bookings.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No booking requests found for your hotels.</p>
      ) : (
        <BookingTable 
          bookings={bookings}
          handleUpdateStatus={handleUpdateStatus}
          updatingStatus={updatingStatus}
          getNationalityLabel={getNationalityLabelUtil}
          setSelectedBooking={setSelectedBooking}
          selectedBooking={selectedBooking}
        />
      )}
    </div>
  );
};

export default BookingRequestsList;
