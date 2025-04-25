
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hotel } from "@/types";
import { Percent, PlusCircle, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface PromotionsManagementProps {
  hotel: Hotel | null;
}

interface Promotion {
  id: string;
  name: string;
  description: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  active: boolean;
}

const PromotionsManagement = ({ hotel }: PromotionsManagementProps) => {
  const { toast } = useToast();
  const [promotions, setPromotions] = useState<Promotion[]>([
    {
      id: '1',
      name: 'Sommarkampanj',
      description: '20% rabatt på alla bokningar under sommaren',
      discountPercent: 20,
      startDate: '2024-06-01',
      endDate: '2024-08-31',
      active: true
    },
    {
      id: '2',
      name: 'Helgerbjudande',
      description: '15% rabatt på helgbokningar',
      discountPercent: 15,
      startDate: '2024-05-01',
      endDate: '2024-12-31',
      active: true
    }
  ]);

  if (!hotel) {
    return (
      <div className="p-8 bg-muted rounded-lg text-center border-2 border-dashed border-muted">
        <Percent className="h-12 w-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-medium mb-2">Kampanjhantering</h3>
        <p className="text-muted-foreground">Välj ett hotell först för att hantera kampanjer.</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Kampanjer för {hotel.name}</CardTitle>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Skapa ny kampanj
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {promotions.map((promotion) => (
            <Card key={promotion.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="font-medium">{promotion.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {promotion.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4 text-primary" />
                      <span className="font-medium">
                        {promotion.discountPercent}% rabatt
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {new Date(promotion.startDate).toLocaleDateString()} - {new Date(promotion.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button
                      variant={promotion.active ? "default" : "outline"}
                      size="sm"
                    >
                      {promotion.active ? "Aktiv" : "Inaktiv"}
                    </Button>
                    <Button variant="outline" size="sm">
                      Redigera
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PromotionsManagement;
