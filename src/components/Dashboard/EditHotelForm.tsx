
import { useState } from 'react';
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Hotel } from "@/types";
import { 
  Edit, 
  Image, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Building, 
  Map, 
  DollarSign,
  Pencil,
  X,
  Check
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface EditHotelFormProps {
  hotel: Hotel;
  onUpdate: (updatedHotel: Hotel) => void;
}

// Form validation schema
const formSchema = z.object({
  name: z.string().min(1, "Hotellnamn krävs"),
  description: z.string().min(10, "Beskrivning måste vara minst 10 tecken"),
  city: z.string().min(1, "Stad krävs"),
  country: z.string().min(1, "Land krävs"),
  phoneNumber: z.string().min(1, "Telefonnummer krävs"),
  email: z.string().email("Ogiltig e-postadress"),
  website: z.string().url("Ange en giltig URL").or(z.string().length(0)),
  pricePerNight: z.number().positive("Priset måste vara större än 0"),
  featuredImage: z.string().min(1, "Huvudbild-URL krävs"),
  address: z.string().optional()
});

const EditHotelForm = ({ hotel, onUpdate }: EditHotelFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Initialize form with hotel data
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: hotel.name,
      description: hotel.description,
      city: hotel.city,
      country: hotel.country,
      phoneNumber: hotel.phoneNumber,
      email: hotel.email,
      website: hotel.website || '',
      pricePerNight: hotel.pricePerNight,
      featuredImage: hotel.featuredImage,
      address: hotel.address || ''
    }
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      
      // Pass the updated hotel data to the parent component
      await onUpdate({
        ...hotel,
        ...data
      });

      toast({
        title: "Hotell uppdaterat",
        description: "Dina ändringar har sparats framgångsrikt.",
      });
      
      // Close dialog after successful update
      setOpen(false);
    } catch (error) {
      console.error('Error updating hotel:', error);
      toast({
        title: "Ett fel uppstod",
        description: "Kunde inte uppdatera hotellet. Försök igen.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full flex items-center justify-center gap-2"
        >
          <Pencil className="h-4 w-4" />
          <span>Redigera Hotell</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Edit className="h-5 w-5" />
            Redigera {hotel.name}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Preview image */}
            <div className="relative aspect-video w-full rounded-md overflow-hidden mb-6 border">
              <img 
                src={form.watch("featuredImage") || hotel.featuredImage} 
                alt={hotel.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
            </div>
            
            {/* Basic Information */}
            <div className="bg-muted/30 p-4 rounded-lg border">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Building className="h-4 w-4 text-primary" />
                Grundläggande information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hotellnamn</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pricePerNight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pris per natt (kr)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="number" 
                            className="pl-10"
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beskrivning</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="min-h-[120px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
                
            {/* Location */}
            <div className="bg-muted/30 p-4 rounded-lg border">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Map className="h-4 w-4 text-primary" />
                Plats
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stad</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Land</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Adress</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input {...field} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
              
            {/* Contact Information */}
            <div className="bg-muted/30 p-4 rounded-lg border">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                Kontaktinformation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefonnummer</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input {...field} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-post</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input {...field} type="email" className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Webbplats</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input {...field} placeholder="https://..." className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="featuredImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Huvudbild URL</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input {...field} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                <X className="h-4 w-4 mr-2" />
                Avbryt
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>Sparar ändringar...</>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Spara ändringar
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditHotelForm;
