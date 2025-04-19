
import { useEffect } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import HeroSection from '@/components/Home/HeroSection';
import DestinationSection from '@/components/Home/DestinationSection';
import FeaturedHotelsSection from '@/components/Home/FeaturedHotelsSection';
import TestimonialsSection from '@/components/Home/TestimonialsSection';

const HomePage = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout>
      <HeroSection />
      <DestinationSection />
      <FeaturedHotelsSection />
      <TestimonialsSection />
    </MainLayout>
  );
};

export default HomePage;
