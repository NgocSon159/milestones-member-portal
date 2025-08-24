import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Separator } from "../ui/separator";
import {
  Ticket,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Gift,
  Plane,
  Car,
  Hotel,
  UtensilsCrossed,
  ShoppingBag,
  Filter,
  Eye,
  Download,
  Copy,
  Info,
  Award,
  MapPin,
  Phone,
  Mail,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

interface MyVouchersProps {
  user: { email: string; name: string };
}

interface Voucher {
  id: string;
  title: string; // Mapped from rewardName
  description: string; // Mapped from description
  type: 'flight' | 'hotel' | 'car' | 'dining' | 'shopping'; // Mapped from rewardType
  discountType: 'percentage' | 'fixed'; // Assuming 'voucher' type implies 'fixed' discount for now, can be refined. Or 'value' from API can be mapped here.
  discountValue: number; // Mapped from value
  code: string; // API response doesn't have a direct 'code', will use rewardId or generate one if needed. For now, will use a placeholder.
  originalMiles: number; // Mapped from milesRequired
  claimedDate: string; // Mapped from validFrom
  expiryDate: string; // Mapped from validUntil
  usedDate?: string;
  status: 'active' | 'used' | 'expired'; // Mapped from status
  termsAndConditions: string[]; // Mapped from termsAndConditions
  detailedInfo?: {
    provider: string; // Not directly available, can be a placeholder or inferred
    category: string; // Not directly available, can be a placeholder or inferred
    minimumSpend?: number;
    maximumDiscount?: number;
    validLocations?: string[];
    customerService?: {
      phone: string;
      email: string;
      hours: string;
    };
    howToUse: string[];
    restrictions: string[];
  };
}

export function MyVouchers({ user }: MyVouchersProps) {
  const [selectedTab, setSelectedTab] = useState("active");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVouchers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token'); // Retrieve token from localStorage
        if (!token) {
          setError('No authentication token found.');
          setLoading(false);
          return;
        }

        const response = await fetch('https://mileswise-be.onrender.com/api/member/my-rewards', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const mappedVouchers: Voucher[] = data.map((item: any) => ({
          id: item.id,
          title: item.reward.rewardName,
          description: item.reward.description,
          type: item.reward.rewardType === 'voucher' ? 'shopping' : 'other', // Default to 'shopping' or 'other', refine if API provides more specific types
          discountType: item.reward.value.includes('.') ? 'fixed' : 'fixed', // Assuming fixed for simplicity
          discountValue: parseFloat(item.reward.value),
          code: item.rewardId, // Using rewardId as code for now, as no direct code field
          originalMiles: item.reward.milesRequired,
          claimedDate: item.reward.validFrom,
          expiryDate: item.reward.validUntil,
          status: mapApiStatusToVoucherStatus(item.reward.validUntil, item.usedDate), // Map status based on expiry and usage
          termsAndConditions: [item.reward.termsAndConditions], // Assuming termsAndConditions is a single string in API
          detailedInfo: {
            provider: item.reward.membershipInfo?.name || 'N/A', // Using membershipInfo.name as provider
            category: item.reward.rewardName, // Using rewardName as category
            howToUse: ["No specific instructions available."], // Placeholder
            restrictions: ["No specific restrictions available."], // Placeholder
            // Add other detailedInfo fields if available in API response
          }
        }));
        setVouchers(mappedVouchers);
      } catch (e: any) {
        setError(e.message);
        toast.error(`Failed to fetch vouchers: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, []); // Empty dependency array means this effect runs once on mount

  // Helper function to map API status to Voucher status
  const mapApiStatusToVoucherStatus = (expiryDate: string, usedDate?: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    if (usedDate) {
      return 'used';
    }
    if (expiry < today) {
      return 'expired';
    }
    return 'active';
  };

  // Get vouchers by status
  const getVouchersByStatus = (status: string) => {
    let filtered = vouchers;
    
    if (status !== "all") {
      filtered = vouchers.filter(voucher => voucher.status === status);
    }
    
    if (filterType !== "all") {
      filtered = filtered.filter(voucher => voucher.type === filterType);
    }
    
    return filtered;
  };

  // Check if voucher is expiring soon (within 14 days)
  const isExpiringSoon = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 14 && diffDays > 0;
  };

  // Get icon by voucher type
  const getVoucherIcon = (type: string) => {
    switch (type) {
      case 'flight':
        return <Plane className="h-5 w-5 text-blue-600" />;
      case 'hotel':
        return <Hotel className="h-5 w-5 text-green-600" />;
      case 'car':
        return <Car className="h-5 w-5 text-purple-600" />;
      case 'dining':
        return <UtensilsCrossed className="h-5 w-5 text-orange-600" />;
      case 'shopping':
        return <ShoppingBag className="h-5 w-5 text-pink-600" />;
      default:
        return <Gift className="h-5 w-5 text-gray-600" />;
    }
  };

  // Get status badge
  const getStatusBadge = (voucher: Voucher) => {
    if (voucher.status === 'expired') {
      return <Badge variant="destructive" className="bg-red-100 text-red-700">Expired</Badge>;
    }
    if (voucher.status === 'used') {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-700">Used</Badge>;
    }
    if (isExpiringSoon(voucher.expiryDate)) {
      return <Badge variant="destructive" className="bg-orange-100 text-orange-700">Expiring Soon</Badge>;
    }
    return <Badge variant="secondary" className="bg-green-100 text-green-700">Active</Badge>;
  };

  // Get days until expiry
  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleViewDetails = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setShowDetailDialog(true);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Voucher code copied to clipboard!");
  };

  const VoucherCard = ({ voucher }: { voucher: Voucher }) => {
    const daysUntilExpiry = getDaysUntilExpiry(voucher.expiryDate);
    const isExpiring = isExpiringSoon(voucher.expiryDate);

    return (
      <Card className={`transition-all hover:shadow-md ${isExpiring && voucher.status === 'active' ? 'border-orange-200 bg-orange-50' : ''}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                {getVoucherIcon(voucher.type)}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{voucher.title}</h3>
                <p className="text-gray-600 text-sm">{voucher.description}</p>
                <div className="flex items-center space-x-2 mt-2">
                  {getStatusBadge(voucher)}
                  <span className="text-xs text-gray-500">
                    Code: <span className="font-mono font-medium">{voucher.code}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {voucher.discountType === 'percentage' ? `${voucher.discountValue}%` : `$${voucher.discountValue}`}
                {voucher.discountType === 'percentage' && voucher.discountValue === 0 ? 'Free' : ' OFF'}
              </div>
              <p className="text-sm text-[rgba(154,33,229,1)] font-bold">{voucher.originalMiles.toLocaleString()} miles</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Claimed</p>
                <p className="text-sm font-medium">{new Date(voucher.claimedDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">
                  {voucher.status === 'expired' ? 'Expired' : voucher.status === 'used' ? 'Used' : 'Expires'}
                </p>
                <p className={`text-sm font-medium ${isExpiring && voucher.status === 'active' ? 'text-orange-600' : ''}`}>
                  {voucher.status === 'used' && voucher.usedDate ? 
                    new Date(voucher.usedDate).toLocaleDateString() : 
                    new Date(voucher.expiryDate).toLocaleDateString()
                  }
                </p>
              </div>
            </div>

            {voucher.status === 'active' && (
              <div className="flex items-center space-x-2">
                {isExpiring ? (
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className={`text-sm font-medium ${isExpiring ? 'text-orange-600' : 'text-green-600'}`}>
                    {isExpiring ? `${daysUntilExpiry} days left` : 'Active'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {isExpiring && voucher.status === 'active' && (
            <div className="bg-orange-100 border border-orange-200 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <p className="text-sm text-orange-800 font-medium">
                  This voucher expires in {daysUntilExpiry} days! Use it before it expires.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleViewDetails(voucher)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
              {voucher.status === 'active' && (
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Use Voucher
                </Button>
              )}
            </div>
            
            {(voucher.status === 'used' || voucher.status === 'expired') && (
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Get expiring soon count for active vouchers
  const expiringSoonCount = vouchers.filter(v => v.status === 'active' && isExpiringSoon(v.expiryDate)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Vouchers</h1>
          <p className="text-gray-600 mt-1">
            Manage your redeemed vouchers and track their usage
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="flight">Flight</SelectItem>
              <SelectItem value="hotel">Hotel</SelectItem>
              <SelectItem value="car">Car Rental</SelectItem>
              <SelectItem value="dining">Dining</SelectItem>
              <SelectItem value="shopping">Shopping</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedTab("active")}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {vouchers.filter(v => v.status === 'active').length}
            </div>
            <p className="text-sm text-gray-600">Active Vouchers</p>
            {expiringSoonCount > 0 && (
              <Badge variant="destructive" className="mt-1 text-xs">
                {expiringSoonCount} expiring soon
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedTab("used")}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {vouchers.filter(v => v.status === 'used').length}
            </div>
            <p className="text-sm text-gray-600">Used Vouchers</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedTab("expired")}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {vouchers.filter(v => v.status === 'expired').length}
            </div>
            <p className="text-sm text-gray-600">Expired Vouchers</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {vouchers.reduce((sum, voucher) => sum + voucher.originalMiles, 0).toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">Total Miles Used</p>
          </CardContent>
        </Card>
      </div>

      {/* Voucher Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Active & Expiring Soon</span>
            {expiringSoonCount > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs px-2 py-0">
                {expiringSoonCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="used" className="flex items-center space-x-2">
            <Ticket className="h-4 w-4" />
            <span>Used Vouchers</span>
          </TabsTrigger>
          <TabsTrigger value="expired" className="flex items-center space-x-2">
            <XCircle className="h-4 w-4" />
            <span>Expired Vouchers</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {getVouchersByStatus("active").length > 0 ? (
            getVouchersByStatus("active").map((voucher) => (
              <VoucherCard key={voucher.id} voucher={voucher} />
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No active vouchers</h3>
                <p className="text-gray-500 mb-4">You don't have any active vouchers at the moment.</p>
                <Button>Redeem New Voucher</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="used" className="space-y-4">
          {getVouchersByStatus("used").length > 0 ? (
            getVouchersByStatus("used").map((voucher) => (
              <VoucherCard key={voucher.id} voucher={voucher} />
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No used vouchers</h3>
                <p className="text-gray-500">Your used vouchers will appear here.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="expired" className="space-y-4">
          {getVouchersByStatus("expired").length > 0 ? (
            getVouchersByStatus("expired").map((voucher) => (
              <VoucherCard key={voucher.id} voucher={voucher} />
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No expired vouchers</h3>
                <p className="text-gray-500">Your expired vouchers will appear here.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Voucher Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-blue-600" />
              <span>Voucher Details</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedVoucher && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  {getVoucherIcon(selectedVoucher.type)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedVoucher.title}</h3>
                  <p className="text-gray-600 mt-1">{selectedVoucher.description}</p>
                  <div className="flex items-center space-x-3 mt-3">
                    {getStatusBadge(selectedVoucher)}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Code:</span>
                      <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                        {selectedVoucher.code}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyCode(selectedVoucher.code)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedVoucher.discountType === 'percentage' 
                      ? `${selectedVoucher.discountValue}%` 
                      : `$${selectedVoucher.discountValue}`
                    }
                    {selectedVoucher.discountType === 'percentage' && selectedVoucher.discountValue === 0 
                      ? 'Free' : ' OFF'}
                  </div>
                  <p className="text-sm text-gray-500">{selectedVoucher.originalMiles.toLocaleString()} miles used</p>
                </div>
              </div>

              <Separator />

              {/* Provider & Category Info */}
              {selectedVoucher.detailedInfo && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Provider Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{selectedVoucher.detailedInfo.provider}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Gift className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{selectedVoucher.detailedInfo.category}</span>
                      </div>
                      {selectedVoucher.detailedInfo.minimumSpend && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">Minimum Spend: ${selectedVoucher.detailedInfo.minimumSpend}</span>
                        </div>
                      )}
                      {selectedVoucher.detailedInfo.maximumDiscount && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">Maximum Discount: ${selectedVoucher.detailedInfo.maximumDiscount}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Voucher Dates</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">Claimed: {new Date(selectedVoucher.claimedDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {selectedVoucher.status === 'used' && selectedVoucher.usedDate
                            ? `Used: ${new Date(selectedVoucher.usedDate).toLocaleDateString()}`
                            : `Expires: ${new Date(selectedVoucher.expiryDate).toLocaleDateString()}`
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Valid Locations */}
              {selectedVoucher.detailedInfo?.validLocations && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Valid Locations</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedVoucher.detailedInfo.validLocations.map((location, index) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {location}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* How to Use */}
              {selectedVoucher.detailedInfo?.howToUse && (
                <div>
                  <h4 className="font-medium mb-3">How to Use This Voucher</h4>
                  <ol className="list-decimal list-inside space-y-2">
                    {selectedVoucher.detailedInfo.howToUse.map((step, index) => (
                      <li key={index} className="text-sm text-gray-700">{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              <Separator />

              {/* Terms and Conditions */}
              <div>
                <h4 className="font-medium mb-3">Terms and Conditions</h4>
                <ul className="list-disc list-inside space-y-1">
                  {selectedVoucher.termsAndConditions.map((term, index) => (
                    <li key={index} className="text-sm text-gray-700">{term}</li>
                  ))}
                </ul>
              </div>

              {/* Restrictions */}
              {selectedVoucher.detailedInfo?.restrictions && (
                <div>
                  <h4 className="font-medium mb-3 text-red-600">Important Restrictions</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedVoucher.detailedInfo.restrictions.map((restriction, index) => (
                      <li key={index} className="text-sm text-red-600">{restriction}</li>
                    ))}
                  </ul>
                </div>
              )}

              <Separator />

              {/* Customer Service */}
              {selectedVoucher.detailedInfo?.customerService && (
                <div>
                  <h4 className="font-medium mb-3">Customer Support</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-medium">{selectedVoucher.detailedInfo.customerService.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-medium">{selectedVoucher.detailedInfo.customerService.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Hours</p>
                        <p className="text-sm font-medium">{selectedVoucher.detailedInfo.customerService.hours}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Close
            </Button>
            {selectedVoucher?.status === 'active' && (
              <Button className="bg-blue-600 hover:bg-blue-700">
                <ExternalLink className="h-4 w-4 mr-2" />
                Use This Voucher
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}