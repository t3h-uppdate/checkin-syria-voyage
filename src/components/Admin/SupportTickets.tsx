
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Mail,
  Search,
  Filter,
  Loader2,
  RefreshCcw,
  AlertCircle,
  CheckCircle,
  Clock,
  MessageSquare,
  User,
  Hotel,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SupportTicket = {
  id: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  category: 'general' | 'booking' | 'payment' | 'technical';
  sender_name: string;
  sender_email: string;
  sender_type: 'guest' | 'owner';
  created_at: string;
  updated_at: string;
  assignee?: string;
  replies?: Array<{
    id: string;
    message: string;
    sender: 'user' | 'admin';
    created_at: string;
  }>;
};

// Mock data for tickets
const mockTickets: SupportTicket[] = Array(15).fill(null).map((_, i) => ({
  id: `ticket-${i+1}`,
  subject: [`Booking cancellation issue`, `Payment not processed`, `Can't update my profile`, `Room quality complaint`, `Website technical issue`][Math.floor(Math.random() * 5)],
  message: `This is a sample message for ticket ${i+1}. This would contain details about the user's issue or request.`,
  status: ['new', 'in_progress', 'resolved'][Math.floor(Math.random() * 3)] as 'new' | 'in_progress' | 'resolved',
  priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
  category: ['general', 'booking', 'payment', 'technical'][Math.floor(Math.random() * 4)] as 'general' | 'booking' | 'payment' | 'technical',
  sender_name: `User ${i+1}`,
  sender_email: `user${i+1}@example.com`,
  sender_type: Math.random() > 0.5 ? 'guest' : 'owner',
  created_at: new Date(Date.now() - Math.floor(Math.random() * 10) * 86400000).toISOString(),
  updated_at: new Date(Date.now() - Math.floor(Math.random() * 5) * 86400000).toISOString(),
  assignee: Math.random() > 0.6 ? 'Admin User' : undefined,
  replies: Math.random() > 0.5 ? [
    {
      id: `reply-${i}-1`,
      message: 'Thank you for contacting us. We are looking into this issue.',
      sender: 'admin' as const,
      created_at: new Date(Date.now() - Math.floor(Math.random() * 2) * 86400000).toISOString(),
    },
    ...(Math.random() > 0.7 ? [{
      id: `reply-${i}-2`,
      message: 'I still have the same issue, please help.',
      sender: 'user' as const,
      created_at: new Date(Date.now() - Math.floor(Math.random() * 1) * 86400000).toISOString(),
    }] : [])
  ] : [],
}));

