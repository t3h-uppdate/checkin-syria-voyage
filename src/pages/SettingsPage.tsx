
import { useEffect } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileSettingsForm from '@/components/Settings/ProfileSettingsForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from 'react-i18next';
import { User, Bell, Shield, Lock } from 'lucide-react';

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
          <h1 className="text-3xl font-bold mb-2">{t('settings.title')}</h1>
          <p className="text-muted-foreground mb-8">{t('settings.account')}</p>
          
          <Card className="p-6">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{t('profile.personalInfo')}</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span>{t('settings.notifications')}</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>{t('settings.security')}</span>
                </TabsTrigger>
                <TabsTrigger value="privacy" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span>{t('settings.privacy')}</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <CardHeader>
                  <CardTitle>{t('profile.personalInfo')}</CardTitle>
                  <CardDescription>
                    Manage your personal information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileSettingsForm />
                </CardContent>
              </TabsContent>
              
              <TabsContent value="notifications">
                <CardHeader>
                  <CardTitle>{t('settings.notifications')}</CardTitle>
                  <CardDescription>
                    Configure your notification preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Notification settings will be added in a future update.
                  </div>
                </CardContent>
              </TabsContent>
              
              <TabsContent value="security">
                <CardHeader>
                  <CardTitle>{t('settings.security')}</CardTitle>
                  <CardDescription>
                    Manage your account security settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Security settings will be added in a future update.
                  </div>
                </CardContent>
              </TabsContent>
              
              <TabsContent value="privacy">
                <CardHeader>
                  <CardTitle>{t('settings.privacy')}</CardTitle>
                  <CardDescription>
                    Manage your privacy settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Privacy settings will be added in a future update.
                  </div>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
