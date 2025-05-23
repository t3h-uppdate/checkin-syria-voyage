import { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Hotel } from "@/types";
import { MessageSquare, Send, Search, Clock, User, ChevronDown, Filter, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format, formatDistanceToNow } from 'date-fns';

interface GuestMessagesProps {
  hotel: Hotel | null;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  hotel_id: string | null;
  subject: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender_name?: string;
  receiver_name?: string;
  hotel_name?: string;
}

interface TypingStatus {
  isTyping: boolean;
  guestId: string | null;
}

const GuestMessages = ({ hotel }: GuestMessagesProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [lastSeen, setLastSeen] = useState<Record<string, string>>({});
  const [typingStatus, setTypingStatus] = useState<TypingStatus>({
    isTyping: false,
    guestId: null
  });

  // Scroll to bottom of messages when conversation changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentConversation, messages]);

  // Fetch messages and set up real-time subscriptions
  useEffect(() => {
    if (!user || !hotel) {
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);
        // Fetch messages where current user (hotel owner) is the receiver
        const { data: receivedMessagesData, error: receivedError } = await supabase
          .from('messages')
          .select('*')
          .eq('receiver_id', user.id)
          .eq('hotel_id', hotel.id); // Filter by current hotel

        if (receivedError) throw receivedError;

        // Fetch messages where current user (hotel owner) is the sender
        const { data: sentMessagesData, error: sentError } = await supabase
          .from('messages')
          .select('*')
          .eq('sender_id', user.id)
          .eq('hotel_id', hotel.id); // Filter by current hotel

        if (sentError) throw sentError;

        const allMessages = [...(receivedMessagesData || []), ...(sentMessagesData || [])];

        // Get sender/receiver names for all messages
        const messagesWithMetadata = await Promise.all(
          allMessages.map(async (msg) => {
            let senderName = 'Unknown Guest';
            let receiverName = 'Hotel Owner';

            // Get sender name (guest)
            const { data: senderData, error: senderError } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', msg.sender_id)
              .single();
            if (!senderError && senderData) {
              senderName = `${senderData.first_name || ''} ${senderData.last_name || ''}`.trim() || 'Unknown Guest';
            }

            // Get receiver name (guest if owner sent, or owner if guest sent)
            const { data: receiverData, error: receiverError } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', msg.receiver_id)
              .single();
            if (!receiverError && receiverData && msg.receiver_id !== user.id) { // Only if receiver is not current user
              receiverName = `${receiverData.first_name || ''} ${receiverData.last_name || ''}`.trim() || 'Unknown Guest';
            }

            return {
              ...msg,
              sender_name: senderName,
              receiver_name: receiverName,
              hotel_name: hotel.name // Already have hotel name from prop
            };
          })
        );
        setMessages(messagesWithMetadata);

        // Fetch last seen timestamps for guests in this hotel
        const guestIdsInConversations = [...new Set(messagesWithMetadata.map(m => m.sender_id === user.id ? m.receiver_id : m.sender_id))].filter(id => id !== user.id);
        const lastSeenMap: Record<string, string> = {};
        for (const guestId of guestIdsInConversations) {
          const { data: lastSeenData } = await supabase
            .from('message_status')
            .select('last_seen')
            .eq('hotel_id', hotel.id)
            .eq('user_id', guestId) // user_id here refers to the guest
            .maybeSingle();
          if (lastSeenData) {
            lastSeenMap[guestId] = lastSeenData.last_seen;
          }
        }
        setLastSeen(lastSeenMap);

      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages');
        toast.error("Failed to load messages.");
      } finally {
        setLoading(false);
      }
    };

    // Set up real-time subscription for new messages
    const setupMessageSubscription = () => {
      if (!user || !hotel) return null;

      const channel = supabase
        .channel(`hotel_messages:${hotel.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `hotel_id=eq.${hotel.id}` },
          async (payload) => {
            const newMessage = payload.new as Message;
            // Only process messages relevant to this hotel owner
            if (newMessage.receiver_id === user.id || newMessage.sender_id === user.id) {
              let senderName = 'Unknown Guest';
              let receiverName = 'Hotel Owner';

              const { data: senderData, error: senderError } = await supabase
                .from('profiles')
                .select('first_name, last_name')
                .eq('id', newMessage.sender_id)
                .single();
              if (!senderError && senderData) {
                senderName = `${senderData.first_name || ''} ${senderData.last_name || ''}`.trim() || 'Unknown Guest';
              }

              const { data: receiverData, error: receiverError } = await supabase
                .from('profiles')
                .select('first_name, last_name')
                .eq('id', newMessage.receiver_id)
                .single();
              if (!receiverError && receiverData && newMessage.receiver_id !== user.id) {
                receiverName = `${receiverData.first_name || ''} ${receiverData.last_name || ''}`.trim() || 'Unknown Guest';
              }

              const enrichedMessage = {
                ...newMessage,
                sender_name: senderName,
                receiver_name: receiverName,
                hotel_name: hotel.name
              };
              setMessages(prevMessages => [...prevMessages, enrichedMessage]);
              toast.info("New message received!");
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    // Set up typing indicators subscription
    const setupTypingSubscription = () => {
      if (!user || !hotel) return null;

      const channel = supabase
        .channel(`typing_status:${hotel.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'typing_status', filter: `hotel_id=eq.${hotel.id}` },
          (payload) => {
            const typingInfo = payload.new as any;
            // Check if the typing status is for a guest typing to this hotel owner
            if (typingInfo.receiver_id === user.id && typingInfo.hotel_id === hotel.id) {
              setTypingStatus({
                isTyping: typingInfo.is_typing,
                guestId: typingInfo.sender_id
              });

              // Auto-reset typing status after 3 seconds if it's true
              if (typingInfo.is_typing) {
                setTimeout(() => {
                  setTypingStatus({
                    isTyping: false,
                    guestId: null
                  });
                }, 3000);
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    fetchMessages();
    const unsubscribeMessage = setupMessageSubscription();
    const unsubscribeTyping = setupTypingSubscription();

    return () => {
      if (unsubscribeMessage) unsubscribeMessage();
      if (unsubscribeTyping) unsubscribeTyping();
    };
  }, [user, hotel]);

  // Get unique conversations (grouped by guest_id)
  const getGuestConversations = () => {
    if (!user) return [];
    const conversationsMap = new Map<string, Message[]>();

    messages.forEach(msg => {
      // Determine the "other" participant in the conversation (the guest)
      const guestId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      if (guestId === user.id) return; // Don't include messages to self

      if (!conversationsMap.has(guestId)) {
        conversationsMap.set(guestId, []);
      }
      conversationsMap.get(guestId)?.push(msg);
    });

    return Array.from(conversationsMap.entries()).map(([guestId, msgs]) => {
      const latestMessage = [...msgs].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

      const unreadCount = msgs.filter(
        m => m.receiver_id === user.id && !m.is_read
      ).length;

      const guestName = latestMessage.sender_id === guestId ? latestMessage.sender_name : latestMessage.receiver_name;

      return {
        guestId,
        guestName: guestName || 'Unknown Guest',
        latestMessage,
        unreadCount,
        timestamp: latestMessage.created_at
      };
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  // Filter conversations based on search and active tab
  const filteredConversations = getGuestConversations()
    .filter(conv => {
      if (activeTab === "all") return true;
      if (activeTab === "unread") return conv.unreadCount > 0;
      return false;
    })
    .filter(conv => {
      if (!searchTerm) return true;
      return (
        conv.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        messages
          .filter(m => (m.sender_id === conv.guestId || m.receiver_id === conv.guestId) && (m.hotel_id === hotel?.id))
          .some(m => 
            m.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.subject.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    });

  const handleSendMessage = async () => {
    if (!user || !hotel || !currentConversation || !newMessage.trim()) return;
    
    try {
      setIsSending(true);
      
      // Send typing indicator (optional, but good for consistency)
      await supabase
        .from('typing_status')
        .upsert(
          {
            sender_id: user.id, // Hotel owner is sender
            receiver_id: currentConversation, // Guest is receiver
            hotel_id: hotel.id,
            is_typing: true,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'sender_id,hotel_id' }
        );

      // Clear typing status after a delay
      setTimeout(async () => {
        await supabase
          .from('typing_status')
          .upsert(
            {
              sender_id: user.id,
              receiver_id: currentConversation,
              hotel_id: hotel.id,
              is_typing: false,
              updated_at: new Date().toISOString()
            },
            { onConflict: 'sender_id,hotel_id' }
          );
      }, 3000); // Clear after 3 seconds

      // Send the message
      const { data: newMsg, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id, // Hotel owner
          receiver_id: currentConversation, // Guest
          hotel_id: hotel.id,
          subject: `Re: Conversation with ${getGuestConversations().find(c => c.guestId === currentConversation)?.guestName || 'Guest'}`, // Dynamic subject
          content: newMessage,
          is_read: true // Mark as read by sender (hotel owner)
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Update the message_status table for read receipts (hotel owner's last sent)
      await supabase
        .from('message_status')
        .upsert(
          {
            user_id: user.id,
            hotel_id: hotel.id,
            last_sent: new Date().toISOString()
          },
          { onConflict: 'user_id,hotel_id' }
        );
      
      // Add to local messages state with enriched data
      if (newMsg) {
        const guestName = getGuestConversations().find(c => c.guestId === currentConversation)?.guestName || 'Guest';
        const enrichedMessage = {
          ...newMsg,
          sender_name: 'You', // For display
          receiver_name: guestName,
          hotel_name: hotel.name
        };
        setMessages(prev => [...prev, enrichedMessage]);
      }
      
      setNewMessage("");
      toast.success("Message sent!");
      
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error("Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  const markConversationAsRead = async (guestId: string) => {
    if (!user || !hotel) return;
    
    try {
      // Mark all unread messages from this guest to this hotel owner as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', user.id)
        .eq('sender_id', guestId)
        .eq('hotel_id', hotel.id)
        .eq('is_read', false);
        
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.receiver_id === user.id && msg.sender_id === guestId && msg.hotel_id === hotel.id && !msg.is_read
            ? { ...msg, is_read: true }
            : msg
        )
      );

      // Update the last seen status for the hotel owner in message_status
      const now = new Date().toISOString();
      await supabase
        .from('message_status')
        .upsert(
          {
            user_id: user.id, // Hotel owner's ID
            hotel_id: hotel.id,
            last_seen: now
          },
          { onConflict: 'user_id,hotel_id' }
        );
        
      setLastSeen(prev => ({
        ...prev,
        [hotel.id]: now // Update last seen for this hotel for the owner
      }));

    } catch (err) {
      console.error('Error marking messages as read or updating last seen:', err);
      toast.error("Failed to update message status.");
    }
    
    setCurrentConversation(guestId);
  };

  // Calculate relative time for message timestamps
  const getRelativeTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (err) {
      console.error('Error formatting time:', err);
      return 'Unknown';
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
        <p>You must be signed in to view messages.</p>
        <Button className="mt-2" onClick={() => window.location.href = '/login'}>
          Login
        </Button>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="p-8 bg-muted rounded-lg text-center border-2 border-dashed border-muted">
        <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-medium mb-2">Guest Messages</h3>
        <p className="text-muted-foreground">Select a hotel first to view messages.</p>
      </div>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Messages for {hotel.name}</CardTitle>
            <CardDescription>Communicate with your guests</CardDescription>
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
                    const info = conversation;
                    
                    // Check if the last message was sent by the guest (sender_id is guestId)
                    const isLastMessageFromGuest = info.latestMessage.sender_id === info.guestId;
                    const lastMessageTimeStamp = new Date(info.timestamp).getTime();
                    
                    // Check if the message has been seen by the hotel owner
                    let isMessageSeen = false;
                    const lastSeenTimestamp = lastSeen[info.guestId];
                    
                    if (lastSeenTimestamp && !isLastMessageFromGuest) {
                      const lastSeenTime = new Date(lastSeenTimestamp).getTime();
                      isMessageSeen = lastSeenTime >= lastMessageTimeStamp;
                    }

                    return (
                      <div 
                        key={info.guestId}
                        onClick={() => markConversationAsRead(info.guestId)}
                        className={`p-3 border-b cursor-pointer hover:bg-muted/50 transition ${
                          currentConversation === info.guestId ? "bg-muted" : ""
                        } ${info.unreadCount > 0 ? "bg-blue-50 dark:bg-blue-950/20" : ""}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="font-medium flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            {info.guestName}
                            {info.unreadCount > 0 && (
                              <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                                {info.unreadCount}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {getRelativeTime(info.timestamp)}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                          {info.latestMessage.content}
                        </p>
                        {!isLastMessageFromGuest && (
                          <div className="flex items-center justify-end mt-1 text-xs text-muted-foreground">
                            {isMessageSeen ? (
                              <div className="flex items-center">
                                <Check className="h-3 w-3 mr-1 text-green-500" />
                                <span>Seen</span>
                              </div>
                            ) : (
                              <span>Sent</span>
                            )}
                          </div>
                        )}
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
                        {getGuestConversations().find(c => c.guestId === currentConversation)?.guestName || "Guest"}
                      </h3>
                    </div>
                  </div>
                </div>
                
                {/* Messages area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages
                    .filter(message => 
                      (message.sender_id === currentConversation && message.receiver_id === user.id) ||
                      (message.receiver_id === currentConversation && message.sender_id === user.id)
                    )
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
                              {message.sender_id === user.id ? 'You' : message.sender_name || 'Guest'}
                            </div>
                            <div className="text-xs ml-4 opacity-70">
                              {new Date(message.created_at).toLocaleString(undefined, {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                          <div className="text-xs text-right mt-1 opacity-70">
                            {getRelativeTime(message.created_at)}
                          </div>
                        </div>
                      </div>
                    ))}
                  {typingStatus.isTyping && typingStatus.guestId === currentConversation && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg p-2 max-w-[80%]">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
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
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button 
                      className="self-end"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isSending}
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send
                        </>
                      )}
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
  );
};

export default GuestMessages;
