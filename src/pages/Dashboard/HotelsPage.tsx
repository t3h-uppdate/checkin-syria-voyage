
import React from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import DashboardHotelList from '@/components/Dashboard/DashboardHotelList';
import { useNavigate } from 'react-router-dom';

export default function DashboardHotelsPage() {
  const navigate = useNavigate();
  
  const handleSelectHotelForRooms = (hotel) => {
    // Store the selected hotel in session storage to access in rooms page
    sessionStorage.setItem('selectedHotel', JSON.stringify(hotel));
    navigate('/dashboard/rooms');
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6">My Hotels</h1>
        <DashboardHotelList onSelectHotelForRooms={handleSelectHotelForRooms} />
      </div>
    </DashboardLayout>
  );
}
