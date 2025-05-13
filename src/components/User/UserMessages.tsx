
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  hotel_id: string | null;
  subject: string;
  content: string;
  created_at: string;
  is_read: boolean;
  hotel_name?: string;
  sender_name?: string;
  receiver_name?: string;
}

interface Hotel {
  id: string;
  name: string;
  owner_id: string;
}

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

const UserMessages = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedHotelId, setSelectedHotelId] = useState<string>('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    const fetchMessagesAndHotels = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch all hotels
        const { data: hotelsData, error: hotelsError } = await supabase
          .from('hotels')
          .select('id, name, owner_id');
          
        if (hotelsError) throw hotelsError;
        setHotels(hotelsData || []);
        
        // Fetch received messages
        const { data: receivedMessagesData, error: receivedError } = await supabase
          .from('messages')
          .select(`
            *,
            sender_profile:profiles!sender_id(first_name, last_name)
          `)
          .eq('receiver_id', user.id);
          
        if (receivedError) throw receivedError;
        
        // Get hotel names for received messages
        const receivedMessagesWithHotelNames = await Promise.all(
          (receivedMessagesData || []).map(async (msg) => {
            let hotelName = null;
            if (msg.hotel_id) {
              const { data: hotelData } = await supabase
                .from('hotels')
                .select('name')
                .eq('id', msg.hotel_id)
                .single();
              
              hotelName = hotelData?.name;
            }
            
            return {
              ...msg,
              hotel_name: hotelName,
              sender_name: msg.sender_profile ? 
                `${msg.sender_profile.first_name || ''} ${msg.sender_profile.last_name || ''}`.trim() || 'Unknown' 
                : 'Unknown'
            };
          })
        );
        
        // Fetch sent messages
        const { data: sentMessagesData, error: sentError } = await supabase
          .from('messages')
          .select(`
            *,
            receiver_profile:profiles!receiver_id(first_name, last_name)
          `)
          .eq('sender_id', user.id);
          
        if (sentError) throw sentError;
        
        // Get hotel names for sent messages
        const sentMessagesWithHotelNames = await Promise.all(
          (sentMessagesData || []).map(async (msg) => {
            let hotelName = null;
            if (msg.hotel_id) {
              const { data: hotelData } = await supabase
                .from('hotels')
                .select('name')
                .eq('id', msg.hotel_id)
                .single();
              
              hotelName = hotelData?.name;
            }
            
            return {
              ...msg,
              hotel_name: hotelName,
              receiver_name: msg.receiver_profile ? 
                `${msg.receiver_profile.first_name || ''} ${msg.receiver_profile.last_name || ''}`.trim() || 'Hotel Owner' 
                : 'Hotel Owner'
            };
          })
        );
        
        // Combine received and sent messages
        const allMessages = [...receivedMessagesWithHotelNames, ...sentMessagesWithHotelNames];
        setMessages(allMessages);
        
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages');
        toast.error(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    
    // Set up real-time subscription for new messages
    const setupMessageSubscription = () => {
      if (!user) return null;
      
      const channel = supabase
        .channel('messages-changes')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
          async (payload) => {
            const newMessage = payload.new as Message;
            
            // Get sender name
            let senderName = 'Unknown';
            const { data: senderData } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', newMessage.sender_id)
              .single();
            
            if (senderData) {
              senderName = `${senderData.first_name || ''} ${senderData.last_name || ''}`.trim() || 'Unknown';
            }
            
            // Get hotel name if applicable
            let hotelName = null;
            if (newMessage.hotel_id) {
              const { data: hotelData } = await supabase
                .from('hotels')
                .select('name')
                .eq('id', newMessage.hotel_id)
                .single();
              
              hotelName = hotelData?.name;
            }
            
            const enrichedMessage = {
              ...newMessage,
              sender_name: senderName,
              hotel_name: hotelName
            };
            
            setMessages(prevMessages => [...prevMessages, enrichedMessage]);
            toast.info(t('notifications.newMessage'));
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    };
    
    fetchMessagesAndHotels();
    const unsubscribe = setupMessageSubscription();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, t]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error(t('dashboard.hotelStats.notSignedIn'));
      return;
    }
    
    if (!selectedHotelId) {
      toast.warning(t('messages.noHotelSelected'));
      return;
    }
    
    if (!subject.trim() || !content.trim()) {
      toast.warning(t('common.error'));
      return;
    }
    
    try {
      setSendingMessage(true);
      
      // Find the hotel owner's ID
      const hotel = hotels.find(h => h.id === selectedHotelId);
      if (!hotel) {
        toast.error(t('messages.error'));
        return;
      }
      
      // Create a new message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: hotel.owner_id,
          hotel_id: selectedHotelId,
          subject,
          content,
          is_read: false
        });
        
      if (messageError) throw messageError;
      
      toast.success(t('messages.messageSent'));
      setSubject('');
      setContent('');
      setSelectedHotelId('');
      setIsDialogOpen(false);
      
      // Refresh messages list
      const { data: newMessage } = await supabase
        .from('messages')
        .select(`
          *,
          receiver_profile:profiles!receiver_id(first_name, last_name)
        `)
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (newMessage) {
        // Get hotel name
        let hotelName = null;
        if (newMessage.hotel_id) {
          const { data: hotelData } = await supabase
            .from('hotels')
            .select('name')
            .eq('id', newMessage.hotel_id)
            .single();
          
          hotelName = hotelData?.name;
        }
        
        const enrichedMessage = {
          ...newMessage,
          hotel_name: hotelName,
          receiver_name: newMessage.receiver_profile ? 
            `${newMessage.receiver_profile.first_name || ''} ${newMessage.receiver_profile.last_name || ''}`.trim() || 'Hotel Owner' 
            : 'Hotel Owner'
        };
        
        setMessages(prev => [...prev, enrichedMessage]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error(t('messages.error'));
    } finally {
      setSendingMessage(false);
    }
  };

  const receivedMessages = messages.filter(msg => msg.receiver_id === user?.id);
  const sentMessages = messages.filter(msg => msg.sender_id === user?.id);

  const markAsRead = async (messageId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId)
        .eq('receiver_id', user.id);
        
      if (error) throw error;
      
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId ? { ...msg, is_read: true } : msg
        )
      );
    } catch (err) {
      console.error('Error marking message as read:', err);
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
        <Button className="mt-2" onClick={() => window.location.href = '/login'}>
          {t('common.login')}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('messages.title')}</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <MessageSquare className="mr-2 h-4 w-4" />
              {t('messages.compose')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('messages.sendToHotel')}</DialogTitle>
              <DialogDescription>{t('messages.newMessage')}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSendMessage}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="hotel">{t('messages.to')}</label>
                  <Select value={selectedHotelId} onValueChange={setSelectedHotelId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a hotel" />
                    </SelectTrigger>
                    <SelectContent>
                      {hotels.map(hotel => (
                        <SelectItem key={hotel.id} value={hotel.id}>
                          {hotel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="subject">{t('messages.subject')}</label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="message">{t('messages.messageContent')}</label>
                  <Textarea
                    id="message"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    rows={5}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={sendingMessage}>
                  {sendingMessage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      {t('messages.send')}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="inbox">
        <TabsList className="mb-6">
          <TabsTrigger value="inbox">
            {t('messages.inbox')} ({receivedMessages.length})
          </TabsTrigger>
          <TabsTrigger value="sent">
            {t('messages.sent')} ({sentMessages.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox">
          {receivedMessages.length > 0 ? (
            <div className="space-y-4">
              {receivedMessages.map((message) => (
                <Card 
                  key={message.id}
                  className={`${!message.is_read ? 'border-l-4 border-l-primary' : ''}`}
                  onClick={() => !message.is_read && markAsRead(message.id)}
                >
                  <CardHeader>
                    <div className="flex justify-between">
                      <CardTitle className="text-lg">{message.subject}</CardTitle>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(message.created_at), 'PP')}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      From: {message.sender_name} {message.hotel_name && `(${message.hotel_name})`}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line">{message.content}</p>
                  </CardContent>
                  <CardFooter>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Send className="mr-2 h-4 w-4" />
                          {t('messages.send')} {t('messages.newMessage')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reply</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label>Subject</label>
                            <Input
                              defaultValue={`Re: ${message.subject}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <label>Message</label>
                            <Textarea
                              rows={5}
                              placeholder={t('messages.writeMessage')}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit">
                            <Send className="mr-2 h-4 w-4" />
                            {t('messages.send')}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-muted rounded-lg">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
              <p>{t('messages.noMessages')}</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent">
          {sentMessages.length > 0 ? (
            <div className="space-y-4">
              {sentMessages.map((message) => (
                <Card key={message.id}>
                  <CardHeader>
                    <div className="flex justify-between">
                      <CardTitle className="text-lg">{message.subject}</CardTitle>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(message.created_at), 'PP')}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      To: {message.receiver_name || 'Hotel Owner'} {message.hotel_name && `(${message.hotel_name})`}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line">{message.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-muted rounded-lg">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
              <p>{t('messages.noMessages')}</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserMessages;
