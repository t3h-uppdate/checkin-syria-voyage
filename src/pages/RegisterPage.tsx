
import { useEffect } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import RegisterForm from '@/components/Auth/RegisterForm';

const RegisterPage = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout>
      <div className="pt-24 pb-12 min-h-[80vh] flex items-center bg-muted">
        <div className="container mx-auto px-4">
          <RegisterForm />
        </div>
      </div>
    </MainLayout>
  );
};

export default RegisterPage;
