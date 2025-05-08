
import React from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import DashboardHotelList from '@/components/Dashboard/DashboardHotelList';
import { useNavigate } from 'react-router-dom';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Hotel } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function DashboardHotelsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const handleSelectHotelForRooms = (hotel) => {
    // Store the selected hotel in session storage to access in rooms page
    sessionStorage.setItem('selectedHotel', JSON.stringify(hotel));
    navigate('/dashboard/rooms');
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Hotel className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t('dashboard.myHotels')}</h1>
            <p className="text-muted-foreground text-sm">{t('dashboard.manageHotels')}</p>
          </div>
        </div>
        <DashboardHotelList onSelectHotelForRooms={handleSelectHotelForRooms} />
      </div>
    </DashboardLayout>
  );
}
