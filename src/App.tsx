
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
import NotFound from "./pages/NotFound";
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </I18nextProvider>
);

export default App;
