
import React from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import GuestMessages from '@/components/Dashboard/GuestMessages';

export default function DashboardMessagesPage() {
  return (
    <DashboardLayout>
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6">Guest Messages</h1>
        <GuestMessages hotel={null} />
      </div>
    </DashboardLayout>
  );
}
