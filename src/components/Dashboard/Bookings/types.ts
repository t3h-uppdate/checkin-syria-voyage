
export type BookingDetails = {
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
