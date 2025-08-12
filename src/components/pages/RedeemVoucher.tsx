import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { toast } from "sonner";
import { useEarnMiles } from "../EarnMilesContext";
import { getMemberData } from "../shared/memberData";
import { 
  Gift, 
  Star,
  Calendar,
  Clock,
  CheckCircle,
  X,
  Award,
  Plane,
  ShoppingBag,
  Coffee,
  Utensils,
  Car,
  Sparkles,
  Crown,
  Diamond
} from "lucide-react";

interface User {
  email: string;
  name: string;
}

interface RedeemVoucherProps {
  user: User;
  section?: string;
}

interface Voucher {
  id: string;
  title: string;
  description: string;
  category: "flight" | "shopping" | "dining" | "transport" | "hotel";
  value: string;
  requiredTier: "Silver" | "Gold" | "Platinum";
  requiredMiles: number;
  expiryDays: number;
  icon: any;
  terms: string[];
  maxClaims: number;
}

interface ClaimedVoucher {
  id: string;
  voucherId: string;
  title: string;
  description: string;
  category: string;
  value: string;
  claimedDate: string;
  expiryDate: string;
  status: "active" | "used" | "expired";
  voucherCode: string;
}

// Mock member data - In real app this would come from API
const getMemberDataLocal = (email: string) => {
  // Different tiers based on email for demo purposes
  if (email.includes("platinum") || email.includes("vip")) {
    return {
      tier: "Platinum",
      totalMiles: 75000,
      tierMiles: 25000, // Miles in current tier
      nextTier: null,
      nextTierMiles: null
    };
  } else if (email.includes("gold") || email === "member01@gmail.com") {
    return {
      tier: "Gold",
      totalMiles: 45000,
      tierMiles: 25000, // Miles in current tier  
      nextTier: "Platinum",
      nextTierMiles: 50000
    };
  } else {
    return {
      tier: "Silver",
      totalMiles: 15000,
      tierMiles: 15000, // Miles in current tier
      nextTier: "Gold", 
      nextTierMiles: 25000
    };
  }
};

// Available vouchers by tier
const availableVouchers: Voucher[] = [
  // Silver Tier Vouchers
  {
    id: "V001",
    title: "10% Off Flight Booking",
    description: "Get 10% discount on your next domestic flight booking",
    category: "flight",
    value: "10% OFF",
    requiredTier: "Silver",
    requiredMiles: 1000,
    expiryDays: 30,
    icon: Plane,
    terms: ["Valid for domestic flights only", "Cannot be combined with other offers", "Minimum booking value $100"],
    maxClaims: 1
  },
  {
    id: "V002",
    title: "Coffee Shop Voucher",
    description: "Free coffee at participating airport cafes",
    category: "dining",
    value: "$5 FREE",
    requiredTier: "Silver",
    requiredMiles: 500,
    expiryDays: 15,
    icon: Coffee,
    terms: ["Valid at airport locations only", "One voucher per visit", "Cannot be exchanged for cash"],
    maxClaims: 3
  },
  {
    id: "V003",
    title: "Airport Parking Discount",
    description: "15% off airport parking for up to 7 days",
    category: "transport",
    value: "15% OFF",
    requiredTier: "Silver",
    requiredMiles: 800,
    expiryDays: 45,
    icon: Car,
    terms: ["Valid for short-term parking only", "Maximum 7 days", "Advance booking required"],
    maxClaims: 2
  },

  // Gold Tier Vouchers
  {
    id: "V004",
    title: "20% Off International Flight",
    description: "Get 20% discount on international flight bookings",
    category: "flight",
    value: "20% OFF",
    requiredTier: "Gold",
    requiredMiles: 2500,
    expiryDays: 60,
    icon: Plane,
    terms: ["Valid for international flights only", "Minimum booking value $300", "Subject to availability"],
    maxClaims: 1
  },
  {
    id: "V005",
    title: "Premium Dining Voucher",
    description: "$25 voucher for premium airport restaurants",
    category: "dining",
    value: "$25 FREE",
    requiredTier: "Gold",
    requiredMiles: 1500,
    expiryDays: 30,
    icon: Utensils,
    terms: ["Valid at premium dining outlets", "Cannot be split across multiple visits", "Alcohol excluded"],
    maxClaims: 2
  },
  {
    id: "V006",
    title: "Shopping Mall Discount",
    description: "15% discount at duty-free and retail stores",
    category: "shopping",
    value: "15% OFF",
    requiredTier: "Gold",
    requiredMiles: 2000,
    expiryDays: 90,
    icon: ShoppingBag,
    terms: ["Valid at participating stores", "Minimum purchase $50", "Excluded brands may apply"],
    maxClaims: 1
  },

  // Platinum Tier Vouchers
  {
    id: "V007",
    title: "Free Business Class Upgrade",
    description: "Complimentary upgrade to Business Class",
    category: "flight",
    value: "FREE UPGRADE",
    requiredTier: "Platinum",
    requiredMiles: 5000,
    expiryDays: 90,
    icon: Crown,
    terms: ["Subject to availability", "Valid on selected routes", "Cannot be transferred"],
    maxClaims: 1
  },
  {
    id: "V008",
    title: "Luxury Lounge Access",
    description: "Access to premium airport lounges worldwide",
    category: "flight",
    value: "FREE ACCESS",
    requiredTier: "Platinum",
    requiredMiles: 3000,
    expiryDays: 120,
    icon: Diamond,
    terms: ["Valid at participating lounges", "Includes guest access", "3-hour time limit"],
    maxClaims: 2
  },
  {
    id: "V009",
    title: "Premium Hotel Discount",
    description: "30% off at 5-star hotel partners",
    category: "hotel",
    value: "30% OFF",
    requiredTier: "Platinum",
    requiredMiles: 4000,
    expiryDays: 180,
    icon: Sparkles,
    terms: ["Valid at partner hotels only", "Minimum 2-night stay", "Advance booking required"],
    maxClaims: 1
  }
];

