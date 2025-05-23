
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
import { Bed, Loader2, MapPin, Star, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useHotels } from '@/hooks/useHotels';
import { useTranslation } from 'react-i18next';

interface DashboardHotelListProps {
  onSelectHotelForRooms: (hotel: HotelType) => void;
}

const DashboardHotelList: React.FC<DashboardHotelListProps> = ({ onSelectHotelForRooms }) => {
  const { user } = useAuth();
  const { data: hotels, isLoading, isError } = useHotels({ ownerId: user?.id });
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleUpdateHotel = async (updatedHotel: HotelType) => {
    try {
      setLoading(true);
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
      
      toast.success('Hotel has been updated successfully');
    } catch (error) {
      console.error('Error updating hotel:', error);
      toast.error('Could not update hotel');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHotel = async (hotelId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('hotels')
        .delete()
        .eq('id', hotelId);

      if (error) throw error;
      toast.success('Hotel has been removed successfully');
    } catch (error) {
      console.error('Error deleting hotel:', error);
      toast.error('Could not remove hotel');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 py-8 bg-red-50 rounded-lg border border-red-200">
        <p className="font-medium">{t('dashboard.errors.fetchingHotels')}</p>
        <p className="text-sm">{t('dashboard.errors.tryAgain')}</p>
      </div>
    );
  }

  if (!hotels?.length) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>{t('dashboard.myHotels')}</CardTitle>
          <CardDescription>{t('dashboard.noHotelsAssigned')}</CardDescription>
        </CardHeader>
        <CardContent>
          <DashboardEmpty />
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <Card className="shadow-md overflow-hidden">
        <CardHeader className="bg-muted/40 border-b">
          <CardTitle>{t('dashboard.myHotels')}</CardTitle>
          <CardDescription>{t('dashboard.manageHotels')}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {hotels.map((hotel) => (
              <div key={hotel.id} className="p-4 md:p-6 hover:bg-muted/20 transition-colors">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Hotel Image */}
                  <div className="md:w-1/4 h-48 overflow-hidden rounded-lg">
                    <img
                      src={hotel.featuredImage || '/placeholder.svg'}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
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
                    
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-3">{hotel.description}</p>
                    
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
                      variant="default"
                      size="sm" 
                      className="w-full flex items-center justify-center gap-2"
                      onClick={() => onSelectHotelForRooms(hotel)}
                    >
                      <Bed className="h-4 w-4" />
                      <span>{t('dashboard.actions.manageRooms')}</span>
                    </Button>
                    
                    <EditHotelForm hotel={hotel} onUpdate={handleUpdateHotel} />
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="w-full flex items-center justify-center gap-2">
                          <Trash2 className="h-4 w-4" />
                          <span>{t('dashboard.actions.remove')}</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('dashboard.actions.removeHotel')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('dashboard.actions.removeConfirm')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteHotel(hotel.id)}>
                            {t('dashboard.actions.remove')}
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
