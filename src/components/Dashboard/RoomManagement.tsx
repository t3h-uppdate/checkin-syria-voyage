
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hotel, Room } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Loader2, Bed, LayoutGrid, LayoutList, Plus } from 'lucide-react';
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
import { useHotelRooms } from '@/hooks/useHotelRooms';
import { AddRoomForm } from './AddRoomForm';
import { RoomDetails } from './RoomDetails';
import RoomFilterBar from './RoomFilterBar';
import AdvancedRoomFilters from './AdvancedRoomFilters';
import RoomStatsCards from './RoomStatsCards';
import RoomGridView from './RoomGridView';
import RoomTableView from './RoomTableView';
import EditRoomForm from './EditRoomForm';

interface RoomManagementProps {
  hotel: Hotel;
}

const RoomManagement: React.FC<RoomManagementProps> = ({ hotel }) => {
  const queryClient = useQueryClient();
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [filterAvailable, setFilterAvailable] = useState<boolean | null>(null);
  const [sortField, setSortField] = useState<keyof Room | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filterBedType, setFilterBedType] = useState<string | null>(null);
  const [priceRangeFilter, setPriceRangeFilter] = useState<[number, number] | null>(null);
  const [capacityFilter, setCapacityFilter] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Use the custom hook to fetch rooms
  const { data: rooms, isLoading, error } = useHotelRooms(hotel.id);

  // Get unique bed types from rooms for the filter
  const uniqueBedTypes = React.useMemo(() => {
    if (!rooms) return [];
    const bedTypes = new Set<string>();
    rooms.forEach(room => {
      if (room.bedType) bedTypes.add(room.bedType);
    });
    return Array.from(bedTypes);
  }, [rooms]);

  // Get min and max price from rooms data
  const priceRange = React.useMemo(() => {
    if (!rooms || rooms.length === 0) return { min: 0, max: 5000 };
    let min = Math.min(...rooms.map(r => r.price));
    let max = Math.max(...rooms.map(r => r.price));
    return { min, max };
  }, [rooms]);

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
    setEditingRoom(room);
  };

  // Handler for delete button
  const handleDelete = (roomId: string) => {
    deleteRoomMutation.mutate(roomId);
  };

  // Handler for view room details
  const handleViewRoom = (room: Room) => {
    setViewingRoom(room);
  };

  // Toggle view mode between list and grid
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'list' ? 'grid' : 'list');
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

    // Apply bed type filter
    if (filterBedType) {
      filtered = filtered.filter(room => room.bedType === filterBedType);
    }

    // Apply capacity filter
    if (capacityFilter) {
      filtered = filtered.filter(room => room.capacity >= capacityFilter);
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
  }, [rooms, searchTerm, filterAvailable, filterBedType, capacityFilter, sortField, sortDirection]);
  
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
    setFilterBedType(null);
    setCapacityFilter(null);
    setPriceRangeFilter(null);
    setSortField(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bed className="h-5 w-5" />
              Manage Rooms for {hotel.name}
            </CardTitle>
            <CardDescription>
              Add, edit, and manage room information and availability
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleViewMode}
              className="flex items-center gap-1"
            >
              {viewMode === 'list' ? (
                <>
                  <LayoutGrid className="h-4 w-4" />
                  <span className="hidden sm:inline">Grid View</span>
                </>
              ) : (
                <>
                  <LayoutList className="h-4 w-4" />
                  <span className="hidden sm:inline">List View</span>
                </>
              )}
            </Button>
            <Dialog open={isAddingRoom} onOpenChange={setIsAddingRoom}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add New Room</span>
                  <span className="inline sm:hidden">Add</span>
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
            {/* Filter Bar */}
            <RoomFilterBar 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterAvailable={filterAvailable}
              setFilterAvailable={setFilterAvailable}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              resetFilters={resetFilters}
            />

            {/* Advanced Filters */}
            {showFilters && (
              <AdvancedRoomFilters 
                filterBedType={filterBedType}
                setFilterBedType={setFilterBedType}
                capacityFilter={capacityFilter}
                setCapacityFilter={setCapacityFilter}
                uniqueBedTypes={uniqueBedTypes}
                resetFilters={resetFilters}
              />
            )}

            {/* Stats Cards */}
            <RoomStatsCards rooms={rooms} />

            {/* Rooms Display - Grid or Table */}
            {viewMode === 'grid' ? (
              <RoomGridView 
                rooms={filteredAndSortedRooms}
                handleViewRoom={handleViewRoom}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                deleteLoading={deleteRoomMutation.isPending}
                Dialog={Dialog}
                DialogContent={DialogContent}
                DialogHeader={DialogHeader}
                DialogTitle={DialogTitle}
                DialogDescription={DialogDescription}
                DialogFooter={DialogFooter}
                DialogClose={DialogClose}
              />
            ) : (
              <RoomTableView 
                rooms={filteredAndSortedRooms}
                sortField={sortField}
                sortDirection={sortDirection}
                handleSort={handleSort}
                handleViewRoom={handleViewRoom}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                deleteLoading={deleteRoomMutation.isPending}
                Dialog={Dialog}
                DialogContent={DialogContent}
                DialogHeader={DialogHeader}
                DialogTitle={DialogTitle}
                DialogDescription={DialogDescription}
                DialogFooter={DialogFooter}
                DialogClose={DialogClose}
              />
            )}

            {/* Room Details Dialog */}
            <Dialog open={viewingRoom !== null} onOpenChange={(open) => !open && setViewingRoom(null)}>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Room Details</DialogTitle>
                </DialogHeader>
                {viewingRoom && <RoomDetails room={viewingRoom} />}
              </DialogContent>
            </Dialog>

            {/* Edit Room Dialog */}
            <Dialog open={editingRoom !== null} onOpenChange={(open) => !open && setEditingRoom(null)}>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Edit Room</DialogTitle>
                  <DialogDescription>
                    Update the details for room {editingRoom?.name}
                  </DialogDescription>
                </DialogHeader>
                {editingRoom && (
                  <EditRoomForm 
                    room={editingRoom}
                    hotelId={hotel.id}
                    onSuccess={() => {
                      setEditingRoom(null);
                      queryClient.invalidateQueries({ queryKey: ['hotel-rooms', hotel.id] });
                    }}
                  />
                )}
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RoomManagement;