const getTierIcon = (tier: string) => {
  switch (tier) {
    case "Silver":
      return <Award className="h-4 w-4 text-gray-500" />;
    case "Gold":
      return <Star className="h-4 w-4 text-yellow-500" />;
    case "Platinum":
      return <Crown className="h-4 w-4 text-purple-500" />;
    default:
      return <Award className="h-4 w-4 text-gray-500" />;
  }
};

const getTierColor = (tier: string) => {
  switch (tier) {
    case "Silver":
      return "bg-gray-100 text-gray-700";
    case "Gold":
      return "bg-yellow-100 text-yellow-700";
    case "Platinum":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "flight":
      return Plane;
    case "shopping":
      return ShoppingBag;
    case "dining":
      return Utensils;
    case "transport":
      return Car;
    case "hotel":
      return Sparkles;
    default:
      return Gift;
  }
};

export function RedeemVoucher({ user, section }: RedeemVoucherProps) {
  const { requests } = useEarnMiles();
  const [claimedVouchers, setClaimedVouchers] = useState<ClaimedVoucher[]>([]);
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  // Get member data from shared function
  const sharedMemberData = getMemberData(requests);
  const localMemberData = getMemberDataLocal(user.email);
  
  // Create unified member data with shared data taking precedence
  const unifiedMemberData = {
    tier: sharedMemberData.currentTier,
    totalMiles: sharedMemberData.milesExpiringEndOfYear, // Available miles for redemption
    tierMiles: sharedMemberData.currentTierMiles,
    nextTier: sharedMemberData.nextTier,
    nextTierMiles: sharedMemberData.nextTierRequired
  };

  // Filter vouchers based on member tier - only show vouchers for current tier
  const getAvailableVouchers = () => {
    return availableVouchers.filter(voucher => {
      return voucher.requiredTier === unifiedMemberData.tier;
    });
  };

  const canClaimVoucher = (voucher: Voucher) => {
    // Check if user has enough miles
    if (unifiedMemberData.totalMiles < voucher.requiredMiles) return false;
    
    // Check if already claimed maximum times
    const claimedCount = claimedVouchers.filter(cv => cv.voucherId === voucher.id).length;
    if (claimedCount >= voucher.maxClaims) return false;
    
    return true;
  };

  const handleClaimVoucher = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setShowClaimDialog(true);
  };

  const confirmClaimVoucher = () => {
    if (!selectedVoucher) return;

    const voucherCode = `VN${selectedVoucher.id}${Date.now().toString().slice(-4)}`;
    const claimedDate = new Date().toISOString().split('T')[0];
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + selectedVoucher.expiryDays);

    const newClaimedVoucher: ClaimedVoucher = {
      id: `CV-${Date.now()}`,
      voucherId: selectedVoucher.id,
      title: selectedVoucher.title,
      description: selectedVoucher.description,
      category: selectedVoucher.category,
      value: selectedVoucher.value,
      claimedDate,
      expiryDate: expiryDate.toISOString().split('T')[0],
      status: "active",
      voucherCode
    };

    setClaimedVouchers(prev => [...prev, newClaimedVoucher]);
    
    toast.success(`Voucher claimed successfully! Code: ${voucherCode}`);
    setShowClaimDialog(false);
    setSelectedVoucher(null);
  };

  const getVoucherStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "used":
        return "bg-gray-100 text-gray-700";
      case "expired":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const VoucherCard = ({ voucher, isAvailable = true }: { voucher: Voucher; isAvailable?: boolean }) => {
    const IconComponent = getCategoryIcon(voucher.category);
    const canClaim = canClaimVoucher(voucher);
    const isDisabled = !canClaim && isAvailable;

    return (
      <Card className={`${isDisabled ? 'opacity-50' : ''} hover:shadow-md transition-shadow`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <IconComponent className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{voucher.title}</h3>
                <p className="text-sm text-gray-600">{voucher.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {voucher.value}
              </div>
              <Badge className={getTierColor(voucher.requiredTier)}>
                {getTierIcon(voucher.requiredTier)}
                <span className="ml-1">{voucher.requiredTier}</span>
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Award className="h-4 w-4" />
                  <span>{voucher.requiredMiles.toLocaleString()} miles</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Valid {voucher.expiryDays} days</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Gift className="h-4 w-4" />
                  <span>Max {voucher.maxClaims} claims</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-xs text-gray-500 mb-2">Terms & Conditions:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                {voucher.terms.slice(0, 2).map((term, index) => (
                  <li key={index}>• {term}</li>
                ))}
              </ul>
            </div>

            {isAvailable && (
              <div className="pt-3">
                {canClaim ? (
                  <Button 
                    onClick={() => handleClaimVoucher(voucher)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Gift className="h-4 w-4 mr-2" />
                    Claim Voucher
                  </Button>
                ) : (
                  <Button disabled className="w-full">
                    {unifiedMemberData.totalMiles < voucher.requiredMiles ? 
                      `Need ${(voucher.requiredMiles - unifiedMemberData.totalMiles).toLocaleString()} more miles` :
                      'Maximum claims reached'
                    }
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const ClaimedVoucherCard = ({ voucher }: { voucher: ClaimedVoucher }) => {
    const IconComponent = getCategoryIcon(voucher.category);
    const isExpiring = new Date(voucher.expiryDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <IconComponent className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{voucher.title}</h3>
                <p className="text-sm text-gray-600">{voucher.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {voucher.value}
              </div>
              <Badge className={getVoucherStatusColor(voucher.status)}>
                {voucher.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                {voucher.status === 'used' && <CheckCircle className="h-3 w-3 mr-1" />}
                {voucher.status === 'expired' && <X className="h-3 w-3 mr-1" />}
                {voucher.status.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Voucher Code</span>
                <Button variant="outline" size="sm" onClick={() => {
                  navigator.clipboard.writeText(voucher.voucherCode);
                  toast.success("Code copied to clipboard!");
                }}>
                  Copy
                </Button>
              </div>
              <p className="font-mono text-lg font-bold text-blue-600">{voucher.voucherCode}</p>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Claimed: {new Date(voucher.claimedDate).toLocaleDateString()}</span>
              </div>
              <div className={`flex items-center space-x-1 ${isExpiring ? 'text-red-600' : ''}`}>
                <Clock className="h-4 w-4" />
                <span>Expires: {new Date(voucher.expiryDate).toLocaleDateString()}</span>
              </div>
            </div>

            {isExpiring && voucher.status === 'active' && (
              <div className="p-2 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-600">⚠️ This voucher expires soon!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Gift className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Redeem Voucher</h1>
            <p className="text-gray-600">Redeem exciting vouchers with your miles</p>
          </div>
        </div>
        
        {/* Member Status */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="flex items-center space-x-1 mb-1">
                  {getTierIcon(unifiedMemberData.tier)}
                  <span className="font-semibold">{unifiedMemberData.tier}</span>
                </div>
                <p className="text-xs text-gray-500">Current Tier</p>
              </div>
              <div className="border-l h-8"></div>
              <div className="text-center">
                <div className="font-bold text-red-600">{sharedMemberData.milesExpiringEndOfYear.toLocaleString()}</div>
                <p className="text-xs text-gray-500">Available Miles</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voucher Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">
              {getAvailableVouchers().length}
            </div>
            <p className="text-gray-600">Available Vouchers</p>
          </CardContent>
        </Card>
        <Card className={section === "available-miles" ? "ring-2 ring-blue-500 ring-offset-2" : ""}>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-red-600">
              {sharedMemberData.milesExpiringEndOfYear.toLocaleString()}
            </div>
            <p className="text-gray-600">Available Miles</p>
            <p className="text-xs text-red-500 mt-1">Expiring this year</p>
          </CardContent>
        </Card>
      </div>

      {/* Available Vouchers Section */}
      <div className="space-y-4">

        {/* Tier Information Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getTierIcon(unifiedMemberData.tier)}
                <div>
                  <h3 className="font-semibold text-gray-900">You are a {unifiedMemberData.tier} Member</h3>
                  <p className="text-sm text-gray-600">Exclusive vouchers designed for your tier level</p>
                </div>
              </div>
              {unifiedMemberData.tier !== "Platinum" && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Upgrade to {unifiedMemberData.nextTier} for more exclusive offers!</p>
                  <p className="text-xs text-gray-500">
                    {((unifiedMemberData.nextTierMiles - unifiedMemberData.tierMiles) || 0).toLocaleString()} miles to {unifiedMemberData.nextTier}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gift className="h-5 w-5 text-blue-600" />
              <span>{unifiedMemberData.tier} Tier Exclusive Vouchers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {getAvailableVouchers().map(voucher => (
                <VoucherCard key={voucher.id} voucher={voucher} isAvailable={true} />
              ))}
            </div>
            
            {getAvailableVouchers().length === 0 && (
              <div className="text-center py-8">
                <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No {unifiedMemberData.tier} tier vouchers available</h3>
                <p className="text-gray-500">Check back later for new {unifiedMemberData.tier} tier vouchers, or upgrade your membership for access to more exclusive offers!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Claim Confirmation Dialog */}
      <Dialog open={showClaimDialog} onOpenChange={setShowClaimDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Gift className="h-5 w-5 text-blue-600" />
              <span>Claim Voucher</span>
            </DialogTitle>
            <DialogDescription>
              Review the voucher details and confirm your claim.
            </DialogDescription>
          </DialogHeader>
          
          {selectedVoucher && (
            <div className="space-y-6">
              {/* Voucher Preview */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Gift className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedVoucher.title}</h3>
                    <p className="text-sm text-gray-600">{selectedVoucher.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedVoucher.value}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost & Terms */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Cost:</span>
                  <span className="font-bold text-blue-600">{selectedVoucher.requiredMiles.toLocaleString()} miles</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Valid for:</span>
                  <span className="font-bold">{selectedVoucher.expiryDays} days</span>
                </div>

                <div>
                  <p className="font-medium mb-2">Terms & Conditions:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {selectedVoucher.terms.map((term, index) => (
                      <li key={index}>• {term}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClaimDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmClaimVoucher} className="bg-green-600 hover:bg-green-700">
              <Gift className="h-4 w-4 mr-2" />
              Confirm Claim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}