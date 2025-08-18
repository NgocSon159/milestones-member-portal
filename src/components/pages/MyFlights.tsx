import { useState, useEffect, useCallback } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination";
import { toast } from "sonner";
import { useEarnMiles } from "../EarnMilesContext";
import { getMemberData } from "../shared/memberData";
import { 
  Plane, 
  Calendar,
  MapPin,
  Users,
  Download,
  CheckCircle,
  AlertCircle,
  Calculator,
  Send,
  X,
  Award,
  Info,
  HourglassIcon,
  Filter,
  Star,
  TrendingUp
} from "lucide-react";

interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  from: { code: string; city: string; country: string; };
  to: { code: string; city: string; country: string; };
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  duration: string;
  aircraft: string;
  class: string;
  seatNumber: string;
  gate: string;
  terminal: string;
  status: string;
  bookingReference: string;
  eTicket: string;
  miles: number;
  bonusMiles?: number;
  distance: number;
  milesRequested?: boolean | "pending";
}

interface MyFlightsProps {
  initialTab?: string;
  initialFilter?: string;
}

export function MyFlights({ initialTab = "upcoming", initialFilter }: MyFlightsProps) {
  const [selectedTab, setSelectedTab] = useState(initialTab);
  const [completedFlightFilter, setCompletedFlightFilter] = useState<"all" | "not-requested" | "requested">("all");
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
  const [showEarnMilesDialog, setShowEarnMilesDialog] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calculatedMilesResult, setCalculatedMilesResult] = useState<{ qualifyingMiles: number; bonusMiles: number } | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Set tab to completed if filter is specified
  useEffect(() => {
    if (initialFilter === "not-requested") {
      setSelectedTab("past");
      setCompletedFlightFilter("not-requested");
    } else if (initialFilter === "requested") {
      setSelectedTab("past");
      setCompletedFlightFilter("requested");
    }
  }, [initialFilter]);
  
  const { addRequest, requests, hasRequestForFlight, getRequestForFlight } = useEarnMiles();
  
  // Get member data for miles calculations
  const memberData = getMemberData(requests);

  // Fetch flights from API
  const fetchFlights = useCallback(async () => {
    setLoading(true);
    setError(null);
    let statusParam = selectedTab;
    if (selectedTab === "past") {
      statusParam = "completed";
    }

    try {
      const token = localStorage.getItem('token'); // Assuming token is stored in local storage
      const response = await fetch(`https://mileswise-be.onrender.com/api/member/my-flights?status=${statusParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      const mappedFlights: Flight[] = data.map((item: any) => {
        const departureDate = item.startTime ? item.startTime.split('T')[0] : "";
        const departureTime = item.startTime ? item.startTime.split('T')[1].substring(0, 5) : "";
        const arrivalDate = item.endTime ? item.endTime.split('T')[0] : "";
        const arrivalTime = item.endTime ? item.endTime.split('T')[1].substring(0, 5) : "";
        const durationMs = item.endTime && item.startTime ? new Date(item.endTime).getTime() - new Date(item.startTime).getTime() : 0;
        const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
        const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        const duration = durationMs > 0 ? `${durationHours}h ${durationMinutes}m` : "N/A";

        return {
          id: item.id,
          flightNumber: item.flightNumber,
          airline: item.airline,
          from: { 
            code: item.departure,
            city: item.departureInfo?.city || "N/A",
            country: "Vietnam" 
          },
          to: { 
            code: item.arrival,
            city: item.arrivalInfo?.city || "N/A",
            country: "Vietnam" 
          },
          departureDate: departureDate,
          departureTime: departureTime,
          arrivalDate: arrivalDate,
          arrivalTime: arrivalTime,
          duration: duration,
          aircraft: "Airbus A321", // Placeholder, as not in response
          class: item.serviceClass,
          seatNumber: item.seat,
          gate: `A${Math.floor(Math.random() * 20) + 1}`, // Random data
          terminal: item.arrivalInfo?.terminal || "N/A",
          status: item.status,
          bookingReference: item.bookingNumber,
          eTicket: item.bookingNumber,
          miles: item.distance,
          bonusMiles: item.distance,
          distance: item.distance,
          milesRequested: false // Default to false as per request
        };
      });
      setFlights(mappedFlights);
    } catch (e: any) {
      setError(e.message);
      toast.error(`Failed to fetch flights: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [selectedTab, hasRequestForFlight, getRequestForFlight]);

  useEffect(() => {
    fetchFlights();
  }, [fetchFlights, selectedTab, initialFilter]); // Add selectedTab here

  // Calculate bonus miles based on service class
  const calculateBonusMiles = (qualifyingMiles: number, serviceClass: string) => {
    let multiplier = 1.0;
    switch (serviceClass) {
      case 'Business':
        multiplier = 1.45;
        break;
      case 'Premium Economy':
        multiplier = 1.3;
        break;
      case 'Economy':
      default:
        multiplier = 1.0;
        break;
    }
    return {
      qualifyingMiles,
      multiplier,
      bonusMiles: Math.round(qualifyingMiles * multiplier)
    };
  };

  // Clear date filters
  const clearFilters = () => {
    setDateFilter({ from: "", to: "" });
  };

  // Filter functions with pagination
  const getFilteredFlights = (status: string) => {
    let filtered = flights.filter(flight => {
      if (status === "upcoming") return flight.status === "upcoming";
      if (status === "ongoing") return flight.status === "ongoing";
      if (status === "past") return flight.status === "completed"; // Map 'past' tab to 'completed' status
      if (status === "cancelled") return flight.status === "cancelled";
      return false;
    });

    // Apply completed flight filter for past (completed) flights
    if (status === "past") {
      if (completedFlightFilter === "not-requested") {
        filtered = filtered.filter(flight => flight.milesRequested === false || flight.milesRequested === undefined); // Adjusted for clarity
      } else if (completedFlightFilter === "requested") {
        filtered = filtered.filter(flight => flight.milesRequested === "pending" || flight.milesRequested === true);
      }
    }

    // Apply date filter
    if (dateFilter.from || dateFilter.to) {
      filtered = filtered.filter(flight => {
        const flightDate = new Date(flight.departureDate);
        const fromDate = dateFilter.from ? new Date(dateFilter.from) : null;
        const toDate = dateFilter.to ? new Date(dateFilter.to) : null;
        
        if (fromDate && flightDate < fromDate) return false;
        if (toDate && flightDate > toDate) return false;
        return true;
      });
    }

    return filtered;
  };

  // Pagination logic
  const getPagedFlights = (flights: Flight[]) => { // Use Flight[] type
    const totalPages = Math.ceil(flights.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return {
      data: flights.slice(startIndex, endIndex),
      totalPages,
      currentPage,
      totalItems: flights.length
    };
  };

  // Reset pagination when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTab, completedFlightFilter, dateFilter]);

  // Handle request miles button click
  const handleRequestMiles = async (flight: Flight) => { // Use Flight type
    setSelectedFlight(flight);
    setShowEarnMilesDialog(true);

    try {
      const token = localStorage.getItem('token');
      const seatClassChar = flight.seatNumber.charAt(0); // Assuming seatClass is the first character of seatNumber
      const requestBody = {
        distance: flight.distance,
        seatClass: seatClassChar,
        departureDate: flight.departureDate
      };

      const response = await fetch(`https://mileswise-be.onrender.com/api/member/calculate-miles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCalculatedMilesResult({ qualifyingMiles: data.totalMiles, bonusMiles: data.totalMiles });

    } catch (e: any) {
      toast.error(`Failed to calculate miles: ${e.message}`);
      setCalculatedMilesResult(null);
    }
  };

  // Handle earn miles submission
  const handleEarnMilesSubmit = () => {
    if (selectedFlight && calculatedMilesResult) {
      // const { qualifyingMiles, bonusMiles } = calculateBonusMiles(selectedFlight.miles, selectedFlight.class);
      addRequest({
        flightNumber: selectedFlight.flightNumber,
        airline: selectedFlight.airline,
        from: `${selectedFlight.from.code} - ${selectedFlight.from.city}`,
        to: `${selectedFlight.to.code} - ${selectedFlight.to.city}`,
        departureDate: selectedFlight.departureDate,
        serviceClass: selectedFlight.class,
        seatClass: selectedFlight.seatNumber.charAt(selectedFlight.seatNumber.length - 1),
        distance: selectedFlight.distance,
        calculatedMiles: calculatedMilesResult.qualifyingMiles,
        bonusMiles: calculatedMilesResult.bonusMiles,
        status: 'waiting to confirm' as const
      });
      toast.success("Miles request submitted successfully!");
      setShowEarnMilesDialog(false);
      setSelectedFlight(null);
      setCalculatedMilesResult(null); // Clear calculated miles result
      fetchFlights(); // Re-fetch flights to update status after request
    }
  };

  // Render pagination component
  const renderPagination = (pagination: any) => {
    if (pagination.totalPages <= 1) return null;

    return (
      <div className="mt-6">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                className={currentPage === pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        
        <div className="text-center mt-2 text-sm text-muted-foreground">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, pagination.totalItems)} of {pagination.totalItems} flights
        </div>
      </div>
    );
  };

  // Flight card component with new design (REMOVED BONUS MILES)
  const FlightCard = ({ flight }: { flight: Flight }) => { // Use Flight type
    const milesRequested = hasRequestForFlight(flight.flightNumber) || flight.milesRequested === true || flight.milesRequested === "pending";
    const requestInfo = getRequestForFlight(flight.flightNumber);
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Plane className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{flight.flightNumber}</h3>
                <p className="text-gray-600">{flight.airline}</p>
              </div>
            </div>
            <Badge 
              variant={
                flight.status === "Completed" ? "default" : 
                flight.status === "Ongoing" ? "secondary" : 
                flight.status === "Cancelled" ? "destructive" :
                flight.status === "Miles Requested" ? "secondary" : // This status is for mock data, will be 'completed' from API
                "outline"
              }
              className={
                flight.status === "Completed" ? "bg-green-100 text-green-700" :
                flight.status === "Ongoing" ? "bg-blue-100 text-blue-700" :
                flight.status === "Cancelled" ? "bg-red-100 text-red-700" :
                flight.status === "Miles Requested" ? "bg-yellow-100 text-yellow-700" : // This status is for mock data, will be 'completed' from API
                "bg-gray-100 text-gray-700"
              }
            >
              {flight.status}
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{flight.from.code}</div>
              <div className="text-sm text-gray-600">{flight.departureTime}</div>
            </div>
            
            <div className="text-center flex flex-col items-center">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="flex-1 h-px bg-gray-300"></div>
                <Plane className="h-4 w-4 text-gray-400" />
                <div className="flex-1 h-px bg-gray-300"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
              <div className="text-sm text-gray-600">{flight.duration}</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">{flight.to.code}</div>
              <div className="text-sm text-gray-600">{flight.arrivalTime}</div>
            </div>
          </div>

          {/* UPDATED GRID - REMOVED BONUS MILES COLUMN */}
          <div className="grid grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
            <div>
              <div className="flex items-center space-x-1 mb-1">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Date</span>
              </div>
              <div>{new Date(flight.departureDate).toLocaleDateString()}</div>
            </div>
            
            <div>
              <div className="flex items-center space-x-1 mb-1">
                <Users className="h-4 w-4" />
                <span className="font-medium">Class</span>
              </div>
              <div>{flight.class}</div>
            </div>
            
            <div>
              <div className="flex items-center space-x-1 mb-1">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">Seat</span>
              </div>
              <div>{flight.seatNumber}</div>
            </div>
            
            <div>
              <div className="flex items-center space-x-1 mb-1">
                <Award className="h-4 w-4" />
                <span className="font-medium">Qualifying Miles</span>
              </div>
              <div className="font-bold text-blue-600">{flight.miles.toLocaleString()}</div>
            </div>
          </div>

          {flight.status === "completed" && !milesRequested && (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                You can request miles for this completed flight.
              </p>
            </div>
          )}

          {flight.status === "completed" && flight.milesRequested === "pending" && (
            <div className="mb-4 p-4 rounded-lg border-2 bg-yellow-50 border-yellow-200">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-sm text-yellow-800 mb-2">
                    Miles request is currently being processed. Please allow 3-5 business days.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-yellow-700">Qualifying Miles:</span>
                      <span className="font-bold text-yellow-800 ml-1">{flight.miles.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-yellow-700">Bonus Miles:</span>
                      <span className="font-bold text-yellow-800 ml-1">{(flight.bonusMiles || flight.miles).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <Badge className="text-xs ml-2 bg-yellow-100 text-yellow-700">
                  Pending
                </Badge>
              </div>
            </div>
          )}

          {flight.status === "completed" && milesRequested && requestInfo && (
            <div className={`mb-4 p-4 rounded-lg border-2 ${
              requestInfo.status === 'approved' ? 'bg-green-50 border-green-200' :
              requestInfo.status === 'rejected' ? 'bg-red-50 border-red-200' :
              'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  {requestInfo.status === 'approved' && (
                    <div>
                      <p className="text-sm text-green-800 mb-2">
                        Miles have been successfully credited to your account!
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-green-700">Qualifying Miles:</span>
                          <span className="font-bold text-green-800 ml-1">{requestInfo.calculatedMiles.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-green-700">Bonus Miles:</span>
                          <span className="font-bold text-green-800 ml-1">{(requestInfo.bonusMiles || requestInfo.calculatedMiles).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {requestInfo.status === 'waiting to confirm' && (
                    <p className="text-sm text-yellow-800">
                      Miles request is pending approval. <span className="font-bold">{requestInfo.calculatedMiles.toLocaleString()} qualifying miles</span> and <span className="font-bold">{(requestInfo.bonusMiles || requestInfo.calculatedMiles).toLocaleString()} bonus miles</span> will be credited upon approval.
                    </p>
                  )}
                  {requestInfo.status === 'rejected' && (
                    <p className="text-sm text-red-800">
                      Miles request was rejected. {requestInfo.reason && `Reason: ${requestInfo.reason}`}
                    </p>
                  )}
                </div>
                <Badge className={`text-xs ml-2 ${
                  requestInfo.status === 'approved' ? 'bg-green-100 text-green-700' :
                  requestInfo.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {requestInfo.status === 'approved' ? 'Approved' :
                   requestInfo.status === 'rejected' ? 'Rejected' :
                   'Pending'}
                </Badge>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-4 border-t">
            {flight.status === "completed" && (
              <>
                {milesRequested && requestInfo ? (
                  <div className={`flex items-center ${
                    requestInfo.status === 'approved' ? 'text-green-600' :
                    requestInfo.status === 'rejected' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {requestInfo.status === 'approved' && <CheckCircle className="h-4 w-4 mr-2" />}
                    {requestInfo.status === 'rejected' && <AlertCircle className="h-4 w-4 mr-2" />}
                    {requestInfo.status === 'waiting to confirm' && <HourglassIcon className="h-4 w-4 mr-2" />}
                    <span className="text-sm">
                      {requestInfo.status === 'approved' ? 'Miles Completed' :
                       requestInfo.status === 'rejected' ? 'Miles Rejected' :
                       'Miles Pending'}
                    </span>
                  </div>
                ) : flight.milesRequested === "pending" ? (
                  <div className="flex items-center text-yellow-600">
                    <HourglassIcon className="h-4 w-4 mr-2" />
                    <span className="text-sm">Miles Processing</span>
                  </div>
                ) : (
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => handleRequestMiles(flight)}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Request Earn Miles Now
                  </Button>
                )}
              </>
            )}

            {(flight.status === "upcoming" || flight.status === "ongoing") && (
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download E-Ticket
              </Button>
            )}

            {flight.status === "cancelled" && (
              <div className="flex items-center text-red-600">
                <X className="h-4 w-4 mr-2" />
                <span className="text-sm">Flight Cancelled</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Get flight counts for each tab
  const upcomingFlights = getFilteredFlights("upcoming");
  const ongoingFlights = getFilteredFlights("ongoing");
  const pastFlights = getFilteredFlights("past");
  const cancelledFlights = getFilteredFlights("cancelled");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plane className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Flights</h1>
              <p className="text-gray-600 text-sm">Manage all your flights and earn miles</p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="font-bold text-2xl text-blue-600">{memberData.completedFlightsCount}</div>
            <p className="text-xs text-gray-500">Completed Flights</p>
          </div>
        </div>
      </div>

      {/* Flight Tabs */}
      <Card className="bg-white shadow-sm">
        <CardContent className="p-6">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="upcoming" className="text-sm">
                Upcoming ({upcomingFlights.length})
              </TabsTrigger>
              <TabsTrigger value="ongoing" className="text-sm">
                Ongoing ({ongoingFlights.length})
              </TabsTrigger>
              <TabsTrigger value="past" className="text-sm">
                Completed ({pastFlights.length})
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="text-sm">
                Cancelled ({cancelledFlights.length})
              </TabsTrigger>
            </TabsList>

            {/* Filters for Completed Flights */}
            {selectedTab === "past" && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Filter:</span>
                    </div>
                    
                    <Select value={completedFlightFilter} onValueChange={(value: any) => setCompletedFlightFilter(value)}>
                      <SelectTrigger className="w-56">
                        <SelectValue placeholder="Filter flights" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Completed Flight</SelectItem>
                        <SelectItem value="not-requested">Not Send Miles Requests</SelectItem>
                        <SelectItem value="requested">Miles Requests</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex items-center space-x-2">
                      <Input
                        type="date"
                        placeholder="From Date"
                        value={dateFilter.from}
                        onChange={(e) => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
                        className="w-36"
                      />
                      <Input
                        type="date"
                        placeholder="To Date"
                        value={dateFilter.to}
                        onChange={(e) => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
                        className="w-36"
                      />
                    </div>
                  </div>
                  
                  {(dateFilter.from || dateFilter.to || completedFlightFilter !== "all") && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Flight Lists */}
            <TabsContent value="upcoming" className="mt-6">
              {loading && <div className="text-center text-blue-500">Loading upcoming flights...</div>}
              {error && <div className="text-center text-red-500">Error: {error}</div>}
              {!loading && !error && (
                <div className="space-y-4">
                  {upcomingFlights.length === 0 ? (
                    <p className="text-center text-gray-500">No upcoming flights found.</p>
                  ) : (
                    upcomingFlights.map((flight) => (
                      <FlightCard key={flight.id} flight={flight} />
                    ))
                  )}
                  {renderPagination(getPagedFlights(upcomingFlights))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="ongoing" className="mt-6">
              {loading && <div className="text-center text-blue-500">Loading ongoing flights...</div>}
              {error && <div className="text-center text-red-500">Error: {error}</div>}
              {!loading && !error && (
                <div className="space-y-4">
                  {ongoingFlights.length === 0 ? (
                    <p className="text-center text-gray-500">No ongoing flights found.</p>
                  ) : (
                    ongoingFlights.map((flight) => (
                      <FlightCard key={flight.id} flight={flight} />
                    ))
                  )}
                  {renderPagination(getPagedFlights(ongoingFlights))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="mt-6">
              {loading && <div className="text-center text-blue-500">Loading completed flights...</div>}
              {error && <div className="text-center text-red-500">Error: {error}</div>}
              {!loading && !error && (
                <div className="space-y-4">
                  {pastFlights.length === 0 ? (
                    <p className="text-center text-gray-500">No completed flights found.</p>
                  ) : (
                    pastFlights.map((flight) => (
                      <FlightCard key={flight.id} flight={flight} />
                    ))
                  )}
                  {renderPagination(getPagedFlights(pastFlights))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="cancelled" className="mt-6">
              {loading && <div className="text-center text-blue-500">Loading cancelled flights...</div>}
              {error && <div className="text-center text-red-500">Error: {error}</div>}
              {!loading && !error && (
                <div className="space-y-4">
                  {cancelledFlights.length === 0 ? (
                    <p className="text-center text-gray-500">No cancelled flights found.</p>
                  ) : (
                    cancelledFlights.map((flight) => (
                      <FlightCard key={flight.id} flight={flight} />
                    ))
                  )}
                  {renderPagination(getPagedFlights(cancelledFlights))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Enhanced Request Miles Dialog */}
      <Dialog open={showEarnMilesDialog} onOpenChange={setShowEarnMilesDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              <span>Miles Calculation & Request</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedFlight && (
            <div className="space-y-6">
              {/* Flight Details */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-3">Flight Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Flight:</span>
                    <span className="font-bold text-blue-900 ml-1">{selectedFlight.flightNumber}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Airline:</span>
                    <span className="font-bold text-blue-900 ml-1">{selectedFlight.airline}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Route:</span>
                    <span className="font-bold text-blue-900 ml-1">{selectedFlight.from.city} → {selectedFlight.to.city}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Date:</span>
                    <span className="font-bold text-blue-900 ml-1">{new Date(selectedFlight.departureDate).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Class:</span>
                    <span className="font-bold text-blue-900 ml-1">{selectedFlight.class}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Distance:</span>
                    <span className="font-bold text-blue-900 ml-1">{selectedFlight.distance.toLocaleString()} km</span>
                  </div>
                </div>
              </div>

              {/* Miles Calculation */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-4 flex items-center">
                  <Award className="h-4 w-4 mr-2" />
                  Miles Calculation Breakdown
                </h3>
                
                {(() => {
                  const calculation = calculateBonusMiles(selectedFlight.miles, selectedFlight.class);
                  return (
                    <div className="space-y-4">
                      {/* Base Qualifying Miles */}
                      <div className="flex items-center justify-between p-3 bg-white rounded border">
                        <div className="flex items-center space-x-2">
                          <Award className="h-4 w-4 text-blue-500" />
                          <span className="font-medium text-gray-700">Base Qualifying Miles</span>
                        </div>
                        <span className="font-bold text-blue-600">{calculatedMilesResult?.qualifyingMiles.toLocaleString() || 'N/A'}</span>
                      </div>

                      {/* Service Class Multiplier */}
                      <div className="flex items-center justify-between p-3 bg-white rounded border">
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium text-gray-700">{selectedFlight.class} Class Multiplier</span>
                        </div>
                        <span className="font-bold text-yellow-600">{calculation.multiplier}x</span>
                      </div>

                      {/* Calculation Formula */}
                      <div className="p-3 bg-gray-50 rounded border border-dashed border-gray-300">
                        <div className="text-center text-sm text-gray-600 mb-2">Calculation Formula</div>
                        <div className="text-center font-mono text-sm">
                          <span className="text-blue-600">{selectedFlight.miles.toLocaleString()}</span>
                          <span className="text-gray-500"> × </span>
                          <span className="text-yellow-600">{calculation.multiplier}</span>
                          <span className="text-gray-500"> = </span>
                          <span className="text-green-600 font-bold">{calculatedMilesResult?.bonusMiles.toLocaleString() || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Total Bonus Miles */}
                      <div className="flex items-center justify-between p-4 bg-green-100 rounded border-2 border-green-300">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                          <span className="font-bold text-green-800">Total Bonus Miles Earned</span>
                        </div>
                        <span className="font-bold text-2xl text-green-600">{calculatedMilesResult?.bonusMiles.toLocaleString() || 'N/A'}</span>
                      </div>

                      {/* Miles Breakdown Summary */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-blue-50 rounded border">
                          <div className="text-xs text-blue-600 mb-1">FOR TIER STATUS</div>
                          <div className="font-bold text-blue-800">Qualifying Miles</div>
                          <div className="text-xl font-bold text-blue-600">{calculatedMilesResult?.qualifyingMiles.toLocaleString() || 'N/A'}</div>
                        </div>
                        <div className="p-3 bg-green-50 rounded border">
                          <div className="text-xs text-green-600 mb-1">FOR REDEMPTION</div>
                          <div className="font-bold text-green-800">Bonus Miles</div>
                          <div className="text-xl font-bold text-green-600">{calculatedMilesResult?.bonusMiles.toLocaleString() || 'N/A'}</div>
                        </div>
                      </div>

                      {/* Additional Information */}
                      <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                        <div className="flex items-start space-x-2">
                          <Info className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-yellow-800">
                            <p className="font-medium mb-1">Important Notes:</p>
                            <ul className="text-xs space-y-1 list-disc list-inside">
                              <li>Qualifying miles count toward your tier status progression</li>
                              <li>Bonus miles can be used for award redemptions and vouchers</li>
                              <li>Miles will be credited within 3-5 business days after approval</li>
                              <li>Service class multiplier applies only to bonus miles, not qualifying miles</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEarnMilesDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEarnMilesSubmit} className="bg-green-600 hover:bg-green-700">
              <Send className="h-4 w-4 mr-2" />
              Submit Miles Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}