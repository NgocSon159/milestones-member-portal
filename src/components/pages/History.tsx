import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useEarnMiles } from "../EarnMilesContext";
import { 
  Search, 
  Filter, 
  Calendar,
  Clock,
  CheckCircle,
  X,
  AlertCircle,
  Eye,
  Award,
  HourglassIcon,
  Plane,
  Info
} from "lucide-react";

const getStatusIcon = (status: string) => {
  switch (status) {
    case "approved":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "waiting to confirm":
      return <HourglassIcon className="h-4 w-4 text-orange-500" />;
    case "rejected":
      return <X className="h-4 w-4 text-red-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-700";
    case "waiting to confirm":
      return "bg-orange-100 text-orange-700";
    case "rejected":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export function History() {
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
  
  const { requests: earnMilesRequests } = useEarnMiles();

  // Convert earn miles requests to history format
  const earnMilesHistory = earnMilesRequests.map(request => ({
    id: request.id,
    type: "Earn Miles Request",
    flightNumber: request.flightNumber,
    description: `Request ${request.calculatedMiles.toLocaleString()} miles for flight ${request.flightNumber} (${request.serviceClass} - ${request.seatClass})`,
    submittedDate: request.submittedDate + "T00:00:00",
    status: request.status === 'waiting to confirm' ? 'waiting to confirm' : request.status === 'approved' ? 'approved' : 'rejected',
    statusDate: request.processedDate ? request.processedDate + "T00:00:00" : request.submittedDate + "T00:00:00",
    priority: "Normal",
    category: "Miles & Rewards",
    earnMilesData: request
  }));

  // Calculate total approved miles
  const totalApprovedMiles = earnMilesHistory
    .filter(request => request.status === "approved")
    .reduce((total, request) => total + (request.earnMilesData?.calculatedMiles || 0), 0);

  const statusCounts = {
    all: earnMilesHistory.length,
    approved: earnMilesHistory.filter(r => r.status === "approved").length,
    waitingToConfirm: earnMilesHistory.filter(r => r.status === "waiting to confirm").length,
    rejected: earnMilesHistory.filter(r => r.status === "rejected").length
  };

  // Filter requests by date range
  const filterRequestsByDate = (requests: any[]) => {
    if (!dateFilter.from && !dateFilter.to) return requests;
    
    return requests.filter(request => {
      const requestDate = new Date(request.submittedDate);
      const fromDate = dateFilter.from ? new Date(dateFilter.from) : null;
      const toDate = dateFilter.to ? new Date(dateFilter.to) : null;
      
      if (fromDate && toDate) {
        return requestDate >= fromDate && requestDate <= toDate;
      } else if (fromDate) {
        return requestDate >= fromDate;
      } else if (toDate) {
        return requestDate <= toDate;
      }
      
      return true;
    });
  };

  // Filter requests based on selected tab
  const getFilteredRequests = () => {
    let filteredByTab;
    switch (selectedTab) {
      case "all":
        filteredByTab = earnMilesHistory;
        break;
      case "waiting":
        filteredByTab = earnMilesHistory.filter(r => r.status === "waiting to confirm");
        break;
      case "approved":
        filteredByTab = earnMilesHistory.filter(r => r.status === "approved");
        break;
      case "rejected":
        filteredByTab = earnMilesHistory.filter(r => r.status === "rejected");
        break;
      default:
        filteredByTab = earnMilesHistory;
    }
    
    return filterRequestsByDate(filteredByTab);
  };

  const filteredRequests = getFilteredRequests().filter(request => {
    const matchesSearch = request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (request.flightNumber && request.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  }).sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());

  const handleViewDetail = (request: any) => {
    setSelectedRequest(request);
    setShowDetailDialog(true);
  };

  const RequestCard = ({ request }: { request: any }) => (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-full">
                <Award className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">{request.type}</h3>
                <p className="text-sm text-gray-600">ID: {request.id}</p>
              </div>
            </div>
            <p className="text-gray-700 mb-3">{request.description}</p>
            
            {/* Flight specific info */}
            {request.earnMilesData && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Flight</p>
                  <p className="text-sm font-medium">{request.earnMilesData.flightNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Route</p>
                  <p className="text-sm font-medium">
                    {request.earnMilesData.from.split(' - ')[0]} → {request.earnMilesData.to.split(' - ')[0]}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Class</p>
                  <p className="text-sm font-medium">{request.earnMilesData.serviceClass} ({request.earnMilesData.seatClass})</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Miles Requested</p>
                  <p className="text-sm font-medium text-green-600">{request.earnMilesData.calculatedMiles.toLocaleString()}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Submitted: {new Date(request.submittedDate).toLocaleDateString()}</span>
              </div>
              {request.earnMilesData?.processedDate && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Processed: {new Date(request.earnMilesData.processedDate).toLocaleDateString()}</span>
                </div>
              )}
              <Badge variant="outline">
                {request.category}
              </Badge>
            </div>

            {/* Rejection reason */}
            {request.earnMilesData?.reason && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-red-600 font-medium">{request.earnMilesData.reason}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <div className="flex items-center space-x-2">
              {getStatusIcon(request.status)}
              <Badge className={getStatusColor(request.status)}>
                {request.status === 'waiting to confirm' ? 'Reviewing Request' : 
                 request.status === 'approved' ? 'Approved' : 'Rejected'}
              </Badge>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleViewDetail(request)}
              className="flex items-center space-x-1"
            >
              <Eye className="h-3 w-3" />
              <span>View Detail</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-lg">
          <Award className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">History My Request</h1>
          <p className="text-gray-600">Track your earn miles requests and their status</p>
        </div>
      </div>

      {/* Date Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter by Request Date</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="request-date-from">From:</Label>
              <Input
                id="request-date-from"
                type="date"
                value={dateFilter.from}
                onChange={(e) => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
                className="w-40"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="request-date-to">To:</Label>
              <Input
                id="request-date-to"
                type="date"
                value={dateFilter.to}
                onChange={(e) => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
                className="w-40"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setDateFilter({ from: "", to: "" })}
            >
              Clear Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {statusCounts.all}
            </div>
            <p className="text-sm text-gray-600">All Request</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {statusCounts.waitingToConfirm}
            </div>
            <p className="text-sm text-gray-600">Reviewing Request</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {statusCounts.approved}
            </div>
            <p className="text-sm text-gray-600">Approved Request</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {statusCounts.rejected}
            </div>
            <p className="text-sm text-gray-600">Rejected Request</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {totalApprovedMiles.toLocaleString()}
            </div>
            <p className="text-sm text-green-700">Total Miles Earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Earn Miles Request Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Request ({statusCounts.all})</TabsTrigger>
          <TabsTrigger value="waiting">Reviewing Request ({statusCounts.waitingToConfirm})</TabsTrigger>
          <TabsTrigger value="approved">Approved Request ({statusCounts.approved})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected Request ({statusCounts.rejected})</TabsTrigger>
        </TabsList>

        {/* Search Filter */}
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search requests by flight number, ID, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4 mt-6">
          <div className="space-y-4">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No earn miles requests found</h3>
                  <p className="text-gray-500">Try adjusting your search criteria or submit a new request from My Flights.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="waiting" className="space-y-4 mt-6">
          <div className="space-y-4">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <HourglassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reviewing requests</h3>
                  <p className="text-gray-500">Requests under review will appear here.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4 mt-6">
          <div className="space-y-4">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No approved requests</h3>
                  <p className="text-gray-500">Your approved requests will appear here.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4 mt-6">
          <div className="space-y-4">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <X className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No rejected requests</h3>
                  <p className="text-gray-500">Your rejected requests will appear here.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-blue-600" />
              <span>Earn Miles Request Details</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Request ID</p>
                  <p className="font-medium">{selectedRequest.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium">{selectedRequest.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedRequest.status)}
                    <Badge className={getStatusColor(selectedRequest.status)}>
                      {selectedRequest.status === 'waiting to confirm' ? 'Reviewing Request' : 
                       selectedRequest.status === 'approved' ? 'Approved' : 'Rejected'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">{selectedRequest.category}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Description</p>
                <p className="p-3 bg-gray-50 rounded-lg">{selectedRequest.description}</p>
              </div>

              {/* Flight Details */}
              {selectedRequest.earnMilesData && (
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h4 className="font-medium mb-3 flex items-center space-x-2">
                    <Plane className="h-4 w-4 text-blue-600" />
                    <span>Flight Information</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Flight Number</p>
                      <p className="font-medium">{selectedRequest.earnMilesData.flightNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Airline</p>
                      <p className="font-medium">{selectedRequest.earnMilesData.airline}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Route</p>
                      <p className="font-medium">{selectedRequest.earnMilesData.from} → {selectedRequest.earnMilesData.to}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Departure Date</p>
                      <p className="font-medium">{new Date(selectedRequest.earnMilesData.departureDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Service Class</p>
                      <p className="font-medium">{selectedRequest.earnMilesData.serviceClass}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Seat Class</p>
                      <p className="font-medium">{selectedRequest.earnMilesData.seatClass}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Distance</p>
                      <p className="font-medium">{selectedRequest.earnMilesData.distance} miles</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Miles Requested</p>
                      <p className="font-medium text-green-600">{selectedRequest.earnMilesData.calculatedMiles.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {selectedRequest.earnMilesData.reason && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Rejection Reason</p>
                      <p className="text-sm text-red-600">{selectedRequest.earnMilesData.reason}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Timeline */}
              <div>
                <p className="text-sm text-gray-500 mb-3">Request Timeline</p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Request Submitted</p>
                      <p className="text-xs text-gray-500">{new Date(selectedRequest.submittedDate).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {selectedRequest.earnMilesData?.processedDate && (
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        selectedRequest.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium">Request {selectedRequest.status === 'approved' ? 'approved' : 'rejected'}</p>
                        <p className="text-xs text-gray-500">{new Date(selectedRequest.earnMilesData.processedDate).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedRequest.status === 'waiting to confirm' && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                      <div>
                        <p className="text-sm font-medium">Under Review</p>
                        <p className="text-xs text-gray-500">Your request is being processed</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}