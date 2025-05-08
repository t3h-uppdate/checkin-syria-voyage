
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
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
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

// Protected route wrapper component
const ProtectedOwnerRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, userRole, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (userRole !== 'owner' && userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/hotels" element={<HotelsPage />} />
    <Route path="/hotels/:id" element={<HotelDetailsPage />} />
    <Route path="/booking/:hotelId/:roomId" element={<BookingPage />} />
    <Route path="/confirmation/:bookingId" element={<BookingConfirmationPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    
    {/* Dashboard Routes - Protected */}
    <Route path="/dashboard" element={
      <ProtectedOwnerRoute>
        <DashboardOverviewPage />
      </ProtectedOwnerRoute>
    } />
    <Route path="/dashboard/hotels" element={
      <ProtectedOwnerRoute>
        <DashboardHotelsPage />
      </ProtectedOwnerRoute>
    } />
    <Route path="/dashboard/rooms" element={
      <ProtectedOwnerRoute>
        <DashboardRoomsPage />
      </ProtectedOwnerRoute>
    } />
    <Route path="/dashboard/bookings" element={
      <ProtectedOwnerRoute>
        <DashboardBookingsPage />
      </ProtectedOwnerRoute>
    } />
    <Route path="/dashboard/services" element={
      <ProtectedOwnerRoute>
        <DashboardServicesPage />
      </ProtectedOwnerRoute>
    } />
    <Route path="/dashboard/messages" element={
      <ProtectedOwnerRoute>
        <DashboardMessagesPage />
      </ProtectedOwnerRoute>
    } />
    <Route path="/dashboard/reviews" element={
      <ProtectedOwnerRoute>
        <DashboardReviewsPage />
      </ProtectedOwnerRoute>
    } />
    <Route path="/dashboard/revenue" element={
      <ProtectedOwnerRoute>
        <DashboardRevenuePage />
      </ProtectedOwnerRoute>
    } />
    <Route path="/dashboard/promotions" element={
      <ProtectedOwnerRoute>
        <DashboardPromotionsPage />
      </ProtectedOwnerRoute>
    } />
    <Route path="/dashboard/settings" element={
      <ProtectedOwnerRoute>
        <DashboardSettingsPage />
      </ProtectedOwnerRoute>
    } />
    
    <Route path="/admin-dashboard" element={<AdminControlPanelPage />} />
    <Route path="/admin-control-panel" element={<AdminControlPanelPage />} />
    <Route path="/guest/:userId" element={<GuestProfilePage />} />
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <I18nextProvider i18n={i18n}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={
              <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            }>
              <AppRoutes />
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </I18nextProvider>
);

export default App;
