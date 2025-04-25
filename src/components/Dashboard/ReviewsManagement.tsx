
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Hotel } from "@/types";
import { Star, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ReviewsManagementProps {
  hotel: Hotel | null;
}

interface Review {
  id: string;
  guestName: string;
  rating: number;
  comment: string;
  date: string;
  response?: string;
}

const ReviewsManagement = ({ hotel }: ReviewsManagementProps) => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      guestName: 'Anna Andersson',
      rating: 4,
      comment: 'Mycket trevligt hotell med bra service!',
      date: '2024-04-20',
      response: 'Tack för din fina recension, Anna!'
    },
    {
      id: '2',
      guestName: 'Erik Eriksson',
      rating: 5,
      comment: 'Perfekt läge och fantastisk frukost.',
      date: '2024-04-18'
    }
  ]);

  if (!hotel) {
    return (
      <div className="p-8 bg-muted rounded-lg text-center border-2 border-dashed border-muted">
        <Star className="h-12 w-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-medium mb-2">Recensionshantering</h3>
        <p className="text-muted-foreground">Välj ett hotell först för att hantera recensioner.</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recensioner för {hotel.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{review.guestName}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {review.date}
                      </span>
                    </div>
                    <p className="text-sm mb-4">{review.comment}</p>
                    
                    {review.response ? (
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm font-medium mb-1">Ditt svar:</p>
                        <p className="text-sm">{review.response}</p>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Skriv ett svar..."
                          className="text-sm"
                        />
                        <Button className="self-start">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Svara
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewsManagement;
