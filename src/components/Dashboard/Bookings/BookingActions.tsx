
import { useState } from 'react';
import { CheckCircle, XCircle, FileText, Loader2 } from 'lucide-react'; 
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { BookingDetailsDialog } from './BookingDetailsDialog';
import { BookingDetails } from './types';

type BookingActionsProps = {
  booking: BookingDetails;
  handleUpdateStatus: (bookingId: string, newStatus: 'confirmed' | 'rejected') => Promise<void>;
  updatingStatus: Record<string, boolean>;
  getNationalityLabel: (code: string | null) => string;
  setSelectedBooking: (booking: BookingDetails) => void;
  selectedBooking: BookingDetails | null;
};

export const BookingActions = ({ 
  booking, 
  handleUpdateStatus, 
  updatingStatus,
  getNationalityLabel,
  setSelectedBooking,
  selectedBooking
}: BookingActionsProps) => {
  return (
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
        <BookingDetailsDialog 
          booking={selectedBooking} 
          getNationalityLabel={getNationalityLabel} 
        />
      </Dialog>
    </div>
  );
};
