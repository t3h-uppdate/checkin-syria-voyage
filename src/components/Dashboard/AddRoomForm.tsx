
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Image, Ruler, Bed } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface AddRoomFormProps {
  hotelId: string;
  onSuccess: () => void;
}

// Form schema validation
const roomSchema = z.object({
  name: z.string().min(2, { message: 'Room name is required and must be at least 2 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  price: z.coerce.number().positive({ message: 'Price must be a positive number' }),
  capacity: z.coerce.number().int().positive({ message: 'Capacity must be a positive integer' }),
  bedType: z.string({ required_error: 'Please select a bed type' }),
  size: z.coerce.number().positive({ message: 'Size must be a positive number' }),
  featuredImage: z.string().url({ message: 'Please enter a valid image URL' }).optional(),
  available: z.boolean().default(true),
  amenities: z.array(z.string()).default([])
});

type RoomFormValues = z.infer<typeof roomSchema>;

export function AddRoomForm({ hotelId, onSuccess }: AddRoomFormProps) {
  // List of common room amenities
  const commonAmenities = [
    'Air Conditioning',
    'Free Wi-Fi',
    'TV',
    'Mini Bar',
    'Coffee Machine',
    'Safe',
    'Desk',
    'Bathtub',
    'Shower',
    'Hairdryer',
    'Ironing Board',
  ];
  
  // Setup form with default values
  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      capacity: 1,
      bedType: 'Double',
      size: 0,
      featuredImage: 'https://placehold.co/600x400?text=Room+Image',
      available: true,
      amenities: ['Free Wi-Fi', 'TV']
    },
  });

  // Mutation to add a new room
  const addRoomMutation = useMutation({
    mutationFn: async (data: RoomFormValues) => {
      // Prepare images array with the featured image
      const images = data.featuredImage ? [data.featuredImage] : [];
      
      const { error } = await supabase
        .from('rooms')
        .insert({
          hotel_id: hotelId,
          name: data.name,
          description: data.description,
          price: data.price,
          capacity: data.capacity,
          bed_type: data.bedType,
          size: data.size,
          images: images,
          amenities: data.amenities,
          available: data.available,
        });

      if (error) {
        console.error('Error adding room:', error);
        throw new Error('Failed to add room');
      }
    },
    onSuccess: () => {
      toast.success('Room added successfully!');
      form.reset();
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Error adding room: ${error.message}`);
    },
  });

  // Form submit handler
  const onSubmit = (data: RoomFormValues) => {
    addRoomMutation.mutate(data);
  };

  // Toggle amenity in the array
  const toggleAmenity = (amenity: string, currentAmenities: string[]) => {
    if (currentAmenities.includes(amenity)) {
      return currentAmenities.filter(a => a !== amenity);
    } else {
      return [...currentAmenities, amenity];
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room Name</FormLabel>
                <FormControl>
                  <Input placeholder="Deluxe Room" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price per Night (kr)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacity (guests)</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="bedType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bed Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <div className="flex items-center gap-2">
                        <Bed className="h-4 w-4" />
                        <SelectValue placeholder="Select bed type" />
                      </div>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="Double">Double</SelectItem>
                    <SelectItem value="Queen">Queen</SelectItem>
                    <SelectItem value="King">King</SelectItem>
                    <SelectItem value="Twin">Twin</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room Size (m²)</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <Ruler className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input type="number" min="1" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="featuredImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Featured Image URL</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <Image className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input {...field} />
                  </div>
                </FormControl>
                <FormDescription>
                  URL to the main image for this room
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="available"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Available for Booking</FormLabel>
                  <FormDescription>
                    Mark this room as available for guests to book
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the room and its features..." 
                  className="min-h-[120px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amenities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room Amenities</FormLabel>
              <FormDescription>
                Select all amenities available in this room
              </FormDescription>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {commonAmenities.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Switch
                      id={`amenity-${amenity}`}
                      checked={field.value.includes(amenity)}
                      onCheckedChange={() => {
                        const updatedAmenities = toggleAmenity(amenity, field.value);
                        field.onChange(updatedAmenities);
                      }}
                    />
                    <label
                      htmlFor={`amenity-${amenity}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {amenity}
                    </label>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={addRoomMutation.isPending}>
            {addRoomMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Add Room
          </Button>
        </div>
      </form>
    </Form>
  );
}
