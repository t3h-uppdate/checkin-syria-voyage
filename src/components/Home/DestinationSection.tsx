
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { DESTINATIONS } from '@/data/mockData';
import { Link } from 'react-router-dom';

const DestinationSection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{t('home.topDestinations')}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the most beautiful destinations across Syria, each with its unique history and character.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {DESTINATIONS.map((destination, index) => (
            <motion.div
              key={destination.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <Link to={`/hotels?destination=${destination.name}`}>
                <div className="relative rounded-lg overflow-hidden h-80 shadow-md">
                  <img 
                    src={destination.image} 
                    alt={destination.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-xl font-bold mb-1">{destination.name}</h3>
                    <p className="text-sm text-gray-200 mb-2">{destination.description}</p>
                    <span className="text-xs font-medium bg-primary/70 rounded-full py-1 px-3">
                      {destination.hotelCount} {destination.hotelCount === 1 ? 'Hotel' : 'Hotels'}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DestinationSection;
