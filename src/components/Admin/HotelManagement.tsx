
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Eye,
  Filter,
  Loader2,
  RefreshCcw,
  AlertTriangle,
  CheckCircle,
  Ban,
  Hotel,
  Search,
  Star,
  MapPin,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Hotel = {
  id: string;
  name: string;
  city: string;
  country: string;
  rating: number;
  review_count: number;
  featured: boolean;
  price_per_night: number;
  owner_id: string;
  created_at: string;
  status?: 'active' | 'pending' | 'suspended';
};

const HotelManagement = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    filterHotels();
  }, [hotels, searchTerm, statusFilter]);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("hotels").select("*");

      if (error) throw error;

      // Add status for demonstration purposes
      const hotelsWithStatus = data.map(hotel => ({
        ...hotel,
        status: Math.random() < 0.7 ? 'active' : Math.random() < 0.85 ? 'pending' : 'suspended'
      }));

      setHotels(hotelsWithStatus);
    } catch (error) {
      console.error("Error fetching hotels:", error);
      toast({
        title: "Error",
        description: "Failed to load hotels",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterHotels = () => {
    let filtered = [...hotels];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        hotel =>
          hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hotel.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hotel.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(hotel => hotel.status === statusFilter);
    }

    setFilteredHotels(filtered);
  };

  const handleSuspendHotel = async () => {
    if (!selectedHotel) return;

    try {
      // In a real implementation, you would update the hotel's status in the database
      const updatedHotels = hotels.map(hotel =>
        hotel.id === selectedHotel.id ? { ...hotel, status: 'suspended' as const } : hotel
      );
      
      setHotels(updatedHotels);
      
      toast({
        title: "Hotel Suspended",
        description: `${selectedHotel.name} has been suspended.`,
      });
      
      setSuspendDialogOpen(false);
    } catch (error) {
      console.error("Error suspending hotel:", error);
      toast({
        title: "Error",
        description: "Failed to suspend hotel",
        variant: "destructive"
      });
    }
  };

  const handleApproveHotel = async () => {
    if (!selectedHotel) return;

    try {
      // In a real implementation, you would update the hotel's status in the database
      const updatedHotels = hotels.map(hotel =>
        hotel.id === selectedHotel.id ? { ...hotel, status: 'active' as const } : hotel
      );
      
      setHotels(updatedHotels);
      
      toast({
        title: "Hotel Approved",
        description: `${selectedHotel.name} has been approved and is now active.`,
      });
      
      setApproveDialogOpen(false);
    } catch (error) {
      console.error("Error approving hotel:", error);
      toast({
        title: "Error",
        description: "Failed to approve hotel",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
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
              <CardTitle>Hotel Management</CardTitle>
              <CardDescription>Review, approve, suspend or remove hotels</CardDescription>
            </div>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={fetchHotels}
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
                placeholder="Search hotels by name, city, or country..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Status: {statusFilter === "all" ? "All" : statusFilter}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Loading hotels...</p>
            </div>
          ) : filteredHotels.length === 0 ? (
            <div className="text-center py-12">
              <Hotel className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Hotels Found</h3>
              <p className="text-muted-foreground mt-2">
                Try adjusting your filters or search term
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Hotel</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Listed</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHotels.map((hotel) => (
                    <TableRow key={hotel.id}>
                      <TableCell>
                        <div className="font-medium">{hotel.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-muted-foreground mr-1" />
                          {hotel.city}, {hotel.country}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-amber-500 mr-1" />
                          <span>{hotel.rating}</span>
                          <span className="text-xs text-muted-foreground ml-1">
                            ({hotel.review_count} reviews)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>${hotel.price_per_night}/night</TableCell>
                      <TableCell>
                        {getStatusBadge(hotel.status)}
                      </TableCell>
                      <TableCell>{formatDate(hotel.created_at)}</TableCell>
                      <TableCell>
                        {hotel.featured ? (
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                            Featured
                          </Badge>
                        ) : (
                          <Badge variant="outline">Regular</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                // View hotel details functionality would go here
                                toast({
                                  title: "View Hotel Details",
                                  description: `Viewing ${hotel.name}`,
                                });
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              <span>View Details</span>
                            </DropdownMenuItem>
                            
                            {hotel.status === 'pending' && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedHotel(hotel);
                                  setApproveDialogOpen(true);
                                }}
                              >
                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                <span>Approve Hotel</span>
                              </DropdownMenuItem>
                            )}
                            
                            {hotel.status !== 'suspended' && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedHotel(hotel);
                                  setSuspendDialogOpen(true);
                                }}
                                className="text-red-500 focus:text-red-500"
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                <span>Suspend Hotel</span>
                              </DropdownMenuItem>
                            )}
                            
                            {hotel.status === 'suspended' && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedHotel(hotel);
                                  setApproveDialogOpen(true);
                                }}
                              >
                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                <span>Reactivate Hotel</span>
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuItem
                              onClick={() => {
                                const newFeaturedStatus = !hotel.featured;
                                const updatedHotels = hotels.map(h =>
                                  h.id === hotel.id ? { ...h, featured: newFeaturedStatus } : h
                                );
                                setHotels(updatedHotels);
                                toast({
                                  title: newFeaturedStatus ? "Hotel Featured" : "Hotel Unfeatured",
                                  description: `${hotel.name} has been ${newFeaturedStatus ? 'added to' : 'removed from'} featured hotels.`,
                                });
                              }}
                            >
                              <Star className="mr-2 h-4 w-4" />
                              <span>{hotel.featured ? "Remove from Featured" : "Add to Featured"}</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suspend Hotel Dialog */}
      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend Hotel</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend this hotel? It will no longer be visible to users until reactivated.
              <div className="mt-4 p-4 bg-muted rounded-md">
                <p className="font-medium">{selectedHotel?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedHotel?.city}, {selectedHotel?.country}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspendHotel}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Suspend Hotel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approve Hotel Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Hotel</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this hotel? It will be visible to all users on the platform.
              <div className="mt-4 p-4 bg-muted rounded-md">
                <p className="font-medium">{selectedHotel?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedHotel?.city}, {selectedHotel?.country}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApproveHotel}>
              Approve Hotel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HotelManagement;
