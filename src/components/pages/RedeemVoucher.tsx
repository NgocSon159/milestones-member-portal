import { useState, useEffect } from "react";
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

interface Reward {
  id: string;
  rewardName: string;
  description: string;
  milesRequired: number;
  maxUsage: number;
  rewardType: "voucher" | "discount";
  value: string;
  validFrom: string;
  validUntil: string;
  termsAndConditions: string;
  membershipName: "Bronze" | "Silver" | "Gold" | "Platinum";
  membershipInfo: {
    id: string;
    name: string;
    description: string;
  };
}

interface MappedVoucher {
  id: string;
  title: string;
  description: string;
  category: "flight" | "shopping" | "dining" | "transport" | "hotel" | "other";
  value: string;
  requiredTier: "Silver" | "Gold" | "Platinum";
  requiredMiles: number;
  expiryDays: number;
  icon: any;
  terms: string[];
  maxClaims: number;
}

interface MembershipInfo {
  id: string;
  name: string;
  description: string;
  milesRequired: number;
  color: string;
  benefit: string;
  autoAssignReward: string | null;
}

interface ProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dob: string;
  streetAddress: string;
  city: string;
  country: string;
  createdAt: string;
  totalBonusMiles: number;
  totalQuantifyingMiles: number;
  memberships: MembershipInfo[];
}

interface User {
  email: string;
  name: string;
}

interface RedeemVoucherProps {
  user: User;
  section?: string;
  onPageChange?: (page: string, params?: any) => void;
}

// NOTE: The `Voucher` interface is now `MappedVoucher` to align with API data.
interface Voucher extends MappedVoucher {}

interface ClaimedVoucher {
  id: string;
  voucherId: string;
  title: string;
  description: string;
  category: "flight" | "shopping" | "dining" | "transport" | "hotel" | "other";
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

const mapRewardToVoucher = (reward: Reward): MappedVoucher => {
  const category = reward.rewardType === "voucher" ? "other" : "other"; // Default to 'other', adjust as needed based on reward name or description
  let icon;
  // Assign icons based on reward name or category, if possible
  if (reward.rewardName.toLowerCase().includes("flight")) {
    icon = Plane;
  } else if (reward.rewardName.toLowerCase().includes("shopping")) {
    icon = ShoppingBag;
  } else if (reward.rewardName.toLowerCase().includes("dining")) {
    icon = Utensils;
  } else if (reward.rewardName.toLowerCase().includes("transport")) {
    icon = Car;
  } else if (reward.rewardName.toLowerCase().includes("hotel")) {
    icon = Sparkles;
  } else {
    icon = Gift; // Default icon
  }

  const validFromDate = new Date(reward.validFrom);
  const validUntilDate = new Date(reward.validUntil);
  const diffTime = Math.abs(validUntilDate.getTime() - validFromDate.getTime());
  const expiryDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    id: reward.id,
    title: reward.rewardName,
    description: reward.description,
    category: category, 
    value: reward.value,
    requiredTier: reward.membershipName === "Bronze" ? "Silver" : reward.membershipName as "Silver" | "Gold" | "Platinum",
    requiredMiles: reward.milesRequired,
    expiryDays: expiryDays,
    icon: icon,
    terms: [reward.termsAndConditions],
    maxClaims: reward.maxUsage,
  };
};

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
    case "other":
      return Gift;
    default:
      return Gift;
  }
};

