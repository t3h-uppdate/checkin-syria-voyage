
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Bell, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  type: string;
  reference_id?: string;
}

const UserNotifications = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        const { data, error: fetchError } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (fetchError) throw fetchError;
        
        setNotifications(data || []);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications');
        toast.error(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    
    // Set up real-time subscription for new notifications
    const setupNotificationSubscription = () => {
      if (!user) return null;
      
      const channel = supabase
        .channel('notifications-changes')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            const newNotification = payload.new as Notification;
            setNotifications(prevNotifications => [newNotification, ...prevNotifications]);
            toast.info(newNotification.title);
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    };
    
    fetchNotifications();
    const unsubscribe = setupNotificationSubscription();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, t]);

  const markAsRead = async (notificationId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId ? { ...notification, is_read: true } : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    const unreadNotifications = notifications.filter(notification => !notification.is_read);
    if (unreadNotifications.length === 0) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
        
      if (error) throw error;
      
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, is_read: true }))
      );
      
      toast.success(t('notifications.allRead'));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      toast.error(t('common.error'));
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    // Navigate based on notification type
    if (notification.type === 'booking' && notification.reference_id) {
      window.location.href = `/confirmation/${notification.reference_id}`;
    } else if (notification.type === 'message') {
      window.location.href = '/messages';
    } else if (notification.type === 'review') {
      window.location.href = '/reviews';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'message':
        return <Bell className="h-5 w-5 text-blue-500" />;
      case 'review':
        return <Bell className="h-5 w-5 text-yellow-500" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 text-center">
        <p>{t('dashboard.hotelStats.notSignedIn')}</p>
        <Button 
          onClick={() => window.location.href = '/login'}
          className="mt-2"
        >
          {t('common.login')}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('notifications.title')}</h1>
        {notifications.some(notification => !notification.is_read) && (
          <Button variant="outline" onClick={markAllAsRead}>
            {t('notifications.markAllAsRead')}
          </Button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card 
              key={notification.id}
              className={`
                cursor-pointer transition-colors
                ${!notification.is_read ? 'border-l-4 border-l-primary bg-primary/5' : ''}
              `}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div>
                    <h3 className="font-medium">{notification.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(notification.created_at), 'PP p')}
                    </p>
                  </div>
                </div>
                {!notification.is_read && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification.id);
                    }}
                  >
                    {t('notifications.markAsRead')}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm">{notification.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-muted rounded-lg">
          <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
          <p>{t('notifications.noNotifications')}</p>
        </div>
      )}
    </div>
  );
};

export default UserNotifications;
