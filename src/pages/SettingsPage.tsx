
import { useEffect } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileSettingsForm from '@/components/Settings/ProfileSettingsForm';
import { Card } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

const SettingsPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <MainLayout>
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <p>{t('common.loading')}</p>
      </div>
    </MainLayout>;
  }

  return (
    <MainLayout>
      <div className="pt-24 pb-12 min-h-screen bg-muted">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">{t('profile.settings')}</h1>
          
          <Card className="p-6">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList>
                <TabsTrigger value="profile">{t('profile.personalInfo')}</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-6">
                <ProfileSettingsForm />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
