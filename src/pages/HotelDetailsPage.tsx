
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import MainLayout from '@/components/Layout/MainLayout';
import ImageGallery from '@/components/Hotel/ImageGallery';
import RoomCard from '@/components/Hotel/RoomCard';
import ReviewList from '@/components/Hotel/ReviewList';
import { HOTELS, ROOMS, REVIEWS } from '@/data/mockData';
import { Hotel } from '@/types';
import { supabase } from '@/integrations/supabase/client';

const HotelDetailsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [checkIn, setCheckIn] = useState<Date | undefined>(undefined);
  const [checkOut, setCheckOut] = useState<Date | undefined>(undefined);
  const [guests, setGuests] = useState<string>('2');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Initialize from URL parameters
  useEffect(() => {
    const checkInParam = searchParams.get('checkIn');
    const checkOutParam = searchParams.get('checkOut');
    const guestsParam = searchParams.get('guests');
    const showBookingParam = searchParams.get('showBooking');
    
    if (checkInParam) setCheckIn(new Date(checkInParam));
    if (checkOutParam) setCheckOut(new Date(checkOutParam));
    if (guestsParam) setGuests(guestsParam);
    if (showBookingParam) setActiveTab('rooms');
    
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, [searchParams]);

  // Fetch hotel data
  useEffect(() => {
    const fetchHotelData = async () => {
      if (!id) {
        setError('No hotel ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch hotel details
        const { data: hotelData, error: hotelError } = await supabase
          .from('hotels')
          .select('*')
          .eq('id', id)
          .single();

        if (hotelError) throw hotelError;

        // Fetch rooms for this hotel
        const { data: roomsData, error: roomsError } = await supabase
          .from('rooms')
          .select('*')
          .eq('hotel_id', id);

        if (roomsError) throw roomsError;

        // Fetch reviews for this hotel
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*')
          .eq('hotel_id', id);

        if (reviewsError) throw reviewsError;

        // Transform data to match our TypeScript types
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

        const transformedRooms: any[] = roomsData.map(room => ({
          id: room.id,
          hotelId: room.hotel_id,
          name: room.name,
          description: room.description,
          price: room.price,
          images: room.images,
          capacity: room.capacity,
          bedType: room.bed_type,
          size: room.size,
          amenities: room.amenities,
          available: room.available
        }));

        const transformedReviews: any[] = reviewsData.map(review => ({
          id: review.id,
          userId: review.user_id,
          hotelId: review.hotel_id,
          rating: review.rating,
          comment: review.comment,
          date: new Date(review.date)
        }));

        setHotel(transformedHotel);
        setRooms(transformedRooms);
        setReviews(transformedReviews);
      } catch (err) {
        console.error('Error fetching hotel data:', err);
        setError('Failed to load hotel details');
      } finally {
        setLoading(false);
      }
    };

    fetchHotelData();
  }, [id]);

  const handleSearch = () => {
    if (!checkIn || !checkOut) return;
    
    const params = new URLSearchParams();
    params.append('checkIn', checkIn.toISOString());
    params.append('checkOut', checkOut.toISOString());
    params.append('guests', guests);
    
    navigate(`/hotels/${id}?${params.toString()}`);
    setActiveTab('rooms');
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center py-12">
            <p className="text-xl">{t('common.loading')}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center py-12 text-red-500">
            <p className="text-xl">{error}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!hotel) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center py-12">
            <p className="text-xl">{t('common.loading')}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{hotel.name}</h1>
            <div className="flex items-center text-gray-600 mb-4">
              <div className="flex items-center mr-4">
                <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>{hotel.rating.toFixed(1)}</span>
                <span className="ml-1 text-gray-500">({hotel.reviewCount} reviews)</span>
              </div>
              <div className="mr-4">
                <svg className="w-4 h-4 text-gray-400 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{hotel.address}, {hotel.city}, {hotel.country}</span>
              </div>
            </div>
            
            {/* Hotel Gallery */}
            <ImageGallery images={hotel.images} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {/* Main Content */}
            <div className="md:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="overview">{t('hotel.overview')}</TabsTrigger>
                  <TabsTrigger value="rooms">{t('hotel.rooms')}</TabsTrigger>
                  <TabsTrigger value="amenities">{t('hotel.amenities')}</TabsTrigger>
                  <TabsTrigger value="reviews">{t('hotel.reviews')}</TabsTrigger>
                  <TabsTrigger value="location">{t('hotel.location')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold mb-4">{t('hotel.about')}</h2>
                  <p className="text-gray-600 mb-6">{hotel.description}</p>
                  
                  <h3 className="text-xl font-bold mb-3">{t('hotel.amenities')}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {hotel.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center">
                        <svg className="w-4 h-4 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-600">{amenity}</span>
                      </div>
                    ))}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3">{t('hotel.location')}</h3>
                  <div className="aspect-video rounded-lg overflow-hidden mb-6">
                    <iframe 
                      src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBRLHZVJ-Txdif8e8wK_BJWvvOw6VBhFbA&q=${hotel.latitude},${hotel.longitude}`} 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      allowFullScreen 
                      loading="lazy"
                      title="Hotel Location"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="rooms">
                  <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-2xl font-bold mb-4">{t('hotel.roomsAvailable')}</h2>
                    {
                      rooms.length > 0 ? (
                        <div className="space-y-6">
                          {rooms.map((room) => (
                            <RoomCard 
                              key={room.id} 
                              room={room} 
                              hotelId={hotel.id}
                              checkIn={checkIn}
                              checkOut={checkOut}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600">
                          {t('hotel.noRoomsAvailable')}
                        </p>
                      )
                    }
                  </div>
                </TabsContent>
                
                <TabsContent value="amenities" className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold mb-6">{t('hotel.amenities')}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {hotel.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-600">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="reviews">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <ReviewList reviews={reviews} />
                  </div>
                </TabsContent>
                
                <TabsContent value="location" className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold mb-4">{t('hotel.location')}</h2>
                  <p className="text-gray-600 mb-4">{hotel.address}, {hotel.city}, {hotel.country}</p>
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <iframe 
                      src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBRLHZVJ-Txdif8e8wK_BJWvvOw6VBhFbA&q=${hotel.latitude},${hotel.longitude}`} 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      allowFullScreen 
                      loading="lazy"
                      title="Hotel Location"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Booking Box */}
            <div className="md:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-lg shadow-md p-6 sticky top-24"
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-gray-600">{t('hotel.from')}</span>
                    <div className="text-2xl font-bold text-primary">${hotel.pricePerNight}</div>
                  </div>
                  <span className="text-gray-600">{t('hotel.perNight')}</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('search.checkIn')} - {t('search.checkOut')}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            {checkIn ? (
                              format(checkIn, 'PP')
                            ) : (
                              <span className="text-muted-foreground">Check in</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={checkIn}
                            onSelect={setCheckIn}
                            initialFocus
                            disabled={(date) => date < new Date()}
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            {checkOut ? (
                              format(checkOut, 'PP')
                            ) : (
                              <span className="text-muted-foreground">Check out</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={checkOut}
                            onSelect={setCheckOut}
                            initialFocus
                            disabled={(date) => date < (checkIn || new Date())}
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('search.guests')}
                    </label>
                    <Select value={guests} onValueChange={setGuests}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'Guest' : 'Guests'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button
                    className="w-full"
                    onClick={handleSearch}
                    disabled={!checkIn || !checkOut}
                  >
                    {t('search.searchButton')}
                  </Button>
                  
                  <div className="text-center text-sm text-gray-500">
                    You won't be charged yet
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">
                      ${hotel.pricePerNight} x {checkIn && checkOut ? Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))) : 0} nights
                    </span>
                    <span>
                      ${checkIn && checkOut ? 
                        hotel.pricePerNight * Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))) : 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Taxes & fees</span>
                    <span>
                      ${checkIn && checkOut ? 
                        Math.round(hotel.pricePerNight * Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))) * 0.12) : 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200 font-bold">
                    <span>Total</span>
                    <span>
                      ${checkIn && checkOut ? 
                        Math.round(hotel.pricePerNight * Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))) * 1.12) : 0}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default HotelDetailsPage;
