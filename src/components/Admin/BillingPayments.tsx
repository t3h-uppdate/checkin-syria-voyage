
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Download,
  Filter,
  BarChart3,
  LineChart,
  ArrowUpRight,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  Hotel,
  User,
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line
} from "recharts";

// Mock data for revenue chart
const revenueData = [
  { month: 'Jan', revenue: 12400, commissions: 1240 },
  { month: 'Feb', revenue: 15100, commissions: 1510 },
  { month: 'Mar', revenue: 18000, commissions: 1800 },
  { month: 'Apr', revenue: 16800, commissions: 1680 },
  { month: 'May', revenue: 20500, commissions: 2050 },
  { month: 'Jun', revenue: 24300, commissions: 2430 },
  { month: 'Jul', revenue: 28100, commissions: 2810 },
  { month: 'Aug', revenue: 30200, commissions: 3020 },
  { month: 'Sep', revenue: 27800, commissions: 2780 },
  { month: 'Oct', revenue: 25600, commissions: 2560 },
  { month: 'Nov', revenue: 29300, commissions: 2930 },
  { month: 'Dec', revenue: 31800, commissions: 3180 },
];

// Mock data for transactions
type Transaction = {
  id: string;
  date: string;
  type: 'commission' | 'payout' | 'refund';
  amount: number;
  currency: string;
  status: 'completed' | 'processing' | 'failed';
  hotel_name: string;
  owner_name: string;
  booking_id?: string;
};

const transactions: Transaction[] = Array(20).fill(null).map((_, i) => {
  const type: ('commission' | 'payout' | 'refund') = 
    Math.random() > 0.7 ? 'payout' : Math.random() > 0.4 ? 'commission' : 'refund';
  
  const amount = type === 'commission' 
    ? Math.floor(Math.random() * 500) + 50
    : type === 'payout'
      ? Math.floor(Math.random() * 2000) + 500
      : Math.floor(Math.random() * 300) + 100;
  
  return {
    id: `txn-${i+1}`,
    date: new Date(Date.now() - Math.floor(Math.random() * 60) * 86400000).toISOString(),
    type,
    amount,
    currency: 'USD',
    status: Math.random() > 0.9 ? 'failed' : Math.random() > 0.8 ? 'processing' : 'completed',
    hotel_name: [`Grand Hotel`, `Beach Resort`, `Mountain Lodge`, `City Center Hotel`, `Lakeside Inn`][Math.floor(Math.random() * 5)],
    owner_name: `Owner ${Math.floor(Math.random() * 10) + 1}`,
    booking_id: type !== 'payout' ? `book-${Math.floor(Math.random() * 1000) + 1}` : undefined,
  };
});

const BillingPayments = () => {
  const [dateFilter, setDateFilter] = useState<string>("last30days");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const filteredTransactions = transactions.filter(txn => {
    if (typeFilter !== 'all' && txn.type !== typeFilter) return false;
    if (statusFilter !== 'all' && txn.status !== statusFilter) return false;
    // We would implement date filtering here with a real date library
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getTotalsByType = () => {
    return transactions.reduce((acc, txn) => {
      if (txn.status === 'completed') {
        if (txn.type === 'commission') {
          acc.commissions += txn.amount;
        } else if (txn.type === 'payout') {
          acc.payouts += txn.amount;
        } else if (txn.type === 'refund') {
          acc.refunds += txn.amount;
        }
      }
      return acc;
    }, { commissions: 0, payouts: 0, refunds: 0 });
  };

  const totals = getTotalsByType();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Commissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {formatCurrency(totals.commissions, 'USD')}
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 font-medium">+12.5%</span> from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Payouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {formatCurrency(totals.payouts, 'USD')}
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              <span className="text-blue-600 font-medium">+8.2%</span> from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Refunds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {formatCurrency(totals.refunds, 'USD')}
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <ArrowUpRight className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              <span className="text-red-600 font-medium">+2.1%</span> from last month
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Transactions</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Revenue & Commissions</CardTitle>
                  <CardDescription>Monthly platform revenue and commission overview</CardDescription>
                </div>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {dateFilter === 'last30days' ? 'Last 30 Days' :
                         dateFilter === 'last6months' ? 'Last 6 Months' :
                         dateFilter === 'last12months' ? 'Last 12 Months' : 'Custom Range'}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last30days">Last 30 Days</SelectItem>
                    <SelectItem value="last6months">Last 6 Months</SelectItem>
                    <SelectItem value="last12months">Last 12 Months</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={revenueData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`$${value}`, undefined]} 
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Bar 
                      name="Total Revenue" 
                      dataKey="revenue" 
                      fill="#3b82f6" 
                      radius={[4, 4, 0, 0]} 
                    />
                    <Bar 
                      name="Commissions" 
                      dataKey="commissions" 
                      fill="#10b981" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex justify-center mt-4 gap-8">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-blue-500 rounded"></div>
                  <span className="text-sm">Platform Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-green-500 rounded"></div>
                  <span className="text-sm">Commissions Earned</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Processing</CardTitle>
                <CardDescription>Transaction success rate over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={[
                        { date: 'Jan', success: 98.2 },
                        { date: 'Feb', success: 97.8 },
                        { date: 'Mar', success: 98.5 },
                        { date: 'Apr', success: 99.1 },
                        { date: 'May', success: 98.7 },
                        { date: 'Jun', success: 99.3 },
                        { date: 'Jul', success: 99.5 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[96, 100]} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="success" 
                        name="Success Rate (%)" 
                        stroke="#10b981" 
                        strokeWidth={2} 
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Commission Stats</CardTitle>
                <CardDescription>Average commissions by booking category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { category: 'Budget', avg: 25 },
                        { category: 'Standard', avg: 40 },
                        { category: 'Deluxe', avg: 75 },
                        { category: 'Luxury', avg: 120 },
                        { category: 'Premium', avg: 180 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="category" type="category" width={80} />
                      <Tooltip formatter={(value) => [`$${value}`, 'Avg. Commission']} />
                      <Bar 
                        dataKey="avg" 
                        fill="#8884d8" 
                        radius={[0, 4, 4, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-end">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span>Download Report</span>
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>View all platform financial transactions</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[140px]">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <span>Type</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="commission">Commissions</SelectItem>
                      <SelectItem value="payout">Payouts</SelectItem>
                      <SelectItem value="refund">Refunds</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <span>Status</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Hotel / Owner</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Booking ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((txn) => (
                      <TableRow key={txn.id}>
                        <TableCell className="font-mono text-xs">
                          {txn.id}
                        </TableCell>
                        <TableCell>{formatDate(txn.date)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={
                              txn.type === 'commission' ? 'bg-green-50 text-green-700 border-green-200' :
                              txn.type === 'payout' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              'bg-red-50 text-red-700 border-red-200'
                            }
                          >
                            {txn.type.charAt(0).toUpperCase() + txn.type.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(txn.amount, txn.currency)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {txn.type === 'payout' ? (
                              <User className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Hotel className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span>{txn.type === 'payout' ? txn.owner_name : txn.hotel_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {txn.status === 'completed' ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : txn.status === 'processing' ? (
                              <Clock className="h-4 w-4 text-amber-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span>{getStatusBadge(txn.status)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {txn.booking_id ? (
                            <span className="font-mono text-xs">{txn.booking_id}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillingPayments;
