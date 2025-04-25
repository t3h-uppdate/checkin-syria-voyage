
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Hotel } from "@/types";
import { MessageSquare, Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface GuestMessagesProps {
  hotel: Hotel | null;
}

interface Message {
  id: string;
  guestName: string;
  content: string;
  timestamp: string;
  isGuest: boolean;
}

const GuestMessages = ({ hotel }: GuestMessagesProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      guestName: 'John Doe',
      content: 'Hej! Jag undrar om ni har parkering?',
      timestamp: '2024-04-25T10:30:00',
      isGuest: true
    },
    {
      id: '2',
      guestName: 'Staff',
      content: 'Ja, vi har parkering tillgänglig för våra gäster. Det kostar 150kr per dygn.',
      timestamp: '2024-04-25T10:35:00',
      isGuest: false
    }
  ]);

  if (!hotel) {
    return (
      <div className="p-8 bg-muted rounded-lg text-center border-2 border-dashed border-muted">
        <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-medium mb-2">Gästmeddelanden</h3>
        <p className="text-muted-foreground">Välj ett hotell först för att se meddelanden.</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meddelanden för {hotel.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {messages.map((message) => (
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
                <div className="text-sm font-medium mb-1">
                  {message.guestName}
                </div>
                <div className="text-sm">{message.content}</div>
                <div className="text-xs mt-1 opacity-70">
                  {new Date(message.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
          
          <div className="flex gap-2 mt-4">
            <Textarea
              placeholder="Skriv ett meddelande..."
              className="min-h-[80px]"
            />
            <Button className="self-end">
              <Send className="h-4 w-4 mr-2" />
              Skicka
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GuestMessages;
