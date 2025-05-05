
import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdvancedRoomFiltersProps {
  filterBedType: string | null;
  setFilterBedType: (value: string | null) => void;
  capacityFilter: number | null;
  setCapacityFilter: (value: number | null) => void;
  uniqueBedTypes: string[];
  resetFilters: () => void;
}

const AdvancedRoomFilters = ({
  filterBedType,
  setFilterBedType,
  capacityFilter,
  setCapacityFilter,
  uniqueBedTypes,
  resetFilters
}: AdvancedRoomFiltersProps) => {
  return (
    <div className="border rounded-md p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label htmlFor="bedTypeFilter">Bed Type</Label>
        <Select 
          value={filterBedType || 'all'}
          onValueChange={(value) => setFilterBedType(value === 'all' ? null : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select bed type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All bed types</SelectItem>
            {uniqueBedTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="capacityFilter">Minimum Capacity</Label>
        <Select 
          value={capacityFilter?.toString() || 'all'}
          onValueChange={(value) => setCapacityFilter(value === 'all' ? null : Number(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select minimum capacity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any capacity</SelectItem>
            {[1, 2, 3, 4, 5].map(num => (
              <SelectItem key={num} value={num.toString()}>{num}+ guests</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-end">
        <Button 
          onClick={resetFilters} 
          variant="secondary" 
          className="w-full"
        >
          Clear all filters
        </Button>
      </div>
    </div>
  );
};

export default AdvancedRoomFilters;
