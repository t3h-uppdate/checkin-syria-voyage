import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Database,
  Search,
  Filter,
  Download,
  AlertCircle,
  Info,
  AlertTriangle,
  CheckCircle,
  Code,
  RefreshCcw,
  ExternalLink,
  Calendar,
  Globe,
  Shield,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Mock data for system logs
type LogEntry = {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  service: 'api' | 'database' | 'auth' | 'payment' | 'booking';
  details?: Record<string, any>;
  source_ip?: string;
  user_id?: string;
  endpoint?: string;
};

// Generate mock logs
const generateMockLogs = (count: number): LogEntry[] => {
  const services = ['api', 'database', 'auth', 'payment', 'booking'];
  const levels = ['info', 'warning', 'error', 'debug'];
  const messages = [
    'User login successful',
    'Database connection timeout',
    'Payment processing completed',
    'API rate limit exceeded',
    'Booking created successfully',
    'Invalid authentication token',
    'Database query error',
    'Unauthorized access attempt',
    'Email notification sent',
    'File upload failed',
  ];

  return Array(count).fill(null).map((_, i) => {
    const service = services[Math.floor(Math.random() * services.length)] as 'api' | 'database' | 'auth' | 'payment' | 'booking';
    const level = levels[Math.floor(Math.random() * levels.length)] as 'info' | 'warning' | 'error' | 'debug';
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    return {
      id: `log-${i+1}`,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 7) * 86400000).toISOString(),
      level,
      message,
      service,
      source_ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      user_id: Math.random() > 0.3 ? `user-${Math.floor(Math.random() * 100) + 1}` : undefined,
      endpoint: service === 'api' ? `/api/v1/${['users', 'hotels', 'bookings', 'reviews'][Math.floor(Math.random() * 4)]}` : undefined,
      details: {
        request_id: `req-${Math.random().toString(36).substring(2, 10)}`,
        duration_ms: Math.floor(Math.random() * 500),
        ...(level === 'error' ? { 
          error_code: ['ERR_TIMEOUT', 'ERR_VALIDATION', 'ERR_AUTH', 'ERR_SERVER'][Math.floor(Math.random() * 4)],
          stack_trace: `Error: Something went wrong\n    at processRequest (/app/api/handlers.js:42:3)\n    at async Router.handle (/app/node_modules/framework/router.js:53:12)`
        } : {})
      }
    };
  });
};

const logs = generateMockLogs(100);
const apiCallStats = [
  { endpoint: '/api/v1/bookings', count: 12453, avgTime: 124, errorRate: 0.8 },
  { endpoint: '/api/v1/hotels', count: 28764, avgTime: 87, errorRate: 0.2 },
  { endpoint: '/api/v1/users', count: 9213, avgTime: 65, errorRate: 0.5 },
  { endpoint: '/api/v1/auth/login', count: 5427, avgTime: 230, errorRate: 1.2 },
  { endpoint: '/api/v1/payments', count: 3182, avgTime: 310, errorRate: 0.7 },
];

