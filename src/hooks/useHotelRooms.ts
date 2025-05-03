
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Room } from '@/types';

export const useHotelRooms = (hotelId: string) => {
  return useQuery({
    queryKey: ['hotel-rooms', hotelId],
    queryFn: async () => {
      if (!hotelId) {
        return [];
      }

      try {
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .eq('hotel_id', hotelId);

        if (error) {
          console.error('Error fetching hotel rooms:', error);
          throw error;
        }

        // Map the snake_case database fields to camelCase for our TypeScript types
        return (data || []).map(room => ({
          id: room.id,
          hotelId: room.hotel_id,
          name: room.name, 
          description: room.description,
          price: room.price,
          images: room.images || [],
          capacity: room.capacity,
          bedType: room.bed_type,
          size: room.size,
          amenities: room.amenities || [],
          available: room.available,
          createdAt: room.created_at,
        })) as Room[];
      } catch (error) {
        console.error('Error in useHotelRooms hook:', error);
        throw error;
      }
    },
    enabled: !!hotelId,
  });
};
