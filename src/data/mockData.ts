
import { Hotel, Room, Review } from '@/types';

// Mock Hotels
export const HOTELS: Hotel[] = [
  {
    id: '1',
    name: 'Grand Damascus Hotel',
    description: 'Experience luxury in the heart of historic Damascus. Our 5-star hotel combines traditional Syrian architecture with modern amenities.',
    address: '123 Al-Thawra Street',
    city: 'Damascus',
    country: 'Syria',
    phoneNumber: '+963-11-123-4567',
    email: 'info@granddamascus.com',
    website: 'www.granddamascus.com',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2032&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    ],
    rating: 4.8,
    reviewCount: 245,
    amenities: ['Free WiFi', 'Swimming Pool', 'Spa', 'Restaurant', 'Room Service', 'Fitness Center', 'Airport Shuttle', 'Business Center'],
    latitude: 33.5138,
    longitude: 36.2765,
    featuredImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    pricePerNight: 150,
    featured: true,
    ownerId: 'owner123'
  },
  {
    id: '2',
    name: 'Aleppo Heritage Resort',
    description: 'Nestled in the ancient city of Aleppo, our resort offers a blend of historical charm and contemporary comfort.',
    address: '456 Al-Qalaa Road',
    city: 'Aleppo',
    country: 'Syria',
    phoneNumber: '+963-21-234-5678',
    email: 'reservations@aleppoheritage.com',
    website: 'www.aleppoheritage.com',
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1560624052-449f5ddf0c31?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    ],
    rating: 4.6,
    reviewCount: 189,
    amenities: ['Free WiFi', 'Restaurant', 'Room Service', 'Concierge', 'Laundry', 'Meeting Rooms', 'Garden', 'Terrace'],
    latitude: 36.2021,
    longitude: 37.1343,
    featuredImage: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    pricePerNight: 120,
    featured: true,
    ownerId: 'owner456'
  },
  {
    id: '3',
    name: 'Palmyra Oasis Hotel',
    description: 'A luxurious retreat near the historic ruins of Palmyra. Experience the magic of the Syrian desert with all modern comforts.',
    address: '789 Palmyra Road',
    city: 'Palmyra',
    country: 'Syria',
    phoneNumber: '+963-31-345-6789',
    email: 'stay@palmyraoasis.com',
    website: 'www.palmyraoasis.com',
    images: [
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
      'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
      'https://images.unsplash.com/photo-1601565415267-71ensj2ddf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    ],
    rating: 4.5,
    reviewCount: 132,
    amenities: ['Free WiFi', 'Outdoor Pool', 'Desert View', 'Restaurant', 'Bar', 'Guided Tours', 'Parking', 'Air Conditioning'],
    latitude: 34.5646,
    longitude: 38.2667,
    featuredImage: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
    pricePerNight: 110,
    featured: true,
    ownerId: 'owner789'
  },
  {
    id: '4',
    name: 'Lattakia Beach Resort',
    description: 'Enjoy the Mediterranean breeze at our beachfront resort in Lattakia. Perfect for both relaxation and water activities.',
    address: '101 Corniche Road',
    city: 'Lattakia',
    country: 'Syria',
    phoneNumber: '+963-41-456-7890',
    email: 'info@lattakiaresort.com',
    website: 'www.lattakiaresort.com',
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80',
      'https://images.unsplash.com/photo-1615880484746-a134be9a6ecf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80',
      'https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80'
    ],
    rating: 4.7,
    reviewCount: 167,
    amenities: ['Beachfront', 'Free WiFi', 'Swimming Pool', 'Water Sports', 'Restaurant', 'Bar', 'Spa', 'Childcare'],
    latitude: 35.5317,
    longitude: 35.7914,
    featuredImage: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80',
    pricePerNight: 140,
    featured: false,
    ownerId: 'owner101'
  },
  {
    id: '5',
    name: 'Homs Historic Inn',
    description: 'Stay in our boutique hotel located in a restored historical building in Homs. Experience authentic Syrian hospitality.',
    address: '222 Al-Hamidiyah Street',
    city: 'Homs',
    country: 'Syria',
    phoneNumber: '+963-31-567-8901',
    email: 'bookings@homsinn.com',
    website: 'www.homsinn.com',
    images: [
      'https://images.unsplash.com/photo-1540304453527-62f979142a17?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2025&q=80',
      'https://images.unsplash.com/photo-1631157769386-fe27e515b3a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1972&q=80'
    ],
    rating: 4.4,
    reviewCount: 95,
    amenities: ['Free WiFi', 'Breakfast Included', 'Restaurant', 'Library', 'Garden', 'Air Conditioning', 'Daily Housekeeping', 'Airport Transfer'],
    latitude: 34.7324,
    longitude: 36.7137,
    featuredImage: 'https://images.unsplash.com/photo-1540304453527-62f979142a17?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    pricePerNight: 95,
    featured: false,
    ownerId: 'owner222'
  },
  {
    id: '6',
    name: 'Euphrates Riverside Hotel',
    description: 'A peaceful retreat by the Euphrates River. Enjoy stunning river views and excellent cuisine.',
    address: '333 River Road',
    city: 'Deir ez-Zor',
    country: 'Syria',
    phoneNumber: '+963-51-678-9012',
    email: 'contact@euphrateshotel.com',
    website: 'www.euphrateshotel.com',
    images: [
      'https://images.unsplash.com/photo-1543489822-c49534f3271f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80',
      'https://images.unsplash.com/photo-1521782462922-9318be1cfd04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2076&q=80',
      'https://images.unsplash.com/photo-1523699289804-55347c09047d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80'
    ],
    rating: 4.3,
    reviewCount: 78,
    amenities: ['River View', 'Free WiFi', 'Restaurant', 'Bar', 'Fishing', 'Air Conditioning', 'Parking', 'Room Service'],
    latitude: 35.3359,
    longitude: 40.1408,
    featuredImage: 'https://images.unsplash.com/photo-1543489822-c49534f3271f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80',
    pricePerNight: 85,
    featured: false,
    ownerId: 'owner333'
  }
];

