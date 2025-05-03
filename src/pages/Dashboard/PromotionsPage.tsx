
import React from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import PromotionsManagement from '@/components/Dashboard/PromotionsManagement';

export default function DashboardPromotionsPage() {
  return (
    <DashboardLayout>
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6">Promotions Management</h1>
        <PromotionsManagement hotel={null} />
      </div>
    </DashboardLayout>
  );
}
