
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Room } from '@/types';
import { DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Edit, X, Eye, Check } from 'lucide-react';

interface RoomTableViewProps {
  rooms: Room[];
  sortField: keyof Room | null;
  sortDirection: 'asc' | 'desc';
  handleSort: (field: keyof Room) => void;
  handleViewRoom: (room: Room) => void;
  handleEdit: (room: Room) => void;
  handleDelete: (roomId: string) => void;
  deleteLoading: boolean;
  Dialog: React.FC<{ children: React.ReactNode }>;
  DialogContent: React.FC<{ children: React.ReactNode }>;
  DialogFooter: React.FC<{ children: React.ReactNode }>;
  DialogHeader: React.FC<{ children: React.ReactNode }>;
  DialogTitle: React.FC<{ children: React.ReactNode }>;
  DialogDescription: React.FC<{ children: React.ReactNode }>;
  DialogClose: React.FC<{ children: React.ReactNode }>;
}

const RoomTableView = ({
  rooms,
  sortField,
  sortDirection,
  handleSort,
  handleViewRoom,
  handleEdit,
  handleDelete,
  deleteLoading,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
}: RoomTableViewProps) => {
  return (
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
          {rooms.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No rooms match your filters or no rooms have been added yet.
              </TableCell>
            </TableRow>
          )}
          {rooms.map((room) => (
            <TableRow key={room.id}>
              <TableCell>
                <div className="font-medium">{room.name}</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {room.capacity} <span className="text-muted-foreground">guests</span>
                </div>
              </TableCell>
              <TableCell>{room.bedType}</TableCell>
              <TableCell>{room.price} kr</TableCell>
              <TableCell>
                <Badge variant={room.available ? "default" : "destructive"}>
                  {room.available ? 'Yes' : 'No'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleViewRoom(room)}
                  >
                    View
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
                        <Button variant="outline" onClick={e => {
                          // Find the closest dialog and close it
                          const dialog = (e.target as HTMLElement).closest('[data-state]');
                          if (dialog) {
                            const closeButton = dialog.querySelector('[data-dismiss]');
                            if (closeButton) {
                              (closeButton as HTMLButtonElement).click();
                            }
                          }
                        }}>
                          Cancel
                        </Button>
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RoomTableView;
