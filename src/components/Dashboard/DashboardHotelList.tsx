import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Eye, PlusCircle, Trash2, BarChart, Loader2, Hotel as HotelIcon, Bed, Star, MapPin } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Hotel as HotelType } from '@/types';
import EditHotelForm from './EditHotelForm';
import DashboardEmpty from './DashboardEmpty';

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
          toast.error('Kunde inte hämta hotell. Försök igen senare.');
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
        setError('Ett oväntat fel uppstod');
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
      toast.success('Hotellet har uppdaterats');
    } catch (error) {
      console.error('Error updating hotel:', error);
      toast.error('Kunde inte uppdatera hotellet');
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
      toast.success('Hotellet har tagits bort');
    } catch (error) {
      console.error('Error deleting hotel:', error);
      toast.error('Kunde inte ta bort hotellet');
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
      <div className="text-center text-red-500 py-8">
        Ett fel uppstod när hotellen skulle hämtas. Försök igen senare.
      </div>
    );
  }

  if (!hotels?.length) {
    return <DashboardEmpty />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Dina Hotell</h2>
          <p className="text-muted-foreground">Hantera alla dina hotell från en plats</p>
        </div>
        <Button asChild>
          <Link to="/dashboard/hotels/new" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Lägg till nytt hotell</span>
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map((hotel) => (
          <Card key={hotel.id} className="overflow-hidden">
            <div className="h-48 overflow-hidden">
              <img
                src={hotel.featuredImage || '/placeholder.svg'}
                alt={hotel.name}
                className="w-full h-full object-cover transition-transform hover:scale-105"
              />
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{hotel.name}</CardTitle>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{hotel.city}, {hotel.country}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-yellow-500">
                    <Star className="h-4 w-4" />
                    <span className="ml-1 text-sm">{hotel.rating.toFixed(1)}</span>
                  </div>
                  <div className="text-sm font-medium">
                    {hotel.pricePerNight} kr
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Button 
                    variant="outline"
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => onSelectHotelForRooms(hotel)}
                  >
                    <Bed className="h-4 w-4" />
                    <span>Hantera Rum</span>
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="flex items-center gap-1">
                        <Trash2 className="h-4 w-4" />
                        <span>Ta bort</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Ta bort hotell</AlertDialogTitle>
                        <AlertDialogDescription>
                          Är du säker på att du vill ta bort "{hotel.name}"? Denna åtgärd kan inte ångras.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Avbryt</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteHotel(hotel.id)}>
                          Ta bort
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                
                <EditHotelForm hotel={hotel} onUpdate={handleUpdateHotel} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardHotelList;
