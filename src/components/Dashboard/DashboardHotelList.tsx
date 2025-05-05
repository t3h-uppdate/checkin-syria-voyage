
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Hotel as HotelType } from '@/types';
import EditHotelForm from './EditHotelForm';
import DashboardEmpty from './DashboardEmpty';
import { Bed, Edit, Eye, Loader2, MapPin, Star, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DashboardHotelListProps {
  onSelectHotelForRooms: (hotel: HotelType) => void;
}

const DashboardHotelList: React.FC<DashboardHotelListProps> = ({ onSelectHotelForRooms }) => {
  const { user } = useAuth();
  const [hotels, setHotels] = useState<HotelType[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch hotels directly when component mounts or user changes
  useEffect(() => {
    const fetchHotels = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching hotels for user ID:", user.id);
        
        const { data: supabaseData, error } = await supabase
          .from('hotels')
          .select('*')
          .eq('owner_id', user.id);

        if (error) {
          console.error('Error fetching hotels:', error);
          setError(error.message);
          toast.error('Could not fetch hotels. Please try again later.');
          return;
        }

        console.log("Hotels fetched:", supabaseData);
        
        const mappedData: HotelType[] = supabaseData?.map((hotel: any) => ({
          id: hotel.id,
          name: hotel.name,
          description: hotel.description,
          address: hotel.address || '',
          city: hotel.city,
          country: hotel.country,
          phoneNumber: hotel.phone_number || '',
          email: hotel.email,
          website: hotel.website,
          images: hotel.images || [],
          rating: hotel.rating || 0,
          reviewCount: hotel.review_count || 0,
          amenities: hotel.amenities || [],
          latitude: hotel.latitude || 0,
          longitude: hotel.longitude || 0,
          featuredImage: hotel.featured_image || '/placeholder.svg',
          pricePerNight: hotel.price_per_night || 0,
          featured: hotel.featured || false,
          ownerId: hotel.owner_id,
        })) || [];

        setHotels(mappedData);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [user?.id]);

  const handleUpdateHotel = async (updatedHotel: HotelType) => {
    try {
      const { error } = await supabase
        .from('hotels')
        .update({
          name: updatedHotel.name,
          description: updatedHotel.description,
          address: updatedHotel.address,
          city: updatedHotel.city,
          country: updatedHotel.country,
          phone_number: updatedHotel.phoneNumber,
          email: updatedHotel.email,
          website: updatedHotel.website,
          featured_image: updatedHotel.featuredImage,
          price_per_night: updatedHotel.pricePerNight,
          amenities: updatedHotel.amenities,
        })
        .eq('id', updatedHotel.id);

      if (error) throw error;

      const updatedHotels = hotels?.map(hotel =>
        hotel.id === updatedHotel.id ? updatedHotel : hotel
      ) || [];
      
      setHotels(updatedHotels);
      toast.success('Hotel has been updated');
    } catch (error) {
      console.error('Error updating hotel:', error);
      toast.error('Could not update hotel');
    }
  };

  const handleDeleteHotel = async (hotelId: string) => {
    try {
      const { error } = await supabase
        .from('hotels')
        .delete()
        .eq('id', hotelId);

      if (error) throw error;

      setHotels(hotels?.filter(hotel => hotel.id !== hotelId) || []);
      toast.success('Hotel has been removed');
    } catch (error) {
      console.error('Error deleting hotel:', error);
      toast.error('Could not remove hotel');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8 bg-red-50 rounded-lg border border-red-200">
        <p className="font-medium">An error occurred while fetching hotels</p>
        <p className="text-sm">Please try again later</p>
      </div>
    );
  }

  if (!hotels?.length) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>My Hotels</CardTitle>
          <CardDescription>You don't have any hotels assigned to you yet</CardDescription>
        </CardHeader>
        <CardContent>
          <DashboardEmpty />
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <Card className="mb-6 shadow-md">
        <CardHeader className="bg-muted/40">
          <CardTitle>My Hotels</CardTitle>
          <CardDescription>Manage your hotel properties</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 gap-px bg-border">
            {hotels.map((hotel) => (
              <div key={hotel.id} className="bg-card p-4 lg:p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Hotel Image */}
                  <div className="md:w-1/4 h-48 overflow-hidden rounded-lg">
                    <img
                      src={hotel.featuredImage || '/placeholder.svg'}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Hotel Details */}
                  <div className="md:w-2/4 flex flex-col">
                    <h3 className="text-xl font-semibold mb-2">{hotel.name}</h3>
                    <div className="flex items-center gap-1 text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4" />
                      <span>{hotel.city}, {hotel.country}</span>
                    </div>
                    
                    <div className="flex items-center mb-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="ml-1 text-sm">{hotel.rating.toFixed(1)}</span>
                      <span className="ml-1 text-xs text-muted-foreground">({hotel.reviewCount} reviews)</span>
                      <Badge variant="outline" className="ml-2 bg-muted/50">
                        ${hotel.pricePerNight}/night
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{hotel.description}</p>
                    
                    <div className="flex flex-wrap gap-1 mt-1">
                      {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {hotel.amenities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{hotel.amenities.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="md:w-1/4 flex flex-col justify-center gap-2">
                    <Button 
                      variant="outline"
                      size="sm" 
                      className="w-full flex items-center justify-center gap-2"
                      onClick={() => onSelectHotelForRooms(hotel)}
                    >
                      <Bed className="h-4 w-4" />
                      <span>Manage Rooms</span>
                    </Button>
                    
                    <EditHotelForm hotel={hotel} onUpdate={handleUpdateHotel} />
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="w-full flex items-center justify-center gap-2">
                          <Trash2 className="h-4 w-4" />
                          <span>Remove</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Hotel</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove "{hotel.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteHotel(hotel.id)}>
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHotelList;
