
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ShieldAlert, Shield, Lock, Key } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const securityFormSchema = z.object({
  requireEmailVerification: z.boolean().default(true),
  passwordMinLength: z.string().default("8"),
  passwordComplexity: z.string().default("medium"),
  mfaEnabled: z.boolean().default(false),
  sessionTimeout: z.string().default("30"),
  allowMultipleSessions: z.boolean().default(true),
});

const apiSecuritySchema = z.object({
  rateLimiting: z.boolean().default(true),
  maxRequestsPerMinute: z.string().default("60"),
  corsEnabled: z.boolean().default(true),
  allowedDomains: z.string().default("*"),
  apiKeyExpiration: z.string().default("90"),
});

// Mock data for demonstration
const recentSecurityEvents = [
  {
    id: 1,
    type: "Failed Login",
    user: "john.doe@example.com",
    ip: "192.168.1.1",
    timestamp: "2023-07-15T14:30:00Z",
    status: "alert",
  },
  {
    id: 2,
    type: "Password Changed",
    user: "jane.smith@example.com",
    ip: "203.0.113.45",
    timestamp: "2023-07-14T10:15:00Z",
    status: "success",
  },
  {
    id: 3,
    type: "Admin Login",
    user: "admin@example.com",
    ip: "198.51.100.23",
    timestamp: "2023-07-13T08:45:00Z",
    status: "info",
  },
  {
    id: 4,
    type: "Failed Login (Multiple)",
    user: "test.user@example.com",
    ip: "192.0.2.18",
    timestamp: "2023-07-12T19:20:00Z",
    status: "alert",
  },
  {
    id: 5,
    type: "Account Locked",
    user: "blocked.user@example.com",
    ip: "203.0.113.12",
    timestamp: "2023-07-11T16:50:00Z",
    status: "alert",
  },
];

const SecuritySettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const securityForm = useForm<z.infer<typeof securityFormSchema>>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      requireEmailVerification: true,
      passwordMinLength: "8",
      passwordComplexity: "medium",
      mfaEnabled: false,
      sessionTimeout: "30",
      allowMultipleSessions: true,
    },
  });

  const apiSecurityForm = useForm<z.infer<typeof apiSecuritySchema>>({
    resolver: zodResolver(apiSecuritySchema),
    defaultValues: {
      rateLimiting: true,
      maxRequestsPerMinute: "60",
      corsEnabled: true,
      allowedDomains: "*",
      apiKeyExpiration: "90",
    },
  });

  const onSubmitSecuritySettings = async (values: z.infer<typeof securityFormSchema>) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Security settings updated:", values);
    
    toast({
      title: "Security Settings Updated",
      description: "Your security settings have been saved successfully.",
    });
    
    setLoading(false);
  };

  const onSubmitApiSecurity = async (values: z.infer<typeof apiSecuritySchema>) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("API security settings updated:", values);
    
    toast({
      title: "API Security Updated",
      description: "Your API security settings have been saved successfully.",
    });
    
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">Security Settings</h2>
      </div>

      <Tabs defaultValue="authentication" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="authentication" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Authentication</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <span>API Security</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span>Security Logs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="authentication">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Security</CardTitle>
              <CardDescription>
                Configure security settings for user authentication and sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...securityForm}>
                <form 
                  onSubmit={securityForm.handleSubmit(onSubmitSecuritySettings)} 
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={securityForm.control}
                      name="requireEmailVerification"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Email Verification
                            </FormLabel>
                            <FormDescription>
                              Require users to verify their email before accessing the platform
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
                      control={securityForm.control}
                      name="mfaEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Two-Factor Authentication
                            </FormLabel>
                            <FormDescription>
                              Enable two-factor authentication for all users
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
                      control={securityForm.control}
                      name="passwordMinLength"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password Minimum Length</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select minimum password length" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="6">6 characters</SelectItem>
                              <SelectItem value="8">8 characters</SelectItem>
                              <SelectItem value="10">10 characters</SelectItem>
                              <SelectItem value="12">12 characters</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Minimum number of characters required for passwords
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={securityForm.control}
                      name="passwordComplexity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password Complexity</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select password complexity level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low (letters only)</SelectItem>
                              <SelectItem value="medium">Medium (letters + numbers)</SelectItem>
                              <SelectItem value="high">High (letters + numbers + symbols)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Required password complexity level
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={securityForm.control}
                      name="sessionTimeout"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Session Timeout (minutes)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>
                            How long until an inactive session expires
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={securityForm.control}
                      name="allowMultipleSessions"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Allow Multiple Sessions
                            </FormLabel>
                            <FormDescription>
                              Allow users to be logged in from multiple devices
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

                  <CardFooter className="border-t pt-6 flex justify-between px-0">
                    <Button variant="outline" type="button">
                      Reset to Defaults
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Security</CardTitle>
              <CardDescription>
                Configure security settings for API access and usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...apiSecurityForm}>
                <form 
                  onSubmit={apiSecurityForm.handleSubmit(onSubmitApiSecurity)} 
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={apiSecurityForm.control}
                      name="rateLimiting"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Rate Limiting
                            </FormLabel>
                            <FormDescription>
                              Limit the number of API requests per minute
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
                      control={apiSecurityForm.control}
                      name="maxRequestsPerMinute"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Requests Per Minute</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>
                            Maximum number of API requests allowed per minute
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={apiSecurityForm.control}
                      name="corsEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              CORS Protection
                            </FormLabel>
                            <FormDescription>
                              Enable Cross-Origin Resource Sharing protection
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
                      control={apiSecurityForm.control}
                      name="allowedDomains"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Allowed Domains</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g. *.example.com, app.domain.com" />
                          </FormControl>
                          <FormDescription>
                            Comma-separated list of domains allowed to access the API (use * for all)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={apiSecurityForm.control}
                      name="apiKeyExpiration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Key Expiration (days)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>
                            Number of days until API keys expire (0 for no expiration)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <CardFooter className="border-t pt-6 flex justify-between px-0">
                    <Button variant="outline" type="button">
                      Reset to Defaults
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Security Logs</CardTitle>
              <CardDescription>
                Recent security events and authentication activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-5 p-4 text-sm font-medium bg-muted">
                  <div>Event</div>
                  <div>User</div>
                  <div>IP Address</div>
                  <div>Timestamp</div>
                  <div>Status</div>
                </div>
                <div className="divide-y">
                  {recentSecurityEvents.map((event) => (
                    <div key={event.id} className="grid grid-cols-5 p-4 text-sm">
                      <div className="font-medium">{event.type}</div>
                      <div className="text-muted-foreground">{event.user}</div>
                      <div className="text-muted-foreground">{event.ip}</div>
                      <div className="text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString()}
                      </div>
                      <div>
                        <Badge variant={
                          event.status === "alert" ? "destructive" : 
                          event.status === "success" ? "outline" : "secondary"
                        }>
                          {event.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center mt-6">
                <Button variant="outline">View All Security Logs</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecuritySettings;
