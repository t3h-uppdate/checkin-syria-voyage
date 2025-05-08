
import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import UserMessages from '@/components/User/UserMessages';

const MessagesPage = () => {
  return (
    <MainLayout>
      <div className="pt-24 pb-12">
        <UserMessages />
      </div>
    </MainLayout>
  );
};

export default MessagesPage;
