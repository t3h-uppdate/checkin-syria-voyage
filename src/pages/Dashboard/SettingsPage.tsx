
import React, { useState } from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ProfileSettingsForm from '@/components/Settings/ProfileSettingsForm';
import { useAuth } from '@/contexts/AuthContext';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { 
  Settings, 
  Bell, 
  Key, 
  Shield, 
  Mail, 
  UserCog, 
  Languages, 
  Eye, 
  LogOut, 
  AlertCircle, 
  Users
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { Separator } from '@/components/ui/separator';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const emailNotificationsSchema = z.object({
  bookingConfirmations: z.boolean().default(true),
  bookingReminders: z.boolean().default(true),
  promotions: z.boolean().default(false),
  newsletter: z.boolean().default(false),
  systemUpdates: z.boolean().default(true),
});

const privacySettingsSchema = z.object({
  shareBookingHistory: z.boolean().default(false),
  shareProfileData: z.boolean().default(false),
  allowCookies: z.boolean().default(true),
  allowTracking: z.boolean().default(false),
});

const sessionSettingsSchema = z.object({
  activeSession: z.boolean().default(true),
  rememberDevice: z.boolean().default(true),
  sessionTimeout: z.string().default("30"),
});

export default function DashboardSettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const notificationsForm = useForm<z.infer<typeof emailNotificationsSchema>>({
    resolver: zodResolver(emailNotificationsSchema),
    defaultValues: {
      bookingConfirmations: true,
      bookingReminders: true,
      promotions: false,
      newsletter: false,
      systemUpdates: true,
    },
  });

  const privacyForm = useForm<z.infer<typeof privacySettingsSchema>>({
    resolver: zodResolver(privacySettingsSchema),
    defaultValues: {
      shareBookingHistory: false,
      shareProfileData: false,
      allowCookies: true,
      allowTracking: false,
    },
  });

  const sessionForm = useForm<z.infer<typeof sessionSettingsSchema>>({
    resolver: zodResolver(sessionSettingsSchema),
    defaultValues: {
      activeSession: true,
      rememberDevice: true,
      sessionTimeout: "30",
    },
  });

  const handlePasswordChange = (data: z.infer<typeof passwordSchema>) => {
    // Mock API call for password change
    setTimeout(() => {
      toast.success("Password updated successfully");
      passwordForm.reset();
    }, 1000);
  };

  const handleNotificationsUpdate = (data: z.infer<typeof emailNotificationsSchema>) => {
    // Mock API call for notification settings
    setTimeout(() => {
      toast.success("Notification preferences updated");
    }, 500);
  };

  const handlePrivacyUpdate = (data: z.infer<typeof privacySettingsSchema>) => {
    // Mock API call for privacy settings
    setTimeout(() => {
      toast.success("Privacy settings updated");
    }, 500);
  };

  const handleSessionUpdate = (data: z.infer<typeof sessionSettingsSchema>) => {
    // Mock API call for session settings
    setTimeout(() => {
      toast.success("Session settings updated");
    }, 500);
  };

  const handleDeleteAccount = () => {
    // Mock API call for account deletion
    setTimeout(() => {
      toast.success("Account deletion requested. You will receive a confirmation email.");
      setShowDeleteConfirm(false);
    }, 1000);
  };

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error("Failed to sign out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    toast.success(`Language changed to ${lang === 'en' ? 'English' : 'Swedish'}`);
  };

  return (
    <DashboardLayout>
      <div className="py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Dashboard Settings</h1>
            <p className="text-muted-foreground">Manage your account preferences and settings</p>
          </div>
          <Button variant="destructive" onClick={handleSignOut} disabled={isLoggingOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
        
        <Tabs defaultValue="profile" className="space-y-6">
          <div className="bg-muted p-1 rounded-lg">
            <TabsList className="grid grid-cols-3 md:grid-cols-5 h-auto">
              <TabsTrigger value="profile" className="flex items-center gap-2 py-2">
                <UserCog className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2 py-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2 py-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2 py-2">
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Privacy</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2 py-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Preferences</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCog className="h-5 w-5" />
                  Profile Settings
                </CardTitle>
                <CardDescription>
                  Update your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileSettingsForm />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Customize which notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...notificationsForm}>
                  <form onSubmit={notificationsForm.handleSubmit(handleNotificationsUpdate)} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Email Notifications</h3>
                      
                      <FormField
                        control={notificationsForm.control}
                        name="bookingConfirmations"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Booking Confirmations</FormLabel>
                              <FormDescription>
                                Receive confirmation emails when a booking is made or updated
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationsForm.control}
                        name="bookingReminders"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Booking Reminders</FormLabel>
                              <FormDescription>
                                Receive reminders about upcoming bookings and check-ins
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationsForm.control}
                        name="promotions"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Promotional Emails</FormLabel>
                              <FormDescription>
                                Receive information about special offers and promotions
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationsForm.control}
                        name="newsletter"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Newsletter</FormLabel>
                              <FormDescription>
                                Receive our monthly newsletter with hotel industry insights
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationsForm.control}
                        name="systemUpdates"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">System Updates</FormLabel>
                              <FormDescription>
                                Receive notifications about important system updates
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button type="submit">Save Notification Preferences</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Password
                  </CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter current password"
                                type="password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter new password"
                                type="password"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Password should be at least 8 characters with numbers, 
                              uppercase, lowercase, and special characters.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Confirm new password"
                                type="password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit">Update Password</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your account security and session settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...sessionForm}>
                    <form onSubmit={sessionForm.handleSubmit(handleSessionUpdate)} className="space-y-4">
                      <div className="space-y-4">
                        <FormField
                          control={sessionForm.control}
                          name="activeSession"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Active Session</FormLabel>
                                <FormDescription>
                                  Your account is currently signed in on this device
                                </FormDescription>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                type="button"
                                onClick={handleSignOut}
                                disabled={isLoggingOut}
                              >
                                Sign Out
                              </Button>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={sessionForm.control}
                          name="rememberDevice"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Remember This Device</FormLabel>
                                <FormDescription>
                                  Stay signed in on this device
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={sessionForm.control}
                          name="sessionTimeout"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Session Timeout (minutes)</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select timeout duration" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="15">15 minutes</SelectItem>
                                  <SelectItem value="30">30 minutes</SelectItem>
                                  <SelectItem value="60">1 hour</SelectItem>
                                  <SelectItem value="120">2 hours</SelectItem>
                                  <SelectItem value="1440">24 hours</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Automatically log out after inactivity
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Button type="submit">Save Security Settings</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>
                  Control how your information is used and shared
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...privacyForm}>
                  <form onSubmit={privacyForm.handleSubmit(handlePrivacyUpdate)} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Data Sharing & Privacy</h3>
                      
                      <FormField
                        control={privacyForm.control}
                        name="shareBookingHistory"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Share Booking History</FormLabel>
                              <FormDescription>
                                Allow us to use your booking history to improve recommendations
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={privacyForm.control}
                        name="shareProfileData"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Profile Data Sharing</FormLabel>
                              <FormDescription>
                                Allow sharing of your profile data with our trusted partners
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={privacyForm.control}
                        name="allowCookies"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Cookies</FormLabel>
                              <FormDescription>
                                Allow us to use cookies to improve your browsing experience
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={privacyForm.control}
                        name="allowTracking"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Usage Tracking</FormLabel>
                              <FormDescription>
                                Allow us to track how you use our platform for improvements
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Account Management</h3>
                      
                      <div className="rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <h4 className="text-base font-medium">Download Your Data</h4>
                          <p className="text-sm text-muted-foreground">
                            Get a copy of all the data we have stored about you
                          </p>
                        </div>
                        <div className="mt-2">
                          <Button variant="outline" size="sm">Request Data Export</Button>
                        </div>
                      </div>
                      
                      <div className="rounded-lg border border-destructive/20 p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <h4 className="text-base font-medium text-destructive">Delete Your Account</h4>
                          <p className="text-sm text-muted-foreground">
                            Permanently delete your account and all associated data
                          </p>
                        </div>
                        <div className="mt-2">
                          <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                            <DialogTrigger asChild>
                              <Button variant="destructive" size="sm">Delete Account</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <AlertCircle className="h-5 w-5 text-destructive" />
                                  Delete Account
                                </DialogTitle>
                                <DialogDescription>
                                  This action cannot be undone. This will permanently delete your
                                  account and remove your data from our servers.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <p className="text-sm text-muted-foreground">
                                  To confirm, type "DELETE" in the field below:
                                </p>
                                <Input placeholder="Type DELETE to confirm" />
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                                  Cancel
                                </Button>
                                <Button variant="destructive" onClick={handleDeleteAccount}>
                                  Delete Account
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                    
                    <Button type="submit">Save Privacy Settings</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Preferences
                </CardTitle>
                <CardDescription>
                  Customize your dashboard experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Language & Localization</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="language">Interface Language</Label>
                        <Select 
                          defaultValue={i18n.language} 
                          onValueChange={changeLanguage}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">
                              <div className="flex items-center gap-2">
                                <span>🇺🇸</span> English
                              </div>
                            </SelectItem>
                            <SelectItem value="sv">
                              <div className="flex items-center gap-2">
                                <span>🇸🇪</span> Swedish
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select defaultValue="auto">
                          <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">Auto (System Default)</SelectItem>
                            <SelectItem value="utc">UTC (Coordinated Universal Time)</SelectItem>
                            <SelectItem value="cet">CET (Central European Time)</SelectItem>
                            <SelectItem value="est">EST (Eastern Standard Time)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Appearance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="theme">Theme</Label>
                        <Select defaultValue="system">
                          <SelectTrigger>
                            <SelectValue placeholder="Select theme" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="density">Display Density</Label>
                        <Select defaultValue="comfortable">
                          <SelectTrigger>
                            <SelectValue placeholder="Select density" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="compact">Compact</SelectItem>
                            <SelectItem value="comfortable">Comfortable</SelectItem>
                            <SelectItem value="spacious">Spacious</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Display animations</Label>
                        <p className="text-sm text-muted-foreground">
                          Show animations throughout the interface
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Default View Settings</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="defaultPage">Default Landing Page</Label>
                        <Select defaultValue="overview">
                          <SelectTrigger>
                            <SelectValue placeholder="Select default page" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="overview">Dashboard Overview</SelectItem>
                            <SelectItem value="hotels">Hotels</SelectItem>
                            <SelectItem value="bookings">Bookings</SelectItem>
                            <SelectItem value="revenue">Revenue Reports</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="tableView">Default Table View</Label>
                        <Select defaultValue="20">
                          <SelectTrigger>
                            <SelectValue placeholder="Items per page" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10 items per page</SelectItem>
                            <SelectItem value="20">20 items per page</SelectItem>
                            <SelectItem value="50">50 items per page</SelectItem>
                            <SelectItem value="100">100 items per page</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <Button>Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
