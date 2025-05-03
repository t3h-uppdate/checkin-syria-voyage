
import React from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import ReviewsManagement from '@/components/Dashboard/ReviewsManagement';

export default function DashboardReviewsPage() {
  return (
    <DashboardLayout>
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6">Reviews Management</h1>
        <ReviewsManagement hotel={null} />
      </div>
    </DashboardLayout>
  );
}
