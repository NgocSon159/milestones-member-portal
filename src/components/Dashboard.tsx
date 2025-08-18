import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { 
  TrendingUp,
  Star,
  Trophy,
  Gift,
  Clock,
  Calendar,
  Award,
  User,
  Plane,
  Send
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useEarnMiles } from "./EarnMilesContext";
import { getMemberData } from "./shared/memberData";

interface DashboardProps {
  user: {
    email: string;
    name: string;
  };
  onPageChange?: (page: string, params?: any) => void;
}

// Generate chart data that matches the exact totals from member data
const generateChartDataFromRequests = (requests: any[], memberData: any) => {
  const approvedRequests = requests.filter(request => request.status === 'approved');
  
  // Group requests by month and calculate actual earned miles
  const monthlyData: { [key: string]: { 
    qualifyingMiles: number, 
    bonusMiles: number, 
    redeemed: number, 
    available: number 
  } } = {};
  
  // Initialize months
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  months.forEach(month => {
    monthlyData[month] = { qualifyingMiles: 0, bonusMiles: 0, redeemed: 0, available: 0 };
  });
  
  // Process approved requests to get real earned miles per month
  approvedRequests.forEach(request => {
    const date = new Date(request.departureDate);
    const monthIndex = date.getMonth();
    const monthName = months[monthIndex];
    
    if (monthlyData[monthName]) {
      monthlyData[monthName].qualifyingMiles += request.calculatedMiles;
      monthlyData[monthName].bonusMiles += (request.bonusMiles || request.calculatedMiles);
    }
  });
  
  // Get months that have earned miles
  const activeMonths = months.filter(month => monthlyData[month].qualifyingMiles > 0 || monthlyData[month].bonusMiles > 0);
  
  // Distribute total redeemed, expiring, and available across active months proportionally
  const totalQualifyingInChart = Object.values(monthlyData).reduce((sum, data) => sum + data.qualifyingMiles, 0);
  const totalBonusInChart = Object.values(monthlyData).reduce((sum, data) => sum + data.bonusMiles, 0);
  
  // If we have earned miles, distribute other metrics proportionally
  if ((totalQualifyingInChart > 0 || totalBonusInChart > 0) && activeMonths.length > 0) {
    // Distribute miles redeemed and available across months
    let remainingRedeemed = memberData.totalMilesRedeemed;
    let remainingAvailable = memberData.milesExpiringEndOfYear; // Using expiring miles as available miles
    
    activeMonths.forEach((month, index) => {
      const monthBonus = monthlyData[month].bonusMiles;
      const proportion = totalBonusInChart > 0 ? monthBonus / totalBonusInChart : 1 / activeMonths.length;
      
      if (index === activeMonths.length - 1) {
        // Last month gets remaining to ensure exact total
        monthlyData[month].redeemed = remainingRedeemed;
        monthlyData[month].available = remainingAvailable;
      } else {
        const monthRedeemed = Math.floor(memberData.totalMilesRedeemed * proportion);
        const monthAvailable = Math.floor(memberData.milesExpiringEndOfYear * proportion);
        
        monthlyData[month].redeemed = monthRedeemed;
        monthlyData[month].available = monthAvailable;
        
        remainingRedeemed -= monthRedeemed;
        remainingAvailable -= monthAvailable;
      }
    });
  }
  
  // Return only months with data or recent months for better visualization
  return months.map(month => ({
    month,
    qualifyingMiles: monthlyData[month].qualifyingMiles,
    bonusMiles: monthlyData[month].bonusMiles,
    redeemed: monthlyData[month].redeemed,
    available: monthlyData[month].available
  })).filter(data => 
    data.qualifyingMiles > 0 || 
    data.bonusMiles > 0 ||
    data.redeemed > 0 || 
    data.available > 0 ||
    ['Aug', 'Sep', 'Oct', 'Nov', 'Dec'].includes(data.month)
  );
};

const getTierInfo = (tier: string) => {
  switch (tier) {
    case "Silver":
      return { color: "text-gray-500", bgColor: "bg-gray-100", icon: Star };
    case "Gold":
      return { color: "text-yellow-500", bgColor: "bg-yellow-100", icon: Award };
    case "Platinum":
      return { color: "text-purple-500", bgColor: "bg-purple-100", icon: Trophy };
    default:
      return { color: "text-gray-500", bgColor: "bg-gray-100", icon: Star };
  }
};

