
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import {
  Bed,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Hotel,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Percent,
  Receipt,
  Settings,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Auto-close sidebar on mobile
  React.useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);
  
  // Close sidebar when navigating on mobile
  React.useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
    { icon: Hotel, label: 'My Hotels', path: '/dashboard/hotels' },
    { icon: Calendar, label: 'Bookings', path: '/dashboard/bookings' },
    { icon: Bed, label: 'Rooms', path: '/dashboard/rooms' },
    { icon: Coffee, label: 'Services', path: '/dashboard/services' },
    { icon: MessageSquare, label: 'Messages', path: '/dashboard/messages' },
    { icon: Star, label: 'Reviews', path: '/dashboard/reviews' },
    { icon: Receipt, label: 'Revenue', path: '/dashboard/revenue' },
    { icon: Percent, label: 'Promotions', path: '/dashboard/promotions' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <MainLayout>
      <div className="pt-16 min-h-screen flex">
        {/* Sidebar Toggle Button - Mobile Only */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-20 left-4 z-40 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Sidebar Backdrop for Mobile */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "h-[calc(100vh-4rem)] fixed top-16 left-0 z-40 transition-all duration-300 bg-white shadow-md border-r",
            sidebarOpen ? "w-64" : isMobile ? "-translate-x-full" : "w-16",
            "flex flex-col"
          )}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className={cn("font-semibold transition-opacity", sidebarOpen ? "opacity-100" : "opacity-0")}>
              Hotel Dashboard
            </h2>
            {!isMobile && (
              <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            )}
          </div>

          <nav className="flex-grow py-4 overflow-y-auto">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Button
                    variant={isActive(item.path) ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start mb-1",
                      !sidebarOpen && "justify-center p-2"
                    )}
                    onClick={() => navigate(item.path)}
                  >
                    <item.icon className={cn("h-5 w-5", sidebarOpen && "mr-2")} />
                    {sidebarOpen && <span>{item.label}</span>}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main 
          className={cn(
            "flex-1 transition-all duration-300 pb-8",
            sidebarOpen ? (isMobile ? "ml-0" : "ml-64") : "ml-0",
            isMobile ? "px-4" : "px-8"
          )}
        >
          {children}
        </main>
      </div>
    </MainLayout>
  );
}
