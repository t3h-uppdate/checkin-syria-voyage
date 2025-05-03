
import React from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import BookingRequestsList from '@/components/Dashboard/BookingRequestsList';

export default function DashboardBookingsPage() {
  return (
    <DashboardLayout>
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6">Booking Management</h1>
        <BookingRequestsList />
      </div>
    </DashboardLayout>
  );
}
