
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Eye, PlusCircle, Trash2, BarChart, Loader2, Hotel as HotelIcon, Bed, Star, MapPin } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Hotel as HotelType } from '@/types';
import EditHotelForm from './EditHotelForm';

interface DashboardHotelListProps {
  onSelectHotelForRooms: (hotel: HotelType) => void;
}

const DashboardHotelList: React.FC<DashboardHotelListProps> = ({ onSelectHotelForRooms }) => {
  const { user } = useAuth();
  const [hotels, setHotels] = useState<HotelType[] | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['owner-hotels', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data: supabaseData, error } = await supabase
        .from('hotels')
        .select('*')
        .eq('owner_id', user.id);

      if (error) {
        console.error('Error fetching hotels:', error);
        throw error;
      }

      const mappedData: HotelType[] = supabaseData?.map((hotel: any) => ({
        id: hotel.id,
        name: hotel.name,
        description: hotel.description,
        address: hotel.address,
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
        featured: hotel.featured,
        ownerId: hotel.owner_id,
      })) || [];

      return mappedData;
    },
    enabled: !!user?.id,
    meta: {
      onSuccess: (data) => {
        setHotels(data);
      }
    }
  });

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

      refetch();
      toast.success('Hotellet har tagits bort');
    } catch (error) {
      console.error('Error deleting hotel:', error);
      toast.error('Kunde inte ta bort hotellet');
    }
  };

  if (isLoading) {
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
    return (
      <div className="text-center py-16 px-4 bg-muted/50 rounded-lg border-2 border-dashed border-muted">
        <div className="mx-auto w-16 h-16 bg-primary/10 flex items-center justify-center rounded-full mb-4">
          <HotelIcon className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-medium mb-2">Välkommen till din hotellportal</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Börja genom att lägga till ditt första hotell. Här kan du hantera alla dina hotell, bokningar och gästinformation på ett enkelt sätt.
        </p>
        <Button asChild size="lg" className="gap-2">
          <Link to="/dashboard/hotels/new">
            <PlusCircle className="h-5 w-5" />
            <span>Lägg till ditt första hotell</span>
          </Link>
        </Button>
      </div>
    );
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
        {hotels?.map((hotel) => (
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
              <EditHotelForm hotel={hotel} onUpdate={handleUpdateHotel} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardHotelList;
