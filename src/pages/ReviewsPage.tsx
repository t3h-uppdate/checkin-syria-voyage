
import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import UserReviews from '@/components/User/UserReviews';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ReviewsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <MainLayout>
        <div className="pt-24 pb-12 container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
          <p className="mb-6">You need to be logged in to view your reviews.</p>
          <Button onClick={() => navigate('/login')}>Log In</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="pt-24 pb-12">
        <UserReviews />
      </div>
    </MainLayout>
  );
};

export default ReviewsPage;
