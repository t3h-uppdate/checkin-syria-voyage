
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hotel } from "@/types";
import { Percent, PlusCircle, Calendar, Edit, Trash2, BarChart, CheckCircle2, XCircle, Clock } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface PromotionsManagementProps {
  hotel: Hotel | null;
}

interface Promotion {
  id: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  active: boolean;
  code?: string;
  roomTypes?: string[];
  minNights?: number;
  maxNights?: number;
  maxUses?: number;
  usesCount?: number;
  revenue?: number;
  bookings?: number;
}

const formSchema = z.object({
  name: z.string().min(2, "Promotion name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.coerce.number().min(0, "Discount value cannot be negative"),
  code: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  active: z.boolean().default(true),
  roomTypes: z.array(z.string()).optional(),
  minNights: z.coerce.number().min(1, "Minimum nights must be at least 1").optional(),
  maxNights: z.coerce.number().optional(),
  maxUses: z.coerce.number().optional(),
}).refine(data => data.endDate >= data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
}).refine(data => {
  if (data.maxNights && data.minNights) {
    return data.maxNights >= data.minNights;
  }
  return true;
}, {
  message: "Max nights must be greater than or equal to min nights",
  path: ["maxNights"],
});

const PromotionsManagement = ({ hotel }: PromotionsManagementProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<string | null>(null);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  
  const [promotions, setPromotions] = useState<Promotion[]>([
    {
      id: '1',
      name: 'Summer Campaign',
      description: '20% discount on all bookings during summer',
      discountType: 'percentage',
      discountValue: 20,
      startDate: '2024-06-01',
      endDate: '2024-08-31',
      active: true,
      code: 'SUMMER24',
      roomTypes: ['Standard', 'Deluxe', 'Suite'],
      minNights: 2,
      maxUses: 100,
      usesCount: 45,
      revenue: 85000,
      bookings: 45
    },
    {
      id: '2',
      name: 'Weekend Special',
      description: '15% discount on weekend bookings',
      discountType: 'percentage',
      discountValue: 15,
      startDate: '2024-05-01',
      endDate: '2024-12-31',
      active: true,
      roomTypes: ['All'],
      minNights: 2,
      maxNights: 3,
      usesCount: 28,
      revenue: 42000,
      bookings: 28
    },
    {
      id: '3',
      name: 'Early Bird Discount',
      description: 'Book 30 days in advance and save $50 per night',
      discountType: 'fixed',
      discountValue: 50,
      startDate: '2024-05-15',
      endDate: '2024-09-30',
      active: true,
      code: 'EARLY50',
      roomTypes: ['Deluxe', 'Suite', 'Executive'],
      maxUses: 200,
      usesCount: 15,
      revenue: 28500,
      bookings: 15
    },
    {
      id: '4',
      name: 'Winter Holiday',
      description: '25% off for bookings during the winter holiday season',
      discountType: 'percentage',
      discountValue: 25,
      startDate: '2024-12-15',
      endDate: '2025-01-05',
      active: false,
      roomTypes: ['All'],
      minNights: 3,
      usesCount: 0,
      revenue: 0,
      bookings: 0
    }
  ]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      discountType: "percentage",
      discountValue: 0,
      code: "",
      startDate: new Date(),
      endDate: new Date(),
      active: true,
      roomTypes: [],
      minNights: undefined,
      maxNights: undefined,
      maxUses: undefined,
    },
  });

  const handleCreatePromotion = (data: z.infer<typeof formSchema>) => {
    const newPromotion: Promotion = {
      id: Date.now().toString(),
      name: data.name,
      description: data.description,
      discountType: data.discountType,
      discountValue: data.discountValue,
      startDate: data.startDate.toISOString().split('T')[0],
      endDate: data.endDate.toISOString().split('T')[0],
      active: data.active,
      code: data.code,
      roomTypes: data.roomTypes,
      minNights: data.minNights,
      maxNights: data.maxNights,
      maxUses: data.maxUses,
      usesCount: 0,
      revenue: 0,
      bookings: 0
    };
    
    setPromotions([...promotions, newPromotion]);
    toast.success("Promotion created successfully");
    setIsDialogOpen(false);
    form.reset();
  };

  const handleEditPromotion = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    form.reset({
      name: promotion.name,
      description: promotion.description,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      code: promotion.code || "",
      startDate: new Date(promotion.startDate),
      endDate: new Date(promotion.endDate),
      active: promotion.active,
      roomTypes: promotion.roomTypes || [],
      minNights: promotion.minNights,
      maxNights: promotion.maxNights,
      maxUses: promotion.maxUses,
    });
    setIsDialogOpen(true);
  };

  const handleUpdatePromotion = (data: z.infer<typeof formSchema>) => {
    if (!editingPromotion) return;
    
    const updatedPromotions = promotions.map((promotion) => 
      promotion.id === editingPromotion.id 
        ? { 
            ...promotion, 
            name: data.name,
            description: data.description,
            discountType: data.discountType,
            discountValue: data.discountValue,
            startDate: data.startDate.toISOString().split('T')[0],
            endDate: data.endDate.toISOString().split('T')[0],
            active: data.active,
            code: data.code,
            roomTypes: data.roomTypes,
            minNights: data.minNights,
            maxNights: data.maxNights,
            maxUses: data.maxUses,
          } 
        : promotion
    );
    
    setPromotions(updatedPromotions);
    toast.success("Promotion updated successfully");
    setIsDialogOpen(false);
    setEditingPromotion(null);
    form.reset();
  };

  const handleDeletePromotion = (id: string) => {
    setPromotionToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeletePromotion = () => {
    if (!promotionToDelete) return;
    
    const updatedPromotions = promotions.filter(promotion => promotion.id !== promotionToDelete);
    setPromotions(updatedPromotions);
    toast.success("Promotion removed successfully");
    setIsDeleteDialogOpen(false);
    setPromotionToDelete(null);
  };

  const togglePromotionStatus = (id: string) => {
    const updatedPromotions = promotions.map(promotion => 
      promotion.id === id 
        ? { ...promotion, active: !promotion.active } 
        : promotion
    );
    setPromotions(updatedPromotions);
    
    const promotion = updatedPromotions.find(p => p.id === id);
    if (promotion) {
      toast.success(`Promotion ${promotion.active ? 'activated' : 'deactivated'} successfully`);
    }
  };

  // Calculate total revenue and bookings from active promotions
  const totalRevenue = promotions.reduce((sum, promo) => sum + (promo.revenue || 0), 0);
  const totalBookings = promotions.reduce((sum, promo) => sum + (promo.bookings || 0), 0);
  const activePromotions = promotions.filter(promo => promo.active);

  if (!hotel) {
    return (
      <div className="p-8 bg-muted rounded-lg text-center border-2 border-dashed border-muted">
        <Percent className="h-12 w-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-medium mb-2">Promotions Management</h3>
        <p className="text-muted-foreground">Select a hotel first to manage promotions.</p>
      </div>
    );
  }

  return (
    <>
      <Tabs defaultValue="active">
        <div className="space-y-6">
          <Card className="shadow-md">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
              <div>
                <CardTitle>Promotions for {hotel.name}</CardTitle>
                <CardDescription>Manage special offers and discounts</CardDescription>
              </div>
              <Button onClick={() => {
                setEditingPromotion(null);
                form.reset({
                  name: "",
                  description: "",
                  discountType: "percentage",
                  discountValue: 0,
                  code: "",
                  startDate: new Date(),
                  endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                  active: true,
                  roomTypes: [],
                });
                setIsDialogOpen(true);
              }}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create promotion
              </Button>
            </CardHeader>
            
            <CardContent>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Promotions</p>
                        <h3 className="text-2xl font-bold">{activePromotions.length}</h3>
                        <p className="text-sm text-muted-foreground mt-1">Total: {promotions.length}</p>
                      </div>
                      <div className="bg-primary/10 p-3 rounded-full">
                        <Percent className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Bookings</p>
                        <h3 className="text-2xl font-bold">{totalBookings}</h3>
                        <p className="text-sm text-muted-foreground mt-1">Using promotions</p>
                      </div>
                      <div className="bg-primary/10 p-3 rounded-full">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                        <h3 className="text-2xl font-bold">${totalRevenue.toLocaleString()}</h3>
                        <p className="text-sm text-muted-foreground mt-1">From promoted bookings</p>
                      </div>
                      <div className="bg-primary/10 p-3 rounded-full">
                        <BarChart className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Tabs for Promotions */}
              <TabsList className="mb-6">
                <TabsTrigger value="active">Active Promotions</TabsTrigger>
                <TabsTrigger value="inactive">Inactive Promotions</TabsTrigger>
                <TabsTrigger value="all">All Promotions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="active">
                {renderPromotionsList(promotions.filter(p => p.active))}
              </TabsContent>
              
              <TabsContent value="inactive">
                {renderPromotionsList(promotions.filter(p => !p.active))}
              </TabsContent>
              
              <TabsContent value="all">
                {renderPromotionsList(promotions)}
              </TabsContent>
            </CardContent>
          </Card>
        </div>
      </Tabs>
      
      {/* Create/Edit Promotion Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingPromotion ? "Edit Promotion" : "Create New Promotion"}</DialogTitle>
            <DialogDescription>
              {editingPromotion
                ? "Update the details of your promotion."
                : "Create a new special offer or discount for your guests."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(editingPromotion ? handleUpdatePromotion : handleCreatePromotion)} 
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Promotion Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Summer Special, Weekend Deal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div>
                        <FormLabel>Status</FormLabel>
                        <FormDescription>
                          Is this promotion active?
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
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the details of your promotion..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="discountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select discount type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage (%)</SelectItem>
                          <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="discountValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Value</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            {form.watch("discountType") === "percentage" ? "%" : "$"}
                          </span>
                          <Input 
                            type="number" 
                            min="0" 
                            step={form.watch("discountType") === "percentage" ? "1" : "0.01"} 
                            className="pl-8" 
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Promotion Code (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. SUMMER2024" {...field} />
                    </FormControl>
                    <FormDescription>
                      Leave blank if no code is required to apply this promotion
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minNights"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Nights (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="maxNights"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Nights (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="maxUses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Uses (Optional)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormDescription>
                      Leave blank for unlimited uses
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPromotion ? "Update Promotion" : "Create Promotion"}
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
              Are you sure you want to delete this promotion? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeletePromotion}>
              Delete Promotion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );

  function renderPromotionsList(promotionsToRender: Promotion[]) {
    if (promotionsToRender.length === 0) {
      return (
        <div className="text-center p-8 border rounded-lg border-dashed">
          <Percent className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No promotions found</h3>
          <p className="text-muted-foreground mb-4">
            Create a promotion to offer special discounts to your guests
          </p>
          <Button onClick={() => {
            setEditingPromotion(null);
            form.reset({
              name: "",
              description: "",
              discountType: "percentage",
              discountValue: 0,
              code: "",
              startDate: new Date(),
              endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
              active: true,
              roomTypes: [],
            });
            setIsDialogOpen(true);
          }}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create First Promotion
          </Button>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promotionsToRender.map((promotion) => {
          // Calculate if the promotion is currently active based on dates and status
          const now = new Date();
          const startDate = new Date(promotion.startDate);
          const endDate = new Date(promotion.endDate);
          const isCurrentlyActive = promotion.active && now >= startDate && now <= endDate;
          
          // Calculate usage percentage if maxUses is set
          const usagePercentage = promotion.maxUses 
            ? Math.min(100, Math.round((promotion.usesCount || 0) * 100 / promotion.maxUses))
            : null;
            
          return (
            <Card key={promotion.id} className={`border ${isCurrentlyActive ? 'border-primary/50' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {promotion.name}
                      {isCurrentlyActive && (
                        <Badge className="ml-2">Active</Badge>
                      )}
                      {!promotion.active && (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                      {promotion.active && !isCurrentlyActive && now < startDate && (
                        <Badge variant="secondary">Upcoming</Badge>
                      )}
                      {promotion.active && !isCurrentlyActive && now > endDate && (
                        <Badge variant="outline" className="bg-muted">Expired</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{promotion.description}</CardDescription>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => togglePromotionStatus(promotion.id)}>
                      {promotion.active ? (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEditPromotion(promotion)}>
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeletePromotion(promotion.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Discount</p>
                    <p className="text-xl font-bold flex items-center">
                      {promotion.discountType === 'percentage' ? (
                        <>{promotion.discountValue}%</>
                      ) : (
                        <>${promotion.discountValue}</>
                      )}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Promo Code</p>
                    <p className="text-lg">
                      {promotion.code ? (
                        <Badge variant="outline" className="font-mono">
                          {promotion.code}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">No code required</span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm font-medium mb-1">Validity Period</p>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(promotion.startDate).toLocaleDateString()} - {new Date(promotion.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {(promotion.minNights || promotion.maxNights) && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-1">Stay Requirements</p>
                    <p className="text-sm">
                      {promotion.minNights && promotion.maxNights 
                        ? `${promotion.minNights}-${promotion.maxNights} nights`
                        : promotion.minNights
                        ? `Minimum ${promotion.minNights} nights`
                        : `Maximum ${promotion.maxNights} nights`
                      }
                    </p>
                  </div>
                )}
                
                {promotion.usesCount !== undefined && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Bookings</span>
                      <span className="font-medium">{promotion.bookings || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Revenue</span>
                      <span className="font-medium">${promotion.revenue?.toLocaleString() || 0}</span>
                    </div>
                    
                    {promotion.maxUses && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Usage Limit</span>
                          <span className="font-medium">{promotion.usesCount || 0} / {promotion.maxUses}</span>
                        </div>
                        <Progress value={usagePercentage || 0} className="h-2" />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }
};

export default PromotionsManagement;
