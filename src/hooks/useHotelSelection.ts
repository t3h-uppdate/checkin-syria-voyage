
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHotels } from '@/hooks/useHotels';
import { Hotel } from '@/types';
import { toast } from 'sonner';

export const useHotelSelection = () => {
  const { user } = useAuth();
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  
  const { data: hotels = [], isLoading, error } = useHotels({ 
    ownerId: user?.id
  });

  useEffect(() => {
    // Auto-select the only hotel if the user only has one
    if (hotels.length === 1 && !selectedHotel) {
      setSelectedHotel(hotels[0]);
    }
  }, [hotels, selectedHotel]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to load hotels");
      console.error("Error loading hotels:", error);
    }
  }, [error]);

  return {
    hotels,
    selectedHotel,
    setSelectedHotel,
    isLoading,
    isMultipleHotels: hotels.length > 1,
    hasSingleHotel: hotels.length === 1,
    hasNoHotels: hotels.length === 0
  };
};