const SupportTickets = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>(mockTickets);
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    filterTickets();
  }, [tickets, searchTerm, statusFilter, priorityFilter, categoryFilter]);

  const filterTickets = () => {
    let filtered = [...tickets];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        ticket =>
          ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.sender_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    // Filter by priority
    if (priorityFilter !== "all") {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter(ticket => ticket.category === categoryFilter);
    }

    setFilteredTickets(filtered);
  };

  const handleSendReply = () => {
    if (!selectedTicket || !replyText.trim()) return;

    const newReply = {
      id: `reply-new-${Date.now()}`,
      message: replyText,
      sender: 'admin' as const,
      created_at: new Date().toISOString(),
    };

    const updatedTicket: SupportTicket = {
      ...selectedTicket,
      status: 'in_progress' as const,
      updated_at: new Date().toISOString(),
      replies: [...(selectedTicket.replies || []), newReply],
    };

    setTickets(tickets.map(ticket => 
      ticket.id === selectedTicket.id ? updatedTicket : ticket
    ));
    
    setSelectedTicket(updatedTicket);
    setReplyText("");
    
    toast({
      title: "Reply Sent",
      description: "Your response has been sent to the user.",
    });
  };

  const markAsResolved = (ticketId: string) => {
    const updatedTickets = tickets.map(ticket =>
      ticket.id === ticketId ? { ...ticket, status: 'resolved' as const, updated_at: new Date().toISOString() } : ticket
    );
    
    setTickets(updatedTickets);
    
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: 'resolved' as const, updated_at: new Date().toISOString() });
    }
    
    toast({
      title: "Ticket Resolved",
      description: "The support ticket has been marked as resolved.",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">New</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">In Progress</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Resolved</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Low</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>Manage and respond to user and hotel owner support requests</CardDescription>
            </div>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => {
                setLoading(true);
                setTimeout(() => {
                  setLoading(false);
                }, 700);
              }}
            >
              <RefreshCcw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets by subject, name or email..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Status</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Priority</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Category</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="booking">Booking</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Loading tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Tickets Found</h3>
              <p className="text-muted-foreground mt-2">
                Try adjusting your filters or search term
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <div className="font-medium">{ticket.subject}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">{ticket.message}</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {ticket.sender_type === 'guest' ? (
                            <User className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Hotel className="h-4 w-4 text-purple-500" />
                          )}
                          <div>
                            <div className="text-sm">{ticket.sender_name}</div>
                            <div className="text-xs text-muted-foreground">{ticket.sender_email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                          <span className="text-sm">{formatDate(ticket.created_at)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setIsTicketDialogOpen(true);
                            }}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Reply
                          </Button>
                          {ticket.status !== 'resolved' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600"
                              onClick={() => markAsResolved(ticket.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Resolve
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredTickets.length} of {tickets.length} tickets
          </div>
          <div className="flex gap-3 text-sm">
            <div>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 mr-1">New</Badge>
              <span>{tickets.filter(t => t.status === 'new').length}</span>
            </div>
            <div>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 mr-1">In Progress</Badge>
              <span>{tickets.filter(t => t.status === 'in_progress').length}</span>
            </div>
            <div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mr-1">Resolved</Badge>
              <span>{tickets.filter(t => t.status === 'resolved').length}</span>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* Ticket Dialog */}
      <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-lg font-semibold">{selectedTicket?.subject}</span>
              {selectedTicket && getStatusBadge(selectedTicket.status)}
              {selectedTicket && getPriorityBadge(selectedTicket.priority)}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            {/* Ticket information */}
            <div className="bg-muted p-4 rounded-md">
              <div className="flex justify-between mb-2">
                <div className="flex items-center gap-2">
                  {selectedTicket?.sender_type === 'guest' ? (
                    <User className="h-5 w-5 text-blue-500" />
                  ) : (
                    <Hotel className="h-5 w-5 text-purple-500" />
                  )}
                  <span className="font-medium">{selectedTicket?.sender_name}</span>
                  <span className="text-sm text-muted-foreground">{selectedTicket?.sender_email}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedTicket && formatDate(selectedTicket.created_at)}
                </div>
              </div>
              <p className="text-sm">{selectedTicket?.message}</p>
            </div>
            
            {/* Previous replies */}
            {selectedTicket?.replies && selectedTicket.replies.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Previous messages</h3>
                {selectedTicket.replies.map((reply) => (
                  <div 
                    key={reply.id} 
                    className={`p-4 rounded-md ${
                      reply.sender === 'admin' 
                        ? 'bg-blue-50 ml-8'
                        : 'bg-muted mr-8'
                    }`}
                  >
                    <div className="flex justify-between mb-2">
                      <div className="font-medium">
                        {reply.sender === 'admin' ? 'Support Agent' : selectedTicket.sender_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(reply.created_at)}
                      </div>
                    </div>
                    <p className="text-sm">{reply.message}</p>
                  </div>
                ))}
              </div>
            )}
            
            {/* Reply form */}
            {selectedTicket?.status !== 'resolved' && (
              <div className="space-y-4 mt-6">
                <h3 className="text-sm font-medium">Your reply</h3>
                <Textarea
                  placeholder="Type your response here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
            )}
          </div>
          
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsTicketDialogOpen(false)}>
              Close
            </Button>
            {selectedTicket?.status !== 'resolved' && (
              <>
                <Button 
                  variant="outline" 
                  className="text-green-600"
                  onClick={() => {
                    if (!selectedTicket) return;
                    markAsResolved(selectedTicket.id);
                    setIsTicketDialogOpen(false);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark as Resolved
                </Button>
                <Button 
                  disabled={!replyText.trim()} 
                  onClick={handleSendReply}
                >
                  Send Reply
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportTickets;
