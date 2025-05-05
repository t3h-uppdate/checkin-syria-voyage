
import { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Hotel } from "@/types";
import { MessageSquare, Send, Search, Clock, User, ChevronDown, Filter } from "lucide-react";
import { toast } from "@/components/ui/sonner";
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

interface GuestMessagesProps {
  hotel: Hotel | null;
}

interface Message {
  id: string;
  guestName: string;
  guestId: string;
  content: string;
  timestamp: string;
  isGuest: boolean;
  read: boolean;
  conversation: string;
}

const GuestMessages = ({ hotel }: GuestMessagesProps) => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      guestName: 'John Doe',
      guestId: '101',
      content: 'Hi! Do you have parking available?',
      timestamp: '2024-04-25T10:30:00',
      isGuest: true,
      read: true,
      conversation: 'c1',
    },
    {
      id: '2',
      guestName: 'Staff',
      guestId: '101',
      content: 'Yes, we have parking available for our guests. It costs $15 per day.',
      timestamp: '2024-04-25T10:35:00',
      isGuest: false,
      read: true,
      conversation: 'c1',
    },
    {
      id: '3',
      guestName: 'John Doe',
      guestId: '101',
      content: 'Great, thank you! One more question: do you offer late check-out?',
      timestamp: '2024-04-25T10:40:00',
      isGuest: true,
      read: true,
      conversation: 'c1',
    },
    {
      id: '4',
      guestName: 'Emma Wilson',
      guestId: '102',
      content: 'Hello, I\'ll be arriving late tonight around 11 PM. Will the reception be open?',
      timestamp: '2024-04-25T15:20:00',
      isGuest: true,
      read: false,
      conversation: 'c2',
    },
    {
      id: '5',
      guestName: 'Robert Johnson',
      guestId: '103',
      content: 'Is there a possibility to add an extra bed to our room reservation #B2204?',
      timestamp: '2024-04-24T09:15:00',
      isGuest: true,
      read: true,
      conversation: 'c3',
    },
    {
      id: '6',
      guestName: 'Staff',
      guestId: '103',
      content: 'Yes, we can add an extra bed for an additional fee of $50 per night. Would you like me to arrange this for you?',
      timestamp: '2024-04-24T09:30:00',
      isGuest: false,
      read: true,
      conversation: 'c3',
    }
  ]);

  // Scroll to bottom of messages when conversation changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentConversation, messages]);

  // Get unique conversations
  const conversations = [...new Set(messages.map(message => message.conversation))];

  // Get conversation info (latest message, unread count)
  const getConversationInfo = (conversationId: string) => {
    const conversationMessages = messages.filter(m => m.conversation === conversationId);
    const latestMessage = [...conversationMessages].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
    
    const unreadCount = conversationMessages.filter(m => m.isGuest && !m.read).length;
    const guestName = conversationMessages.find(m => m.isGuest)?.guestName || 'Unknown';
    
    return {
      latestMessage,
      unreadCount,
      guestName,
      guestId: latestMessage.guestId,
      timestamp: latestMessage.timestamp
    };
  };

  // Filter conversations according to tab
  const filteredConversations = conversations.filter(conversationId => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") {
      return getConversationInfo(conversationId).unreadCount > 0;
    }
    return false;
  }).filter(conversationId => {
    if (!searchTerm) return true;
    const info = getConversationInfo(conversationId);
    return info.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      messages.some(m => 
        m.conversation === conversationId && 
        m.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
  });

  const handleSendMessage = () => {
    if (!currentConversation || !newMessage.trim()) return;
    
    const newMessageObj: Message = {
      id: Date.now().toString(),
      guestName: 'Staff',
      guestId: getConversationInfo(currentConversation).guestId,
      content: newMessage,
      timestamp: new Date().toISOString(),
      isGuest: false,
      read: true,
      conversation: currentConversation,
    };
    
    setMessages([...messages, newMessageObj]);
    setNewMessage("");
    toast.success("Message sent");
  };

  const markConversationAsRead = (conversationId: string) => {
    setMessages(messages.map(m => 
      m.conversation === conversationId && m.isGuest && !m.read
        ? { ...m, read: true }
        : m
    ));
    
    setCurrentConversation(conversationId);
  };

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
                  {filteredConversations.map(conversationId => {
                    const info = getConversationInfo(conversationId);
                    return (
                      <div 
                        key={conversationId}
                        onClick={() => markConversationAsRead(conversationId)}
                        className={`p-3 border-b cursor-pointer hover:bg-muted/50 transition ${
                          currentConversation === conversationId ? "bg-muted" : ""
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
                            {new Date(info.timestamp).toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                          {info.latestMessage.content}
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
                        {getConversationInfo(currentConversation).guestName}
                      </h3>
                    </div>
                  </div>
                </div>
                
                {/* Messages area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages
                    .filter(message => message.conversation === currentConversation)
                    .map(message => (
                      <div
                        key={message.id}
                        className={`flex ${message.isGuest ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.isGuest
                              ? 'bg-muted'
                              : 'bg-primary text-primary-foreground'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <div className="text-sm font-medium">
                              {message.guestName}
                            </div>
                            <div className="text-xs ml-4 opacity-70">
                              {new Date(message.timestamp).toLocaleString(undefined, {
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
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button 
                      className="self-end"
                      onClick={handleSendMessage}
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
  );
};

export default GuestMessages;
