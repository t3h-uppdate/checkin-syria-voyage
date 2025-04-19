
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Hotel } from '@/types';

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
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
    >
      <Link to={`/hotels/${hotel.id}`}>
        <div className="relative h-60">
          <img 
            src={hotel.featuredImage} 
            alt={hotel.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 bg-primary text-white text-sm font-bold rounded-full py-1 px-3">
            ${hotel.pricePerNight} <span className="text-xs font-normal">{t('hotel.perNight')}</span>
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-2">{hotel.name}</h3>
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="ml-1 text-gray-600">{hotel.rating.toFixed(1)}</span>
              <span className="ml-1 text-gray-400">({hotel.reviewCount})</span>
            </div>
            <span className="mx-2 text-gray-300">•</span>
            <span className="text-gray-600">{hotel.city}, {hotel.country}</span>
          </div>
          <p className="text-gray-600 line-clamp-2 mb-4">{hotel.description}</p>
          <div className="flex flex-wrap gap-2">
            {hotel.amenities.slice(0, 3).map((amenity, index) => (
              <span key={index} className="bg-muted text-gray-600 text-xs rounded-full px-2 py-1">
                {amenity}
              </span>
            ))}
            {hotel.amenities.length > 3 && (
              <span className="bg-muted text-gray-600 text-xs rounded-full px-2 py-1">
                +{hotel.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default HotelCard;
