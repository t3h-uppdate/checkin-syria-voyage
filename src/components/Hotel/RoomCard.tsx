
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Room } from '@/types';

interface RoomCardProps {
  room: Room;
  hotelId: string;
  checkIn?: Date;
  checkOut?: Date;
}

const RoomCard = ({ room, hotelId, checkIn, checkOut }: RoomCardProps) => {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);

  const calculateStayDuration = () => {
    if (!checkIn || !checkOut) return 1;
    
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const totalPrice = room.price * calculateStayDuration();
  
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
              
              <Link 
                to={checkIn && checkOut 
                  ? `/booking/${hotelId}/${room.id}?checkIn=${checkIn.toISOString()}&checkOut=${checkOut.toISOString()}` 
                  : `/hotels/${hotelId}?showBooking=true`
                }
              >
                <Button className="w-full sm:w-auto">
                  {checkIn && checkOut ? t('room.bookNow') : t('room.selectDates')}
                </Button>
              </Link>
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
                
                <Link 
                  to={checkIn && checkOut 
                    ? `/booking/${hotelId}/${room.id}?checkIn=${checkIn.toISOString()}&checkOut=${checkOut.toISOString()}` 
                    : `/hotels/${hotelId}?showBooking=true`
                  }
                >
                  <Button>
                    {checkIn && checkOut ? t('room.bookNow') : t('room.selectDates')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RoomCard;
