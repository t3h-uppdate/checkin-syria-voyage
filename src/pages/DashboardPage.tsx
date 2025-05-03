
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import { Loader2 } from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the new dashboard overview
    navigate('/dashboard');
  }, [navigate]);

  return (
    <MainLayout>
      <div className="pt-24 pb-12 min-h-[80vh]">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
