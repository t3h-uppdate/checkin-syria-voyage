
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
      
      return data as Hotel[];
    },
  });
};
