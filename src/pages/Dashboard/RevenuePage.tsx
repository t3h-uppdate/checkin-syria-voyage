
import React from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import RevenueReports from '@/components/Dashboard/RevenueReports';

export default function DashboardRevenuePage() {
  return (
    <DashboardLayout>
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6">Revenue Reports</h1>
        <RevenueReports hotel={null} />
      </div>
    </DashboardLayout>
  );
}
