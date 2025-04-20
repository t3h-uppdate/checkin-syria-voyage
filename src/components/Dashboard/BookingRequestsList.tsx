import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle } from 'lucide-react'; // Added icons
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // Added Button
import { useToast } from "@/components/ui/use-toast"; // Added useToast
import { format } from 'date-fns';
import { Link } from 'react-router-dom'; // Import Link

// Define a type matching the booking_details_view columns
type BookingDetails = {
  booking_id: string;
  check_in_date: string;
  check_out_date: string;
  guest_count: number;
  total_price: number;
  booking_status: string;
  special_requests: string | null;
  booking_created_at: string;
  user_id: string;
  guest_first_name: string | null;
  guest_last_name: string | null;
  hotel_id: string;
  hotel_name: string | null;
  owner_id: string;
  room_id: string;
  room_name: string | null;
};

const BookingRequestsList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingDetails[]>([]); // Use new type BookingDetails
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({}); // Track loading state per booking
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingRequests = async () => {
      if (!user) {
        setError("User not authenticated.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch directly from the view, filtering by owner_id
        const { data: bookingData, error: viewError } = await supabase
          .from('booking_details_view') // Query the view
          .select('*') // Select all columns from the view
          .eq('owner_id', user.id) // Filter by owner_id directly
          .order('booking_created_at', { ascending: false }); // Order by booking creation time

        if (viewError) throw viewError;

        // Map the data fetched from the view to our BookingDetails type
        const mappedBookings: BookingDetails[] = (bookingData || []).map((item: any) => ({
          booking_id: item.booking_id,
          check_in_date: item.check_in_date,
          check_out_date: item.check_out_date,
          guest_count: item.guest_count,
          total_price: item.total_price,
          booking_status: item.booking_status,
          special_requests: item.special_requests,
          booking_created_at: item.booking_created_at,
          user_id: item.user_id,
          guest_first_name: item.guest_first_name,
          guest_last_name: item.guest_last_name,
          hotel_id: item.hotel_id,
          hotel_name: item.hotel_name,
          owner_id: item.owner_id,
          room_id: item.room_id,
          room_name: item.room_name,
        }));
        setBookings(mappedBookings);

      } catch (err: any) {
        console.error("Error fetching booking details from view:", err);
        setError(err.message || "Failed to fetch booking requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingRequests();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Dependencies are correct, disable lint warning if needed

  const handleUpdateStatus = async (bookingId: string, newStatus: 'confirmed' | 'rejected') => {
    // Use bookingId (which is the actual booking UUID) for the update call
    setUpdatingStatus(prev => ({ ...prev, [bookingId]: true }));

    try {
      // Update the original 'bookings' table using the original 'id' column
      const { error: updateError } = await supabase
        .from('bookings') // Target the actual table for updates
        .update({ status: newStatus }) // Use the original 'status' column name
        .eq('id', bookingId); // Use the original 'id' column name

      if (updateError) throw updateError;

      // Update local state (using booking_id and booking_status)
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hotel</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Actions</TableHead> {/* Added Actions Header */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              // Use booking_id for the key
              <TableRow key={booking.booking_id}>
                {/* Use names from the view */}
                <TableCell>{booking.hotel_name ?? booking.hotel_id}</TableCell>
                <TableCell>{booking.room_name ?? booking.room_id}</TableCell>
                <TableCell>
                  {/* Link guest name/ID to profile page */}
                  <Link to={`/guest/${booking.user_id}`} className="text-primary hover:underline">
                    {`${booking.guest_first_name ?? ''} ${booking.guest_last_name ?? ''}`.trim() || booking.user_id}
                  </Link>
                </TableCell>
                <TableCell>
                  {format(new Date(booking.check_in_date), 'PP')} - {format(new Date(booking.check_out_date), 'PP')}
                </TableCell>
                <TableCell>
                  {/* Use booking_status */}
                  <Badge variant={booking.booking_status === 'pending' ? 'secondary' : booking.booking_status === 'confirmed' ? 'default' : 'destructive'}>
                    {booking.booking_status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">${booking.total_price.toFixed(2)}</TableCell>
                <TableCell>
                   {/* Use booking_status */}
                  {booking.booking_status === 'pending' && ( 
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:text-green-700 hover:bg-green-100"
                        onClick={() => handleUpdateStatus(booking.booking_id, 'confirmed')}
                        disabled={updatingStatus[booking.booking_id]}
                      >
                        {updatingStatus[booking.booking_id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                        <span className="ml-1">Confirm</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-100"
                        onClick={() => handleUpdateStatus(booking.booking_id, 'rejected')}
                        disabled={updatingStatus[booking.booking_id]}
                      >
                        {updatingStatus[booking.booking_id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                        <span className="ml-1">Reject</span>
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default BookingRequestsList;
