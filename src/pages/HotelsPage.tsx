
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MainLayout from '@/components/Layout/MainLayout';
import SearchFilters from '@/components/Hotels/SearchFilters';
import HotelCard from '@/components/Hotels/HotelCard';
import { HOTELS } from '@/data/mockData';
import { Hotel } from '@/types';

const HotelsPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  
  // Parse search params
  const destination = searchParams.get('destination');
  const checkIn = searchParams.get('checkIn') ? new Date(searchParams.get('checkIn')!) : undefined;
  const checkOut = searchParams.get('checkOut') ? new Date(searchParams.get('checkOut')!) : undefined;
  const guests = searchParams.get('guests') ? parseInt(searchParams.get('guests')!) : undefined;
  const priceMin = searchParams.get('priceMin') ? parseInt(searchParams.get('priceMin')!) : undefined;
  const priceMax = searchParams.get('priceMax') ? parseInt(searchParams.get('priceMax')!) : undefined;
  const amenitiesParam = searchParams.get('amenities');
  const amenities = amenitiesParam ? amenitiesParam.split(',') : [];
  const ratingParam = searchParams.get('rating');
  const rating = ratingParam ? parseInt(ratingParam) : undefined;

  // Filter hotels based on search params
  useEffect(() => {
    // Scroll to top on filter change
    window.scrollTo(0, 0);
    
    let filtered = [...HOTELS];
    
    // Filter by destination (city or country)
    if (destination) {
      const searchTerm = destination.toLowerCase();
      filtered = filtered.filter(hotel => 
        hotel.city.toLowerCase().includes(searchTerm) || 
        hotel.country.toLowerCase().includes(searchTerm) || 
        hotel.name.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filter by price
    if (priceMin !== undefined) {
      filtered = filtered.filter(hotel => hotel.pricePerNight >= priceMin);
    }
    
    if (priceMax !== undefined) {
      filtered = filtered.filter(hotel => hotel.pricePerNight <= priceMax);
    }
    
    // Filter by amenities
    if (amenities.length > 0) {
      filtered = filtered.filter(hotel => 
        amenities.every(amenity => hotel.amenities.includes(amenity))
      );
    }
    
    // Filter by rating
    if (rating !== undefined) {
      filtered = filtered.filter(hotel => hotel.rating >= rating);
    }
    
    // TODO: In a real app, we would also filter by availability based on checkIn, checkOut, and guests
    
    setFilteredHotels(filtered);
  }, [destination, checkIn, checkOut, guests, priceMin, priceMax, amenities, rating]);

  return (
    <MainLayout>
      <div className="pt-24 pb-12 bg-muted">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">{t('common.hotels')}</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <SearchFilters />
            </div>
            
            {/* Hotel Listings */}
            <div className="lg:col-span-3">
              {/* Results count */}
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">
                    {filteredHotels.length} {filteredHotels.length === 1 ? 'Hotel' : 'Hotels'} {destination ? `in "${destination}"` : ''}
                  </h2>
                  {/* TODO: Add sort functionality */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{t('search.sortBy')}:</span>
                    <select className="border rounded-md text-sm p-1">
                      <option value="recommended">Recommended</option>
                      <option value="price-low">Price (Low to High)</option>
                      <option value="price-high">Price (High to Low)</option>
                      <option value="rating">Rating</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Hotel Cards */}
              <div className="space-y-6">
                {filteredHotels.length > 0 ? (
                  filteredHotels.map((hotel, index) => (
                    <HotelCard key={hotel.id} hotel={hotel} index={index} />
                  ))
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <h3 className="text-xl font-bold mb-2">{t('search.noResults')}</h3>
                    <p className="text-gray-600 mb-4">No hotels match your current filters. Try adjusting your search criteria.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default HotelsPage;
