
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MainLayout from '@/components/Layout/MainLayout';
import SearchFilters from '@/components/Hotels/SearchFilters';
import HotelCard from '@/components/Hotels/HotelCard';
import { useHotels } from '@/hooks/useHotels';
import { Hotel } from '@/types';
import { Button } from '@/components/ui/button';
import { Loader2, Filter } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const HotelsPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterVisible, setIsFilterVisible] = useState(true);
  const hotelsPerPage = 5;
  
  // Get hotels from Supabase
  const { data: hotels, isLoading, error } = useHotels();
  
  // Parse search params once
  const searchParamsObj = {
    destination: searchParams.get('destination')?.toLowerCase() || '',
    checkIn: searchParams.get('checkIn') ? new Date(searchParams.get('checkIn')!) : undefined,
    checkOut: searchParams.get('checkOut') ? new Date(searchParams.get('checkOut')!) : undefined,
    guests: searchParams.get('guests') ? parseInt(searchParams.get('guests')!) : undefined,
    priceMin: searchParams.get('priceMin') ? parseInt(searchParams.get('priceMin')!) : undefined,
    priceMax: searchParams.get('priceMax') ? parseInt(searchParams.get('priceMax')!) : undefined,
    amenities: searchParams.get('amenities')?.split(',') || [],
    rating: searchParams.get('rating') ? parseInt(searchParams.get('rating')!) : undefined,
  };

  // Filter hotels based on search params
  useEffect(() => {
    // Only scroll to top when filters change and not during initial load
    if (searchParams.toString() && document.referrer !== window.location.href) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    setCurrentPage(1);
    
    if (!hotels) {
      setFilteredHotels([]);
      return;
    }
    
    let filtered = [...hotels];
    
    // Filter by destination (city or country)
    if (searchParamsObj.destination) {
      filtered = filtered.filter(hotel => 
        hotel.city.toLowerCase().includes(searchParamsObj.destination) || 
        hotel.country.toLowerCase().includes(searchParamsObj.destination) || 
        hotel.name.toLowerCase().includes(searchParamsObj.destination)
      );
    }
    
    // Filter by price
    if (searchParamsObj.priceMin !== undefined) {
      filtered = filtered.filter(hotel => hotel.pricePerNight >= searchParamsObj.priceMin!);
    }
    
    if (searchParamsObj.priceMax !== undefined) {
      filtered = filtered.filter(hotel => hotel.pricePerNight <= searchParamsObj.priceMax!);
    }
    
    // Filter by amenities
    if (searchParamsObj.amenities.length > 0) {
      filtered = filtered.filter(hotel => 
        searchParamsObj.amenities.every(amenity => hotel.amenities.includes(amenity))
      );
    }
    
    // Filter by rating
    if (searchParamsObj.rating !== undefined) {
      filtered = filtered.filter(hotel => hotel.rating >= searchParamsObj.rating!);
    }
    
    setFilteredHotels(filtered);
  }, [hotels, searchParams]);

  // Pagination logic
  const indexOfLastHotel = currentPage * hotelsPerPage;
  const indexOfFirstHotel = indexOfLastHotel - hotelsPerPage;
  const currentHotels = filteredHotels.slice(indexOfFirstHotel, indexOfLastHotel);
  const totalPages = Math.ceil(filteredHotels.length / hotelsPerPage);

  const toggleFilters = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Smooth scroll to results with offset for header
    const resultsElement = document.getElementById('hotel-results');
    if (resultsElement) {
      const headerOffset = 96; // Height of the fixed header
      const elementPosition = resultsElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <MainLayout>
      <div className="pt-24 pb-12 w-full">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">{t('common.hotels')}</h1>
            <Button 
              variant="outline" 
              className="lg:hidden flex items-center gap-2"
              onClick={toggleFilters}
            >
              <Filter className="h-4 w-4" />
              {isFilterVisible ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className={`lg:col-span-1 lg:block ${isFilterVisible ? 'block' : 'hidden'}`}>
              <div className="sticky top-24">
                <SearchFilters />
              </div>
            </div>
            
            {/* Hotel Listings */}
            <div id="hotel-results" className="lg:col-span-3">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <h3 className="text-xl font-bold mb-2">Error</h3>
                  <p className="text-gray-600 mb-4">Failed to load hotels. Please try again later.</p>
                </div>
              ) : (
                <>
                  {/* Results count */}
                  <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-bold">
                        {filteredHotels.length} {filteredHotels.length === 1 ? 'Hotel' : 'Hotels'} {searchParamsObj.destination ? `in "${searchParamsObj.destination}"` : ''}
                      </h2>
                      {/* TODO: Add sort functionality */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 hidden sm:inline">{t('search.sortBy')}:</span>
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
                    {currentHotels.length > 0 ? (
                      <>
                        {currentHotels.map((hotel, index) => (
                          <HotelCard key={hotel.id} hotel={hotel} index={index} />
                        ))}
                        
                        {/* Pagination */}
                        {totalPages > 1 && (
                          <Pagination className="mt-8">
                            <PaginationContent>
                              <PaginationItem>
                                <PaginationPrevious 
                                  onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""} 
                                />
                              </PaginationItem>
                              
                              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                                const pageNum = i + 1;
                                return (
                                  <PaginationItem key={i}>
                                    <PaginationLink 
                                      isActive={currentPage === pageNum}
                                      onClick={() => handlePageChange(pageNum)}
                                    >
                                      {pageNum}
                                    </PaginationLink>
                                  </PaginationItem>
                                );
                              })}
                              
                              <PaginationItem>
                                <PaginationNext 
                                  onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""} 
                                />
                              </PaginationItem>
                            </PaginationContent>
                          </Pagination>
                        )}
                      </>
                    ) : (
                      <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <h3 className="text-xl font-bold mb-2">{t('search.noResults')}</h3>
                        <p className="text-gray-600 mb-4">No hotels match your current filters. Try adjusting your search criteria.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default HotelsPage;
