import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Hotel, Room } from '@/types'; // Assuming types are defined here
import { Switch } from "@/components/ui/switch"; // Import Switch
import { Badge } from "@/components/ui/badge"; // Import Badge

// Mock room data for now - replace with actual data fetching
const mockRooms: Room[] = [
  { id: 'room1', hotelId: 'hotel1', name: 'Standard Double Room', description: 'A comfortable room with a double bed.', price: 120, images: ['/placeholder.svg'], capacity: 2, bedType: 'Double', size: 25, amenities: ['Wifi', 'TV', 'Air Conditioning'], available: true },
  { id: 'room2', hotelId: 'hotel1', name: 'Deluxe Suite', description: 'A luxurious suite with a king bed and city view.', price: 250, images: ['/placeholder.svg'], capacity: 2, bedType: 'King', size: 45, amenities: ['Wifi', 'TV', 'Air Conditioning', 'Mini Bar', 'Jacuzzi'], available: true },
  { id: 'room3', hotelId: 'hotel1', name: 'Family Room', description: 'Spacious room suitable for families.', price: 180, images: ['/placeholder.svg'], capacity: 4, bedType: 'Double + Twin', size: 35, amenities: ['Wifi', 'TV', 'Air Conditioning', 'Sofa Bed'], available: false },
];

interface RoomManagementProps {
  hotel: Hotel; // Assuming the selected hotel is passed as a prop
}

const RoomManagement: React.FC<RoomManagementProps> = ({ hotel }) => {
  // State for managing edits - simplified for now
  const [editingRoom, setEditingRoom] = React.useState<Room | null>(null);
  const [rooms, setRooms] = React.useState<Room[]>(mockRooms); // Use mock data initially

  // TODO: Fetch actual rooms for the hotel
  // useEffect(() => {
  //   // Fetch rooms based on hotel.id
  // }, [hotel.id]);

  const handleEdit = (room: Room) => {
    setEditingRoom({ ...room }); // Create a copy for editing
  };

  const handleSave = (roomId: string) => {
    if (!editingRoom) return;
    // TODO: Implement API call to save changes
    console.log('Saving changes for room:', roomId, editingRoom);
    // Update local state
    setRooms(rooms.map(r => r.id === roomId ? { ...editingRoom } : r));
    setEditingRoom(null); // Exit edit mode
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
                      <Button size="sm" onClick={() => handleSave(room.id)}>Save</Button>
                      <Button size="sm" variant="outline" onClick={handleCancel}>Cancel</Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleEdit(room)}>Edit</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* TODO: Add functionality to add a new room */}
        {/* <div className="mt-4">
          <Button>Add New Room</Button>
        </div> */}
      </CardContent>
    </Card>
  );
};

export default RoomManagement;
