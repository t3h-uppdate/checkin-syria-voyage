
import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Room } from '@/types';

interface RoomStatsCardsProps {
  rooms: Room[];
}

const RoomStatsCards = ({ rooms }: RoomStatsCardsProps) => {
  const averagePrice = rooms.length > 0 
    ? Math.round(rooms.reduce((sum, r) => sum + r.price, 0) / rooms.length)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
          <div className="text-2xl font-bold">{rooms.length}</div>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-sm font-medium">Available Rooms</CardTitle>
          <div className="text-2xl font-bold">{rooms.filter(r => r.available).length}</div>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-sm font-medium">Average Price</CardTitle>
          <div className="text-2xl font-bold">{averagePrice} kr</div>
        </CardHeader>
      </Card>
    </div>
  );
};

export default RoomStatsCards;
