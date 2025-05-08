
import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import UserBookings from '@/components/User/UserBookings';

const BookingsPage = () => {
  return (
    <MainLayout>
      <div className="pt-24 pb-12">
        <UserBookings />
      </div>
    </MainLayout>
  );
};

export default BookingsPage;
