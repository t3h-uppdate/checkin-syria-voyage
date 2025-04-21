
import { useEffect, useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import RegisterForm from '@/components/Auth/RegisterForm';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RegisterPage = () => {
  const [showConfirmationAlert, setShowConfirmationAlert] = useState(false);
  
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout>
      <div className="pt-24 pb-12 min-h-[80vh] flex flex-col items-center bg-muted">
        <div className="container mx-auto px-4">
          {showConfirmationAlert && (
            <Alert className="mb-8 max-w-md mx-auto border-green-500 bg-green-50">
              <AlertTitle className="text-green-700">Check your email!</AlertTitle>
              <AlertDescription className="text-green-600">
                A confirmation link has been sent to your email address. Please check your inbox and spam folder to verify your account.
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => window.open("https://pzbppzlaaiujajrwgorf.supabase.co/dashboard/project/pzbppzlaaiujajrwgorf/auth/providers", "_blank")}
                  >
                    <ExternalLink size={16} />
                    For testing, you may disable email confirmation in Supabase
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
          <RegisterForm onRegistrationSuccess={() => setShowConfirmationAlert(true)} />
        </div>
      </div>
    </MainLayout>
  );
};

export default RegisterPage;