// Mock Rooms for each hotel
export const ROOMS: Record<string, Room[]> = {
  '1': [
    {
      id: '101',
      hotelId: '1',
      name: 'Deluxe King Room',
      description: 'Spacious room with king-sized bed, city view, and luxury amenities.',
      price: 180,
      images: [
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
      ],
      capacity: 2,
      bedType: 'King',
      size: 40,
      amenities: ['Air Conditioning', 'Flat-screen TV', 'Mini Bar', 'Safety Deposit Box', 'Free WiFi', 'Bathtub'],
      available: true
    },
    {
      id: '102',
      hotelId: '1',
      name: 'Executive Suite',
      description: 'Luxury suite with separate living area, premium amenities, and panoramic city views.',
      price: 300,
      images: [
        'https://images.unsplash.com/photo-1609949279531-cf48d64bed89?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        'https://images.unsplash.com/photo-1540518614846-7eded433c457?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2039&q=80'
      ],
      capacity: 2,
      bedType: 'King',
      size: 65,
      amenities: ['Air Conditioning', 'Flat-screen TV', 'Mini Bar', 'Safety Deposit Box', 'Free WiFi', 'Jacuzzi', 'Living Room', 'Executive Lounge Access'],
      available: true
    },
    {
      id: '103',
      hotelId: '1',
      name: 'Twin Room',
      description: 'Comfortable room with two single beds, perfect for friends or colleagues.',
      price: 150,
      images: [
        'https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
      ],
      capacity: 2,
      bedType: 'Twin',
      size: 35,
      amenities: ['Air Conditioning', 'Flat-screen TV', 'Mini Bar', 'Safety Deposit Box', 'Free WiFi', 'Shower'],
      available: true
    }
  ],
  '2': [
    {
      id: '201',
      hotelId: '2',
      name: 'Heritage Room',
      description: 'Traditional room with authentic Syrian decor and modern amenities.',
      price: 140,
      images: [
        'https://images.unsplash.com/photo-1549638441-b787d2e11f14?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        'https://images.unsplash.com/photo-1551105378-78e609e1d468?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2064&q=80'
      ],
      capacity: 2,
      bedType: 'Queen',
      size: 30,
      amenities: ['Air Conditioning', 'Flat-screen TV', 'Mini Fridge', 'Safety Deposit Box', 'Free WiFi', 'Shower'],
      available: true
    },
    {
      id: '202',
      hotelId: '2',
      name: 'Family Suite',
      description: 'Spacious suite ideal for families with a master bedroom and additional living space.',
      price: 200,
      images: [
        'https://images.unsplash.com/photo-1617098900591-3f90928e8c54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80',
        'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1180&q=80'
      ],
      capacity: 4,
      bedType: 'King + Sofa Bed',
      size: 55,
      amenities: ['Air Conditioning', 'Flat-screen TV', 'Mini Bar', 'Safety Deposit Box', 'Free WiFi', 'Bathtub', 'Living Room'],
      available: true
    }
  ],
  '3': [
    {
      id: '301',
      hotelId: '3',
      name: 'Desert View Room',
      description: 'Comfortable room with stunning views of the Syrian desert and ancient ruins.',
      price: 130,
      images: [
        'https://images.unsplash.com/photo-1631049035182-249067d7618e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
        'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80'
      ],
      capacity: 2,
      bedType: 'Queen',
      size: 32,
      amenities: ['Air Conditioning', 'Flat-screen TV', 'Mini Fridge', 'Safety Deposit Box', 'Free WiFi', 'Shower'],
      available: true
    },
    {
      id: '302',
      hotelId: '3',
      name: 'Palmyra Suite',
      description: 'Luxurious suite with private balcony overlooking the ancient city of Palmyra.',
      price: 190,
      images: [
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        'https://images.unsplash.com/photo-1587985064135-0366536eab42?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
      ],
      capacity: 2,
      bedType: 'King',
      size: 50,
      amenities: ['Air Conditioning', 'Flat-screen TV', 'Mini Bar', 'Safety Deposit Box', 'Free WiFi', 'Bathtub', 'Private Balcony'],
      available: true
    }
  ]
};

