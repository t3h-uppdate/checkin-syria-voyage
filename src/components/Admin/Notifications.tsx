
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Megaphone,
  Mail,
  Send,
  Users,
  Calendar,
  Clock,
  ChevronDown,
  Edit,
  Copy,
  Trash,
  CheckCircle,
  BarChart,
  Bell,
  Globe,
  List,
  Tag,
  Hotel,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Sample notification templates
const notificationTemplates = [
  {
    id: "welcome",
    name: "Welcome Email",
    subject: "Welcome to CheckInSyria!",
    body: "Hello {first_name},\n\nWelcome to CheckInSyria! We're delighted to have you join our platform. Start exploring hotels and plan your perfect stay today.\n\nBest Regards,\nThe CheckInSyria Team",
    type: "email",
  },
  {
    id: "booking-confirmation",
    name: "Booking Confirmation",
    subject: "Booking Confirmation #{booking_id}",
    body: "Hello {first_name},\n\nYour booking at {hotel_name} has been confirmed for {check_in_date} to {check_out_date}. Your booking ID is {booking_id}.\n\nThank you for booking with us!\n\nBest Regards,\nThe CheckInSyria Team",
    type: "email",
  },
  {
    id: "promo-summer",
    name: "Summer Promotion",
    subject: "Special Summer Deals - Save up to 30%!",
    body: "Hello {first_name},\n\nSummer is here! Book your next stay and get up to 30% off on selected hotels. Use promo code SUMMER30 at checkout.\n\nOffer valid until September 1st.\n\nBest Regards,\nThe CheckInSyria Team",
    type: "email",
  },
  {
    id: "new-hotel-alert",
    name: "New Hotel Alert",
    title: "New Hotel Added: {hotel_name}",
    body: "A new hotel has been added to our collection in {city}. Check it out now!",
    type: "push",
  },
  {
    id: "price-drop",
    name: "Price Drop Alert",
    title: "Price Drop Alert!",
    body: "Good news! Prices have dropped for hotels in {city} that you've viewed recently.",
    type: "push",
  },
];

// Sample campaigns
const campaigns = [
  {
    id: "campaign-1",
    name: "Summer Sale 2023",
    type: "email",
    status: "active",
    audience: "all_users",
    sent: 12583,
    opened: 6821,
    clicked: 2157,
    scheduled_at: "2023-06-15T09:00:00Z",
    created_at: "2023-06-10T14:23:42Z",
    template_id: "promo-summer",
  },
  {
    id: "campaign-2",
    name: "New Year Special",
    type: "email",
    status: "draft",
    audience: "inactive_users",
    sent: null,
    opened: null,
    clicked: null,
    scheduled_at: "2023-12-15T10:00:00Z",
    created_at: "2023-09-05T11:30:18Z",
    template_id: "promo-summer",
  },
  {
    id: "campaign-3",
    name: "New Beach Resort Announcement",
    type: "push",
    status: "completed",
    audience: "location_specific",
    sent: 5248,
    opened: 3012,
    clicked: 1482,
    scheduled_at: "2023-05-10T15:00:00Z",
    created_at: "2023-05-01T09:12:56Z",
    template_id: "new-hotel-alert",
  },
  {
    id: "campaign-4",
    name: "Flash Sale Weekend",
    type: "email",
    status: "scheduled",
    audience: "recent_visitors",
    sent: null,
    opened: null,
    clicked: null,
    scheduled_at: "2023-09-22T08:00:00Z",
    created_at: "2023-09-15T16:45:22Z",
    template_id: "promo-summer",
  },
  {
    id: "campaign-5",
    name: "Price Drop Alert",
    type: "push",
    status: "active",
    audience: "wishlist_users",
    sent: 2834,
    opened: 1745,
    clicked: 892,
    scheduled_at: "2023-09-18T14:30:00Z",
    created_at: "2023-09-16T10:20:33Z",
    template_id: "price-drop",
  },
];

