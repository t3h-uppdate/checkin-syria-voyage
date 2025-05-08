
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Star, Edit, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Review {
  id: string;
  hotel_id: string;
  user_id: string;
  rating: number;
  comment: string;
  date: string;
  hotel_name?: string;
}

interface Hotel {
  id: string;
  name: string;
}

const UserReviews = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [reviewedHotelIds, setReviewedHotelIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Review state
  const [selectedHotelId, setSelectedHotelId] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Edit state
  const [editReviewId, setEditReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState<number>(5);
  const [editComment, setEditComment] = useState<string>('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Delete state
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchReviewsAndHotels = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch user's reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            *,
            hotels:hotel_id(name)
          `)
          .eq('user_id', user.id);
          
        if (reviewsError) throw reviewsError;
        
        // Fetch all hotels
        const { data: hotelsData, error: hotelsError } = await supabase
          .from('hotels')
          .select('id, name');
          
        if (hotelsError) throw hotelsError;
        
        const formattedReviews = reviewsData?.map(review => ({
          ...review,
          hotel_name: review.hotels?.name || 'Unknown Hotel'
        })) || [];
        
        setReviews(formattedReviews);
        setHotels(hotelsData || []);
        
        // Create array of hotel IDs the user has already reviewed
        const reviewedIds = formattedReviews.map(review => review.hotel_id);
        setReviewedHotelIds(reviewedIds);
        
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews');
        toast.error(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviewsAndHotels();
  }, [user, t]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error(t('dashboard.hotelStats.notSignedIn'));
      return;
    }
    
    if (!selectedHotelId) {
      toast.warning(t('reviews.selectHotel'));
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create a new review
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          hotel_id: selectedHotelId,
          rating,
          comment,
          date: new Date().toISOString()
        });
        
      if (reviewError) throw reviewError;
      
      // Update the UI
      const selectedHotel = hotels.find(h => h.id === selectedHotelId);
      
      const newReview: Review = {
        id: `temp-${Date.now()}`, // Will be replaced when we re-fetch
        user_id: user.id,
        hotel_id: selectedHotelId,
        rating,
        comment,
        date: new Date().toISOString(),
        hotel_name: selectedHotel?.name
      };
      
      setReviews(prevReviews => [...prevReviews, newReview]);
      setReviewedHotelIds(prev => [...prev, selectedHotelId]);
      
      toast.success(t('reviews.submitted'));
      setComment('');
      setRating(5);
      setSelectedHotelId('');
      setIsDialogOpen(false);
      
    } catch (err) {
      console.error('Error submitting review:', err);
      toast.error(t('reviews.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !editReviewId) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Update the review
      const { error: updateError } = await supabase
        .from('reviews')
        .update({
          rating: editRating,
          comment: editComment,
        })
        .eq('id', editReviewId)
        .eq('user_id', user.id);
        
      if (updateError) throw updateError;
      
      // Update the UI
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review.id === editReviewId 
            ? { ...review, rating: editRating, comment: editComment } 
            : review
        )
      );
      
      toast.success('Review updated successfully');
      setIsEditDialogOpen(false);
      
    } catch (err) {
      console.error('Error updating review:', err);
      toast.error('Error updating review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!user || !deleteReviewId) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Delete the review
      const { error: deleteError } = await supabase
        .from('reviews')
        .delete()
        .eq('id', deleteReviewId)
        .eq('user_id', user.id);
        
      if (deleteError) throw deleteError;
      
      // Find the hotel_id of the deleted review to remove from reviewedHotelIds
      const reviewToDelete = reviews.find(r => r.id === deleteReviewId);
      
      // Update the UI
      setReviews(prevReviews => prevReviews.filter(review => review.id !== deleteReviewId));
      
      if (reviewToDelete) {
        setReviewedHotelIds(prev => prev.filter(id => id !== reviewToDelete.hotel_id));
      }
      
      toast.success('Review deleted successfully');
      setIsDeleteDialogOpen(false);
      
    } catch (err) {
      console.error('Error deleting review:', err);
      toast.error('Error deleting review');
    } finally {
      setIsSubmitting(false);
      setDeleteReviewId(null);
    }
  };

  const startEditReview = (review: Review) => {
    setEditReviewId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setIsEditDialogOpen(true);
  };

  const startDeleteReview = (reviewId: string) => {
    setDeleteReviewId(reviewId);
    setIsDeleteDialogOpen(true);
  };

  // Filter out hotels the user has already reviewed
  const availableHotels = hotels.filter(hotel => 
    !reviewedHotelIds.includes(hotel.id)
  );

  const renderStars = (count: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < count ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 text-center">
        <p>{t('dashboard.hotelStats.notSignedIn')}</p>
        <Button 
          onClick={() => window.location.href = '/login'}
          className="mt-2"
        >
          {t('common.login')}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('reviews.myReviews')}</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={availableHotels.length === 0}>
              <Star className="mr-2 h-4 w-4" />
              {t('reviews.writeReview')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('reviews.writeReview')}</DialogTitle>
              <DialogDescription>{t('reviews.selectHotel')}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitReview}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="hotel">Hotel</label>
                  <Select value={selectedHotelId} onValueChange={setSelectedHotelId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a hotel" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableHotels.map(hotel => (
                        <SelectItem key={hotel.id} value={hotel.id}>
                          {hotel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="rating">{t('reviews.rating')}</label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-6 w-6 cursor-pointer ${
                          star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                        onClick={() => setRating(star)}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="comment">{t('reviews.comment')}</label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    rows={5}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting || !selectedHotelId}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('reviews.submitting')}
                    </>
                  ) : (
                    t('reviews.submit')
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle className="text-lg">
                    {t('reviews.reviewFor')} {review.hotel_name}
                  </CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(review.date), 'PP')}
                  </span>
                </div>
                <div className="flex mt-1">
                  {renderStars(review.rating)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{review.comment}</p>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEditReview(review)}
                >
                  <Edit className="mr-1 h-4 w-4" />
                  {t('reviews.editReview')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => startDeleteReview(review.id)}
                >
                  <Trash className="mr-1 h-4 w-4" />
                  {t('reviews.deleteReview')}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-muted rounded-lg">
          <Star className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
          <p>{t('reviews.noReviews')}</p>
        </div>
      )}

      {/* Edit Review Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('reviews.editReview')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateReview}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="editRating">{t('reviews.rating')}</label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-6 w-6 cursor-pointer ${
                        star <= editRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                      onClick={() => setEditRating(star)}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="editComment">{t('reviews.comment')}</label>
                <Textarea
                  id="editComment"
                  value={editComment}
                  onChange={e => setEditComment(e.target.value)}
                  rows={5}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('reviews.submitting')}
                  </>
                ) : (
                  t('reviews.submit')
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('reviews.deleteReview')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('reviews.confirmDelete')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteReview}
              className="bg-red-500 hover:bg-red-600"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t('common.delete')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserReviews;
