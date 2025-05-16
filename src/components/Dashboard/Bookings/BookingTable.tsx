
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookingTableRow } from './BookingTableRow';
import { BookingDetails } from './types';

type BookingTableProps = {
  bookings: BookingDetails[];
  handleUpdateStatus: (bookingId: string, newStatus: 'confirmed' | 'rejected') => Promise<void>;
  updatingStatus: Record<string, boolean>;
  getNationalityLabel: (code: string | null) => string;
  setSelectedBooking: (booking: BookingDetails) => void;
  selectedBooking: BookingDetails | null;
};

export const BookingTable = ({
  bookings,
  handleUpdateStatus,
  updatingStatus,
  getNationalityLabel,
  setSelectedBooking,
  selectedBooking
}: BookingTableProps) => {
  return (
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
          <BookingTableRow 
            key={booking.booking_id}
            booking={booking}
            handleUpdateStatus={handleUpdateStatus}
            updatingStatus={updatingStatus}
            getNationalityLabel={getNationalityLabel}
            setSelectedBooking={setSelectedBooking}
            selectedBooking={selectedBooking}
          />
        ))}
      </TableBody>
    </Table>
  );
};
