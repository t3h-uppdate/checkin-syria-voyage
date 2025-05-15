
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle, Phone, Flag, FileText } from 'lucide-react'; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

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
  guest_phone: string | null;
  guest_nationality: string | null;
  hotel_id: string;
  hotel_name: string | null;
  owner_id: string;
  room_id: string;
  room_name: string | null;
};

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

  const getNationalityLabel = (code: string | null) => {
    if (!code) return "Not provided";
    
    const countries: Record<string, string> = {
      us: 'United States',
      uk: 'United Kingdom',
      ca: 'Canada',
      au: 'Australia',
      fr: 'France',
      de: 'Germany',
      it: 'Italy',
      es: 'Spain',
      jp: 'Japan',
      cn: 'China',
      br: 'Brazil',
      mx: 'Mexico',
      in: 'India',
      ru: 'Russia',
      za: 'South Africa',
      sg: 'Singapore',
      ae: 'United Arab Emirates',
      sa: 'Saudi Arabia',
      tr: 'Turkey',
      sy: 'Syria',
      lb: 'Lebanon',
      jo: 'Jordan',
      iq: 'Iraq',
    };
    
    return countries[code.toLowerCase()] || code;
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
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.booking_id}>
                <TableCell>{booking.hotel_name ?? booking.hotel_id}</TableCell>
                <TableCell>{booking.room_name ?? booking.room_id}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <Link to={`/guest/${booking.user_id}`} className="text-primary hover:underline">
                      {`${booking.guest_first_name ?? ''} ${booking.guest_last_name ?? ''}`.trim() || booking.user_id}
                    </Link>
                    {booking.guest_phone && (
                      <span className="text-xs text-gray-500 flex items-center mt-1">
                        <Phone className="h-3 w-3 mr-1" />
                        {booking.guest_phone}
                      </span>
                    )}
                    {booking.guest_nationality && (
                      <span className="text-xs text-gray-500 flex items-center mt-1">
                        <Flag className="h-3 w-3 mr-1" />
                        <Badge variant="country" className="text-xs">{booking.guest_nationality.toUpperCase()}</Badge>
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(booking.check_in_date), 'PP')} - {format(new Date(booking.check_out_date), 'PP')}
                </TableCell>
                <TableCell>
                  <Badge variant={booking.booking_status === 'pending' ? 'secondary' : booking.booking_status === 'confirmed' ? 'default' : 'destructive'}>
                    {booking.booking_status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">${booking.total_price.toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex gap-2 items-center">
                    {booking.booking_status === 'pending' && ( 
                      <>
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
                      </>
                    )}
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Booking Details</DialogTitle>
                          <DialogDescription>
                            Review complete information for this booking
                          </DialogDescription>
                        </DialogHeader>
                        
                        {selectedBooking && (
                          <div className="space-y-4 mt-4">
                            <div>
                              <h3 className="font-medium text-sm">Booking Information</h3>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                <div className="text-sm text-muted-foreground">Status:</div>
                                <div className="text-sm">
                                  <Badge variant={selectedBooking.booking_status === 'pending' ? 'secondary' : selectedBooking.booking_status === 'confirmed' ? 'default' : 'destructive'}>
                                    {selectedBooking.booking_status}
                                  </Badge>
                                </div>
                                
                                <div className="text-sm text-muted-foreground">Hotel:</div>
                                <div className="text-sm">{selectedBooking.hotel_name}</div>
                                
                                <div className="text-sm text-muted-foreground">Room:</div>
                                <div className="text-sm">{selectedBooking.room_name}</div>
                                
                                <div className="text-sm text-muted-foreground">Check-in:</div>
                                <div className="text-sm">{format(new Date(selectedBooking.check_in_date), 'PPP')}</div>
                                
                                <div className="text-sm text-muted-foreground">Check-out:</div>
                                <div className="text-sm">{format(new Date(selectedBooking.check_out_date), 'PPP')}</div>
                                
                                <div className="text-sm text-muted-foreground">Total Price:</div>
                                <div className="text-sm font-medium">${selectedBooking.total_price.toFixed(2)}</div>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="font-medium text-sm">Guest Information</h3>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                <div className="text-sm text-muted-foreground">Name:</div>
                                <div className="text-sm">
                                  {`${selectedBooking.guest_first_name ?? ''} ${selectedBooking.guest_last_name ?? ''}`.trim() || 'Not provided'}
                                </div>
                                
                                <div className="text-sm text-muted-foreground">Phone:</div>
                                <div className="text-sm">{selectedBooking.guest_phone || 'Not provided'}</div>
                                
                                <div className="text-sm text-muted-foreground">Nationality:</div>
                                <div className="text-sm">
                                  {selectedBooking.guest_nationality ? (
                                    <div className="flex items-center">
                                      <Badge variant="country" className="mr-1">{selectedBooking.guest_nationality.toUpperCase()}</Badge>
                                      {getNationalityLabel(selectedBooking.guest_nationality)}
                                    </div>
                                  ) : 'Not provided'}
                                </div>
                              </div>
                            </div>
                            
                            {selectedBooking.special_requests && (
                              <div>
                                <h3 className="font-medium text-sm">Special Requests:</h3>
                                <p className="text-sm mt-1 p-2 bg-gray-50 rounded-md">{selectedBooking.special_requests}</p>
                              </div>
                            )}
                            
                            <div className="flex justify-end mt-4">
                              <DialogClose asChild>
                                <Button>Close</Button>
                              </DialogClose>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
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
