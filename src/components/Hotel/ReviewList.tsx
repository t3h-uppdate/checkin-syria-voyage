
import { useTranslation } from 'react-i18next';
import { Progress } from '@/components/ui/progress';
import { Review } from '@/types';

interface ReviewListProps {
  reviews: Review[];
}

const ReviewList = ({ reviews }: ReviewListProps) => {
  const { t } = useTranslation();
  
  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
    : 0;
  
  // Calculate rating distribution
  const ratingCounts = [0, 0, 0, 0, 0]; // Index 0 = 1 star, index 4 = 5 stars
  reviews.forEach(review => {
    ratingCounts[review.rating - 1]++;
  });
  
  const ratingPercentages = ratingCounts.map(count => 
    reviews.length > 0 ? (count / reviews.length) * 100 : 0
  );

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-6">{t('hotel.reviews')}</h2>
      
      {reviews.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col items-center justify-center p-6 bg-muted rounded-lg">
              <div className="text-4xl font-bold mb-2">{averageRating.toFixed(1)}</div>
              <div className="flex mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg 
                    key={star} 
                    className={`w-5 h-5 ${
                      star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'
                    }`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <div className="text-sm text-gray-500">
                Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </div>
            </div>
            
            <div className="col-span-2 space-y-3">
              {[5, 4, 3, 2, 1].map((rating, index) => (
                <div key={rating} className="flex items-center">
                  <div className="w-12 text-sm text-gray-600">{rating} stars</div>
                  <div className="flex-1 mx-4">
                    <Progress value={ratingPercentages[4 - index]} className="h-2" />
                  </div>
                  <div className="w-12 text-sm text-gray-600">
                    {ratingCounts[4 - index]} ({Math.round(ratingPercentages[4 - index])}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-6">
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 bg-primary/10 text-primary font-bold rounded-full flex items-center justify-center mr-3">
                    {review.userId.substring(4, 6).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold">
                      Guest {review.userId.substring(4, 6).toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(review.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="flex mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg 
                      key={star} 
                      className={`w-4 h-4 ${
                        star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No reviews yet for this hotel.</p>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
