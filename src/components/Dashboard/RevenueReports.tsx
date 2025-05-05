
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hotel } from "@/types";
import { Receipt, TrendingUp, Download, Calendar, Clock, ChevronDown, PlusSquare, MinusSquare, ArrowDownUp, ArrowUpRight, ArrowDownRight, Filter } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface RevenueReportsProps {
  hotel: Hotel | null;
}

// Helper function to get color based on comparison with previous period
const getComparisonColor = (change: number) => {
  if (change > 0) return "text-green-500";
  if (change < 0) return "text-red-500";
  return "text-muted-foreground";
};

// Helper function to get icon based on comparison with previous period
const getComparisonIcon = (change: number) => {
  if (change > 0) return <ArrowUpRight className="h-4 w-4" />;
  if (change < 0) return <ArrowDownRight className="h-4 w-4" />;
  return <ArrowDownUp className="h-4 w-4" />;
};

const RevenueReports = ({ hotel }: RevenueReportsProps) => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2024, 3, 20),
    to: new Date(2024, 3, 26),
  });
  const [tab, setTab] = useState("overview");
  
  // Sample data
  const dailyData = [
    { name: 'Apr 20', revenue: 15000, occupancy: 75, bookings: 12 },
    { name: 'Apr 21', revenue: 12000, occupancy: 70, bookings: 10 },
    { name: 'Apr 22', revenue: 18000, occupancy: 85, bookings: 15 },
    { name: 'Apr 23', revenue: 16000, occupancy: 80, bookings: 13 },
    { name: 'Apr 24', revenue: 20000, occupancy: 90, bookings: 16 },
    { name: 'Apr 25', revenue: 22000, occupancy: 95, bookings: 18 },
    { name: 'Apr 26', revenue: 19000, occupancy: 85, bookings: 15 },
  ];

  const weeklyData = [
    { name: 'Week 14', revenue: 90000, occupancy: 75, bookings: 74 },
    { name: 'Week 15', revenue: 105000, occupancy: 80, bookings: 82 },
    { name: 'Week 16', revenue: 95000, occupancy: 78, bookings: 79 },
    { name: 'Week 17', revenue: 122000, occupancy: 85, bookings: 96 },
  ];

  const monthlyData = [
    { name: 'Jan', revenue: 380000, occupancy: 70, bookings: 310 },
    { name: 'Feb', revenue: 420000, occupancy: 75, bookings: 345 },
    { name: 'Mar', revenue: 450000, occupancy: 80, bookings: 370 },
    { name: 'Apr', revenue: 430000, occupancy: 78, bookings: 356 },
  ];

  const revenueByRoomType = [
    { name: 'Standard', value: 35 },
    { name: 'Deluxe', value: 25 },
    { name: 'Suite', value: 20 },
    { name: 'Executive', value: 15 },
    { name: 'Family', value: 5 },
  ];

  const revenueByChannel = [
    { name: 'Direct Booking', value: 40 },
    { name: 'Booking.com', value: 25 },
    { name: 'Expedia', value: 15 },
    { name: 'Airbnb', value: 10 },
    { name: 'Other', value: 10 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const getData = () => {
    switch (period) {
      case 'daily': return dailyData;
      case 'weekly': return weeklyData;
      case 'monthly': return monthlyData;
      default: return dailyData;
    }
  };

  const handleDownloadReport = () => {
    toast.success("Report downloaded successfully");
  };

  if (!hotel) {
    return (
      <div className="p-8 bg-muted rounded-lg text-center border-2 border-dashed border-muted">
        <Receipt className="h-12 w-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-medium mb-2">Revenue Reports</h3>
        <p className="text-muted-foreground">Select a hotel first to view revenue reports.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Revenue Dashboard: {hotel.name}</CardTitle>
              <CardDescription>Track and analyze your hotel's financial performance</CardDescription>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {/* Date Range Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              
              {/* Download Report Button */}
              <Button variant="outline" onClick={handleDownloadReport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="overview" className="mt-4" value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                        <h3 className="text-2xl font-bold">$122,000</h3>
                        <div className="flex items-center mt-1 text-sm text-green-500">
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                          <span>+8.5% vs last period</span>
                        </div>
                      </div>
                      <div className="bg-primary/10 p-3 rounded-full">
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Average Daily Rate</p>
                        <h3 className="text-2xl font-bold">$210</h3>
                        <div className="flex items-center mt-1 text-sm text-green-500">
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                          <span>+5.2% vs last period</span>
                        </div>
                      </div>
                      <div className="bg-primary/10 p-3 rounded-full">
                        <DollarSign className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Occupancy Rate</p>
                        <h3 className="text-2xl font-bold">85.7%</h3>
                        <div className="flex items-center mt-1 text-sm text-green-500">
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                          <span>+3.2% vs last period</span>
                        </div>
                      </div>
                      <div className="bg-primary/10 p-3 rounded-full">
                        <Bed className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">RevPAR</p>
                        <h3 className="text-2xl font-bold">$180</h3>
                        <div className="flex items-center mt-1 text-sm text-green-500">
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                          <span>+7.1% vs last period</span>
                        </div>
                      </div>
                      <div className="bg-primary/10 p-3 rounded-full">
                        <LineChart className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Revenue Chart */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <CardTitle>Revenue Trend</CardTitle>
                    <div className="flex gap-2">
                      <div className="flex gap-1">
                        <Button
                          variant={chartType === 'line' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setChartType('line')}
                          className="h-8 px-3"
                        >
                          Line
                        </Button>
                        <Button
                          variant={chartType === 'bar' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setChartType('bar')}
                          className="h-8 px-3"
                        >
                          Bar
                        </Button>
                      </div>
                      <Select value={period} onValueChange={(value) => setPeriod(value as any)}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === 'line' ? (
                        <LineChart data={getData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip 
                            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#2563eb"
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      ) : (
                        <BarChart data={getData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip 
                            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                          />
                          <Legend />
                          <Bar dataKey="revenue" fill="#2563eb" />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Trends Tab */}
            <TabsContent value="trends" className="space-y-6">
              {/* Occupancy Rate vs Revenue */}
              <Card>
                <CardHeader>
                  <CardTitle>Occupancy Rate vs Revenue</CardTitle>
                  <CardDescription>
                    Correlation between occupancy and generated revenue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <RechartsTooltip />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="revenue"
                          stroke="#2563eb"
                          name="Revenue ($)"
                          strokeWidth={2}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="occupancy"
                          stroke="#10b981"
                          name="Occupancy (%)"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Booking Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Booking Trends</CardTitle>
                  <CardDescription>
                    Number of bookings over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="bookings" fill="#8884d8" name="Number of Bookings" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Breakdown Tab */}
            <TabsContent value="breakdown" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Revenue by Room Type */}
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Room Type</CardTitle>
                    <CardDescription>
                      Distribution of revenue across different room types
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={revenueByRoomType}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {revenueByRoomType.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip formatter={(value: number) => [`${value}%`, 'Percentage']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Revenue by Channel */}
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Distribution Channel</CardTitle>
                    <CardDescription>
                      Revenue breakdown by booking source
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={revenueByChannel}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {revenueByChannel.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip formatter={(value: number) => [`${value}%`, 'Percentage']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueReports;
