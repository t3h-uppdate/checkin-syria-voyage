
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RoomFilterBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterAvailable: boolean | null;
  setFilterAvailable: (value: boolean | null) => void;
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;
  resetFilters: () => void;
}

const RoomFilterBar = ({
  searchTerm,
  setSearchTerm,
  filterAvailable,
  setFilterAvailable,
  showFilters,
  setShowFilters,
  resetFilters
}: RoomFilterBarProps) => {
  return (
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
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </Button>
        
        <Select 
          value={filterAvailable === null ? 'all' : filterAvailable.toString()}
          onValueChange={(value) => {
            if (value === 'all') setFilterAvailable(null);
            else setFilterAvailable(value === 'true');
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All rooms</SelectItem>
            <SelectItem value="true">Available</SelectItem>
            <SelectItem value="false">Unavailable</SelectItem>
          </SelectContent>
        </Select>
        
        <Button variant="outline" onClick={resetFilters} size="sm">
          Reset
        </Button>
      </div>
    </div>
  );
};

export default RoomFilterBar;
