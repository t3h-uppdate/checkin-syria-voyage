
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
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  nationality: string | null;
  hotel_id: string;
  hotel_name: string | null;
  owner_id: string;
  room_id: string;
  room_name: string | null;
};

// Helper type for BookingTable filtering
export type BookingFilter = {
  status?: string;
  dateRange?: [Date | null, Date | null];
  searchTerm?: string;
};
