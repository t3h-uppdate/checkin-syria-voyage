
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from "@/components/ui/textarea";
import { Hotel, Room } from '@/types';
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Loader2, Plus, Bed, Edit, X, Check, Image, Ruler } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AddRoomForm } from './AddRoomForm';
import { RoomDetails } from './RoomDetails';
import { useHotelRooms } from '@/hooks/useHotelRooms';

interface RoomManagementProps {
  hotel: Hotel;
}

const RoomManagement: React.FC<RoomManagementProps> = ({ hotel }) => {
  const queryClient = useQueryClient();
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [filterAvailable, setFilterAvailable] = useState<boolean | null>(null);
  const [sortField, setSortField] = useState<keyof Room | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  // Use the custom hook to fetch rooms
  const { data: rooms, isLoading, error } = useHotelRooms(hotel.id);

  // Mutation for updating a room
  const updateRoomMutation = useMutation({
    mutationFn: async (updatedRoom: Room) => {
      const { error } = await supabase
        .from('rooms')
        .update({
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
      queryClient.invalidateQueries({ queryKey: ['hotel-rooms', hotel.id] });
      setEditingRoom(null);
    },
    onError: (error) => {
      toast.error(`Error updating room: ${error.message}`);
    },
  });

  // Mutation for deleting a room
  const deleteRoomMutation = useMutation({
    mutationFn: async (roomId: string) => {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId);

      if (error) {
        console.error('Error deleting room:', error);
        throw new Error('Failed to delete room');
      }
    },
    onSuccess: () => {
      toast.success('Room deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['hotel-rooms', hotel.id] });
    },
    onError: (error) => {
      toast.error(`Error deleting room: ${error.message}`);
    },
  });

  // Handler for edit button
  const handleEdit = (room: Room) => {
    setEditingRoom({ ...room });
  };

  // Handler for save button
  const handleSave = () => {
    if (!editingRoom) return;
    updateRoomMutation.mutate(editingRoom);
  };

  // Handler for cancel button
  const handleCancel = () => {
    setEditingRoom(null);
  };

  // Handler for delete button
  const handleDelete = (roomId: string) => {
    deleteRoomMutation.mutate(roomId);
  };

  // Handler for input change
  const handleInputChange = (field: keyof Room, value: string | number | boolean) => {
    if (editingRoom) {
      setEditingRoom({ ...editingRoom, [field]: value });
    }
  };

  // Handler for view room details
  const handleViewRoom = (room: Room) => {
    setViewingRoom(room);
  };

  // Filter and sort rooms
  const filteredAndSortedRooms = React.useMemo(() => {
    if (!rooms) return [];
    
    let filtered = [...rooms];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(room => 
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.bedType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply availability filter
    if (filterAvailable !== null) {
      filtered = filtered.filter(room => room.available === filterAvailable);
    }
    
    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        // Handle different types of fields
        const valueA = a[sortField];
        const valueB = b[sortField];
        
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return sortDirection === 'asc' 
            ? valueA.localeCompare(valueB) 
            : valueB.localeCompare(valueA);
        }
        
        if (typeof valueA === 'number' && typeof valueB === 'number') {
          return sortDirection === 'asc' 
            ? valueA - valueB 
            : valueB - valueA;
        }
        
        if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
          return sortDirection === 'asc' 
            ? (valueA ? 1 : -1) 
            : (valueA ? -1 : 1);
        }
        
        return 0;
      });
    }
    
    return filtered;
  }, [rooms, searchTerm, filterAvailable, sortField, sortDirection]);
  
  // Toggle sort direction and field
  const handleSort = (field: keyof Room) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterAvailable(null);
    setSortField(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bed className="h-5 w-5" />
              Manage Rooms for {hotel.name}
            </CardTitle>
            <CardDescription>
              Add, edit, and manage room information and availability
            </CardDescription>
          </div>
          <Dialog open={isAddingRoom} onOpenChange={setIsAddingRoom}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Room
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Room</DialogTitle>
                <DialogDescription>
                  Fill out the details to add a new room to {hotel.name}
                </DialogDescription>
              </DialogHeader>
              <AddRoomForm 
                hotelId={hotel.id} 
                onSuccess={() => {
                  setIsAddingRoom(false);
                  queryClient.invalidateQueries({ queryKey: ['hotel-rooms', hotel.id] });
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
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
          <>
            {/* Filter and search section */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Search rooms by name, description or bed type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Select 
                  value={filterAvailable === null ? '' : filterAvailable.toString()}
                  onValueChange={(value) => {
                    if (value === '') setFilterAvailable(null);
                    else setFilterAvailable(value === 'true');
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All rooms</SelectItem>
                    <SelectItem value="true">Available</SelectItem>
                    <SelectItem value="false">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={resetFilters} size="sm">
                  Reset
                </Button>
              </div>
            </div>

            {/* Rooms table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('name')}
                    >
                      Room Name
                      {sortField === 'name' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('capacity')}
                    >
                      Capacity
                      {sortField === 'capacity' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </TableHead>
                    <TableHead>Bed Type</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('price')}
                    >
                      Price (kr)
                      {sortField === 'price' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('available')}
                    >
                      Available
                      {sortField === 'available' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedRooms.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        {searchTerm || filterAvailable !== null ? 
                          'No rooms match your filters.' : 
                          'No rooms found for this hotel yet.'}
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredAndSortedRooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell>
                        {editingRoom?.id === room.id ? (
                          <Input
                            value={editingRoom.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="w-full"
                          />
                        ) : (
                          <div className="font-medium">{room.name}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRoom?.id === room.id ? (
                          <Input
                            type="number"
                            value={editingRoom.capacity}
                            onChange={(e) => handleInputChange('capacity', Number(e.target.value))}
                            className="w-16"
                          />
                        ) : (
                          <div className="flex items-center gap-1">
                            {room.capacity} <span className="text-muted-foreground">guests</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRoom?.id === room.id ? (
                          <Select 
                            value={editingRoom.bedType}
                            onValueChange={(value) => handleInputChange('bedType', value)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue placeholder="Select bed type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Single">Single</SelectItem>
                              <SelectItem value="Double">Double</SelectItem>
                              <SelectItem value="Queen">Queen</SelectItem>
                              <SelectItem value="King">King</SelectItem>
                              <SelectItem value="Twin">Twin</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          room.bedType
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRoom?.id === room.id ? (
                          <Input
                            type="number"
                            value={editingRoom.price}
                            onChange={(e) => handleInputChange('price', Number(e.target.value))}
                            className="w-24"
                          />
                        ) : (
                          `${room.price} kr`
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
                              disabled={updateRoomMutation.isPending}
                              className="flex items-center gap-1"
                            >
                              {updateRoomMutation.isPending ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                              <span>Save</span>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={handleCancel} 
                              disabled={updateRoomMutation.isPending}
                              className="flex items-center gap-1"
                            >
                              <X className="h-3 w-3" />
                              <span>Cancel</span>
                            </Button>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            <Dialog open={viewingRoom?.id === room.id} onOpenChange={(open) => !open && setViewingRoom(null)}>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleViewRoom(room)}
                                >
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                  <DialogTitle>Room Details</DialogTitle>
                                </DialogHeader>
                                <RoomDetails room={room} />
                              </DialogContent>
                            </Dialog>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleEdit(room)}
                              className="flex items-center gap-1"
                            >
                              <Edit className="h-3 w-3" />
                              <span>Edit</span>
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  className="flex items-center gap-1"
                                >
                                  <X className="h-3 w-3" />
                                  <span>Delete</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Confirm Deletion</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to delete the room "{room.name}"? This action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                  </DialogClose>
                                  <Button 
                                    variant="destructive" 
                                    onClick={() => handleDelete(room.id)}
                                    disabled={deleteRoomMutation.isPending}
                                  >
                                    {deleteRoomMutation.isPending && (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Delete Room
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RoomManagement;
