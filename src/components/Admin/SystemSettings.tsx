
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Settings, Mail, Globe, Shield, Bell } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const generalSettingsSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  siteUrl: z.string().url("Please enter a valid URL"),
  supportEmail: z.string().email("Please enter a valid email address"),
  defaultLanguage: z.string(),
  enableBookings: z.boolean(),
  enableReviews: z.boolean(),
  maintenanceMode: z.boolean(),
});

const emailSettingsSchema = z.object({
  emailFromName: z.string().min(1, "From name is required"),
  emailFromAddress: z.string().email("Please enter a valid email address"),
  smtpHost: z.string().min(1, "SMTP host is required"),
  smtpPort: z.string().regex(/^\d+$/, "Port must be a number"),
  smtpUser: z.string().min(1, "SMTP username is required"),
  smtpPassword: z.string().min(1, "SMTP password is required"),
  smtpSecure: z.boolean(),
});

const notificationSettingsSchema = z.object({
  newUserNotification: z.boolean(),
  newBookingNotification: z.boolean(),
  bookingCancelledNotification: z.boolean(),
  newReviewNotification: z.boolean(),
  lowInventoryNotification: z.boolean(),
});

const privacySettingsSchema = z.object({
  privacyPolicy: z.string().min(10, "Privacy policy content is required"),
  termsOfService: z.string().min(10, "Terms of service content is required"),
  cookiePolicy: z.string().min(10, "Cookie policy content is required"),
  gdprCompliance: z.boolean(),
  dataRetentionDays: z.string().regex(/^\d+$/, "Must be a number"),
});

const SystemSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const generalForm = useForm<z.infer<typeof generalSettingsSchema>>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      siteName: "Hotell App",
      siteUrl: "https://hotelapp.example.com",
      supportEmail: "support@hotelapp.example.com",
      defaultLanguage: "sv",
      enableBookings: true,
      enableReviews: true,
      maintenanceMode: false,
    },
  });

  const emailForm = useForm<z.infer<typeof emailSettingsSchema>>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: {
      emailFromName: "Hotel App",
      emailFromAddress: "noreply@hotelapp.example.com",
      smtpHost: "smtp.example.com",
      smtpPort: "587",
      smtpUser: "smtpuser",
      smtpPassword: "••••••••••",
      smtpSecure: true,
    },
  });

  const notificationForm = useForm<z.infer<typeof notificationSettingsSchema>>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      newUserNotification: true,
      newBookingNotification: true,
      bookingCancelledNotification: true,
      newReviewNotification: false,
      lowInventoryNotification: false,
    },
  });

  const privacyForm = useForm<z.infer<typeof privacySettingsSchema>>({
    resolver: zodResolver(privacySettingsSchema),
    defaultValues: {
      privacyPolicy: "This is our privacy policy...",
      termsOfService: "These are our terms of service...",
      cookiePolicy: "This is our cookie policy...",
      gdprCompliance: true,
      dataRetentionDays: "365",
    },
  });

  const onSubmitGeneralSettings = async (values: z.infer<typeof generalSettingsSchema>) => {
    setLoading(true);
    try {
      // In a real app, you would save the settings to your backend
      console.log("Saving general settings:", values);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Settings updated",
        description: "Your general settings have been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmitEmailSettings = async (values: z.infer<typeof emailSettingsSchema>) => {
    setLoading(true);
    try {
      console.log("Saving email settings:", values);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Email settings updated",
        description: "Your email configuration has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update email settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmitNotificationSettings = async (values: z.infer<typeof notificationSettingsSchema>) => {
    setLoading(true);
    try {
      console.log("Saving notification settings:", values);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmitPrivacySettings = async (values: z.infer<typeof privacySettingsSchema>) => {
    setLoading(true);
    try {
      console.log("Saving privacy settings:", values);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Privacy settings updated",
        description: "Your privacy policies have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update privacy settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">System Settings</h2>
        <p className="text-muted-foreground">
          Manage your application settings and configurations
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>General</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>Email</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Privacy & Legal</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure general application settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...generalForm}>
                <form onSubmit={generalForm.handleSubmit(onSubmitGeneralSettings)} className="space-y-4">
                  <FormField
                    control={generalForm.control}
                    name="siteName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          The name of your application or website
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="siteUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site URL</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          The base URL of your application
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="supportEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Support Email</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Email address for customer support inquiries
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="defaultLanguage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Language</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="sv">Swedish</SelectItem>
                            <SelectItem value="no">Norwegian</SelectItem>
                            <SelectItem value="da">Danish</SelectItem>
                            <SelectItem value="fi">Finnish</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Default language for the application
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={generalForm.control}
                      name="enableBookings"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div>
                            <FormLabel>Enable Bookings</FormLabel>
                            <FormDescription>
                              Allow users to make new bookings
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
                      control={generalForm.control}
                      name="enableReviews"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div>
                            <FormLabel>Enable Reviews</FormLabel>
                            <FormDescription>
                              Allow users to leave reviews
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

                  <FormField
                    control={generalForm.control}
                    name="maintenanceMode"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div>
                          <FormLabel>Maintenance Mode</FormLabel>
                          <FormDescription>
                            Enable maintenance mode to temporarily make the site inaccessible to normal users
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

                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Settings
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>
                Configure email settings for notifications and communication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onSubmitEmailSettings)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={emailForm.control}
                      name="emailFromName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Name to display in the from field of emails
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={emailForm.control}
                      name="emailFromAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From Email Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Email address to send from
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={emailForm.control}
                      name="smtpHost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Host</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={emailForm.control}
                      name="smtpPort"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Port</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={emailForm.control}
                      name="smtpUser"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Username</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={emailForm.control}
                      name="smtpPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={emailForm.control}
                    name="smtpSecure"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div>
                          <FormLabel>Use SSL/TLS</FormLabel>
                          <FormDescription>
                            Enable secure connection for SMTP
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

                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Email Settings
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure which events trigger admin notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onSubmitNotificationSettings)} className="space-y-4">
                  <div className="space-y-4">
                    <FormField
                      control={notificationForm.control}
                      name="newUserNotification"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div>
                            <FormLabel>New User Registration</FormLabel>
                            <FormDescription>
                              Get notified when a new user registers
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
                      control={notificationForm.control}
                      name="newBookingNotification"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div>
                            <FormLabel>New Booking</FormLabel>
                            <FormDescription>
                              Get notified when a new booking is made
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
                      control={notificationForm.control}
                      name="bookingCancelledNotification"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div>
                            <FormLabel>Booking Cancellation</FormLabel>
                            <FormDescription>
                              Get notified when a booking is cancelled
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
                      control={notificationForm.control}
                      name="newReviewNotification"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div>
                            <FormLabel>New Review</FormLabel>
                            <FormDescription>
                              Get notified when a new review is posted
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
                      control={notificationForm.control}
                      name="lowInventoryNotification"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div>
                            <FormLabel>Low Room Inventory</FormLabel>
                            <FormDescription>
                              Get notified when room availability is running low
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

                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Notification Settings
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Legal</CardTitle>
              <CardDescription>
                Manage privacy policies and legal documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...privacyForm}>
                <form onSubmit={privacyForm.handleSubmit(onSubmitPrivacySettings)} className="space-y-4">
                  <FormField
                    control={privacyForm.control}
                    name="privacyPolicy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Privacy Policy</FormLabel>
                        <FormControl>
                          <Textarea rows={6} {...field} />
                        </FormControl>
                        <FormDescription>
                          Your application's privacy policy
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={privacyForm.control}
                    name="termsOfService"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Terms of Service</FormLabel>
                        <FormControl>
                          <Textarea rows={6} {...field} />
                        </FormControl>
                        <FormDescription>
                          Your application's terms of service
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={privacyForm.control}
                    name="cookiePolicy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cookie Policy</FormLabel>
                        <FormControl>
                          <Textarea rows={4} {...field} />
                        </FormControl>
                        <FormDescription>
                          Your application's cookie policy
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={privacyForm.control}
                      name="gdprCompliance"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div>
                            <FormLabel>GDPR Compliance</FormLabel>
                            <FormDescription>
                              Enable features for GDPR compliance
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
                      name="dataRetentionDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Retention (days)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Number of days to retain user data
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Privacy Settings
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettings;
