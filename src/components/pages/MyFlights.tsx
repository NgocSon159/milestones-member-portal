import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination";
import { toast } from "sonner";
import { useEarnMiles } from "../EarnMilesContext";
import { getMemberData } from "../shared/memberData";
import { 
  Plane, 
  Calendar,
  Clock,
  MapPin,
  Users,
  Luggage,
  Ticket,
  Download,
  CheckCircle,
  AlertCircle,
  Loader,
  Calculator,
  Send,
  X,
  Award,
  Info,
  HourglassIcon,
  Filter,
  Star,
  TrendingUp,
  Edit
} from "lucide-react";

interface MyFlightsProps {
  onPageChange?: (page: string, params?: any) => void;
  initialTab?: string;
  initialFilter?: string;
}

interface FlightFormData {
  flightNumber: string;
  airline: string;
  from: string;
  to: string;
  departureDate: string;
  class: string;
  distance: number;
  seatNumber: string;
  seatClass: string;
}

export function MyFlights({ onPageChange, initialTab = "upcoming", initialFilter }: MyFlightsProps) {
  const [selectedTab, setSelectedTab] = useState(initialTab);
  const [completedFlightFilter, setCompletedFlightFilter] = useState<"all" | "not-requested" | "requested">("all");
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
  const [showEarnMilesDialog, setShowEarnMilesDialog] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [dialogStep, setDialogStep] = useState<"form" | "calculation">("form");
  const [flightFormData, setFlightFormData] = useState<FlightFormData>({
    flightNumber: "",
    airline: "",
    from: "",
    to: "",
    departureDate: "",
    class: "",
    distance: 0,
    seatNumber: "",
    seatClass: ""
  });
  const [calculationResult, setCalculationResult] = useState<any>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // API state management
  const [flightData, setFlightData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map tab names to API status values
  const getStatusFromTab = (tab: string): string => {
    switch (tab) {
      case "upcoming": return "upcoming";
      case "ongoing": return "ongoing";
      case "past": return "completed";
      case "cancelled": return "completed"; // Cancelled flights are also in completed status
      default: return "upcoming";
    }
  };

  // API service function to fetch flights
  const fetchFlights = async (status: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `https://mileswise-be.onrender.com/api/member/my-flights?status=${status}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Map API response to match existing data structure
      const mappedFlights = data.map((item: any) => {
        // Calculate duration from start/end time
        const startTime = new Date(item.startTime);
        const endTime = new Date(item.endTime);
        const durationMs = endTime.getTime() - startTime.getTime();
        const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
        const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        const duration = `${durationHours}h ${durationMinutes}m`;

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
          departureDate: startTime.toISOString().split('T')[0],
          departureTime: startTime.toTimeString().slice(0, 5),
          arrivalDate: endTime.toISOString().split('T')[0],
          arrivalTime: endTime.toTimeString().slice(0, 5),
          duration: duration,
          aircraft: Math.random() > 0.5 ? "Boeing 787" : "Airbus A321",
          class: item.serviceClass,
          seatNumber: item.seat,
          seatClass: item.seatClass,
          status: item.status,
          bookingReference: item.bookingNumber,
          eTicket: item.bookingNumber,
          qualifyingMiles: item.qualifyingMiles || item.distance,
          bonusMiles: item.bonusMiles || item.distance,
          distance: item.distance,
          milesRequested: item.requestEarnMilesStatus !== null,
          requestEarnMilesStatus: item.requestEarnMilesStatus,  /*"rejected", "reviewing", "approved"*/
        };
      });

      console.log('mappedFlights', mappedFlights)

      setFlightData(mappedFlights);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching flights');
      console.error('Error fetching flights:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch flights when component mounts or tab changes
  useEffect(() => {
    const status = getStatusFromTab(selectedTab);
    fetchFlights(status);
  }, [selectedTab]);

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
  const getFilteredFlights = (type: string) => {
    // Since API already returns flights based on status, we start with flightData
    let filtered = [...flightData];

    // For cancelled flights, we need to filter from completed flights
    if (type === "cancelled") {
      filtered = filtered.filter(flight => 
        flight.status === "cancelled" || flight.status === "Cancelled"
      );
    }

    // Apply completed flight filter for past flights with new logic
    if (type === "past") {
      if (completedFlightFilter === "not-requested") {
        // Flights that haven't requested miles OR actual context flights that haven't been requested
        filtered = filtered.filter(flight => 
          flight.milesRequested === false || 
          (!hasRequestForFlight(flight.flightNumber) && flight.milesRequested !== "pending")
        );
      } else if (completedFlightFilter === "requested") {
        // Flights with pending miles requests OR flights that have been requested in context
        filtered = filtered.filter(flight => 
          flight.milesRequested === "pending" || 
          flight.milesRequested === true ||
          hasRequestForFlight(flight.flightNumber)
        );
      }
      // "all" shows all completed flights
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
  const getPagedFlights = (flights: any[]) => {
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
  const handleRequestMiles = (flight: any) => {
    setSelectedFlight(flight);
    setDialogStep("form");
    setFlightFormData({
      flightNumber: flight.flightNumber,
      airline: flight.airline,
      from: `${flight.from.code} - ${flight.from.city}`,
      to: `${flight.to.code} - ${flight.to.city}`,
      departureDate: flight.departureDate,
      class: flight.class,
      distance: flight.distance,
      seatNumber: flight.seatNumber,
      seatClass: flight.seatClass
    });
    setCalculationResult(null);
    setShowEarnMilesDialog(true);
  };

  // Handle form field changes
  const handleFormFieldChange = (field: keyof FlightFormData, value: string | number) => {
    setFlightFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle calculate miles
  const handleCalculateMiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const requestBody = {
        distance: flightFormData.distance,
        seatClass: flightFormData.seatClass,
        serviceClass: flightFormData.class,
        departureDate: flightFormData.departureDate
      };

      const response = await fetch(
        'https://mileswise-be.onrender.com/api/member/calculate-miles',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Map API response to calculation result
      setCalculationResult({
        qualifyingMiles: data.qualifyingMiles,
        bonusMiles: data.bonusMiles,
        multiplier: data.multiplier, // Calculate multiplier from response
        flightData: flightFormData
      });
      
      setDialogStep("calculation");
      toast.success("Miles calculated successfully!");
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while calculating miles';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error calculating miles:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle earn miles submission
  const handleEarnMilesSubmit = async () => {
    if (calculationResult && flightFormData && selectedFlight) {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Make API call to request earn miles
        const response = await fetch(
          'https://mileswise-be.onrender.com/api/member/request-earn-miles',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              customerFlightId: selectedFlight.id.toString()
            })
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Update local context for UI consistency
        addRequest({
          flightNumber: flightFormData.flightNumber,
          airline: flightFormData.airline,
          from: flightFormData.from,
          to: flightFormData.to,
          departureDate: flightFormData.departureDate,
          serviceClass: flightFormData.class,
          seatClass: flightFormData.seatNumber.charAt(flightFormData.seatNumber.length - 1),
          distance: flightFormData.distance,
          qualifyingMiles: calculationResult.qualifyingMiles,
          status: 'waiting to confirm' as const
        });
        
        toast.success("Miles request submitted successfully!");
        setShowEarnMilesDialog(false);
        setSelectedFlight(null);
        setDialogStep("form");
        setCalculationResult(null);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while submitting miles request';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Error submitting miles request:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle back to form
  const handleBackToForm = () => {
    setDialogStep("form");
    setCalculationResult(null);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setShowEarnMilesDialog(false);
    setSelectedFlight(null);
    setDialogStep("form");
    setCalculationResult(null);
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
  const FlightCard = ({ flight }: { flight: any }) => {
    const milesRequested = flight.milesRequested
    const requestInfo = {
      status: flight.requestEarnMilesStatus,
      qualifyingMiles: flight.qualifyingMiles,
      bonusMiles: flight.bonusMiles,
      reason: "", // todo: flight.reason
    }
    
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
                flight.status === "Miles Requested" ? "secondary" :
                "outline"
              }
              className={
                flight.status === "Completed" ? "bg-green-100 text-green-700" :
                flight.status === "Ongoing" ? "bg-blue-100 text-blue-700" :
                flight.status === "Cancelled" ? "bg-red-100 text-red-700" :
                flight.status === "Miles Requested" ? "bg-yellow-100 text-yellow-700" :
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
              <div className="font-bold text-blue-600">{flight.qualifyingMiles.toLocaleString()}</div>
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
                      <span className="font-bold text-yellow-800 ml-1">{flight.qualifyingMiles.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-yellow-700">Bonus Miles:</span>
                      <span className="font-bold text-yellow-800 ml-1">{flight.bonusMiles.toLocaleString()}</span>
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
                          <span className="font-bold text-green-800 ml-1">{requestInfo.qualifyingMiles.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-green-700">Bonus Miles:</span>
                          <span className="font-bold text-green-800 ml-1">{(requestInfo.bonusMiles || requestInfo.qualifyingMiles).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {requestInfo.status === 'reviewing' && (
                    <p className="text-sm text-yellow-800">
                      Miles request is pending approval. <span className="font-bold">{requestInfo.qualifyingMiles.toLocaleString()} qualifying miles</span> and <span className="font-bold">{(requestInfo.bonusMiles || requestInfo.qualifyingMiles).toLocaleString()} bonus miles</span> will be credited upon approval.
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
                    {requestInfo.status === 'reviewing' && <HourglassIcon className="h-4 w-4 mr-2" />}
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
              {(() => {
                const pagination = getPagedFlights(upcomingFlights);
                return (
                  <div className="space-y-4">
                    {pagination.data.map((flight) => (
                      <FlightCard key={flight.id} flight={flight} />
                    ))}
                    {renderPagination(pagination)}
                  </div>
                );
              })()}
            </TabsContent>

            <TabsContent value="ongoing" className="mt-6">
              {(() => {
                const pagination = getPagedFlights(ongoingFlights);
                return (
                  <div className="space-y-4">
                    {pagination.data.map((flight) => (
                      <FlightCard key={flight.id} flight={flight} />
                    ))}
                    {renderPagination(pagination)}
                  </div>
                );
              })()}
            </TabsContent>

            <TabsContent value="past" className="mt-6">
              {(() => {
                const pagination = getPagedFlights(pastFlights);
                return (
                  <div className="space-y-4">
                    {pagination.data.map((flight) => (
                      <FlightCard key={flight.id} flight={flight} />
                    ))}
                    {renderPagination(pagination)}
                  </div>
                );
              })()}
            </TabsContent>

            <TabsContent value="cancelled" className="mt-6">
              {(() => {
                const pagination = getPagedFlights(cancelledFlights);
                return (
                  <div className="space-y-4">
                    {pagination.data.map((flight) => (
                      <FlightCard key={flight.id} flight={flight} />
                    ))}
                    {renderPagination(pagination)}
                  </div>
                );
              })()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Interactive Request Miles Dialog */}
      <Dialog open={showEarnMilesDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {dialogStep === "form" ? (
                <>
                  <Edit className="h-5 w-5 text-blue-600" />
                  <span>Flight Details & Miles Request</span>
                </>
              ) : (
                <>
                  <Calculator className="h-5 w-5 text-green-600" />
                  <span>Miles Calculation Result</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {dialogStep === "form" && (
            <div className="space-y-6">
              {/* Editable Flight Form */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
                  <Edit className="h-4 w-4 mr-2" />
                  Flight Information (Editable)
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="flightNumber">Flight Number</Label>
                    <Input
                      id="flightNumber"
                      value={flightFormData.flightNumber}
                      onChange={(e) => handleFormFieldChange('flightNumber', e.target.value)}
                      placeholder="e.g. VN123"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="airline">Airline</Label>
                    <Input
                      id="airline"
                      value={flightFormData.airline}
                      onChange={(e) => handleFormFieldChange('airline', e.target.value)}
                      placeholder="e.g. Vietnam Airlines"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="from">From</Label>
                    <Input
                      id="from"
                      value={flightFormData.from}
                      onChange={(e) => handleFormFieldChange('from', e.target.value)}
                      placeholder="e.g. HAN - Hanoi"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="to">To</Label>
                    <Input
                      id="to"
                      value={flightFormData.to}
                      onChange={(e) => handleFormFieldChange('to', e.target.value)}
                      placeholder="e.g. SGN - Ho Chi Minh City"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="departureDate">Departure Date</Label>
                    <Input
                      id="departureDate"
                      type="date"
                      value={flightFormData.departureDate}
                      onChange={(e) => handleFormFieldChange('departureDate', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="class">Service Class</Label>
                    <Select 
                      value={flightFormData.class} 
                      onValueChange={(value) => handleFormFieldChange('class', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Economy">Economy</SelectItem>
                        <SelectItem value="Premium Economy">Premium Economy</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="distance">Distance (km)</Label>
                    <Input
                      id="distance"
                      type="number"
                      value={flightFormData.distance}
                      onChange={(e) => handleFormFieldChange('distance', parseInt(e.target.value) || 0)}
                      placeholder="e.g. 1200"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="seatNumber">Seat Number</Label>
                    <Input
                      id="seatNumber"
                      value={flightFormData.seatNumber}
                      onChange={(e) => handleFormFieldChange('seatNumber', e.target.value)}
                      placeholder="e.g. 12A"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seatClass">Seat Class</Label>
                    <Input
                        id="seatClass"
                        value={flightFormData.seatClass}
                        onChange={(e) => handleFormFieldChange('seatClass', e.target.value)}
                        placeholder="e.g. L"
                    />
                  </div>
                </div>
              </div>

              {/* Information Note */}
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start space-x-2">
                  <Info className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Please verify your flight information</p>
                    <p>Make sure all details are correct before calculating miles. You can edit any field above.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {dialogStep === "calculation" && calculationResult && (
            <div className="space-y-6">
              {/* Flight Summary */}
              <div className="p-4 bg-gray-50 rounded-lg border">
                <h3 className="font-semibold text-gray-900 mb-3">Flight Summary</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Flight:</span>
                    <span className="font-bold text-gray-900 ml-1">{calculationResult.flightData.flightNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Route:</span>
                    <span className="font-bold text-gray-900 ml-1">{calculationResult.flightData.from} → {calculationResult.flightData.to}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Class:</span>
                    <span className="font-bold text-gray-900 ml-1">{calculationResult.flightData.class}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Distance:</span>
                    <span className="font-bold text-gray-900 ml-1">{calculationResult.flightData.distance.toLocaleString()} km</span>
                  </div>
                </div>
              </div>

              {/* Miles Calculation Result */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-4 flex items-center">
                  <Award className="h-4 w-4 mr-2" />
                  Miles Calculation Result
                </h3>
                
                <div className="space-y-4">
                  {/* Calculation Steps */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded border">
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-gray-700">Base Qualifying Miles</span>
                        <span className="text-xs text-gray-500">(Distance × 1.2)</span>
                      </div>
                      <span className="font-bold text-blue-600">{calculationResult.qualifyingMiles.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded border">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium text-gray-700">{calculationResult.flightData.class} Class Multiplier</span>
                      </div>
                      <span className="font-bold text-yellow-600">{calculationResult.multiplier}x</span>
                    </div>

                    <div className="p-3 bg-gray-50 rounded border border-dashed border-gray-300">
                      <div className="text-center text-sm text-gray-600 mb-2">Bonus Miles Calculation</div>
                      <div className="text-center font-mono text-sm">
                        <span className="text-blue-600">{calculationResult.qualifyingMiles.toLocaleString()}</span>
                        <span className="text-gray-500"> × </span>
                        <span className="text-yellow-600">{calculationResult.multiplier}</span>
                        <span className="text-gray-500"> = </span>
                        <span className="text-green-600 font-bold">{calculationResult.bonusMiles.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Final Results */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded border border-blue-200">
                      <div className="text-xs text-blue-600 mb-1">FOR TIER STATUS</div>
                      <div className="font-bold text-blue-800">Qualifying Miles</div>
                      <div className="text-2xl font-bold text-blue-600">{calculationResult.qualifyingMiles.toLocaleString()}</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded border border-green-200">
                      <div className="text-xs text-green-600 mb-1">FOR REDEMPTION</div>
                      <div className="font-bold text-green-800">Bonus Miles</div>
                      <div className="text-2xl font-bold text-green-600">{calculationResult.bonusMiles.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Box */}
              <div className="p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="font-bold text-lg text-gray-900">Total Miles You'll Earn</span>
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {calculationResult.bonusMiles.toLocaleString()} miles
                  </div>
                  <div className="text-sm text-gray-600">
                    {calculationResult.qualifyingMiles.toLocaleString()} qualifying + {(calculationResult.bonusMiles - calculationResult.qualifyingMiles).toLocaleString()} bonus miles
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {dialogStep === "form" ? (
              <>
                <Button variant="outline" onClick={handleDialogClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCalculateMiles}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!flightFormData.flightNumber || !flightFormData.distance || !flightFormData.class}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Miles
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleBackToForm}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Details
                </Button>
                <Button onClick={handleEarnMilesSubmit} className="bg-green-600 hover:bg-green-700">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Miles Request
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}