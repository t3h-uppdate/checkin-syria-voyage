
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { REVIEWS } from '@/data/mockData';

const TestimonialsSection = () => {
  const { t } = useTranslation();
  
  // Get only 5-star reviews
  const topReviews = REVIEWS.filter(review => review.rating === 5).slice(0, 3);

  return (
    <section className="py-20 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Guest Testimonials</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hear from our satisfied guests about their experiences at CheckInSyria hotels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {topReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-md p-6 flex flex-col"
            >
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-white font-bold">
                    {review.userId.substring(4, 6).toUpperCase()}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold">Guest {review.userId.substring(4, 6).toUpperCase()}</h4>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i} 
                        className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-1 text-sm text-gray-500">
                      {new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              </div>
              <blockquote className="text-gray-600 italic flex-grow">
                "{review.comment}"
              </blockquote>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
