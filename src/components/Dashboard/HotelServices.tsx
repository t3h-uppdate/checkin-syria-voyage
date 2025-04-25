
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Hotel } from "@/types";
import { PlusCircle, Coffee, Car, Spa } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface HotelServicesProps {
  hotel: Hotel | null;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
}

const HotelServices = ({ hotel }: HotelServicesProps) => {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([
    {
      id: '1',
      name: 'Frukost',
      description: 'Kontinental frukost serveras mellan 07:00-10:00',
      price: 150,
      available: true
    },
    {
      id: '2',
      name: 'Flygplatstransfer',
      description: 'Transport till och från flygplatsen',
      price: 500,
      available: true
    }
  ]);

  if (!hotel) {
    return (
      <div className="p-8 bg-muted rounded-lg text-center border-2 border-dashed border-muted">
        <Coffee className="h-12 w-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-medium mb-2">Hantera Tjänster</h3>
        <p className="text-muted-foreground">Välj ett hotell först för att hantera dess tjänster.</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tjänster för {hotel.name}</CardTitle>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Lägg till tjänst
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <Card key={service.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                    <p className="text-sm font-medium mt-2">{service.price} kr</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Redigera
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HotelServices;
