
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Eye, PlusCircle, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

type Hotel = {
  id: string;
  name: string;
  description: string;
  city: string;
  country: string;
  rating: number;
  price_per_night: number;
  featured_image: string;
};

interface DashboardHotelListProps {
  hotels: Hotel[];
}

const DashboardHotelList = ({ hotels }: DashboardHotelListProps) => {
  const [localHotels, setLocalHotels] = useState<Hotel[]>(hotels);

  const handleDeleteHotel = async (hotelId: string) => {
    try {
      const { error } = await supabase
        .from('hotels')
        .delete()
        .eq('id', hotelId);

      if (error) throw error;

      // Update local state
      setLocalHotels(localHotels.filter(hotel => hotel.id !== hotelId));
      toast.success('Hotellet har tagits bort');
    } catch (error) {
      console.error('Error deleting hotel:', error);
      toast.error('Kunde inte ta bort hotellet');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Dina Hotell</h2>
        <Button asChild>
          <Link to="/dashboard/hotels/new" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Lägg till nytt hotell</span>
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {localHotels.map((hotel) => (
          <Card key={hotel.id} className="overflow-hidden">
            <div className="h-48 overflow-hidden">
              <img 
                src={hotel.featured_image || '/placeholder.svg'} 
                alt={hotel.name} 
                className="w-full h-full object-cover transition-transform hover:scale-105"
              />
            </div>
            <CardHeader>
              <CardTitle>{hotel.name}</CardTitle>
              <CardDescription>{hotel.city}, {hotel.country}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 line-clamp-2">{hotel.description}</p>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-yellow-500 mr-1">★</span>
                  <span>{hotel.rating.toFixed(1)}</span>
                </div>
                <div className="font-medium">
                  {hotel.price_per_night} SEK / natt
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Edit className="h-4 w-4" />
                    <span>Redigera</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Redigera hotell</DialogTitle>
                    <DialogDescription>
                      Redigera information för {hotel.name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p>Redigeringsfunktionen är under utveckling</p>
                  </div>
                  <DialogFooter>
                    <Button type="button">Spara ändringar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/hotels/${hotel.id}`} className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>Visa</span>
                  </Link>
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
                      <AlertDialogTitle>Är du säker?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Detta kommer permanent ta bort {hotel.name} och all dess data. Denna åtgärd kan inte ångras.
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
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardHotelList;
