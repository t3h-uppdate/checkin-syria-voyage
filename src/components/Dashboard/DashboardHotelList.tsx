
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Eye, PlusCircle, Trash2, BarChart, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const DashboardHotelList = () => {
  const { user } = useAuth();
  
  const { data: hotels, isLoading, error, refetch } = useQuery({
    queryKey: ['owner-hotels', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .eq('owner_id', user?.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

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
          <Hotel className="h-8 w-8 text-primary" />
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
        {hotels.map((hotel) => (
          <Card key={hotel.id} className="overflow-hidden">
            <div className="h-48 overflow-hidden">
              <img 
                src={hotel.featured_image || '/placeholder.svg'} 
                alt={hotel.name} 
                className="w-full h-full object-cover transition-transform hover:scale-105"
              />
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{hotel.name}</CardTitle>
                  <CardDescription>{hotel.city}, {hotel.country}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-yellow-500">
                    <span>★</span>
                    <span className="ml-1 text-sm">{hotel.rating.toFixed(1)}</span>
                  </div>
                  <div className="text-sm font-medium">
                    {hotel.price_per_night} kr
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">{hotel.description}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/dashboard/hotels/${hotel.id}/edit`} className="flex items-center gap-1">
                    <Edit className="h-4 w-4" />
                    <span>Redigera</span>
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/dashboard/hotels/${hotel.id}/stats`} className="flex items-center gap-1">
                    <BarChart className="h-4 w-4" />
                    <span>Statistik</span>
                  </Link>
                </Button>
              </div>

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
