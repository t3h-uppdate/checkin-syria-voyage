
import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import UserReviews from '@/components/User/UserReviews';

const ReviewsPage = () => {
  return (
    <MainLayout>
      <div className="pt-24 pb-12">
        <UserReviews />
      </div>
    </MainLayout>
  );
};

export default ReviewsPage;
