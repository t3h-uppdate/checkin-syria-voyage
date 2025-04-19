
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MainLayout from '@/components/Layout/MainLayout';
import BookingForm from '@/components/Booking/BookingForm';
import { HOTELS, ROOMS } from '@/data/mockData';

const BookingPage = () => {
  const { t } = useTranslation();
  const { hotelId, roomId } = useParams<{ hotelId: string; roomId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [hotel, setHotel] = useState<any | null>(null);
  const [room, setRoom] = useState<any | null>(null);
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
    
    const loadData = async () => {
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
        
        // Get hotel data
        if (hotelId) {
          const foundHotel = HOTELS.find(h => h.id === hotelId);
          if (!foundHotel) {
            setError('Hotel not found');
            setLoading(false);
            return;
          }
          setHotel(foundHotel);
          
          // Get room data
          if (roomId) {
            const hotelRooms = ROOMS[hotelId] || [];
            const foundRoom = hotelRooms.find(r => r.id === roomId);
            if (!foundRoom) {
              setError('Room not found');
              setLoading(false);
              return;
            }
            setRoom(foundRoom);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading booking data:', error);
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
