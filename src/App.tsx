
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import HomePage from "./pages/HomePage";
import HotelsPage from "./pages/HotelsPage";
import HotelDetailsPage from "./pages/HotelDetailsPage";
import BookingPage from "./pages/BookingPage";
import BookingConfirmationPage from "./pages/BookingConfirmationPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import GuestProfilePage from "./pages/GuestProfilePage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import AdminControlPanelPage from "./pages/AdminControlPanelPage";
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// Dashboard pages
import DashboardOverviewPage from "./pages/Dashboard/DashboardOverviewPage";
import DashboardHotelsPage from "./pages/Dashboard/HotelsPage";
import DashboardRoomsPage from "./pages/Dashboard/RoomsPage";
import DashboardBookingsPage from "./pages/Dashboard/BookingsPage";
import DashboardServicesPage from "./pages/Dashboard/ServicesPage";
import DashboardMessagesPage from "./pages/Dashboard/MessagesPage";
import DashboardReviewsPage from "./pages/Dashboard/ReviewsPage";
import DashboardRevenuePage from "./pages/Dashboard/RevenuePage";
import DashboardPromotionsPage from "./pages/Dashboard/PromotionsPage";
import DashboardSettingsPage from "./pages/Dashboard/SettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <I18nextProvider i18n={i18n}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/hotels" element={<HotelsPage />} />
              <Route path="/hotels/:id" element={<HotelDetailsPage />} />
              <Route path="/booking/:hotelId/:roomId" element={<BookingPage />} />
              <Route path="/confirmation/:bookingId" element={<BookingConfirmationPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Dashboard Routes */}
              <Route path="/dashboard" element={<DashboardOverviewPage />} />
              <Route path="/dashboard/hotels" element={<DashboardHotelsPage />} />
              <Route path="/dashboard/rooms" element={<DashboardRoomsPage />} />
              <Route path="/dashboard/bookings" element={<DashboardBookingsPage />} />
              <Route path="/dashboard/services" element={<DashboardServicesPage />} />
              <Route path="/dashboard/messages" element={<DashboardMessagesPage />} />
              <Route path="/dashboard/reviews" element={<DashboardReviewsPage />} />
              <Route path="/dashboard/revenue" element={<DashboardRevenuePage />} />
              <Route path="/dashboard/promotions" element={<DashboardPromotionsPage />} />
              <Route path="/dashboard/settings" element={<DashboardSettingsPage />} />
              
              <Route path="/admin-dashboard" element={<AdminControlPanelPage />} />
              <Route path="/admin-control-panel" element={<AdminControlPanelPage />} />
              <Route path="/guest/:userId" element={<GuestProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </I18nextProvider>
);

export default App;
