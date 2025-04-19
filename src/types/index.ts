
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'guest' | 'owner' | 'admin';
  phoneNumber?: string;
  profilePicture?: string;
  createdAt: Date;
}

export interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  phoneNumber: string;
  email: string;
  website?: string;
  images: string[];
  rating: number;
  reviewCount: number;
  amenities: string[];
  latitude: number;
  longitude: number;
  featuredImage: string;
  pricePerNight: number;
  featured?: boolean;
  ownerId: string;
}

export interface Room {
  id: string;
  hotelId: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  capacity: number;
  bedType: string;
  size: number;
  amenities: string[];
  available: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  hotelId: string;
  roomId: string;
  checkInDate: Date;
  checkOutDate: Date;
  guestCount: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: Date;
  specialRequests?: string;
}

export interface Review {
  id: string;
  userId: string;
  hotelId: string;
  rating: number;
  comment: string;
  date: Date;
}

export interface SearchFilters {
  destination?: string;
  checkIn?: Date;
  checkOut?: Date;
  guests?: number;
  priceRange?: [number, number];
  amenities?: string[];
  rating?: number;
}
