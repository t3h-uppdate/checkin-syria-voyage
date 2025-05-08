
import { Hotel } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Building } from 'lucide-react';

interface HotelSelectorProps {
  hotels: Hotel[];
  selectedHotel: Hotel | null;
  onHotelChange: (hotelId: string) => void;
  className?: string;
}

const HotelSelector = ({ 
  hotels, 
  selectedHotel, 
  onHotelChange,
  className = ""
}: HotelSelectorProps) => {
  if (hotels.length <= 1) return null;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Label htmlFor="hotel-select" className="flex items-center">
        <Building className="h-4 w-4 mr-2" />
        Select Hotel:
      </Label>
      <Select
        value={selectedHotel?.id || ""}
        onValueChange={onHotelChange}
      >
        <SelectTrigger id="hotel-select" className="w-[200px]">
          <SelectValue placeholder="Select hotel" />
        </SelectTrigger>
        <SelectContent>
          {hotels.map((hotel) => (
            <SelectItem key={hotel.id} value={hotel.id}>
              {hotel.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default HotelSelector;
