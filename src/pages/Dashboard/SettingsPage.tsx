
import React from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import ProfileSettingsForm from '@/components/Settings/ProfileSettingsForm';

export default function DashboardSettingsPage() {
  return (
    <DashboardLayout>
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard Settings</h1>
        
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="profile">
              <TabsList className="mb-4">
                <TabsTrigger value="profile">Profile Settings</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <ProfileSettingsForm />
              </TabsContent>
              
              <TabsContent value="notifications">
                <p className="text-muted-foreground">Notification settings will be available soon.</p>
              </TabsContent>
              
              <TabsContent value="account">
                <p className="text-muted-foreground">Account settings will be available soon.</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