export function RedeemVoucher({ user, section, onPageChange }: RedeemVoucherProps) {
  const { requests } = useEarnMiles();
  const [claimedVouchers, setClaimedVouchers] = useState<ClaimedVoucher[]>([]);
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [errorProfile, setErrorProfile] = useState<string | null>(null);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token'); 
      const response = await fetch('https://mileswise-be.onrender.com/api/member/rewards', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Reward[] = await response.json();
      setRewards(data);
    } catch (error: any) {
      setError(error.message);
      toast.error("Failed to load rewards.");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const token = localStorage.getItem('token');
      const response = await fetch('https://mileswise-be.onrender.com/api/member/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ProfileResponse = await response.json();
      setProfile(data);
    } catch (error: any) {
      setErrorProfile(error.message);
      toast.error("Failed to load profile.");
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchRewards();
    fetchProfile();
  }, []);

  // Get member data from shared function
  const sharedMemberData = getMemberData(requests);
  const localMemberData = getMemberDataLocal(user.email);
  
  // Force Gold tier as requested
  const unifiedMemberData = {
    tier: profile?.memberships[0]?.name || "Silver",
    totalMiles: profile?.totalBonusMiles || 0, 
    tierMiles: sharedMemberData.currentTierMiles,
    nextTier: "Platinum",
    nextTierMiles: 75000
  };

  // Filter loyalty vouchers based on member tier (free for Gold, Platinum)
  const getLoyaltyVouchers = () => {
    const filteredRewards = rewards.filter(reward => reward.milesRequired === 0);
    return filteredRewards.map(mapRewardToVoucher);
  };

  // Filter redeemable vouchers based on member tier (requires miles)
  const getAvailableVouchers = () => {
    const filteredRewards = rewards.filter(reward => reward.milesRequired > 0);
    return filteredRewards.map(mapRewardToVoucher);
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

  const confirmClaimVoucher = async () => {
    if (!selectedVoucher) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://mileswise-be.onrender.com/api/member/rewards/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          rewardId: selectedVoucher.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // If successful, proceed with local state update and refetch data
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
      
      // Re-fetch rewards and profile to update available miles and vouchers
      await fetchRewards(); 
      await fetchProfile();

    } catch (error: any) {
      toast.error(error.message || "Failed to claim voucher.");
    } finally {
      setShowClaimDialog(false);
      setSelectedVoucher(null);
    }
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

  const VoucherCard = ({ voucher, isAvailable = true, isLoyalty = false }: { voucher: Voucher; isAvailable?: boolean; isLoyalty?: boolean }) => {
    const IconComponent = getCategoryIcon(voucher.category);
    const canClaim = canClaimVoucher(voucher);
    const isDisabled = !canClaim && isAvailable;

    return (
      <Card className={`${isDisabled ? 'opacity-50' : ''} hover:shadow-lg transition-all duration-200 border-0 shadow-sm`}>
        <CardContent className="p-5">
          <div className="space-y-4">
            {/* Header with icon and value */}
            <div className="flex items-start justify-between">
              <div className="p-2 bg-blue-50 rounded-lg">
                <IconComponent className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-right">
                <div className={`text-xl font-bold ${isLoyalty ? 'text-green-600' : 'text-blue-600'} mb-1`}>
                  {voucher.value}
                </div>
                {isLoyalty && (
                  <Badge className="bg-green-100 text-green-700 text-xs">
                    FREE
                  </Badge>
                )}
              </div>
            </div>

            {/* Title and description */}
            <div>
              <h3 className="font-semibold text-base mb-1">{voucher.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{voucher.description}</p>
            </div>

            {/* Miles and validity info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-1">
                  <Award className="h-4 w-4 text-gray-400" />
                  {isLoyalty ? (
                    <span className="font-semibold text-green-600">FREE</span>
                  ) : (
                    <span className="font-bold text-gray-900">{voucher.requiredMiles.toLocaleString()} miles</span>
                  )}
                </div>
                <div className="flex items-center space-x-1 text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>{voucher.expiryDays} days</span>
                </div>
              </div>
            </div>

            {/* Action button */}
            {isAvailable && (
              <div className="pt-2">
                {canClaim || isLoyalty ? (
                  <Button 
                    onClick={() => handleClaimVoucher(voucher)}
                    className={`w-full ${isLoyalty ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                    size="sm"
                  >
                    <Gift className="h-4 w-4 mr-2" />
                    {isLoyalty ? "Claim Free" : "Redeem"}
                  </Button>
                ) : (
                  <Button disabled className="w-full text-xs" size="sm">
                    {unifiedMemberData.totalMiles < voucher.requiredMiles ? 
                      `Need ${(voucher.requiredMiles - unifiedMemberData.totalMiles).toLocaleString()} more miles` :
                      'Max claims reached'
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
      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Gift className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Redeem Voucher</h1>
              <p className="text-gray-600 text-sm">Redeem exciting vouchers with your miles</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="flex items-center space-x-2">
                {getTierIcon(profile?.memberships[0]?.name || "Silver")}
                <span className="font-semibold text-lg">{profile?.memberships[0]?.name || "Silver"}</span>
              </div>
            </div>
            
            <div className="text-center">
              <div className="font-bold text-2xl text-red-600">{unifiedMemberData.totalMiles.toLocaleString()}</div>
              <p className="text-xs text-gray-500">Available Miles</p>
              <p className="text-xs text-red-500">Expiring this year</p>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onPageChange && onPageChange('reward-details')}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              View All Tier
            </Button>
          </div>
        </div>
      </div>

      {loading && <div className="text-center py-12 text-gray-500">Loading vouchers...</div>}
      {error && <div className="text-center py-12 text-red-600">Error: {error}</div>}
      {loadingProfile && <div className="text-center py-12 text-gray-500">Loading profile...</div>}
      {errorProfile && <div className="text-center py-12 text-red-600">Error: {errorProfile}</div>}

      {!loading && !error && !loadingProfile && !errorProfile && (
        <>
          {/* Your Loyalty Vouchers Section */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <Crown className="h-5 w-5 text-green-600" />
                    <span>Your Loyalty Vouchers</span>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Free vouchers available for Gold members - no miles required!</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {getLoyaltyVouchers().map(voucher => (
                  <VoucherCard key={voucher.id} voucher={voucher} isAvailable={true} isLoyalty={true} />
                ))}
              </div>
              
              {getLoyaltyVouchers().length === 0 && (
                <div className="text-center py-12">
                  <Crown className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No loyalty vouchers available</h3>
                  <p className="text-gray-500">Check back later for new exclusive Gold member vouchers!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Redeem Your Vouchers Section */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <Gift className="h-5 w-5 text-blue-600" />
                    <span>Redeem Your Vouchers</span>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Use your miles to redeem these exclusive vouchers</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {getAvailableVouchers().map(voucher => (
                  <VoucherCard key={voucher.id} voucher={voucher} isAvailable={true} isLoyalty={false} />
                ))}
              </div>
              
              {getAvailableVouchers().length === 0 && (
                <div className="text-center py-12">
                  <Gift className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No {unifiedMemberData.tier} tier vouchers available</h3>
                  <p className="text-gray-500">Check back later for new {unifiedMemberData.tier} tier vouchers, or upgrade your membership for access to more exclusive offers!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

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
                  {selectedVoucher.requiredMiles === 0 ? (
                    <span className="font-bold text-green-600">FREE</span>
                  ) : (
                    <span className="font-bold text-blue-600">{selectedVoucher.requiredMiles.toLocaleString()} miles</span>
                  )}
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