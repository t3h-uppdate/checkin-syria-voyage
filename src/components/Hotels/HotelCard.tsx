
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Hotel } from '@/types';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin } from 'lucide-react';

interface HotelCardProps {
  hotel: Hotel;
  index: number;
}

const HotelCard = ({ hotel, index }: HotelCardProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <Link to={`/hotels/${hotel.id}`} className="block">
          <div className="flex flex-col md:flex-row">
            <div className="relative md:w-1/3">
              <img 
                src={hotel.featuredImage} 
                alt={hotel.name} 
                className="w-full h-60 md:h-full object-cover"
              />
              <Badge className="absolute top-4 right-4 bg-primary text-white font-bold">
                ${hotel.pricePerNight} <span className="text-xs font-normal">{t('hotel.perNight')}</span>
              </Badge>
            </div>
            <CardContent className="p-6 md:w-2/3">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">{hotel.name}</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                    <span>{hotel.city}, {hotel.country}</span>
                  </div>
                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-gray-600">{hotel.rating.toFixed(1)}</span>
                      <span className="ml-1 text-gray-400">({hotel.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 line-clamp-2">{hotel.description}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {hotel.amenities.slice(0, 4).map((amenity, idx) => (
                    <Badge key={idx} variant="outline" className="bg-muted/50">
                      {amenity}
                    </Badge>
                  ))}
                  {hotel.amenities.length > 4 && (
                    <Badge variant="outline" className="bg-muted/50">
                      +{hotel.amenities.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </div>
        </Link>
      </Card>
    </motion.div>
  );
};

export default HotelCard;
