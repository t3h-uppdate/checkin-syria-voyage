
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Hotel } from '@/types';

export const useHotels = (options?: { featured?: boolean }) => {
  return useQuery({
    queryKey: ['hotels', options],
    queryFn: async () => {
      let query = supabase.from('hotels').select('*');
      
      if (options?.featured !== undefined) {
        query = query.eq('featured', options.featured);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      // Map the snake_case database fields to camelCase for our TypeScript types
      return (data || []).map(hotel => ({
        id: hotel.id,
        name: hotel.name,
        description: hotel.description,
        address: hotel.address,
        city: hotel.city,
        country: hotel.country,
        phoneNumber: hotel.phone_number,
        email: hotel.email,
        website: hotel.website,
        images: hotel.images,
        rating: hotel.rating,
        reviewCount: hotel.review_count,
        amenities: hotel.amenities,
        latitude: hotel.latitude,
        longitude: hotel.longitude,
        featuredImage: hotel.featured_image,
        pricePerNight: hotel.price_per_night,
        featured: hotel.featured,
        ownerId: hotel.owner_id
      })) as Hotel[];
    },
  });
};
