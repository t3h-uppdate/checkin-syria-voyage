
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
import { CalendarRange, Users, CreditCard, MessageSquare } from 'lucide-react';

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
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          Booking Details
          <BookingStatusBadge status={booking.booking_status} size="sm" />
        </DialogTitle>
        <DialogDescription>
          Booking #{booking.booking_id.substring(0, 8)}
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6 mt-4">
        {/* Hotel and Room Info */}
        <div className="bg-muted/50 p-4 rounded-md">
          <h3 className="font-medium">{booking.hotel_name}</h3>
          <p className="text-sm text-muted-foreground">{booking.room_name}</p>
        </div>
        
        {/* Key Booking Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CalendarRange className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {format(new Date(booking.check_in_date), 'PPP')} - {format(new Date(booking.check_out_date), 'PPP')}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm">{booking.guest_count} guests</span>
          </div>
          
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">${booking.total_price.toFixed(2)}</span>
          </div>
        </div>
        
        {/* Guest Information */}
        <div>
          <h3 className="text-sm font-medium mb-2">Guest Information</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">Name:</div>
            <div>
              {`${booking.first_name ?? ''} ${booking.last_name ?? ''}`.trim() || 'Not provided'}
            </div>
            
            <div className="text-muted-foreground">Phone:</div>
            <div>{booking.phone_number || 'Not provided'}</div>
            
            <div className="text-muted-foreground">Nationality:</div>
            <div>
              {booking.nationality ? (
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="text-xs">{booking.nationality.toUpperCase()}</Badge>
                  {getNationalityLabel(booking.nationality)}
                </div>
              ) : 'Not provided'}
            </div>
          </div>
        </div>
        
        {/* Special Requests */}
        {booking.special_requests && (
          <div>
            <div className="flex items-start gap-2 mb-1">
              <MessageSquare className="h-4 w-4 text-primary mt-0.5" />
              <h3 className="text-sm font-medium">Special Requests</h3>
            </div>
            <p className="text-sm p-3 bg-muted/50 rounded-md">
              {booking.special_requests}
            </p>
          </div>
        )}
        
        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </div>
      </div>
    </DialogContent>
  );
};
