
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookingStatusBadge } from './BookingStatusBadge';
import { BookingDetails } from './types';

type BookingDetailsDialogProps = {
  booking: BookingDetails | null;
  getNationalityLabel: (code: string | null) => string;
};

export const BookingDetailsDialog = ({ 
  booking, 
  getNationalityLabel 
}: BookingDetailsDialogProps) => {
  if (!booking) return null;
  
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Booking Details</DialogTitle>
        <DialogDescription>
          Review complete information for this booking
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 mt-4">
        <div>
          <h3 className="font-medium text-sm">Booking Information</h3>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="text-sm text-muted-foreground">Status:</div>
            <div className="text-sm">
              <BookingStatusBadge status={booking.booking_status} />
            </div>
            
            <div className="text-sm text-muted-foreground">Hotel:</div>
            <div className="text-sm">{booking.hotel_name}</div>
            
            <div className="text-sm text-muted-foreground">Room:</div>
            <div className="text-sm">{booking.room_name}</div>
            
            <div className="text-sm text-muted-foreground">Check-in:</div>
            <div className="text-sm">{format(new Date(booking.check_in_date), 'PPP')}</div>
            
            <div className="text-sm text-muted-foreground">Check-out:</div>
            <div className="text-sm">{format(new Date(booking.check_out_date), 'PPP')}</div>
            
            <div className="text-sm text-muted-foreground">Total Price:</div>
            <div className="text-sm font-medium">${booking.total_price.toFixed(2)}</div>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium text-sm">Guest Information</h3>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="text-sm text-muted-foreground">Name:</div>
            <div className="text-sm">
              {`${booking.guest_first_name ?? ''} ${booking.guest_last_name ?? ''}`.trim() || 'Not provided'}
            </div>
            
            <div className="text-sm text-muted-foreground">Phone:</div>
            <div className="text-sm">{booking.guest_phone || 'Not provided'}</div>
            
            <div className="text-sm text-muted-foreground">Nationality:</div>
            <div className="text-sm">
              {booking.guest_nationality ? (
                <div className="flex items-center">
                  <Badge variant="country" className="mr-1">{booking.guest_nationality.toUpperCase()}</Badge>
                  {getNationalityLabel(booking.guest_nationality)}
                </div>
              ) : 'Not provided'}
            </div>
          </div>
        </div>
        
        {booking.special_requests && (
          <div>
            <h3 className="font-medium text-sm">Special Requests:</h3>
            <p className="text-sm mt-1 p-2 bg-gray-50 rounded-md">{booking.special_requests}</p>
          </div>
        )}
        
        <div className="flex justify-end mt-4">
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </div>
      </div>
    </DialogContent>
  );
};
