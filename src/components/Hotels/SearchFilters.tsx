
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { format } from 'date-fns';
import { CalendarIcon, Search } from 'lucide-react';
import { AMENITIES } from '@/data/mockData';

const SearchFilters = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Parse search params
  const initialDestination = searchParams.get('destination') || '';
  const initialCheckIn = searchParams.get('checkIn') ? new Date(searchParams.get('checkIn')!) : undefined;
  const initialCheckOut = searchParams.get('checkOut') ? new Date(searchParams.get('checkOut')!) : undefined;
  const initialGuests = searchParams.get('guests') || '2';
  const initialPriceMin = searchParams.get('priceMin') ? parseInt(searchParams.get('priceMin')!) : 0;
  const initialPriceMax = searchParams.get('priceMax') ? parseInt(searchParams.get('priceMax')!) : 500;
  
  // State for form values
  const [destination, setDestination] = useState(initialDestination);
  const [checkIn, setCheckIn] = useState<Date | undefined>(initialCheckIn);
  const [checkOut, setCheckOut] = useState<Date | undefined>(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests);
  const [priceRange, setPriceRange] = useState<number[]>([initialPriceMin, initialPriceMax]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [rating, setRating] = useState<string>('');

  // Initialize amenities from URL
  useEffect(() => {
    const amenitiesParam = searchParams.get('amenities');
    if (amenitiesParam) {
      setSelectedAmenities(amenitiesParam.split(','));
    }
    
    const ratingParam = searchParams.get('rating');
    if (ratingParam) {
      setRating(ratingParam);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create search query
    const params = new URLSearchParams();
    if (destination) params.append('destination', destination);
    if (checkIn) params.append('checkIn', checkIn.toISOString());
    if (checkOut) params.append('checkOut', checkOut.toISOString());
    if (guests) params.append('guests', guests);
    params.append('priceMin', priceRange[0].toString());
    params.append('priceMax', priceRange[1].toString());
    
    if (selectedAmenities.length > 0) {
      params.append('amenities', selectedAmenities.join(','));
    }
    
    if (rating) {
      params.append('rating', rating);
    }

    navigate(`/hotels?${params.toString()}`);
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    if (checked) {
      setSelectedAmenities([...selectedAmenities, amenity]);
    } else {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    }
  };

  const clearFilters = () => {
    setDestination('');
    setCheckIn(undefined);
    setCheckOut(undefined);
    setGuests('2');
    setPriceRange([0, 500]);
    setSelectedAmenities([]);
    setRating('');
    
    navigate('/hotels');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <form onSubmit={handleSearch}>
        <div className="space-y-6">
          <div>
            <Label htmlFor="destination">{t('search.destination')}</Label>
            <Input 
              id="destination" 
              placeholder="Damascus, Aleppo..." 
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="checkIn">{t('search.checkIn')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full mt-1 justify-start text-left font-normal"
                  id="checkIn"
                >
                  {checkIn ? (
                    format(checkIn, 'PP')
                  ) : (
                    <span className="text-muted-foreground">Select date</span>
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
          </div>

          <div>
            <Label htmlFor="checkOut">{t('search.checkOut')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full mt-1 justify-start text-left font-normal"
                  id="checkOut"
                >
                  {checkOut ? (
                    format(checkOut, 'PP')
                  ) : (
                    <span className="text-muted-foreground">Select date</span>
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

          <div>
            <Label htmlFor="guests">{t('search.guests')}</Label>
            <Select value={guests} onValueChange={setGuests}>
              <SelectTrigger id="guests" className="mt-1">
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

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="price">
              <AccordionTrigger>
                <div className="text-left">
                  <h3 className="font-medium">{t('search.price')}</h3>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-2 px-1">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">${priceRange[0]}</span>
                    <span className="text-sm text-gray-600">${priceRange[1]}</span>
                  </div>
                  <Slider
                    value={priceRange}
                    min={0}
                    max={500}
                    step={10}
                    onValueChange={setPriceRange}
                    className="mt-1"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="amenities">
              <AccordionTrigger>
                <div className="text-left">
                  <h3 className="font-medium">{t('search.amenities')}</h3>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-2 grid grid-cols-1 gap-2">
                  {AMENITIES.map((amenity) => (
                    <div key={amenity} className="flex items-center">
                      <Checkbox 
                        id={`amenity-${amenity}`} 
                        checked={selectedAmenities.includes(amenity)}
                        onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                      />
                      <label
                        htmlFor={`amenity-${amenity}`}
                        className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {amenity}
                      </label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="rating">
              <AccordionTrigger>
                <div className="text-left">
                  <h3 className="font-medium">{t('search.ratings')}</h3>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-2 space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center">
                      <input
                        type="radio"
                        id={`rating-${star}`}
                        name="rating"
                        checked={rating === star.toString()}
                        onChange={() => setRating(star.toString())}
                        className="mr-2"
                      />
                      <label 
                        htmlFor={`rating-${star}`}
                        className="flex items-center text-sm"
                      >
                        {Array.from({ length: star }).map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="ml-1">& up</span>
                      </label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="space-y-2">
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              <Search className="mr-2 h-4 w-4" />
              {t('search.searchButton')}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={clearFilters} 
              className="w-full"
            >
              {t('search.clearFilters')}
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default SearchFilters;
