
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Menu, Search, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Change header on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('language', newLang);
  };

  // Set initial direction based on language
  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
      i18n.changeLanguage(savedLang);
      document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
    } else {
      document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    }
  }, [i18n]);

  const isHomePage = location.pathname === '/';

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled || !isHomePage 
          ? 'bg-white shadow-md py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 
              className={`text-2xl font-bold transition-colors duration-300 ${
                isScrolled || !isHomePage ? 'text-primary' : 'text-white'
              }`}
            >
              {t('common.checkInSyria')}
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`transition-colors duration-300 hover:text-primary ${
                isScrolled || !isHomePage ? 'text-gray-700' : 'text-white'
              }`}
            >
              {t('common.home')}
            </Link>
            <Link 
              to="/hotels" 
              className={`transition-colors duration-300 hover:text-primary ${
                isScrolled || !isHomePage ? 'text-gray-700' : 'text-white'
              }`}
            >
              {t('common.hotels')}
            </Link>
            <Link 
              to="/login" 
              className={`transition-colors duration-300 hover:text-primary ${
                isScrolled || !isHomePage ? 'text-gray-700' : 'text-white'
              }`}
            >
              {t('common.login')}
            </Link>
            
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className={`font-medium ${
                isScrolled || !isHomePage ? 'text-gray-700' : 'text-white'
              }`}
            >
              {i18n.language === 'en' ? 'العربية' : 'English'}
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={isScrolled || !isHomePage ? 'text-gray-700' : 'text-white'}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden mt-4 pb-4"
          >
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-primary"
              >
                {t('common.home')}
              </Link>
              <Link 
                to="/hotels"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-primary"
              >
                {t('common.hotels')}
              </Link>
              <Link 
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-primary"
              >
                {t('common.login')}
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  toggleLanguage();
                  setIsMobileMenuOpen(false);
                }}
                className="text-gray-700 hover:text-primary justify-start"
              >
                {i18n.language === 'en' ? 'العربية' : 'English'}
              </Button>
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Header;
