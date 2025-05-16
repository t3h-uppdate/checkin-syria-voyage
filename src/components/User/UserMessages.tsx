
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MessageSquare, Send, Search, Clock, User, ChevronDown, Filter } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
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

const UserMessages = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // New conversation view state
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [filteredHotelId, setFilteredHotelId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Dialog state for new messages
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedHotelId, setSelectedHotelId] = useState<string>('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentConversation, messages]);

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
          .select('*')
          .eq('receiver_id', user.id);
          
        if (receivedError) throw receivedError;
        
        // Get sender names and hotel names for received messages
        const receivedMessagesWithMetadata = await Promise.all(
          (receivedMessagesData || []).map(async (msg) => {
            // Get sender name
            let senderName = 'Unknown';
            const { data: senderData, error: senderError } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', msg.sender_id)
              .single();
            
            if (!senderError && senderData) {
              senderName = `${senderData.first_name || ''} ${senderData.last_name || ''}`.trim() || 'Unknown';
            }
            
            // Get hotel name
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
              sender_name: senderName
            };
          })
        );
        
        // Fetch sent messages
        const { data: sentMessagesData, error: sentError } = await supabase
          .from('messages')
          .select('*')
          .eq('sender_id', user.id);
          
        if (sentError) throw sentError;
        
        // Get receiver names and hotel names for sent messages
        const sentMessagesWithMetadata = await Promise.all(
          (sentMessagesData || []).map(async (msg) => {
            // Get receiver name
            let receiverName = 'Hotel Owner';
            const { data: receiverData, error: receiverError } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', msg.receiver_id)
              .single();
            
            if (!receiverError && receiverData) {
              receiverName = `${receiverData.first_name || ''} ${receiverData.last_name || ''}`.trim() || 'Hotel Owner';
            }
            
            // Get hotel name
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
              receiver_name: receiverName
            };
          })
        );
        
        // Combine received and sent messages
        const allMessages = [...receivedMessagesWithMetadata, ...sentMessagesWithMetadata];
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
            const { data: senderData, error: senderError } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', newMessage.sender_id)
              .single();
            
            if (!senderError && senderData) {
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
      const { data: newMessage, error: newMessageError } = await supabase
        .from('messages')
        .select('*')
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (newMessageError) {
        console.error('Error fetching new message:', newMessageError);
        return;
      }
      
      if (newMessage) {
        // Get receiver name
        let receiverName = 'Hotel Owner';
        const { data: receiverData, error: receiverError } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', newMessage.receiver_id)
          .single();
        
        if (!receiverError && receiverData) {
          receiverName = `${receiverData.first_name || ''} ${receiverData.last_name || ''}`.trim() || 'Hotel Owner';
        }
        
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
          receiver_name: receiverName
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

  // Send reply directly in conversation view
  const sendReply = async () => {
    if (!user || !currentConversation || !newMessage.trim()) return;
    
    try {
      // Get the conversation details from current messages
      const conversationMessages = messages.filter(
        m => m.hotel_id === currentConversation
      );
      
      if (conversationMessages.length === 0) return;
      
      // Find the hotel and owner information
      const hotelId = currentConversation;
      const hotel = hotels.find(h => h.id === hotelId);
      
      if (!hotel) {
        toast.error("Hotel not found");
        return;
      }
      
      // Send the message
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: hotel.owner_id,
          hotel_id: hotelId,
          subject: `Re: ${conversationMessages[0].subject || 'Your Booking'}`,
          content: newMessage,
          is_read: false
        });
        
      if (error) throw error;
      
      // Clear input field
      setNewMessage("");
      
      // Add to local messages state
      const newMessageObj: Message = {
        id: Date.now().toString(),
        sender_id: user.id,
        receiver_id: hotel.owner_id,
        hotel_id: hotelId,
        subject: `Re: ${conversationMessages[0].subject || 'Your Booking'}`,
        content: newMessage,
        created_at: new Date().toISOString(),
        is_read: true,
        receiver_name: 'Hotel Owner',
        hotel_name: hotel.name
      };
      
      setMessages(prev => [...prev, newMessageObj]);
      toast.success(t('messages.messageSent'));
      
    } catch (err) {
      console.error('Error sending reply:', err);
      toast.error(t('messages.error'));
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

  // Get conversations grouped by hotel
  const getHotelConversations = () => {
    const hotelIds = [...new Set(messages.map(m => m.hotel_id))].filter(Boolean) as string[];
    
    return hotelIds.map(hotelId => {
      const hotelMessages = messages.filter(m => m.hotel_id === hotelId);
      const latestMessage = [...hotelMessages].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];
      
      const unreadCount = hotelMessages.filter(
        m => m.receiver_id === user?.id && !m.is_read
      ).length;
      
      return {
        hotelId,
        hotelName: latestMessage.hotel_name || 'Unknown Hotel',
        latestMessage,
        unreadCount,
        timestamp: latestMessage.created_at
      };
    });
  };
  
  // Filter conversations based on search and active tab
  const filteredConversations = getHotelConversations()
    .filter(conv => {
      if (activeTab === "all") return true;
      if (activeTab === "unread") return conv.unreadCount > 0;
      return false;
    })
    .filter(conv => {
      if (!searchTerm) return true;
      return (
        conv.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        messages
          .filter(m => m.hotel_id === conv.hotelId)
          .some(m => 
            m.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.subject.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    });

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

      <Card className="shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('messages.hotelConversations')}</CardTitle>
              <CardDescription>{t('messages.communicateWithHotels')}</CardDescription>
            </div>
            <div className="flex space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setActiveTab("all")}>
                    All Messages
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("unread")}>
                    Unread Only
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-3 h-[500px] divide-x">
            {/* Left sidebar - conversations list */}
            <div className="col-span-1 overflow-y-auto border-r">
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search messages..."
                    className="pl-10 pr-4"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div>
                {filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No conversations found
                  </div>
                ) : (
                  <div>
                    {filteredConversations.map(conversation => {
                      return (
                        <div 
                          key={conversation.hotelId}
                          onClick={() => {
                            setCurrentConversation(conversation.hotelId);
                            // Mark messages as read
                            messages
                              .filter(m => m.hotel_id === conversation.hotelId && m.receiver_id === user.id && !m.is_read)
                              .forEach(m => markAsRead(m.id));
                          }}
                          className={`p-3 border-b cursor-pointer hover:bg-muted/50 transition ${
                            currentConversation === conversation.hotelId ? "bg-muted" : ""
                          } ${conversation.unreadCount > 0 ? "bg-blue-50 dark:bg-blue-950/20" : ""}`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="font-medium flex items-center">
                              <User className="h-4 w-4 mr-2" />
                              {conversation.hotelName}
                              {conversation.unreadCount > 0 && (
                                <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(conversation.timestamp).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                            {conversation.latestMessage.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            
            {/* Right side - messages */}
            <div className="col-span-2 flex flex-col">
              {currentConversation ? (
                <>
                  {/* Message header */}
                  <div className="p-3 border-b bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          {hotels.find(h => h.id === currentConversation)?.name || "Hotel"}
                        </h3>
                      </div>
                    </div>
                  </div>
                  
                  {/* Messages area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages
                      .filter(message => message.hotel_id === currentConversation)
                      .sort((a, b) => 
                        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                      )
                      .map(message => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.sender_id === user.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <div className="text-sm font-medium">
                                {message.sender_id === user.id ? 'You' : message.sender_name || 'Hotel Staff'}
                              </div>
                              <div className="text-xs ml-4 opacity-70">
                                {new Date(message.created_at).toLocaleString(undefined, {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                            <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                          </div>
                        </div>
                      ))}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* Input area */}
                  <div className="p-3 border-t">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Write a message..."
                        className="min-h-[80px] resize-none"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendReply();
                          }
                        }}
                      />
                      <Button 
                        className="self-end"
                        onClick={sendReply}
                        disabled={!newMessage.trim()}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Conversation Selected</h3>
                  <p className="text-muted-foreground mt-1">
                    Select a conversation from the left to view messages
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredConversations.length === 0 && (
        <Tabs defaultValue="inbox" className="mt-6">
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
      )}
    </div>
  );
};

export default UserMessages;
