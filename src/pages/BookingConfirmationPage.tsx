
import { useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const BookingConfirmationPage = () => {
  const { t } = useTranslation();
  const { bookingId } = useParams<{ bookingId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!booking) {
    return (
      <MainLayout>
        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 text-center">
              <h2 className="text-2xl font-bold mb-4">Booking Information Not Found</h2>
              <p className="text-gray-600 mb-6">
                We couldn't find the details for this booking. Please check your bookings in your account.
              </p>
              <div className="flex justify-center space-x-4">
                <Button onClick={() => navigate('/profile/bookings')}>
                  View My Bookings
                </Button>
                <Button variant="outline" onClick={() => navigate('/')}>
                  Return to Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="pt-24 pb-12 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="bg-primary text-white p-6 text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <Check className="text-primary w-10 h-10" />
              </div>
              <h1 className="text-2xl font-bold mb-2">{t('confirmation.bookingConfirmed')}</h1>
              <p className="text-lg">{t('confirmation.thankYou')}</p>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <p className="text-sm text-gray-500">{t('confirmation.bookingId')}</p>
                <p className="text-lg font-bold">{bookingId}</p>
              </div>
              
              <h2 className="text-xl font-bold mb-4">{t('confirmation.bookingDetails')}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Hotel</h3>
                  <p className="text-lg font-bold mb-1">{booking.hotelName}</p>
                  <p className="text-gray-600 mb-4">{booking.roomName}</p>
                  
                  <h3 className="font-medium text-gray-700 mb-2">Guest</h3>
                  <p className="text-lg mb-1">{booking.guestName}</p>
                  <p className="text-gray-600">{booking.email}</p>
                  <p className="text-gray-600 mb-4">{booking.phone}</p>
                  
                  {booking.specialRequests && (
                    <>
                      <h3 className="font-medium text-gray-700 mb-2">Special Requests</h3>
                      <p className="text-gray-600 mb-4">{booking.specialRequests}</p>
                    </>
                  )}
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Stay Dates</h3>
                  <div className="bg-muted rounded-md p-4 mb-4">
                    <div className="flex justify-between mb-2">
                      <div>
                        <p className="text-sm text-gray-500">Check-in</p>
                        <p className="font-bold">
                          {format(new Date(booking.checkIn), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Check-out</p>
                        <p className="font-bold">
                          {format(new Date(booking.checkOut), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {booking.nights} {booking.nights === 1 ? 'night' : 'nights'}
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-gray-700 mb-2">Payment</h3>
                  <div className="bg-muted rounded-md p-4">
                    <p className="text-gray-600 mb-2">Payment will be collected at the hotel</p>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${booking.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Button onClick={() => window.print()}>
                  Print Confirmation
                </Button>
                <Button variant="outline" onClick={() => navigate('/')}>
                  {t('confirmation.backToHome')}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BookingConfirmationPage;
