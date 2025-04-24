
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Settings, FileText, Loader2, LineChart, AlertOctagon, Bell, Mail, Lock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SystemSettings from "@/components/Admin/SystemSettings";
import ContentManagement from "@/components/Admin/ContentManagement";
import UserManagement from "@/components/Admin/UserManagement";
import SiteAnalytics from "@/components/Admin/SiteAnalytics";
import SecuritySettings from "@/components/Admin/SecuritySettings";

const AdminControlPanelPage = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkIfAdmin = async () => {
      if (!user) {
        console.log("No user found, redirecting to login");
        navigate("/login");
        return;
      }
      
      console.log("Checking if user is admin... Current role from context:", userRole);
      
      if (userRole === 'admin') {
        console.log("User confirmed as admin via context");
        setIsAdmin(true);
        setLoading(false);
        return;
      }
      
      try {
        console.log("Checking user profile in database...");
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          throw error;
        }

        console.log("User profile retrieved from database:", profile);
        if (!profile || profile.role !== "admin") {
          console.log("User is not an admin, role:", profile?.role);
          toast({
            title: "Access denied",
            description: "You must be an administrator to access this page.",
            variant: "destructive"
          });
          navigate("/");
          return;
        }

        console.log("User is admin, allowing access");
        setIsAdmin(true);
      } catch (error) {
        console.error("Error checking admin status:", error);
        toast({
          title: "An error occurred",
          description: "Could not verify your permissions.",
          variant: "destructive"
        });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    checkIfAdmin();
  }, [user, navigate, toast, userRole]);

  if (loading) {
    return (
      <MainLayout>
        <div className="pt-24 pb-12 min-h-[80vh] flex justify-center items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-2">Verifying admin access...</p>
        </div>
      </MainLayout>
    );
  }

  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="pt-24 pb-12 min-h-[80vh] flex flex-col justify-center items-center">
          <Shield className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You must have admin privileges to access this page.</p>
          <Button onClick={() => navigate("/")}>Return to Home</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="pt-24 pb-12 min-h-[80vh]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Admin Control Panel</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate("/")}>
                View Site
              </Button>
              <Button variant="default" onClick={() => navigate("/admin-dashboard")}>
                User Dashboard
              </Button>
            </div>
          </div>

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="mb-4 flex flex-wrap">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>User Management</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>System Settings</span>
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Content Management</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <LineChart className="h-4 w-4" />
                <span>Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>Security</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <UserManagement />
            </TabsContent>

            <TabsContent value="settings">
              <SystemSettings />
            </TabsContent>

            <TabsContent value="content">
              <ContentManagement />
            </TabsContent>

            <TabsContent value="analytics">
              <SiteAnalytics />
            </TabsContent>

            <TabsContent value="security">
              <SecuritySettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminControlPanelPage;
