
import { useEffect } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import LoginForm from '@/components/Auth/LoginForm';

const LoginPage = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout>
      <div className="pt-24 pb-12 min-h-[80vh] flex items-center bg-muted">
        <div className="container mx-auto px-4">
          <LoginForm />
        </div>
      </div>
    </MainLayout>
  );
};

export default LoginPage;
