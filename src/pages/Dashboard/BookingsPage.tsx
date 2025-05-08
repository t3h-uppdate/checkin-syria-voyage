
import React from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import BookingRequestsList from '@/components/Dashboard/BookingRequestsList';
import { useTranslation } from 'react-i18next';

export default function DashboardBookingsPage() {
  const { t } = useTranslation();
  
  return (
    <DashboardLayout>
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6">{t('dashboard.manageBookings')}</h1>
        <BookingRequestsList />
      </div>
    </DashboardLayout>
  );
}
