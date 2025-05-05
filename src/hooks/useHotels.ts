
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Hotel } from '@/types';

export const useHotels = (options?: { featured?: boolean; ownerId?: string }) => {
  return useQuery({
    queryKey: ['hotels', options],
    queryFn: async () => {
      try {
        let query = supabase.from('hotels').select('*');
        
        if (options?.featured !== undefined) {
          query = query.eq('featured', options.featured);
        }
        
        if (options?.ownerId) {
          query = query.eq('owner_id', options.ownerId);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching hotels:', error);
          throw error;
        }
        
        // Map the snake_case database fields to camelCase for our TypeScript types
        return (data || []).map(hotel => ({
          id: hotel.id,
          name: hotel.name,
          description: hotel.description,
          address: hotel.address || '',
          city: hotel.city,
          country: hotel.country,
          phoneNumber: hotel.phone_number,
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
          ownerId: hotel.owner_id
        })) as Hotel[];
      } catch (error) {
        console.error('Error in useHotels hook:', error);
        throw error;
      }
    },
  });
};
