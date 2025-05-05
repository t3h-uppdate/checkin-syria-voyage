
import React from 'react';
import { Room } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Bed, Ruler, Image as ImageIcon, Users } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface RoomDetailsProps {
  room: Room;
}

export function RoomDetails({ room }: RoomDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Room Images Carousel */}
      <Carousel className="w-full">
        <CarouselContent>
          {room.images && room.images.length > 0 ? (
            room.images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="flex aspect-[16/9] items-center justify-center p-2">
                  <img
                    src={image}
                    alt={`${room.name} - Image ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://placehold.co/600x400?text=Image+Not+Found';
                    }}
                  />
                </div>
              </CarouselItem>
            ))
          ) : (
            <CarouselItem>
              <div className="flex aspect-[16/9] items-center justify-center p-2 bg-muted rounded-lg">
                <div className="text-muted-foreground flex flex-col items-center">
                  <ImageIcon className="h-12 w-12 mb-2" />
                  <span>No images available</span>
                </div>
              </div>
            </CarouselItem>
          )}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      {/* Room Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-2xl font-semibold">{room.name}</h3>
          <div className="mt-4 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-muted/30">
                <CardContent className="flex items-center gap-2 p-4">
                  <div className="rounded-full bg-primary/20 p-2">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Capacity</p>
                    <p className="font-medium">{room.capacity} guests</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-muted/30">
                <CardContent className="flex items-center gap-2 p-4">
                  <div className="rounded-full bg-primary/20 p-2">
                    <Bed className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Bed Type</p>
                    <p className="font-medium">{room.bedType}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-muted/30">
                <CardContent className="flex items-center gap-2 p-4">
                  <div className="rounded-full bg-primary/20 p-2">
                    <Ruler className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Room Size</p>
                    <p className="font-medium">{room.size} m²</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price per night:</span>
              <span className="font-medium text-lg">{room.price} kr</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant={room.available ? "default" : "destructive"} className="text-sm">
                {room.available ? 'Available' : 'Not Available'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Room Description */}
        <div>
          <h4 className="font-medium mb-3">Description</h4>
          <div className="bg-muted/30 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">{room.description}</p>
          </div>

          {/* Room Amenities */}
          <div className="mt-6">
            <h4 className="font-medium mb-3">Amenities</h4>
            {room.amenities && room.amenities.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {room.amenities.map((amenity, index) => (
                  <Badge key={index} variant="outline" className="py-1 px-2">
                    {amenity}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No amenities listed</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
