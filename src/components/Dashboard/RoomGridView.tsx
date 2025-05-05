
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Room } from '@/types';
import { Bed, Edit, Eye, Image, X } from 'lucide-react';
import { DialogTrigger } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface RoomGridViewProps {
  rooms: Room[];
  handleViewRoom: (room: Room) => void;
  handleEdit: (room: Room) => void;
  handleDelete: (roomId: string) => void;
  deleteLoading: boolean;
  DialogContent: React.FC<{ children: React.ReactNode }>;
  DialogFooter: React.FC<{ children: React.ReactNode }>;
  DialogHeader: React.FC<{ children: React.ReactNode }>;
  DialogTitle: React.FC<{ children: React.ReactNode }>;
  DialogDescription: React.FC<{ children: React.ReactNode }>;
  Dialog: React.FC<{ children: React.ReactNode }>;
  DialogClose: React.FC<{ children: React.ReactNode }>;
}

const RoomGridView = ({
  rooms,
  handleViewRoom,
  handleEdit,
  handleDelete,
  deleteLoading,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
}: RoomGridViewProps) => {
  if (rooms.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No rooms match your filters or no rooms have been added yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {rooms.map(room => (
        <Card key={room.id} className="overflow-hidden">
          <div className="aspect-video w-full overflow-hidden bg-muted">
            {room.images && room.images.length > 0 ? (
              <img 
                src={room.images[0]} 
                alt={room.name} 
                className="h-full w-full object-cover transition-all hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://placehold.co/600x400?text=Room+Image';
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted">
                <Image className="h-10 w-10 opacity-20" />
              </div>
            )}
          </div>
          <CardHeader className="p-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">{room.name}</CardTitle>
              <Badge variant={room.available ? "default" : "destructive"}>
                {room.available ? 'Available' : 'Unavailable'}
              </Badge>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Bed className="mr-1 h-4 w-4" /> {room.bedType} · {room.capacity} guests · {room.size} m²
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="font-medium">{room.price} kr / night</div>
            <div className="mt-4 flex space-x-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleViewRoom(room)}
                className="flex items-center gap-1"
              >
                <Eye className="h-3 w-3" />
                <span>Details</span>
              </Button>
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
                      disabled={deleteLoading}
                    >
                      {deleteLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Delete Room
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RoomGridView;
