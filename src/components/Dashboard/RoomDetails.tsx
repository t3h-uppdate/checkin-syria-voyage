
import React from 'react';
import { Room } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Bed, Ruler, Image as ImageIcon } from 'lucide-react';
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
          <div className="mt-2 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price per night:</span>
              <span className="font-medium">{room.price} kr</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant={room.available ? "default" : "destructive"}>
                {room.available ? 'Available' : 'Not Available'}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Capacity:</span>
              <span>{room.capacity} guests</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Bed Type:</span>
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                <span>{room.bedType}</span>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Room Size:</span>
              <div className="flex items-center gap-1">
                <Ruler className="h-4 w-4" />
                <span>{room.size} m²</span>
              </div>
            </div>
          </div>
        </div>

        {/* Room Description */}
        <div>
          <h4 className="font-medium mb-2">Description</h4>
          <p className="text-sm text-muted-foreground">{room.description}</p>
        </div>
      </div>

      {/* Room Amenities */}
      <div>
        <h4 className="font-medium mb-3">Amenities</h4>
        {room.amenities && room.amenities.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {room.amenities.map((amenity, index) => (
              <Badge key={index} variant="outline">
                {amenity}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No amenities listed</p>
        )}
      </div>
    </div>
  );
}
