
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Hotel } from "@/types";
import { Star, MessageSquare, Search, Filter, ChevronDown, Calendar, AlertCircle, CheckCircle2, User } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ReviewsManagementProps {
  hotel: Hotel | null;
}

interface Review {
  id: string;
  guestName: string;
  guestEmail: string;
  rating: number;
  comment: string;
  date: string;
  response?: string;
  category?: string;
  status: 'pending' | 'published' | 'flagged';
  bookingId?: string;
}

const ReviewsManagement = ({ hotel }: ReviewsManagementProps) => {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      guestName: 'Anna Anderson',
      guestEmail: 'anna.anderson@example.com',
      rating: 4,
      comment: 'Very nice hotel with great service! The staff was friendly and the room was clean and comfortable. The breakfast was excellent and had many options. Only downside was that the WiFi was a bit slow at times.',
      date: '2024-04-20',
      response: 'Thank you for your wonderful review, Anna! We appreciate your feedback about the WiFi and we are working on improving it.',
      category: 'Service',
      status: 'published',
      bookingId: 'B12345'
    },
    {
      id: '2',
      guestName: 'Erik Eriksson',
      guestEmail: 'erik.eriksson@example.com',
      rating: 5,
      comment: 'Perfect location and fantastic breakfast. The room had a beautiful view of the city and the bed was extremely comfortable. Will definitely stay here again!',
      date: '2024-04-18',
      category: 'Location',
      status: 'published',
      bookingId: 'B12346'
    },
    {
      id: '3',
      guestName: 'Maria Martinez',
      guestEmail: 'maria.m@example.com',
      rating: 3,
      comment: 'The hotel was okay. Room was smaller than expected and there was construction noise during the day. Staff was helpful when asked for assistance.',
      date: '2024-04-15',
      category: 'Room',
      status: 'pending'
    },
    {
      id: '4',
      guestName: 'James Wilson',
      guestEmail: 'james.w@example.com',
      rating: 2,
      comment: 'Disappointing stay. The bathroom was not properly cleaned and there were issues with the air conditioning. Would not recommend.',
      date: '2024-04-10',
      status: 'flagged',
      bookingId: 'B12349'
    },
    {
      id: '5',
      guestName: 'Sofia Larsson',
      guestEmail: 'sofia.l@example.com',
      rating: 5,
      comment: 'Amazing experience! The spa facilities were extraordinary and the staff went above and beyond to make our stay special. Perfect for our anniversary celebration.',
      date: '2024-04-05',
      category: 'Amenities',
      status: 'published'
    }
  ]);
  
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState<string>("");
  const [isResponseModalOpen, setIsResponseModalOpen] = useState<boolean>(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleResponse = (review: Review) => {
    setSelectedReview(review);
    setResponseText(review.response || "");
    setIsResponseModalOpen(true);
  };

  const handleSaveResponse = () => {
    if (!selectedReview) return;
    
    const updatedReviews = reviews.map((review) => 
      review.id === selectedReview.id 
        ? { ...review, response: responseText } 
        : review
    );
    
    setReviews(updatedReviews);
    toast.success("Response saved successfully");
    setIsResponseModalOpen(false);
    setSelectedReview(null);
    setResponseText("");
  };

  const handleStatusChange = (reviewId: string, status: 'pending' | 'published' | 'flagged') => {
    const updatedReviews = reviews.map((review) => 
      review.id === reviewId 
        ? { ...review, status } 
        : review
    );
    
    setReviews(updatedReviews);
    toast.success(`Review marked as ${status}`);
  };

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1))
    : 0;

  // Filter reviews
  const filteredReviews = reviews.filter(review => {
    let matchesFilter = true;
    
    if (filterRating !== null) {
      matchesFilter = matchesFilter && review.rating === filterRating;
    }
    
    if (filterStatus !== null) {
      matchesFilter = matchesFilter && review.status === filterStatus;
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      matchesFilter = matchesFilter && (
        review.guestName.toLowerCase().includes(searchLower) ||
        review.comment.toLowerCase().includes(searchLower) ||
        (review.response && review.response.toLowerCase().includes(searchLower))
      );
    }
    
    return matchesFilter;
  });

  if (!hotel) {
    return (
      <div className="p-8 bg-muted rounded-lg text-center border-2 border-dashed border-muted">
        <Star className="h-12 w-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-medium mb-2">Review Management</h3>
        <p className="text-muted-foreground">Select a hotel first to manage reviews.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <CardTitle>Reviews for {hotel.name}</CardTitle>
                <CardDescription>Manage and respond to guest reviews</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="bg-muted px-3 py-2 rounded-md flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < averageRating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-lg">{averageRating}</span>
                  <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4 border-y bg-muted/30">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reviews..."
                    className="pl-10 pr-4"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        {filterRating !== null ? `${filterRating} Stars` : "All Ratings"}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setFilterRating(null)}>
                        All Ratings
                      </DropdownMenuItem>
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <DropdownMenuItem key={rating} onClick={() => setFilterRating(rating)}>
                          {rating} {rating === 1 ? 'Star' : 'Stars'}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        {filterStatus ? `${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}` : "All Status"}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setFilterStatus(null)}>
                        All Status
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterStatus('published')}>
                        Published
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterStatus('pending')}>
                        Pending
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterStatus('flagged')}>
                        Flagged
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
            
            <div className="divide-y">
              {filteredReviews.length === 0 ? (
                <div className="p-8 text-center">
                  <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No reviews found matching your criteria</p>
                </div>
              ) : (
                filteredReviews.map((review) => (
                  <div key={review.id} className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{review.guestName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{review.guestName}</h3>
                              <Badge 
                                variant={
                                  review.status === 'published' ? 'default' : 
                                  review.status === 'flagged' ? 'destructive' : 'outline'
                                }
                              >
                                {review.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{review.guestEmail}</p>
                          </div>
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground gap-2">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{new Date(review.date).toLocaleDateString()}</span>
                            </div>
                            {review.category && (
                              <Badge variant="outline">{review.category}</Badge>
                            )}
                            {review.bookingId && (
                              <span className="text-xs text-muted-foreground">
                                Booking: {review.bookingId}
                              </span>
                            )}
                          </div>
                          <p className="text-sm">{review.comment}</p>
                        </div>

                        {review.response && (
                          <div className="bg-muted p-4 rounded-lg mt-4">
                            <p className="text-sm font-medium mb-1">Your response:</p>
                            <p className="text-sm">{review.response}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2 mt-4 md:mt-0">
                        <Button 
                          variant={review.response ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleResponse(review)}
                          className="whitespace-nowrap"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          {review.response ? "Edit Response" : "Respond"}
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="whitespace-nowrap">
                              Set Status
                              <ChevronDown className="h-4 w-4 ml-2" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(review.id, 'published')}
                              disabled={review.status === 'published'}
                              className="flex items-center gap-2"
                            >
                              <CheckCircle2 className="h-4 w-4" /> Publish
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(review.id, 'pending')}
                              disabled={review.status === 'pending'}
                              className="flex items-center gap-2"
                            >
                              <Clock className="h-4 w-4" /> Mark as Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(review.id, 'flagged')}
                              disabled={review.status === 'flagged'}
                              className="flex items-center gap-2"
                            >
                              <AlertCircle className="h-4 w-4" /> Flag Review
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4 bg-muted/30">
            <div className="flex justify-between items-center w-full">
              <p className="text-sm text-muted-foreground">
                Showing {filteredReviews.length} of {reviews.length} reviews
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Response Dialog */}
      <Dialog open={isResponseModalOpen} onOpenChange={setIsResponseModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Respond to Review</DialogTitle>
            <DialogDescription>
              Your response will be visible to all users viewing this review.
            </DialogDescription>
          </DialogHeader>
          
          {selectedReview && (
            <>
              <div className="bg-muted p-4 rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{selectedReview.guestName}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < selectedReview.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm">{selectedReview.comment}</p>
              </div>
              
              <Textarea
                placeholder="Write your response to the guest..."
                rows={6}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
              />
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsResponseModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveResponse}>
                  Save Response
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReviewsManagement;