// Mock Reviews for hotels
export const REVIEWS: Review[] = [
  {
    id: '1001',
    userId: 'user123',
    hotelId: '1',
    rating: 5,
    comment: 'Absolutely stunning hotel with incredible service. The staff went above and beyond to make our stay special.',
    date: new Date('2023-06-15')
  },
  {
    id: '1002',
    userId: 'user456',
    hotelId: '1',
    rating: 4,
    comment: 'Beautiful property in a great location. The room was spacious and comfortable, though the WiFi was a bit slow at times.',
    date: new Date('2023-07-22')
  },
  {
    id: '1003',
    userId: 'user789',
    hotelId: '1',
    rating: 5,
    comment: 'The attention to detail in preserving the historical aspects while providing modern comforts was impressive.',
    date: new Date('2023-08-03')
  },
  {
    id: '2001',
    userId: 'user234',
    hotelId: '2',
    rating: 4,
    comment: 'Lovely hotel with authentic Syrian charm. The breakfast was amazing with lots of local specialties.',
    date: new Date('2023-05-18')
  },
  {
    id: '2002',
    userId: 'user567',
    hotelId: '2',
    rating: 5,
    comment: 'We enjoyed our stay immensely. The hotel arranged a wonderful tour of the old city for us.',
    date: new Date('2023-07-09')
  },
  {
    id: '3001',
    userId: 'user890',
    hotelId: '3',
    rating: 4,
    comment: 'The location near the ancient ruins is perfect. The desert views from our room were breathtaking.',
    date: new Date('2023-06-27')
  }
];

// Mock Destinations
export const DESTINATIONS = [
  {
    id: '1',
    name: 'Damascus',
    description: 'The historic capital city, one of the oldest continuously inhabited cities in the world.',
    image: 'https://images.unsplash.com/photo-1548091344-306d5252c442?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    hotelCount: 12
  },
  {
    id: '2',
    name: 'Aleppo',
    description: 'A major cultural center with stunning medieval architecture and vibrant markets.',
    image: 'https://images.unsplash.com/photo-1667653221790-937ed46c062b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    hotelCount: 8
  },
  {
    id: '3',
    name: 'Palmyra',
    description: 'Home to the magnificent ruins of an ancient city that was once one of the most important cultural centers.',
    image: 'https://images.unsplash.com/photo-1591497599880-aecb6f01308e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    hotelCount: 4
  },
  {
    id: '4',
    name: 'Lattakia',
    description: 'A beautiful coastal city on the Mediterranean, known for its beaches and port.',
    image: 'https://images.unsplash.com/photo-1615460549969-36fa19521a4f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
    hotelCount: 10
  }
];

// Mock amenities list for filtering
export const AMENITIES = [
  'Free WiFi',
  'Swimming Pool',
  'Spa',
  'Restaurant',
  'Room Service',
  'Fitness Center',
  'Airport Shuttle',
  'Free Breakfast',
  'Bar/Lounge',
  'Air Conditioning',
  'Concierge Service',
  'Laundry Service',
  'Business Center',
  'Parking',
  'Childcare',
  'Pet Friendly',
  'Wheelchair Accessible',
  'Beach Access'
];
