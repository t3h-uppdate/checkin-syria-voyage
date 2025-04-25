
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hotel } from "@/types";
import { Receipt, TrendingUp, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface RevenueReportsProps {
  hotel: Hotel | null;
}

const RevenueReports = ({ hotel }: RevenueReportsProps) => {
  const { toast } = useToast();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const data = [
    { name: '20 Apr', revenue: 15000 },
    { name: '21 Apr', revenue: 12000 },
    { name: '22 Apr', revenue: 18000 },
    { name: '23 Apr', revenue: 16000 },
    { name: '24 Apr', revenue: 20000 },
    { name: '25 Apr', revenue: 22000 },
    { name: '26 Apr', revenue: 19000 },
  ];

  if (!hotel) {
    return (
      <div className="p-8 bg-muted rounded-lg text-center border-2 border-dashed border-muted">
        <Receipt className="h-12 w-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-medium mb-2">Intäktsrapporter</h3>
        <p className="text-muted-foreground">Välj ett hotell först för att se intäktsrapporter.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Intäkter för {hotel.name}</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={period === 'daily' ? 'default' : 'outline'}
              onClick={() => setPeriod('daily')}
            >
              Daglig
            </Button>
            <Button
              variant={period === 'weekly' ? 'default' : 'outline'}
              onClick={() => setPeriod('weekly')}
            >
              Veckovis
            </Button>
            <Button
              variant={period === 'monthly' ? 'default' : 'outline'}
              onClick={() => setPeriod('monthly')}
            >
              Månadsvis
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sammanfattning</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Dagens intäkter</p>
                    <h3 className="text-2xl font-bold">19,000 kr</h3>
                  </div>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Veckans intäkter</p>
                    <h3 className="text-2xl font-bold">122,000 kr</h3>
                  </div>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Månadens intäkter</p>
                    <h3 className="text-2xl font-bold">450,000 kr</h3>
                  </div>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Button className="mt-6" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Ladda ner rapport
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueReports;
