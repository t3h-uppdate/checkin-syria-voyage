
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Hotel, Room } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface BookingFormProps {
  hotel: Hotel;
  room: Room;
  checkIn: Date;
  checkOut: Date;
}

const formSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone number is required'),
  specialRequests: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
});

type FormValues = z.infer<typeof formSchema>;

const BookingForm = ({ hotel, room, checkIn, checkOut }: BookingFormProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specialRequests: '',
      agreeToTerms: false,
    },
  });

  const calculateStayDuration = () => {
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const nights = calculateStayDuration();
  const subtotal = room.price * nights;
  const taxes = subtotal * 0.12; // 12% tax
  const total = subtotal + taxes;

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // This would be an API call to create a booking in a real app
      console.log('Booking data:', {
        ...data,
        hotelId: hotel.id,
        roomId: room.id,
        checkIn,
        checkOut,
        nights,
        total,
      });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a fake booking ID
      const bookingId = `BK${Math.floor(Math.random() * 100000)}`;
      
      // Navigate to confirmation page
      navigate(`/confirmation/${bookingId}`, { 
        state: { 
          booking: {
            id: bookingId,
            hotelName: hotel.name,
            roomName: room.name,
            checkIn,
            checkOut,
            nights,
            guestName: `${data.firstName} ${data.lastName}`,
            email: data.email,
            phone: data.phone,
            specialRequests: data.specialRequests,
            total,
          }
        } 
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-2xl font-bold mb-6">{t('booking.guestInformation')}</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('booking.firstName')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('booking.lastName')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('booking.email')}</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('booking.phone')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="specialRequests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('booking.specialRequests')}</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Let us know if you have any special requests..." 
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="agreeToTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          {t('booking.termsAndConditions')}
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : t('booking.confirmBooking')}
                </Button>
              </form>
            </Form>
          </motion.div>
        </div>
        
        <div className="md:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-6 sticky top-24"
          >
            <h2 className="text-xl font-bold mb-4">{t('booking.bookingSummary')}</h2>
            
            <div className="mb-4">
              <img 
                src={hotel.featuredImage} 
                alt={hotel.name} 
                className="w-full h-32 object-cover rounded-md mb-3"
              />
              <h3 className="font-bold">{hotel.name}</h3>
              <p className="text-sm text-gray-600">{hotel.city}, {hotel.country}</p>
            </div>
            
            <div className="border-t border-b py-4 mb-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('booking.roomType')}</span>
                <span className="font-medium">{room.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('booking.checkIn')}</span>
                <span className="font-medium">{format(checkIn, 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('booking.checkOut')}</span>
                <span className="font-medium">{format(checkOut, 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('booking.nights')}</span>
                <span className="font-medium">{nights}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('booking.guests')}</span>
                <span className="font-medium">{room.capacity}</span>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Room ({nights} {nights === 1 ? 'night' : 'nights'})</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('booking.taxes')}</span>
                <span className="font-medium">${taxes.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>{t('booking.total')}</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              Your booking will be confirmed immediately. Payment will be collected at the hotel.
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
