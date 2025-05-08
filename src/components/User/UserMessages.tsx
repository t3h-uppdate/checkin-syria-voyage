
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
}

interface Hotel {
  id: string;
  name: string;
  owner_id: string;
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
        
        // Fetch messages where user is receiver
        const { data: receivedMessages, error: receivedError } = await supabase
          .from('messages')
          .select(`
            *,
            hotels(name),
            sender:profiles!sender_id(first_name, last_name)
          `)
          .eq('receiver_id', user.id);
          
        if (receivedError) throw receivedError;
        
        // Fetch messages where user is sender
        const { data: sentMessages, error: sentError } = await supabase
          .from('messages')
          .select(`
            *,
            hotels(name),
            receiver:profiles!receiver_id(first_name, last_name)
          `)
          .eq('sender_id', user.id);
          
        if (sentError) throw sentError;
        
        // Fetch all available hotels for sending messages
        const { data: hotelsData, error: hotelsError } = await supabase
          .from('hotels')
          .select('id, name, owner_id');
          
        if (hotelsError) throw hotelsError;
        
        const formattedReceivedMessages = receivedMessages?.map(msg => ({
          ...msg,
          hotel_name: msg.hotels?.name || null,
          sender_name: msg.sender ? `${msg.sender.first_name} ${msg.sender.last_name}` : 'Unknown'
        })) || [];
        
        const formattedSentMessages = sentMessages?.map(msg => ({
          ...msg,
          hotel_name: msg.hotels?.name || null,
          receiver_name: msg.receiver ? `${msg.receiver.first_name} ${msg.receiver.last_name}` : 'Unknown'
        })) || [];
        
        const allMessages = [...formattedReceivedMessages, ...formattedSentMessages];
        
        setMessages(allMessages);
        setHotels(hotelsData || []);
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
          (payload) => {
            const newMessage = payload.new as Message;
            setMessages(prevMessages => [...prevMessages, newMessage]);
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
