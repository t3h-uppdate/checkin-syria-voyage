
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Flag,
  Search,
  Filter,
  Loader2,
  RefreshCcw,
  Check,
  X,
  AlertTriangle,
  Star,
  Hotel,
  User,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Review = {
  id: string;
  hotel_id: string;
  hotel_name: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  date: string;
  status: 'published' | 'pending' | 'flagged' | 'rejected';
  flag_reason?: string;
};

// Mock data for reviews
const mockReviews: Review[] = Array(18).fill(null).map((_, i) => ({
  id: `review-${i+1}`,
  hotel_id: `hotel-${Math.floor(Math.random() * 5) + 1}`,
  hotel_name: [`Grand Hotel`, `Beach Resort`, `Mountain Lodge`, `City Center Hotel`, `Lakeside Inn`][Math.floor(Math.random() * 5)],
  user_id: `user-${Math.floor(Math.random() * 10) + 1}`,
  user_name: `User ${Math.floor(Math.random() * 10) + 1}`,
  rating: Math.floor(Math.random() * 5) + 1,
  comment: [
    "Great stay, would definitely recommend!",
    "The room was not as clean as expected. Staff was friendly though.",
    "Absolutely terrible experience. The room had bugs and the staff was rude.",
    "Decent place for the price. Nothing fancy but does the job.",
    "Outstanding service and amenities. Will definitely return!",
    "The food at the restaurant was incredible. Room was average.",
    "Questionable cleanliness and horrible customer service. Never coming back!"
  ][Math.floor(Math.random() * 7)],
  date: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString(),
  status: ['published', 'pending', 'flagged', 'rejected'][Math.floor(Math.random() * 4)] as 'published' | 'pending' | 'flagged' | 'rejected',
  flag_reason: Math.random() > 0.7 ? ["Inappropriate language", "Suspected fake review", "Harassment", "Spam"][Math.floor(Math.random() * 4)] : undefined,
}));

const ReviewModeration = () => {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    filterReviews();
  }, [reviews, searchTerm, statusFilter, ratingFilter]);

  const filterReviews = () => {
    let filtered = [...reviews];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        review =>
          review.hotel_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.comment.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(review => review.status === statusFilter);
    }

    // Filter by rating
    if (ratingFilter !== "all") {
      filtered = filtered.filter(review => review.rating === parseInt(ratingFilter));
    }

    setFilteredReviews(filtered);
  };

  const approveReview = (reviewId: string) => {
    const updatedReviews = reviews.map(review =>
      review.id === reviewId ? { ...review, status: 'published' as const } : review
    );
    
    setReviews(updatedReviews);
    
    toast({
      title: "Review Approved",
      description: "The review has been published successfully.",
    });
    
    if (isDetailsDialogOpen && selectedReview?.id === reviewId) {
      setSelectedReview({ ...selectedReview, status: 'published' });
    }
  };

  const rejectReview = (reviewId: string) => {
    const updatedReviews = reviews.map(review =>
      review.id === reviewId ? { ...review, status: 'rejected' as const } : review
    );
    
    setReviews(updatedReviews);
    
    toast({
      title: "Review Rejected",
      description: "The review has been rejected and will not be published.",
      variant: "destructive",
    });
    
    setIsRejectDialogOpen(false);
    
    if (isDetailsDialogOpen && selectedReview?.id === reviewId) {
      setSelectedReview({ ...selectedReview, status: 'rejected' });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Published</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
      case 'flagged':
        return <Badge variant="destructive">Flagged</Badge>;
      case 'rejected':
        return <Badge variant="secondary">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {Array(5)
          .fill(0)
          .map((_, index) => (
            <Star
              key={index}
              className={`h-4 w-4 ${
                index < rating ? "text-amber-500 fill-amber-500" : "text-gray-300"
              }`}
            />
          ))}
        <span className="ml-1 text-sm">{rating}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Review Moderation</CardTitle>
              <CardDescription>Approve, delete, or flag inappropriate content in user reviews</CardDescription>
            </div>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 700);
              }}
            >
              <RefreshCcw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews by hotel, user or content..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 flex-col sm:flex-row">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Status</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-[140px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Rating</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Loading reviews...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <Flag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Reviews Found</h3>
              <p className="text-muted-foreground mt-2">
                Try adjusting your filters or search term
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rating</TableHead>
                    <TableHead className="w-[300px]">Review</TableHead>
                    <TableHead>Hotel</TableHead>
                    <TableHead>Reviewer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>{renderStars(review.rating)}</TableCell>
                      <TableCell>
                        <div className="truncate max-w-[300px]">
                          {review.comment}
                        </div>
                        {review.status === 'flagged' && review.flag_reason && (
                          <div className="flex items-center mt-1">
                            <AlertTriangle className="h-3 w-3 text-amber-500 mr-1" />
                            <span className="text-xs text-red-500">{review.flag_reason}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Hotel className="h-4 w-4 text-muted-foreground" />
                          <span>{review.hotel_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{review.user_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(review.status)}</TableCell>
                      <TableCell>{formatDate(review.date)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedReview(review);
                              setIsDetailsDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {(review.status === 'pending' || review.status === 'flagged') && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600"
                                onClick={() => approveReview(review.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedReview(review);
                                  setIsRejectDialogOpen(true);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription>
              Review by {selectedReview?.user_name} for {selectedReview?.hotel_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                {selectedReview && renderStars(selectedReview.rating)}
              </div>
              <div>{selectedReview && getStatusBadge(selectedReview.status)}</div>
            </div>
            
            <div className="bg-muted p-4 rounded-md">
              <p>{selectedReview?.comment}</p>
            </div>
            
            {selectedReview?.status === 'flagged' && selectedReview.flag_reason && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-md">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <strong>Flagged for Review</strong>
                </div>
                <p className="text-sm">Reason: {selectedReview.flag_reason}</p>
              </div>
            )}
            
            <div className="flex justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{selectedReview?.user_name}</span>
              </div>
              <div>Posted on {selectedReview && formatDate(selectedReview.date)}</div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            {(selectedReview?.status === 'pending' || selectedReview?.status === 'flagged') && (
              <>
                <Button
                  variant="outline"
                  className="text-green-600"
                  onClick={() => {
                    if (selectedReview) {
                      approveReview(selectedReview.id);
                      setIsDetailsDialogOpen(false);
                    }
                  }}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600"
                  onClick={() => {
                    setIsRejectDialogOpen(true);
                    setIsDetailsDialogOpen(false);
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Review Dialog */}
      <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this review? It will not be visible on the platform.
              <div className="mt-4 p-4 bg-muted rounded-md">
                <div className="mb-2">{selectedReview && renderStars(selectedReview.rating)}</div>
                <p className="text-sm">{selectedReview?.comment}</p>
                <div className="mt-2 text-xs text-muted-foreground">
                  By {selectedReview?.user_name} for {selectedReview?.hotel_name}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedReview && rejectReview(selectedReview.id)}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Reject Review
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ReviewModeration;
