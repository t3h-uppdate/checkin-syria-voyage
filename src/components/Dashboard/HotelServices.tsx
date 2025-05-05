
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Hotel } from "@/types";
import { 
  PlusCircle, 
  Coffee, 
  Car, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  DollarSign 
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Switch } from "@/components/ui/switch";

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

const serviceSchema = z.object({
  name: z.string().min(2, "Service name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  available: z.boolean().default(true),
});

const HotelServices = ({ hotel }: HotelServicesProps) => {
  const [services, setServices] = useState<Service[]>([
    {
      id: '1',
      name: 'Breakfast',
      description: 'Continental breakfast served between 07:00-10:00',
      price: 150,
      available: true
    },
    {
      id: '2',
      name: 'Airport Transfer',
      description: 'Transportation to and from the airport',
      price: 500,
      available: true
    },
    {
      id: '3',
      name: 'Spa Access',
      description: 'Full day access to our luxury spa facilities',
      price: 300,
      available: true
    },
    {
      id: '4',
      name: 'Late Check-out',
      description: 'Extended check-out until 4 PM',
      price: 200,
      available: true
    }
  ]);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  const form = useForm<z.infer<typeof serviceSchema>>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      available: true,
    },
  });

  const handleAddNewService = (data: z.infer<typeof serviceSchema>) => {
    const newService: Service = {
      id: Date.now().toString(),
      name: data.name,
      description: data.description,
      price: data.price,
      available: data.available,
    };
    
    setServices([...services, newService]);
    toast.success("Service added successfully");
    setIsAddDialogOpen(false);
    form.reset();
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    form.reset({
      name: service.name,
      description: service.description,
      price: service.price,
      available: service.available,
    });
    setIsAddDialogOpen(true);
  };

  const handleUpdateService = (data: z.infer<typeof serviceSchema>) => {
    if (!editingService) return;
    
    const updatedServices = services.map((service) => 
      service.id === editingService.id 
        ? { ...service, ...data } 
        : service
    );
    
    setServices(updatedServices);
    toast.success("Service updated successfully");
    setIsAddDialogOpen(false);
    setEditingService(null);
    form.reset();
  };

  const handleDeleteService = (id: string) => {
    setServiceToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteService = () => {
    if (!serviceToDelete) return;
    
    const updatedServices = services.filter(service => service.id !== serviceToDelete);
    setServices(updatedServices);
    toast.success("Service removed successfully");
    setIsDeleteDialogOpen(false);
    setServiceToDelete(null);
  };

  const toggleServiceAvailability = (id: string) => {
    const updatedServices = services.map(service => 
      service.id === id 
        ? { ...service, available: !service.available } 
        : service
    );
    setServices(updatedServices);
    
    const service = updatedServices.find(s => s.id === id);
    if (service) {
      toast.success(`Service ${service.available ? 'enabled' : 'disabled'} successfully`);
    }
  };

  if (!hotel) {
    return (
      <div className="p-8 bg-muted rounded-lg text-center border-2 border-dashed border-muted">
        <Coffee className="h-12 w-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-medium mb-2">Manage Services</h3>
        <p className="text-muted-foreground">Select a hotel first to manage its services.</p>
      </div>
    );
  }

  return (
    <>
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Services for {hotel.name}</CardTitle>
            <CardDescription>Manage the additional services offered by your hotel</CardDescription>
          </div>
          <Button onClick={() => {
            form.reset();
            setEditingService(null);
            setIsAddDialogOpen(true);
          }}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add service
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.length === 0 ? (
              <div className="col-span-full p-8 text-center border rounded-lg border-dashed">
                <Coffee className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No services added yet. Add your first service to get started.</p>
              </div>
            ) : (
              services.map((service) => (
                <Card key={service.id} className={`transition-all ${!service.available ? 'opacity-70' : ''}`}>
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="space-y-1">
                        <h3 className="font-medium text-lg flex items-center gap-2">
                          {service.name}
                          {!service.available && <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">Unavailable</span>}
                        </h3>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mb-3">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{service.price.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={service.available}
                          onCheckedChange={() => toggleServiceAvailability(service.id)}
                        />
                        <span className="text-sm">{service.available ? 'Available' : 'Unavailable'}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditService(service)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteService(service.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Service Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingService ? "Edit Service" : "Add New Service"}</DialogTitle>
            <DialogDescription>
              {editingService
                ? "Update the details of this service."
                : "Add a new service to offer to your guests."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(editingService ? handleUpdateService : handleAddNewService)} 
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Breakfast, Airport Transfer, etc." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Describe what the service includes..."
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input {...field} type="number" min="0" step="0.01" className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="available"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Available</FormLabel>
                      <FormDescription>
                        Make this service available to guests
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
              
              <DialogFooter>
                <Button type="submit" className="w-full">
                  {editingService ? "Update Service" : "Add Service"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this service? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteService}>
              Delete Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HotelServices;
