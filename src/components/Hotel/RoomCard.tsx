
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Room } from '@/types';

interface RoomCardProps {
  room: Room;
  hotelId: string;
  checkIn?: Date;
  checkOut?: Date;
}

const RoomCard = ({ room, hotelId, checkIn: initialCheckIn, checkOut: initialCheckOut }: RoomCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [checkIn, setCheckIn] = useState<Date | undefined>(initialCheckIn);
  const [checkOut, setCheckOut] = useState<Date | undefined>(initialCheckOut);
  const [guests, setGuests] = useState<string>(room.capacity.toString());

  const calculateStayDuration = () => {
    if (!checkIn || !checkOut) return 1;
    
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const totalPrice = room.price * calculateStayDuration();

  const handleBookNow = () => {
    if (checkIn && checkOut) {
      navigate(`/booking/${hotelId}/${room.id}?checkIn=${checkIn.toISOString()}&checkOut=${checkOut.toISOString()}`);
    } else {
      setShowBookingModal(true);
    }
  };
  
  const handleProceedToBooking = () => {
    if (checkIn && checkOut) {
      navigate(`/booking/${hotelId}/${room.id}?checkIn=${checkIn.toISOString()}&checkOut=${checkOut.toISOString()}`);
      setShowBookingModal(false);
    }
  };
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Room Image */}
          <div className="md:col-span-4 h-48 md:h-full relative">
            <img 
              src={room.images[0]} 
              alt={room.name} 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Room Information */}
          <div className="p-6 md:col-span-8">
            <div className="flex flex-col md:flex-row md:justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">{room.name}</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="bg-muted text-gray-600 text-xs rounded-full px-2 py-1">
                    {room.capacity} {room.capacity === 1 ? 'Guest' : 'Guests'}
                  </span>
                  <span className="bg-muted text-gray-600 text-xs rounded-full px-2 py-1">
                    {room.bedType}
                  </span>
                  <span className="bg-muted text-gray-600 text-xs rounded-full px-2 py-1">
                    {room.size} m²
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-primary mb-1">
                  ${room.price}
                  <span className="text-sm text-gray-500 font-normal"> / {t('hotel.perNight')}</span>
                </div>
                {checkIn && checkOut && (
                  <div className="text-sm text-gray-500 mb-2">
                    ${totalPrice} {t('booking.total')} for {calculateStayDuration()} {calculateStayDuration() === 1 ? 'night' : 'nights'}
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-gray-600 mb-4 line-clamp-2">{room.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {room.amenities.slice(0, 4).map((amenity, index) => (
                <span key={index} className="bg-primary/10 text-primary text-xs font-medium rounded-full px-2 py-1">
                  {amenity}
                </span>
              ))}
              {room.amenities.length > 4 && (
                <button 
                  onClick={() => setShowDetails(true)}
                  className="bg-primary/10 text-primary text-xs font-medium rounded-full px-2 py-1 hover:bg-primary/20 transition-colors"
                >
                  +{room.amenities.length - 4} more
                </button>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowDetails(true)}
              >
                {t('hotel.viewRoom')}
              </Button>
              
              <Button onClick={handleBookNow} className="w-full sm:w-auto">
                {t('room.bookNow')}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Room Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{room.name}</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            <Carousel className="w-full">
              <CarouselContent>
                {room.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="h-64 md:h-80 relative rounded-lg overflow-hidden">
                      <img 
                        src={image} 
                        alt={`${room.name} view ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
            
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-2">{t('room.details')}</h3>
              <p className="text-gray-600 mb-4">{room.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                <div className="bg-muted rounded-lg p-3">
                  <span className="text-gray-500 text-sm">{t('room.guests')}</span>
                  <p className="font-bold">{room.capacity}</p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <span className="text-gray-500 text-sm">{t('room.beds')}</span>
                  <p className="font-bold">{room.bedType}</p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <span className="text-gray-500 text-sm">{t('room.size')}</span>
                  <p className="font-bold">{room.size} m²</p>
                </div>
              </div>
              
              <h3 className="text-lg font-bold mb-2">{t('room.amenities')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
                {room.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center">
                    <svg className="w-4 h-4 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">{amenity}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center border-t pt-4">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    ${room.price}
                    <span className="text-sm text-gray-500 font-normal"> / {t('hotel.perNight')}</span>
                  </div>
                  {checkIn && checkOut && (
                    <div className="text-sm text-gray-500">
                      ${totalPrice} {t('booking.total')} for {calculateStayDuration()} {calculateStayDuration() === 1 ? 'night' : 'nights'}
                    </div>
                  )}
                </div>
                
                <Button onClick={handleBookNow}>
                  {t('room.bookNow')}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Modal for Check-in/Check-out Selection */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Book {room.name}</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
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
                      className={cn("p-3 pointer-events-auto")}
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
                      className={cn("p-3 pointer-events-auto")}
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
                  {Array.from({length: room.capacity}, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {checkIn && checkOut && (
              <div className="pt-4 border-t">
                <div className="flex justify-between text-sm mb-2">
                  <span>{room.price} x {calculateStayDuration()} nights</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowBookingModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleProceedToBooking}
                disabled={!checkIn || !checkOut}
              >
                Continue to Booking
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RoomCard;
