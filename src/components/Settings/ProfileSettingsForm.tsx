
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";

// Comprehensive form schema
const formSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters").optional(),
  email: z.string().email(),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.date().optional(),
  nationality: z.string().optional(),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
  addressStreet: z.string().optional(),
  addressCity: z.string().optional(),
  addressPostalCode: z.string().optional(),
  addressCountry: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

type FormData = z.infer<typeof formSchema>;

const ProfileSettingsForm = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile data from the database
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        setProfileData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: user?.user_metadata?.display_name || "",
      email: user?.email || "",
      phoneNumber: "",
      dateOfBirth: undefined,
      nationality: "",
      gender: undefined,
      addressStreet: "",
      addressCity: "",
      addressPostalCode: "",
      addressCountry: "",
      firstName: "",
      lastName: "",
    },
  });

  // Set form values once profile data is loaded
  useEffect(() => {
    if (profileData && !loading) {
      form.reset({
        displayName: profileData?.display_name || user?.user_metadata?.display_name || "",
        email: user?.email || "",
        phoneNumber: profileData?.phone_number || user?.user_metadata?.phone_number || "",
        dateOfBirth: profileData?.date_of_birth 
          ? new Date(profileData.date_of_birth)
          : user?.user_metadata?.date_of_birth 
            ? new Date(user.user_metadata.date_of_birth)
            : undefined,
        nationality: profileData?.nationality || user?.user_metadata?.nationality || "",
        gender: (profileData?.gender || user?.user_metadata?.gender || undefined) as any,
        addressStreet: profileData?.address_street || user?.user_metadata?.address_street || "",
        addressCity: profileData?.address_city || user?.user_metadata?.address_city || "",
        addressPostalCode: profileData?.address_postal_code || user?.user_metadata?.address_postal_code || "",
        addressCountry: profileData?.address_country || user?.user_metadata?.address_country || "",
        firstName: profileData?.first_name || "",
        lastName: profileData?.last_name || "",
      });
    }
  }, [profileData, loading, user, form]);

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    
    try {
      // Update Supabase auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          display_name: data.displayName,
          phone_number: data.phoneNumber,
          date_of_birth: data.dateOfBirth ? format(data.dateOfBirth, 'yyyy-MM-dd') : null,
          nationality: data.nationality,
          gender: data.gender,
          address_street: data.addressStreet,
          address_city: data.addressCity,
          address_postal_code: data.addressPostalCode,
          address_country: data.addressCountry,
        }
      });

      if (authError) throw authError;

      // Update profile in the database
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          phone_number: data.phoneNumber,
          display_name: data.displayName,
          nationality: data.nationality,
          address_street: data.addressStreet,
          address_city: data.addressCity,
          address_postal_code: data.addressPostalCode,
          address_country: data.addressCountry,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast.success(t('profile.profileUpdated'));
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('profile.updateError'));
    }
  };

  if (loading) {
    return <div>{t('common.loading')}</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name Section */}
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Name</h3>
            <p className="text-muted-foreground mb-4">Let us know what to call you</p>
            
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your display name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Email Section */}
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Email address</h3>
            <p className="text-muted-foreground mb-4">This is where we send your booking confirmations</p>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} readOnly />
                  </FormControl>
                  <p className="text-sm text-green-600">Verified</p>
                </FormItem>
              )}
            />
          </div>

          {/* Phone Number Section */}
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Phone number</h3>
            <p className="text-muted-foreground mb-4">Properties will use this number if they need to contact you</p>
            
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="Enter your phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Date of Birth Section */}
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Date of Birth</h3>
            <p className="text-muted-foreground mb-4">Enter your date of birth</p>
            
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth</FormLabel>
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
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Nationality Section */}
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Nationality</h3>
            <p className="text-muted-foreground mb-4">Select the country/region you're from</p>
            
            <FormField
              control={form.control}
              name="nationality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nationality</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your nationality" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="sy">Syria</SelectItem>
                      <SelectItem value="lb">Lebanon</SelectItem>
                      <SelectItem value="jo">Jordan</SelectItem>
                      <SelectItem value="tr">Turkey</SelectItem>
                      <SelectItem value="iq">Iraq</SelectItem>
                      <SelectItem value="sa">Saudi Arabia</SelectItem>
                      <SelectItem value="ae">United Arab Emirates</SelectItem>
                      {/* Add more countries */}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Gender Section */}
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Gender</h3>
            <p className="text-muted-foreground mb-4">Select your gender</p>
            
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Address Section */}
          <div className="border rounded-lg p-6 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Address</h3>
            <p className="text-muted-foreground mb-4">Add your address details</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="addressStreet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter street address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="addressCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter city" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="addressPostalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter postal code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="addressCountry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="us">United States</SelectItem>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                          <SelectItem value="ca">Canada</SelectItem>
                          <SelectItem value="sy">Syria</SelectItem>
                          <SelectItem value="lb">Lebanon</SelectItem>
                          <SelectItem value="jo">Jordan</SelectItem>
                          <SelectItem value="tr">Turkey</SelectItem>
                          <SelectItem value="iq">Iraq</SelectItem>
                          <SelectItem value="sa">Saudi Arabia</SelectItem>
                          <SelectItem value="ae">United Arab Emirates</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit">
            {t('settings.saveChanges')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProfileSettingsForm;