export function Dashboard({ user, onPageChange }: DashboardProps) {
  const { requests } = useEarnMiles();

  // Use shared member data calculation
  const memberData = getMemberData(requests);

  // Generate chart data that matches exact totals
  const milesChartData = generateChartDataFromRequests(requests, memberData);

  const tierInfo = getTierInfo(memberData.currentTier);
  const TierIcon = tierInfo.icon;

  const handleQuickAction = (action: string) => {
    if (!onPageChange) return;
    
    switch (action) {
      case "profile":
        onPageChange("profile");
        break;
      case "request-miles":
        // Navigate to My Flights page, completed flights tab, with filter for not requested
        onPageChange("flights", { tab: "completed", filter: "not-requested" });
        break;
      case "redeem":
        onPageChange("redeem");
        break;
    }
  };

  const handleMetricClick = (metric: string) => {
    if (!onPageChange) return;
    
    switch (metric) {
      case "total-miles":
        // Link to History My Request (Approved Request tab) - Qualifying miles
        onPageChange("history", { tab: "approved", showTotalEarned: true });
        break;
      case "bonus-miles":
        // Link to History My Request to show bonus miles breakdown
        onPageChange("history", { tab: "approved", showBonusMiles: true });
        break;
      case "miles-redeemed":
        // Link to My Vouchers "Total Miles Used"
        onPageChange("my-vouchers", { section: "total-used" });
        break;

      case "available-miles":
        // Link to Redeem Voucher for available bonus miles
        onPageChange("redeem");
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Member Tier Progress - Featured Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-100 border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-xl">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <span className="text-blue-900">Member Tier Progress</span>
          </CardTitle>
          <p className="text-sm text-blue-700">Track your journey to the next tier based on completed flights</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Current Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-3xl font-bold text-blue-600">{memberData.totalQualifyingMiles.toLocaleString()}</div>
                <p className="text-sm text-gray-600">Qualifying Miles</p>
                <p className="text-xs text-blue-500">Used for tier calculation</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className={`text-3xl font-bold ${tierInfo.color}`}>{memberData.currentTier}</div>
                <p className="text-sm text-gray-600">Current Tier</p>
                <div className="flex items-center justify-center mt-1">
                  <TierIcon className={`h-5 w-5 ${tierInfo.color} mr-1`} />
                  <span className="text-xs text-gray-500">Member Level</span>
                </div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-3xl font-bold text-green-600">{memberData.totalBonusMiles.toLocaleString()}</div>
                <p className="text-sm text-gray-600">Total Bonus Miles</p>
                <p className="text-xs text-green-500">From completed flights</p>
              </div>
            </div>

            {/* Tier Progress Visualization */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-8">
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full ${memberData.totalMilesEarned >= 0 ? 'bg-gray-400' : 'bg-gray-200'}`}></div>
                    <span className={`text-sm ${memberData.totalQualifyingMiles >= 0 ? 'font-medium text-gray-600' : 'text-gray-400'}`}>Silver</span>
                    <span className="text-xs text-gray-400">(0 miles)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full ${memberData.totalMilesEarned >= 25000 ? 'bg-yellow-400' : 'bg-gray-200'}`}></div>
                    <span className={`text-sm ${memberData.totalMilesEarned >= 25000 ? 'font-semibold text-yellow-600' : 'text-gray-400'}`}>Gold</span>
                    <span className="text-xs text-gray-400">(25,000 miles)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full ${memberData.totalMilesEarned >= 75000 ? 'bg-purple-400' : 'bg-gray-200 border-2 border-purple-300'}`}></div>
                    <span className={`text-sm ${memberData.totalMilesEarned >= 75000 ? 'font-semibold text-purple-600' : 'text-gray-600'}`}>Platinum</span>
                    <span className="text-xs text-gray-400">(75,000 miles)</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{memberData.totalQualifyingMiles.toLocaleString()} / {memberData.nextTierRequired.toLocaleString()} qualifying miles</span>
                  <span className="text-sm font-medium text-blue-600">{Math.round((memberData.totalQualifyingMiles / memberData.nextTierRequired) * 100)}%</span>
                </div>
                <Progress value={(memberData.totalQualifyingMiles / memberData.nextTierRequired) * 100} className="h-3" />
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Tier Calculation:</strong> Your member tier is determined by qualifying miles from completed flights. 
                  Bonus miles are used for redemptions. You need {memberData.milesToNextTier.toLocaleString()} more qualifying miles to reach {memberData.nextTier} status.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Miles Chart with Overview Cards */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <span>Miles Activity Overview</span>
          </CardTitle>
          <p className="text-sm text-gray-600">Track your qualifying miles, bonus miles, redemptions, and available miles for voucher redemption</p>
        </CardHeader>
        <CardContent>
          {/* Miles Overview Cards - Above Chart */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Qualifying Miles - Compact */}
            <Card 
              className="cursor-pointer hover:shadow-sm transition-shadow p-3 border-blue-200"
              onClick={() => handleMetricClick("total-miles")}
            >
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Award className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-xs font-medium text-gray-600">Qualifying</span>
                </div>
                <p className="text-lg font-bold text-blue-600">{memberData.totalQualifyingMiles.toLocaleString()}</p>
                <p className="text-xs text-gray-500">For tier status</p>
              </div>
            </Card>

            {/* Total Bonus Miles - Compact */}
            <Card 
              className="cursor-pointer hover:shadow-sm transition-shadow p-3 border-green-200"
              onClick={() => handleMetricClick("bonus-miles")}
            >
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Star className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs font-medium text-gray-600">Bonus</span>
                </div>
                <p className="text-lg font-bold text-green-600">{memberData.totalBonusMiles.toLocaleString()}</p>
                <p className="text-xs text-gray-500">For redemption</p>
              </div>
            </Card>

            {/* Miles Redeemed - Compact */}
            <Card 
              className="cursor-pointer hover:shadow-sm transition-shadow p-3 border-purple-200"
              onClick={() => handleMetricClick("miles-redeemed")}
            >
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Gift className="h-4 w-4 text-purple-500 mr-1" />
                  <span className="text-xs font-medium text-gray-600">Redeemed</span>
                </div>
                <p className="text-lg font-bold text-purple-600">{memberData.totalMilesRedeemed.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Used</p>
              </div>
            </Card>

            {/* Available Miles - Compact - Match RedeemVoucher Display */}
            <Card 
              className="cursor-pointer hover:shadow-sm transition-shadow p-3 border-red-200"
              onClick={() => handleMetricClick("available-miles")}
            >
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Gift className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-xs font-medium text-gray-600">Available Miles</span>
                </div>
                <p className="text-lg font-bold text-red-600">{memberData.milesExpiringEndOfYear.toLocaleString()}</p>
                <p className="text-xs text-red-500">Expiring this year</p>
              </div>
            </Card>
          </div>

          {/* Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={milesChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  `${Number(value).toLocaleString()} miles`, 
                  name
                ]} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="qualifyingMiles" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  name="Qualifying Miles"
                />
                <Line 
                  type="monotone" 
                  dataKey="bonusMiles" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name="Total Bonus Miles"
                />
                <Line 
                  type="monotone" 
                  dataKey="redeemed" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  name="Miles Redeemed"
                />
                <Line 
                  type="monotone" 
                  dataKey="available" 
                  stroke="#EF4444" 
                  strokeWidth={3}
                  name="Available Miles"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Summary to verify totals */}
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500">Chart Qualifying</p>
                <p className="font-medium text-blue-600">
                  {milesChartData.reduce((sum, data) => sum + data.qualifyingMiles, 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Chart Bonus</p>
                <p className="font-medium text-green-600">
                  {milesChartData.reduce((sum, data) => sum + data.bonusMiles, 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Chart Redeemed</p>
                <p className="font-medium text-purple-600">
                  {milesChartData.reduce((sum, data) => sum + data.redeemed, 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Chart Available</p>
                <p className="font-medium text-red-600">
                  {milesChartData.reduce((sum, data) => sum + data.available, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions - Updated with only 3 actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-purple-500" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleQuickAction("profile")}
              >
                <User className="h-4 w-4 mr-2" />
                Update Profile
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleQuickAction("request-miles")}
              >
                <Send className="h-4 w-4 mr-2" />
                Request Earn Miles Now
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleQuickAction("redeem")}
              >
                <Gift className="h-4 w-4 mr-2" />
                Redeem Miles
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Flight Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Plane className="h-5 w-5 text-blue-500" />
              <span>Recent Completed Flights</span>
            </CardTitle>
            <p className="text-xs text-gray-500">Latest flights contributing to your tier status</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Show latest approved flight requests */}
              {requests
                .filter(request => request.status === 'approved')
                .slice(0, 4)
                .map((request, index) => (
                  <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="p-1 bg-blue-100 rounded-full">
                        <Plane className="h-3 w-3 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{request.from.split(' - ')[1]} → {request.to.split(' - ')[1]}</p>
                        <p className="text-xs text-gray-500">Flight {request.flightNumber} • {request.serviceClass}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">+{request.calculatedMiles.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">miles</p>
                    </div>
                  </div>
                ))}
              
              {/* Summary */}
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Total from {memberData.completedFlightsCount} flights</p>
                  <p className="text-sm font-semibold text-blue-600">{memberData.totalQualifyingMiles.toLocaleString()} qualifying miles</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Plane className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Ho Chi Minh City → Bangkok</p>
                  <p className="text-sm text-gray-600">Dec 25, 2024 • VN123</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-green-600">Confirmed</p>
                <p className="text-sm text-gray-600">Seat 15A • +2,450 miles</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Plane className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Bangkok → Ho Chi Minh City</p>
                  <p className="text-sm text-gray-600">Jan 5, 2025 • VN456</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-blue-600">Scheduled</p>
                <p className="text-sm text-gray-600">Seat 12C • +2,180 miles</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}