const SystemLogs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("last7days");
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [isLogDetailsOpen, setIsLogDetailsOpen] = useState(false);
  const { toast } = useToast();

  // Filter logs based on current filters
  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === "" || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.user_id && log.user_id.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLevel = levelFilter === "all" || log.level === levelFilter;
    const matchesService = serviceFilter === "all" || log.service === serviceFilter;
    
    // We would implement date filtering here with a real date library
    return matchesSearch && matchesLevel && matchesService;
  });

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'info':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Info</Badge>;
      case 'warning':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Warning</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'debug':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Debug</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'debug':
        return <Code className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span>System Logs</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            <span>API Monitoring</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Security Logs</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>System Logs</CardTitle>
                  <CardDescription>Browse and analyze system logs from all services</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => {
                    toast({
                      title: "Logs Refreshed",
                      description: "The system logs have been refreshed.",
                    });
                  }}
                >
                  <RefreshCcw className="h-4 w-4" />
                  <span>Refresh</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs by message, ID or user..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger className="w-[120px]">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <span>Level</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={serviceFilter} onValueChange={setServiceFilter}>
                    <SelectTrigger className="w-[120px]">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <span>Service</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                      <SelectItem value="auth">Auth</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="booking">Booking</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-[150px]">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Time Period</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="last24hours">Last 24 Hours</SelectItem>
                      <SelectItem value="last7days">Last 7 Days</SelectItem>
                      <SelectItem value="last30days">Last 30 Days</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </Button>
                </div>
              </div>
              
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Timestamp</TableHead>
                      <TableHead className="w-[100px]">Level</TableHead>
                      <TableHead className="w-[100px]">Service</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.slice(0, 15).map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs font-mono">
                          {formatDateTime(log.timestamp)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getLevelIcon(log.level)}
                            {getLevelBadge(log.level)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {log.service.charAt(0).toUpperCase() + log.service.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="truncate max-w-[400px]">
                          {log.message}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedLog(log);
                              setIsLogDetailsOpen(true);
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <div>
                  Showing {Math.min(15, filteredLogs.length)} of {filteredLogs.length} logs
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1">
                    <Info className="h-4 w-4 text-blue-500" />
                    <span>{logs.filter(l => l.level === 'info').length} Info</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span>{logs.filter(l => l.level === 'warning').length} Warning</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span>{logs.filter(l => l.level === 'error').length} Error</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Statistics</CardTitle>
              <CardDescription>Monitor API endpoints performance and error rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Endpoint</TableHead>
                      <TableHead className="text-right">Request Count</TableHead>
                      <TableHead className="text-right">Avg. Response Time</TableHead>
                      <TableHead className="text-right">Error Rate (%)</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiCallStats.map((stat, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-xs">
                          {stat.endpoint}
                        </TableCell>
                        <TableCell className="text-right">
                          {stat.count.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {stat.avgTime} ms
                        </TableCell>
                        <TableCell className="text-right">
                          {stat.errorRate.toFixed(1)}%
                        </TableCell>
                        <TableCell>
                          {stat.errorRate > 1 ? (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              <span>High Error Rate</span>
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              <span>Healthy</span>
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-medium">Recent API Errors</h3>
                
                <Accordion type="single" collapsible className="w-full">
                  {logs
                    .filter(log => log.service === 'api' && log.level === 'error')
                    .slice(0, 3)
                    .map((log, index) => (
                      <AccordionItem value={`error-${index}`} key={index}>
                        <AccordionTrigger className="hover:bg-muted/50 px-4">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <span className="font-medium">{log.message}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {formatDateTime(log.timestamp)}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pt-2 pb-4 bg-muted/30">
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-medium mb-1">Endpoint</h4>
                                <p className="text-sm font-mono">{log.endpoint}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-1">Error Code</h4>
                                <p className="text-sm font-mono">{log.details?.error_code}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-1">Source IP</h4>
                                <p className="text-sm font-mono">{log.source_ip}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-1">Request ID</h4>
                                <p className="text-sm font-mono">{log.details?.request_id}</p>
                              </div>
                            </div>
                            
                            {log.details?.stack_trace && (
                              <div>
                                <h4 className="text-sm font-medium mb-1">Stack Trace</h4>
                                <pre className="text-xs font-mono bg-muted p-2 rounded-md overflow-x-auto">
                                  {log.details.stack_trace}
                                </pre>
                              </div>
                            )}
                            
                            <div className="flex justify-end">
                              <Button variant="outline" size="sm" className="flex items-center gap-1">
                                <ExternalLink className="h-3 w-3" />
                                <span>View Full Log</span>
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                </Accordion>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Audit Logs</CardTitle>
              <CardDescription>Monitor authentication and authorization events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Failed Login Attempts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">24</div>
                      <div className="text-xs text-red-600 mt-1">
                        +12 from yesterday
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Suspicious IP Addresses
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">3</div>
                      <div className="text-xs text-amber-600 mt-1">
                        +1 from yesterday
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Admin Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">42</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Last 24 hours
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Location</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="text-xs font-mono">2023-09-14T08:23:15Z</TableCell>
                        <TableCell>
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            <span>Failed Login Attempt</span>
                          </Badge>
                        </TableCell>
                        <TableCell>admin@example.com</TableCell>
                        <TableCell className="font-mono text-xs">195.24.68.193</TableCell>
                        <TableCell className="flex items-center gap-1">
                          <Globe className="h-3 w-3 text-muted-foreground" />
                          <span>Moscow, Russia</span>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs font-mono">2023-09-14T06:45:22Z</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Successful Login
                          </Badge>
                        </TableCell>
                        <TableCell>owner15@example.com</TableCell>
                        <TableCell className="font-mono text-xs">104.28.97.142</TableCell>
                        <TableCell className="flex items-center gap-1">
                          <Globe className="h-3 w-3 text-muted-foreground" />
                          <span>New York, USA</span>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs font-mono">2023-09-13T22:12:08Z</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Permission Change
                          </Badge>
                        </TableCell>
                        <TableCell>admin@example.com</TableCell>
                        <TableCell className="font-mono text-xs">81.172.34.56</TableCell>
                        <TableCell className="flex items-center gap-1">
                          <Globe className="h-3 w-3 text-muted-foreground" />
                          <span>Amsterdam, Netherlands</span>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs font-mono">2023-09-13T18:37:44Z</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            Password Reset
                          </Badge>
                        </TableCell>
                        <TableCell>user29@example.com</TableCell>
                        <TableCell className="font-mono text-xs">45.88.193.102</TableCell>
                        <TableCell className="flex items-center gap-1">
                          <Globe className="h-3 w-3 text-muted-foreground" />
                          <span>Berlin, Germany</span>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs font-mono">2023-09-13T15:19:32Z</TableCell>
                        <TableCell>
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            <span>Unauthorized API Access</span>
                          </Badge>
                        </TableCell>
                        <TableCell>Unknown</TableCell>
                        <TableCell className="font-mono text-xs">118.24.76.199</TableCell>
                        <TableCell className="flex items-center gap-1">
                          <Globe className="h-3 w-3 text-muted-foreground" />
                          <span>Beijing, China</span>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    <span>Download Full Audit Log</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Log Details Dialog */}
      <Dialog open={isLogDetailsOpen} onOpenChange={setIsLogDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedLog && getLevelIcon(selectedLog.level)}
              <span>Log Details</span>
              <Badge className="ml-2">{selectedLog?.id}</Badge>
            </DialogTitle>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Timestamp</h4>
                  <p className="text-sm font-mono">{formatDateTime(selectedLog.timestamp)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Level</h4>
                  <div>{getLevelBadge(selectedLog.level)}</div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Service</h4>
                  <Badge variant="outline">
                    {selectedLog.service.charAt(0).toUpperCase() + selectedLog.service.slice(1)}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Source IP</h4>
                  <p className="text-sm font-mono">{selectedLog.source_ip || 'N/A'}</p>
                </div>
                {selectedLog.user_id && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">User ID</h4>
                    <p className="text-sm font-mono">{selectedLog.user_id}</p>
                  </div>
                )}
                {selectedLog.endpoint && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Endpoint</h4>
                    <p className="text-sm font-mono">{selectedLog.endpoint}</p>
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Message</h4>
                <div className="bg-muted p-3 rounded-md">
                  {selectedLog.message}
                </div>
              </div>
              
              {selectedLog.details && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Details</h4>
                  <pre className="text-xs font-mono bg-muted/50 p-3 rounded-md overflow-x-auto max-h-[300px] overflow-y-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
              
              {selectedLog.level === 'error' && selectedLog.details?.stack_trace && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Stack Trace</h4>
                  <pre className="text-xs font-mono bg-muted/50 p-3 rounded-md overflow-x-auto max-h-[200px] overflow-y-auto">
                    {selectedLog.details.stack_trace}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SystemLogs;
