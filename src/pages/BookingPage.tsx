
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MainLayout from '@/components/Layout/MainLayout';
import BookingForm from '@/components/Booking/BookingForm';
import { supabase } from '@/integrations/supabase/client';
import { Hotel, Room } from '@/types'; // Import types

const BookingPage = () => {
  const { t } = useTranslation();
  const { hotelId, roomId } = useParams<{ hotelId: string; roomId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [hotel, setHotel] = useState<Hotel | null>(null); // Use Hotel type
  const [room, setRoom] = useState<Room | null>(null);   // Use Room type
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
    
    const loadData = async () => {
      if (!hotelId || !roomId) {
        setError('Hotel ID and Room ID are required.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Parse dates from URL
        const checkInParam = searchParams.get('checkIn');
        const checkOutParam = searchParams.get('checkOut');

        if (!checkInParam || !checkOutParam) {
          setError('Check-in and check-out dates are required for booking');
          setLoading(false);
          return;
        }

        setCheckIn(new Date(checkInParam));
        setCheckOut(new Date(checkOutParam));

        // Fetch hotel data from Supabase
        const { data: hotelData, error: hotelError } = await supabase
          .from('hotels')
          .select('*')
          .eq('id', hotelId)
          .single();

        if (hotelError || !hotelData) {
          console.error('Error fetching hotel:', hotelError);
          setError('Hotel not found');
          setLoading(false);
          return;
        }

        // Transform hotel data
        const transformedHotel: Hotel = {
          id: hotelData.id,
          name: hotelData.name,
          description: hotelData.description,
          address: hotelData.address,
          city: hotelData.city,
          country: hotelData.country,
          phoneNumber: hotelData.phone_number,
          email: hotelData.email,
          website: hotelData.website,
          images: hotelData.images,
          rating: hotelData.rating,
          reviewCount: hotelData.review_count,
          amenities: hotelData.amenities,
          latitude: hotelData.latitude,
          longitude: hotelData.longitude,
          featuredImage: hotelData.featured_image,
          pricePerNight: hotelData.price_per_night,
          featured: hotelData.featured,
          ownerId: hotelData.owner_id
        };
        setHotel(transformedHotel);

        // Fetch room data from Supabase
        const { data: roomData, error: roomError } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', roomId)
          .eq('hotel_id', hotelId) // Ensure room belongs to the correct hotel
          .single();

        if (roomError || !roomData) {
          console.error('Error fetching room:', roomError);
          setError('Room not found');
          setLoading(false);
          return;
        }

        // Transform room data
        const transformedRoom: Room = {
          id: roomData.id,
          hotelId: roomData.hotel_id,
          name: roomData.name,
          description: roomData.description,
          price: roomData.price,
          images: roomData.images,
          capacity: roomData.capacity,
          bedType: roomData.bed_type,
          size: roomData.size,
          amenities: roomData.amenities,
          available: roomData.available
        };
        setRoom(transformedRoom);

        setLoading(false);
      } catch (err) {
        console.error('Error loading booking data:', err);
        setError('Failed to load booking data');
        setLoading(false);
      }
    };
    
    loadData();
  }, [hotelId, roomId, searchParams]);

  if (loading) {
    return (
      <MainLayout>
        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="text-center py-12">
              <p className="text-xl">{t('common.loading')}</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !hotel || !room || !checkIn || !checkOut) {
    return (
      <MainLayout>
        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <h2 className="text-2xl font-bold mb-4">Error</h2>
              <p className="text-red-600 mb-6">{error || 'Missing required booking information'}</p>
              <button
                className="bg-primary text-white px-4 py-2 rounded-md"
                onClick={() => navigate(-1)}
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="pt-24 pb-12 bg-muted">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Complete Your Booking</h1>
          
          <BookingForm
            hotel={hotel}
            room={room}
            checkIn={checkIn}
            checkOut={checkOut}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default BookingPage;
