
import { useState } from 'react';
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Hotel } from "@/types";
import { Edit, Image, Phone, Mail, Globe, MapPin } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EditHotelFormProps {
  hotel: Hotel;
  onUpdate: (updatedHotel: Hotel) => void;
}

const EditHotelForm = ({ hotel, onUpdate }: EditHotelFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: hotel.name,
      description: hotel.description,
      city: hotel.city,
      country: hotel.country,
      phoneNumber: hotel.phoneNumber,
      email: hotel.email,
      website: hotel.website || '',
      pricePerNight: hotel.pricePerNight,
      featuredImage: hotel.featuredImage
    }
  });

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('hotels')
        .update({
          name: data.name,
          description: data.description,
          city: data.city,
          country: data.country,
          phone_number: data.phoneNumber,
          email: data.email,
          website: data.website,
          price_per_night: data.pricePerNight,
          featured_image: data.featuredImage
        })
        .eq('id', hotel.id);

      if (error) throw error;

      const updatedHotel = {
        ...hotel,
        ...data,
        phoneNumber: data.phoneNumber,
        pricePerNight: data.pricePerNight,
        featuredImage: data.featuredImage
      };

      onUpdate(updatedHotel);
      
      toast({
        title: "Hotell uppdaterat",
        description: "Dina ändringar har sparats.",
      });
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit className="h-5 w-5" />
          Redigera hotelluppgifter
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Hotellnamn</Label>
              <Input
                id="name"
                {...register("name", { required: "Hotellnamn krävs" })}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricePerNight">Pris per natt (kr)</Label>
              <Input
                id="pricePerNight"
                type="number"
                {...register("pricePerNight", { required: "Pris krävs" })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Stad</Label>
              <Input
                id="city"
                {...register("city", { required: "Stad krävs" })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Land</Label>
              <Input
                id="country"
                {...register("country", { required: "Land krävs" })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Telefonnummer</Label>
              <div className="flex">
                <Phone className="h-5 w-5 mr-2 text-muted-foreground" />
                <Input
                  id="phoneNumber"
                  {...register("phoneNumber", { required: "Telefonnummer krävs" })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-post</Label>
              <div className="flex">
                <Mail className="h-5 w-5 mr-2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  {...register("email", { required: "E-post krävs" })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Webbplats</Label>
              <div className="flex">
                <Globe className="h-5 w-5 mr-2 text-muted-foreground" />
                <Input
                  id="website"
                  {...register("website")}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="featuredImage">Huvudbild URL</Label>
              <div className="flex">
                <Image className="h-5 w-5 mr-2 text-muted-foreground" />
                <Input
                  id="featuredImage"
                  {...register("featuredImage", { required: "Huvudbild krävs" })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beskrivning</Label>
            <Textarea
              id="description"
              {...register("description", { required: "Beskrivning krävs" })}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>Sparar ändringar...</>
              ) : (
                <>Spara ändringar</>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditHotelForm;
