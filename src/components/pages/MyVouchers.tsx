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
  title: string;
  description: string;
  type: 'flight' | 'hotel' | 'car' | 'dining' | 'shopping';
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  code: string;
  originalMiles: number;
  claimedDate: string;
  expiryDate: string;
  usedDate?: string;
  status: 'active' | 'used' | 'expired';
  termsAndConditions: string[];
  detailedInfo?: {
    provider: string;
    category: string;
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

  // Updated voucher data to match memberData.ts (22,500 total miles)
  const [vouchers] = useState<Voucher[]>([
    {
      id: "voucher_001",
      title: "Hotel Discount - 25% Off",
      description: "Get 25% discount on hotel bookings worldwide",
      type: "hotel",
      discountType: "percentage",
      discountValue: 25,
      code: "HOTEL25OFF",
      originalMiles: 5000,
      claimedDate: "2024-08-10",
      expiryDate: "2024-08-24", // 14 days from now (expiring soon)
      status: "active",
      termsAndConditions: [
        "Valid for hotel bookings only",
        "Minimum booking value of $100",
        "Cannot be combined with other offers",
        "Valid until expiry date"
      ],
      detailedInfo: {
        provider: "Global Hotel Partners",
        category: "Accommodation",
        minimumSpend: 100,
        maximumDiscount: 200,
        validLocations: ["Vietnam", "Thailand", "Singapore", "Malaysia", "Philippines"],
        customerService: {
          phone: "+84 28 1234 5678",
          email: "support@hotelpartners.com",
          hours: "24/7 Support"
        },
        howToUse: [
          "Visit participating hotel booking websites",
          "Select your preferred hotel and dates",
          "Enter voucher code 'HOTEL25OFF' at checkout",
          "Discount will be applied automatically",
          "Complete your booking with payment"
        ],
        restrictions: [
          "Valid for new bookings only",
          "Cannot be used for existing reservations",
          "Not valid during peak seasons (Dec 20-Jan 5, Apr 10-30)",
          "Maximum one voucher per booking",
          "Subject to hotel availability"
        ]
      }
    },
    {
      id: "voucher_002",
      title: "Flight Upgrade - Business Class",
      description: "Complimentary upgrade to Business Class on domestic flights",
      type: "flight",
      discountType: "fixed",
      discountValue: 0,
      code: "UPGRADE2024",
      originalMiles: 8000,
      claimedDate: "2024-07-20",
      expiryDate: "2024-12-31",
      status: "active",
      termsAndConditions: [
        "Valid for domestic flights only",
        "Subject to availability",
        "Must be requested 48 hours before flight",
        "One-time use only"
      ],
      detailedInfo: {
        provider: "Vietnam Airlines",
        category: "Flight Services",
        validLocations: ["Vietnam Domestic Routes"],
        customerService: {
          phone: "+84 1900 1100",
          email: "customer.service@vietnamairlines.com",
          hours: "6:00 AM - 10:00 PM (GMT+7)"
        },
        howToUse: [
          "Call Vietnam Airlines reservation center",
          "Provide your booking reference and voucher code",
          "Request upgrade at least 48 hours before departure",
          "Confirm upgrade availability",
          "Receive confirmation via email or SMS"
        ],
        restrictions: [
          "Domestic flights within Vietnam only",
          "Must have existing Economy booking",
          "Subject to Business Class seat availability",
          "Cannot be transferred to another person",
          "Valid for one-way upgrade only"
        ]
      }
    },
    {
      id: "voucher_003",
      title: "Car Rental - 20% Off",
      description: "20% discount on car rental services",
      type: "car",
      discountType: "percentage",
      discountValue: 20,
      code: "CAR20OFF",
      originalMiles: 3000,
      claimedDate: "2024-07-15",
      expiryDate: "2024-10-15",
      usedDate: "2024-08-01",
      status: "used",
      termsAndConditions: [
        "Valid for car rentals only",
        "Minimum rental period of 3 days",
        "Valid at participating locations",
        "Cannot be refunded"
      ],
      detailedInfo: {
        provider: "Southeast Asia Car Rental",
        category: "Transportation",
        minimumSpend: 150,
        maximumDiscount: 100,
        validLocations: ["Ho Chi Minh City", "Hanoi", "Da Nang", "Nha Trang", "Bangkok", "Singapore"],
        customerService: {
          phone: "+84 28 9876 5432",
          email: "info@seacarrental.com",
          hours: "8:00 AM - 8:00 PM (GMT+7)"
        },
        howToUse: [
          "Visit our website or call our booking center",
          "Select pickup location, dates, and vehicle type",
          "Enter voucher code 'CAR20OFF' during booking",
          "Complete booking with valid driver's license",
          "Pick up vehicle at designated location"
        ],
        restrictions: [
          "Valid driver's license required",
          "Minimum age 21 years",
          "Credit card required for security deposit",
          "Fuel policy: return with same fuel level",
          "Late return charges may apply"
        ]
      }
    },
    {
      id: "voucher_004",
      title: "Dining Voucher - $50 Credit",
      description: "$50 credit for restaurant dining",
      type: "dining",
      discountType: "fixed",
      discountValue: 50,
      code: "DINING50",
      originalMiles: 4000,
      claimedDate: "2024-06-01",
      expiryDate: "2024-07-31",
      status: "expired",
      termsAndConditions: [
        "Valid at participating restaurants",
        "Cannot be used for alcohol",
        "Minimum bill of $100",
        "One-time use only"
      ],
      detailedInfo: {
        provider: "Premium Dining Network",
        category: "Food & Beverage",
        minimumSpend: 100,
        validLocations: ["Ho Chi Minh City", "Hanoi", "Da Nang"],
        customerService: {
          phone: "+84 28 5555 0123",
          email: "dine@premiumnetwork.vn",
          hours: "10:00 AM - 10:00 PM (GMT+7)"
        },
        howToUse: [
          "Visit any participating restaurant",
          "Browse our restaurant directory online",
          "Make reservation mentioning voucher code",
          "Present voucher code to server before ordering",
          "Credit will be applied to final bill"
        ],
        restrictions: [
          "Not valid for alcoholic beverages",
          "Cannot be combined with other promotions",
          "Advance reservation recommended",
          "Gratuity not included in credit",
          "Valid for dine-in only, not for takeaway"
        ]
      }
    },
    {
      id: "voucher_005",
      title: "Shopping Discount - 15% Off",
      description: "15% discount on online shopping",
      type: "shopping",
      discountType: "percentage",
      discountValue: 15,
      code: "SHOP15OFF",
      originalMiles: 2500,
      claimedDate: "2024-08-05",
      expiryDate: "2024-08-20", // 8 days from now (expiring soon)
      status: "active",
      termsAndConditions: [
        "Valid for online purchases only",
        "Minimum purchase of $75",
        "Excludes sale items",
        "Valid until expiry date"
      ],
      detailedInfo: {
        provider: "E-Commerce Partners",
        category: "Retail Shopping",
        minimumSpend: 75,
        maximumDiscount: 150,
        validLocations: ["Vietnam", "International Shipping Available"],
        customerService: {
          phone: "+84 1800 6789",
          email: "support@ecommercepartners.com",
          hours: "9:00 AM - 6:00 PM (GMT+7), Mon-Fri"
        },
        howToUse: [
          "Visit participating online stores",
          "Add items to your shopping cart",
          "Proceed to checkout",
          "Enter voucher code 'SHOP15OFF' in promo code field",
          "Complete purchase with payment method"
        ],
        restrictions: [
          "Online purchases only",
          "Cannot be used in physical stores",
          "Excludes already discounted items",
          "Shipping fees not included in discount",
          "Return policy as per merchant terms"
        ]
      }
    }
  ]);

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
              22,500
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