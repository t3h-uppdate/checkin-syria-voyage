
import React, { useState } from 'react';
import { Room } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, PlusCircle, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from '@/components/ui/sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const roomSchema = z.object({
  name: z.string().min(2, { message: 'Room name must be at least 2 characters' }),
  description: z.string().min(5, { message: 'Description must be at least 5 characters' }),
  bedType: z.string().min(1, { message: 'Bed type is required' }),
  capacity: z.number().min(1, { message: 'Capacity must be at least 1' }).max(10, { message: 'Maximum capacity is 10' }),
  size: z.number().min(1, { message: 'Size must be at least 1' }),
  price: z.number().min(1, { message: 'Price must be positive' }),
  available: z.boolean().default(true),
});

type RoomFormValues = z.infer<typeof roomSchema>;

interface EditRoomFormProps {
  room: Room;
  onSuccess: () => void;
  hotelId: string;
}

const EditRoomForm: React.FC<EditRoomFormProps> = ({ room, onSuccess, hotelId }) => {
  const [imageUrls, setImageUrls] = useState<string[]>(room.images || []);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [amenities, setAmenities] = useState<string[]>(room.amenities || []);
  const [newAmenity, setNewAmenity] = useState('');
  const queryClient = useQueryClient();
  
  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      name: room.name,
      description: room.description,
      bedType: room.bedType,
      capacity: room.capacity,
      size: room.size,
      price: room.price,
      available: room.available
    },
  });

  const updateRoomMutation = useMutation({
    mutationFn: async (updatedData: RoomFormValues & { images: string[], amenities: string[] }) => {
      const { error } = await supabase
        .from('rooms')
        .update({
          name: updatedData.name,
          description: updatedData.description,
          price: updatedData.price,
          images: updatedData.images,
          capacity: updatedData.capacity,
          bed_type: updatedData.bedType,
          size: updatedData.size,
          amenities: updatedData.amenities,
          available: updatedData.available,
        })
        .eq('id', room.id);

      if (error) {
        console.error('Error updating room:', error);
        throw new Error('Failed to update room');
      }
    },
    onSuccess: () => {
      toast.success('Room updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['hotel-rooms', hotelId] });
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Error updating room: ${error.message}`);
    },
  });

  const onSubmit = (values: RoomFormValues) => {
    updateRoomMutation.mutate({
      ...values,
      images: imageUrls,
      amenities: amenities,
    });
  };

  const addImageUrl = () => {
    if (newImageUrl.trim() && !imageUrls.includes(newImageUrl)) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity)) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity('');
    }
  };

  const removeAmenity = (index: number) => {
    setAmenities(amenities.filter((_, i) => i !== index));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room Name</FormLabel>
                <FormControl>
                  <Input placeholder="Deluxe Suite" {...field} />
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
                  <Input 
                    type="number" 
                    placeholder="1000" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
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
                    <SelectTrigger>
                      <SelectValue placeholder="Select a bed type" />
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
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacity (guests)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="2" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
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
                  <Input 
                    type="number" 
                    placeholder="30" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
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
                  <FormLabel>Availability</FormLabel>
                  <FormDescription>
                    Set whether this room is currently available for booking
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
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
                  placeholder="A spacious room with a beautiful view..." 
                  className="min-h-[100px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Room Images Section */}
        <div className="space-y-2">
          <Label>Room Images</Label>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                placeholder="https://example.com/image.jpg"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
              />
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addImageUrl}
              className="flex items-center gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add</span>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            {imageUrls.map((url, index) => (
              <div
                key={index}
                className="flex items-center gap-2 border rounded-md p-2 group"
              >
                <div className="w-16 h-16 bg-muted rounded overflow-hidden">
                  <img
                    src={url}
                    alt={`Room image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://placehold.co/100?text=Error';
                    }}
                  />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm truncate">{url}</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => removeImageUrl(index)}
                  className="opacity-0 group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Room Amenities Section */}
        <div className="space-y-2">
          <Label>Room Amenities</Label>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                placeholder="WiFi"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
              />
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addAmenity}
              className="flex items-center gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add</span>
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {amenities.map((amenity, index) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-muted/50 rounded-md py-1 px-2 text-sm"
              >
                <span>{amenity}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-4 w-4 p-0"
                  onClick={() => removeAmenity(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            disabled={updateRoomMutation.isPending}
            className="flex items-center gap-2"
          >
            {updateRoomMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditRoomForm;
