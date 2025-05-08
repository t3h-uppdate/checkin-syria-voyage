
import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import UserNotifications from '@/components/User/UserNotifications';

const NotificationsPage = () => {
  return (
    <MainLayout>
      <div className="pt-24 pb-12">
        <UserNotifications />
      </div>
    </MainLayout>
  );
};

export default NotificationsPage;
