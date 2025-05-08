
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Menu, User, ChevronDown, LogOut, Hotel, Settings, Shield, MessageSquare, Book, Star, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut, userRole } = useAuth();

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

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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
          <Link to="/" className="flex items-center">
            <h1 
              className={`text-2xl font-bold transition-colors duration-300 ${
                isScrolled || !isHomePage ? 'text-primary' : 'text-white'
              }`}
            >
              {t('common.checkInSyria')}
            </h1>
          </Link>

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
            
            {user ? (
              <>
                <Link 
                  to="/bookings" 
                  className={`transition-colors duration-300 hover:text-primary ${
                    isScrolled || !isHomePage ? 'text-gray-700' : 'text-white'
                  }`}
                >
                  {t('common.myBookings')}
                </Link>
                <Link 
                  to="/messages" 
                  className={`transition-colors duration-300 hover:text-primary ${
                    isScrolled || !isHomePage ? 'text-gray-700' : 'text-white'
                  }`}
                >
                  {t('common.messages')}
                </Link>
                <Link 
                  to="/reviews" 
                  className={`transition-colors duration-300 hover:text-primary ${
                    isScrolled || !isHomePage ? 'text-gray-700' : 'text-white'
                  }`}
                >
                  {t('common.myReviews')}
                </Link>
                <Link 
                  to="/notifications" 
                  className={`transition-colors duration-300 hover:text-primary ${
                    isScrolled || !isHomePage ? 'text-gray-700' : 'text-white'
                  }`}
                >
                  {t('common.notifications')}
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className={`flex items-center gap-2 ${
                        isScrolled || !isHomePage ? 'text-gray-700' : 'text-white'
                      }`}
                    >
                      <User className="h-4 w-4" />
                      <span>{t('common.profile')}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {userRole === 'admin' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/admin-control-panel" className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            <span>Admin Control Panel</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/admin-dashboard" className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            <span>User Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    {(userRole === 'owner' || userRole === 'admin') && (
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="flex items-center gap-2">
                          <Hotel className="h-4 w-4" />
                          <span>{t('common.dashboard')}</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        <span>{t('common.settings')}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-500">
                      <LogOut className="h-4 w-4" />
                      <span>{t('common.logout')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link 
                to="/login" 
                className={`transition-colors duration-300 hover:text-primary ${
                  isScrolled || !isHomePage ? 'text-gray-700' : 'text-white'
                }`}
              >
                {t('common.login')}
              </Link>
            )}
            
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
              
              {user ? (
                <>
                  <Link 
                    to="/bookings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-gray-700 hover:text-primary flex items-center gap-2"
                  >
                    <Book className="h-4 w-4" />
                    <span>{t('common.myBookings')}</span>
                  </Link>
                  <Link 
                    to="/messages"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-gray-700 hover:text-primary flex items-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>{t('common.messages')}</span>
                  </Link>
                  <Link 
                    to="/reviews"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-gray-700 hover:text-primary flex items-center gap-2"
                  >
                    <Star className="h-4 w-4" />
                    <span>{t('common.myReviews')}</span>
                  </Link>
                  <Link 
                    to="/notifications"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-gray-700 hover:text-primary flex items-center gap-2"
                  >
                    <Bell className="h-4 w-4" />
                    <span>{t('common.notifications')}</span>
                  </Link>
                  {userRole === 'admin' && (
                    <>
                      <Link 
                        to="/admin-control-panel"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-gray-700 hover:text-primary flex items-center gap-2"
                      >
                        <Shield className="h-4 w-4" />
                        <span>Admin Control Panel</span>
                      </Link>
                      <Link 
                        to="/admin-dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-gray-700 hover:text-primary flex items-center gap-2"
                      >
                        <Shield className="h-4 w-4" />
                        <span>User Dashboard</span>
                      </Link>
                    </>
                  )}
                  {(userRole === 'owner' || userRole === 'admin') && (
                    <Link 
                      to="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-gray-700 hover:text-primary flex items-center gap-2"
                    >
                      <Hotel className="h-4 w-4" />
                      <span>{t('common.dashboard')}</span>
                    </Link>
                  )}
                  <Link 
                    to="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-gray-700 hover:text-primary flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span>{t('common.settings')}</span>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-red-500 hover:text-red-700 justify-start flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t('common.logout')}</span>
                  </Button>
                </>
              ) : (
                <Link 
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-700 hover:text-primary"
                >
                  {t('common.login')}
                </Link>
              )}
              
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
