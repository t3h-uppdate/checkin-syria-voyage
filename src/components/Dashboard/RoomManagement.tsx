import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Hotel, Room } from '@/types'; // Assuming types are defined here
import { Switch } from "@/components/ui/switch"; // Import Switch
import { Badge } from "@/components/ui/badge"; // Import Badge
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // Import react-query hooks
import { supabase } from '@/integrations/supabase/client'; // Import supabase client
import { toast } from '@/components/ui/sonner'; // Import toast
import { Loader2 } from 'lucide-react'; // Import Loader icon

interface RoomManagementProps {
  hotel: Hotel; // Assuming the selected hotel is passed as a prop
}

const RoomManagement: React.FC<RoomManagementProps> = ({ hotel }) => {
  const queryClient = useQueryClient(); // Get query client instance
  const [editingRoom, setEditingRoom] = useState<Room | null>(null); // Use useState directly

  // Fetch rooms for the selected hotel using useQuery
  const { data: rooms, isLoading, error } = useQuery<Room[], Error>({
    queryKey: ['hotel-rooms', hotel.id], // Unique query key per hotel
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('hotel_id', hotel.id);

      if (error) {
        console.error('Error fetching rooms:', error);
        throw new Error('Failed to fetch rooms');
      }

      // Map Supabase data (snake_case) to Room type (camelCase)
      const mappedData: Room[] = data?.map((room: any) => ({
        id: room.id,
        hotelId: room.hotel_id, // Map snake_case to camelCase
        name: room.name,
        description: room.description,
        price: room.price,
        images: room.images || [],
        capacity: room.capacity,
        bedType: room.bed_type, // Map snake_case to camelCase
        size: room.size,
        amenities: room.amenities || [],
        available: room.available,
        // Note: created_at is in the DB schema but not in the Room type, so we omit it.
      })) || [];

      return mappedData;
    },
    enabled: !!hotel.id, // Only run query if hotel.id is available
  });

  // Mutation for updating a room
  const updateRoomMutation = useMutation({
    mutationFn: async (updatedRoom: Room) => {
      const { error } = await supabase
        .from('rooms')
        .update({
          // Map back to snake_case for Supabase
          name: updatedRoom.name,
          description: updatedRoom.description,
          price: updatedRoom.price,
          images: updatedRoom.images,
          capacity: updatedRoom.capacity,
          bed_type: updatedRoom.bedType,
          size: updatedRoom.size,
          amenities: updatedRoom.amenities,
          available: updatedRoom.available,
        })
        .eq('id', updatedRoom.id);

      if (error) {
        console.error('Error updating room:', error);
        throw new Error('Failed to update room');
      }
    },
    onSuccess: () => {
      toast.success('Room updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['hotel-rooms', hotel.id] }); // Refetch rooms on success
      setEditingRoom(null); // Exit edit mode
    },
    onError: (error) => {
      toast.error(`Error updating room: ${error.message}`);
    },
  });

  const handleEdit = (room: Room) => {
    setEditingRoom({ ...room }); // Create a copy for editing
  };

  const handleSave = () => { // No need for roomId argument anymore
    if (!editingRoom) return;
    updateRoomMutation.mutate(editingRoom); // Call the mutation with the edited room data
  };

  const handleCancel = () => {
    setEditingRoom(null);
  };

  // Update handler to accept boolean for 'available' field
  const handleInputChange = (field: keyof Room, value: string | number | boolean) => {
    if (editingRoom) {
      setEditingRoom({ ...editingRoom, [field]: value });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Rooms for {hotel.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {error && (
          <div className="text-center text-red-500 py-8">
            Error loading rooms: {error.message}
          </div>
        )}
        {!isLoading && !error && rooms && (
          <Table>
            <TableHeader>
              <TableRow>
              <TableHead>Room Name</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Bed Type</TableHead>
              <TableHead>Price ($)</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
            <TableBody>
              {rooms.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No rooms found for this hotel yet.
                  </TableCell>
                </TableRow>
              )}
              {rooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell>{room.name}</TableCell>
                <TableCell>{room.capacity}</TableCell>
                <TableCell>{room.bedType}</TableCell>
                <TableCell>
                  {editingRoom?.id === room.id ? (
                    <Input
                      type="number"
                      value={editingRoom.price}
                      onChange={(e) => handleInputChange('price', Number(e.target.value))}
                      className="w-24"
                    />
                  ) : (
                    `$${room.price}`
                  )}
                </TableCell>
                <TableCell>
                  {editingRoom?.id === room.id ? (
                    <Switch
                      checked={editingRoom.available}
                      onCheckedChange={(checked) => handleInputChange('available', checked)}
                    />
                  ) : (
                    <Badge variant={room.available ? "default" : "destructive"}>
                      {room.available ? 'Yes' : 'No'}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {editingRoom?.id === room.id ? (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={updateRoomMutation.isPending} // Disable button while saving
                      >
                        {updateRoomMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel} disabled={updateRoomMutation.isPending}>Cancel</Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleEdit(room)}>Edit</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
        {/* TODO: Add functionality to add a new room */}
        {/* <div className="mt-4">
          <Button>Add New Room</Button>
        </div> */}
      </CardContent>
    </Card>
  );
};

export default RoomManagement;
