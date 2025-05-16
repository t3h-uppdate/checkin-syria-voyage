
import { format } from 'date-fns';
import { TableCell, TableRow } from "@/components/ui/table";
import { BookingStatusBadge } from './BookingStatusBadge';
import { GuestInfo } from './GuestInfo';
import { BookingActions } from './BookingActions';
import { BookingDetails } from './types';

type BookingTableRowProps = {
  booking: BookingDetails;
  handleUpdateStatus: (bookingId: string, newStatus: 'confirmed' | 'rejected') => Promise<void>;
  updatingStatus: Record<string, boolean>;
  getNationalityLabel: (code: string | null) => string;
  setSelectedBooking: (booking: BookingDetails) => void;
  selectedBooking: BookingDetails | null;
};

export const BookingTableRow = ({ 
  booking, 
  handleUpdateStatus, 
  updatingStatus,
  getNationalityLabel,
  setSelectedBooking,
  selectedBooking
}: BookingTableRowProps) => {
  return (
    <TableRow key={booking.booking_id}>
      <TableCell>{booking.hotel_name ?? booking.hotel_id}</TableCell>
      <TableCell>{booking.room_name ?? booking.room_id}</TableCell>
      <TableCell>
        <GuestInfo 
          userId={booking.user_id}
          firstName={booking.first_name}
          lastName={booking.last_name}
          phone={booking.phone_number}
          nationality={booking.nationality}
        />
      </TableCell>
      <TableCell>
        {format(new Date(booking.check_in_date), 'PP')} - {format(new Date(booking.check_out_date), 'PP')}
      </TableCell>
      <TableCell>
        <BookingStatusBadge status={booking.booking_status} />
      </TableCell>
      <TableCell className="text-right">${booking.total_price.toFixed(2)}</TableCell>
      <TableCell>
        <BookingActions 
          booking={booking}
          handleUpdateStatus={handleUpdateStatus}
          updatingStatus={updatingStatus}
          getNationalityLabel={getNationalityLabel}
          setSelectedBooking={setSelectedBooking}
          selectedBooking={selectedBooking}
        />
      </TableCell>
    </TableRow>
  );
};