const Notifications = () => {
  const { toast } = useToast();
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);
  const [isEditTemplateOpen, setIsEditTemplateOpen] = useState(false);
  const [isDeleteCampaignOpen, setIsDeleteCampaignOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [campaignName, setCampaignName] = useState("");
  const [campaignType, setCampaignType] = useState("email");
  const [campaignAudience, setCampaignAudience] = useState("all_users");
  const [campaignSchedule, setCampaignSchedule] = useState("now");
  const [templateSubject, setTemplateSubject] = useState("");
  const [templateBody, setTemplateBody] = useState("");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Scheduled</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getAudienceName = (audienceId: string) => {
    switch (audienceId) {
      case 'all_users':
        return 'All Users';
      case 'inactive_users':
        return 'Inactive Users';
      case 'recent_visitors':
        return 'Recent Visitors';
      case 'wishlist_users':
        return 'Users with Wishlists';
      case 'location_specific':
        return 'Location Specific Users';
      default:
        return 'Unknown Audience';
    }
  };

  const handleCreateCampaign = () => {
    toast({
      title: "Campaign Created",
      description: `Your ${campaignType} campaign "${campaignName}" has been created successfully.`,
    });
    setIsCreateCampaignOpen(false);
    
    // Reset form fields
    setCampaignName("");
    setCampaignType("email");
    setCampaignAudience("all_users");
    setCampaignSchedule("now");
  };

  const handleSaveTemplate = () => {
    toast({
      title: "Template Updated",
      description: "The notification template has been updated successfully.",
    });
    setIsEditTemplateOpen(false);
  };

  const handleDeleteCampaign = () => {
    toast({
      title: "Campaign Deleted",
      description: `The campaign "${selectedCampaign?.name}" has been deleted.`,
      variant: "destructive",
    });
    setIsDeleteCampaignOpen(false);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            <span>Campaigns</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>Templates</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Notification Settings</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Email & Push Campaigns</h2>
            <Button
              onClick={() => setIsCreateCampaignOpen(true)}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              <span>Create Campaign</span>
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Active & Upcoming Campaigns</CardTitle>
              <CardDescription>Manage your marketing campaigns and announcements</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Scheduled For</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={campaign.type === 'email' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}>
                          <div className="flex items-center gap-1">
                            {campaign.type === 'email' ? (
                              <Mail className="h-3 w-3" />
                            ) : (
                              <Bell className="h-3 w-3" />
                            )}
                            <span>{campaign.type === 'email' ? 'Email' : 'Push'}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span>{getAudienceName(campaign.audience)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{formatDate(campaign.scheduled_at)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {campaign.sent ? (
                          <Collapsible>
                            <CollapsibleTrigger asChild>
                              <Button variant="link" className="flex items-center gap-1 h-auto p-0">
                                <BarChart className="h-3 w-3" />
                                <span>{campaign.opened ? `${Math.round(campaign.opened / campaign.sent * 100)}% Open Rate` : 'View Stats'}</span>
                                <ChevronDown className="h-3 w-3" />
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-2 text-sm">
                              <div className="bg-muted/50 rounded-md p-2">
                                <div className="grid grid-cols-3 gap-2">
                                  <div>
                                    <div className="text-xs text-muted-foreground">Sent</div>
                                    <div className="font-medium">{campaign.sent.toLocaleString()}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground">Opened</div>
                                    <div className="font-medium">{campaign.opened ? campaign.opened.toLocaleString() : 0} ({campaign.opened ? Math.round(campaign.opened / campaign.sent * 100) : 0}%)</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground">Clicked</div>
                                    <div className="font-medium">{campaign.clicked ? campaign.clicked.toLocaleString() : 0} ({campaign.clicked ? Math.round(campaign.clicked / campaign.sent * 100) : 0}%)</div>
                                  </div>
                                </div>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        ) : (
                          <span className="text-muted-foreground">Not sent yet</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-red-500"
                            onClick={() => {
                              setSelectedCampaign(campaign);
                              setIsDeleteCampaignOpen(true);
                            }}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Monthly Email Sends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">48,294</div>
                <div className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-600 font-medium">+12.5%</span> from last month
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Open Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42.8%</div>
                <div className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-600 font-medium">+2.3%</span> from last month
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Click Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18.2%</div>
                <div className="text-xs text-muted-foreground mt-1">
                  <span className="text-amber-600 font-medium">-0.5%</span> from last month
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Templates</CardTitle>
              <CardDescription>Manage email and push notification templates</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="email">
                <TabsList className="mb-4">
                  <TabsTrigger value="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>Email Templates</span>
                  </TabsTrigger>
                  <TabsTrigger value="push" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span>Push Notification Templates</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="email" className="space-y-4">
                  {notificationTemplates
                    .filter(template => template.type === 'email')
                    .map((template) => (
                      <Card key={template.id}>
                        <CardHeader>
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <CardDescription className="text-sm">{template.subject}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <pre className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-md">
                            {template.body}
                          </pre>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Template Copied",
                                description: "Template content has been copied to clipboard.",
                              });
                            }}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => {
                              setSelectedTemplate(template);
                              setTemplateSubject(template.subject);
                              setTemplateBody(template.body);
                              setIsEditTemplateOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </TabsContent>
                
                <TabsContent value="push" className="space-y-4">
                  {notificationTemplates
                    .filter(template => template.type === 'push')
                    .map((template) => (
                      <Card key={template.id}>
                        <CardHeader>
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <CardDescription className="text-sm">{template.title}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <pre className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-md">
                            {template.body}
                          </pre>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Template Copied",
                                description: "Template content has been copied to clipboard.",
                              });
                            }}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </Button>
                          <Button variant="default" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure platform-wide notification settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Settings</h3>
                
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sender Name</label>
                      <Input defaultValue="CheckInSyria" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Reply-to Email</label>
                      <Input defaultValue="no-reply@checkinsyria.com" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Footer Text</label>
                    <Textarea 
                      defaultValue="© 2023 CheckInSyria. All rights reserved. You're receiving this email because you have an account with CheckInSyria. If you'd like to unsubscribe from marketing emails, click here: {unsubscribe_link}" 
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Push Notification Settings</h3>
                
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Default Icon</label>
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded bg-primary flex items-center justify-center text-white">
                          <Hotel className="h-6 w-6" />
                        </div>
                        <Button variant="outline" size="sm">Change</Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Default Landing URL</label>
                      <Input defaultValue="/dashboard" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Sending Limits</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Daily Email Limit</label>
                    <Select defaultValue="50000">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10000">10,000 emails per day</SelectItem>
                        <SelectItem value="25000">25,000 emails per day</SelectItem>
                        <SelectItem value="50000">50,000 emails per day</SelectItem>
                        <SelectItem value="100000">100,000 emails per day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Daily Push Notification Limit</label>
                    <Select defaultValue="100000">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25000">25,000 notifications per day</SelectItem>
                        <SelectItem value="50000">50,000 notifications per day</SelectItem>
                        <SelectItem value="100000">100,000 notifications per day</SelectItem>
                        <SelectItem value="unlimited">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={() => {
                toast({
                  title: "Settings Saved",
                  description: "Notification settings have been updated successfully.",
                });
              }}>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Campaign Dialog */}
      <Dialog open={isCreateCampaignOpen} onOpenChange={setIsCreateCampaignOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>
              Create a new marketing campaign or notification for your users
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Campaign Name</label>
              <Input 
                placeholder="E.g., Summer Sale 2023" 
                value={campaignName} 
                onChange={(e) => setCampaignName(e.target.value)} 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Campaign Type</label>
              <Select value={campaignType} onValueChange={setCampaignType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>Email Campaign</span>
                  </SelectItem>
                  <SelectItem value="push" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span>Push Notification</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Template</label>
              <Select defaultValue={campaignType === 'email' ? "promo-summer" : "new-hotel-alert"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {notificationTemplates
                    .filter(template => template.type === campaignType)
                    .map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Audience</label>
              <Select value={campaignAudience} onValueChange={setCampaignAudience}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_users" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>All Users</span>
                  </SelectItem>
                  <SelectItem value="inactive_users" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Inactive Users (30+ days)</span>
                  </SelectItem>
                  <SelectItem value="recent_visitors" className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Recent Website Visitors</span>
                  </SelectItem>
                  <SelectItem value="wishlist_users" className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    <span>Users with Wishlists</span>
                  </SelectItem>
                  <SelectItem value="location_specific" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>Location Specific Users</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {campaignAudience === 'location_specific' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Select defaultValue="damascus">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="damascus">Damascus, Syria</SelectItem>
                    <SelectItem value="aleppo">Aleppo, Syria</SelectItem>
                    <SelectItem value="tartus">Tartus, Syria</SelectItem>
                    <SelectItem value="latakia">Latakia, Syria</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Schedule</label>
              <Select value={campaignSchedule} onValueChange={setCampaignSchedule}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="now">Send Immediately</SelectItem>
                  <SelectItem value="later">Schedule for Later</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {campaignSchedule === 'later' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time</label>
                  <Input type="time" />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  <span>Marketing</span>
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  <span>Promotion</span>
                </Badge>
                <Button variant="outline" size="sm" className="h-6">
                  + Add Tag
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateCampaignOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateCampaign} disabled={!campaignName.trim()}>
              {campaignSchedule === 'now' ? 'Create & Send Now' : 'Schedule Campaign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={isEditTemplateOpen} onOpenChange={setIsEditTemplateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Update the {selectedTemplate?.type === 'email' ? 'email' : 'push notification'} template
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Template Name</label>
                <Input defaultValue={selectedTemplate.name} />
              </div>
              
              {selectedTemplate.type === 'email' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Subject</label>
                    <Input 
                      value={templateSubject} 
                      onChange={(e) => setTemplateSubject(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">Email Body</label>
                      <div className="text-xs text-muted-foreground">
                        Available variables: {"{first_name}"}, {"{hotel_name}"}, {"{booking_id}"}, etc.
                      </div>
                    </div>
                    <Textarea 
                      value={templateBody} 
                      onChange={(e) => setTemplateBody(e.target.value)} 
                      rows={8}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notification Title</label>
                    <Input defaultValue={selectedTemplate.title} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">Notification Body</label>
                      <div className="text-xs text-muted-foreground">
                        Keep it short and engaging
                      </div>
                    </div>
                    <Textarea defaultValue={selectedTemplate.body} rows={4} />
                  </div>
                </>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTemplateOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTemplate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Campaign Dialog */}
      <AlertDialog open={isDeleteCampaignOpen} onOpenChange={setIsDeleteCampaignOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this campaign? This action cannot be undone.
              <div className="mt-4 p-4 bg-muted rounded-md">
                <p className="font-medium">{selectedCampaign?.name}</p>
                <p className="text-sm text-muted-foreground">
                  Status: {selectedCampaign?.status}
                  {selectedCampaign?.scheduled_at && ` • Scheduled for: ${formatDate(selectedCampaign.scheduled_at)}`}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCampaign}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete Campaign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Notifications;
