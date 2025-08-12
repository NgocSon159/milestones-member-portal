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
  const monthlyData: { [key: string]: { earned: number, redeemed: number, expiring: number } } = {};
  
  // Initialize months
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  months.forEach(month => {
    monthlyData[month] = { earned: 0, redeemed: 0, expiring: 0 };
  });
  
  // Process approved requests to get real earned miles per month
  approvedRequests.forEach(request => {
    const date = new Date(request.departureDate);
    const monthIndex = date.getMonth();
    const monthName = months[monthIndex];
    
    if (monthlyData[monthName]) {
      monthlyData[monthName].earned += request.calculatedMiles;
    }
  });
  
  // Get months that have earned miles
  const activeMonths = months.filter(month => monthlyData[month].earned > 0);
  
  // Distribute total redeemed and expiring across active months proportionally
  const totalEarnedInChart = Object.values(monthlyData).reduce((sum, data) => sum + data.earned, 0);
  
  // If we have earned miles, distribute redeemed and expiring proportionally
  if (totalEarnedInChart > 0 && activeMonths.length > 0) {
    // Distribute miles redeemed across months
    let remainingRedeemed = memberData.totalMilesRedeemed;
    let remainingExpiring = memberData.milesExpiringEndOfYear;
    
    activeMonths.forEach((month, index) => {
      const monthEarned = monthlyData[month].earned;
      const proportion = monthEarned / totalEarnedInChart;
      
      if (index === activeMonths.length - 1) {
        // Last month gets remaining to ensure exact total
        monthlyData[month].redeemed = remainingRedeemed;
        monthlyData[month].expiring = remainingExpiring;
      } else {
        const monthRedeemed = Math.floor(memberData.totalMilesRedeemed * proportion);
        const monthExpiring = Math.floor(memberData.milesExpiringEndOfYear * proportion);
        
        monthlyData[month].redeemed = monthRedeemed;
        monthlyData[month].expiring = monthExpiring;
        
        remainingRedeemed -= monthRedeemed;
        remainingExpiring -= monthExpiring;
      }
    });
  }
  
  // Return only months with data or recent months for better visualization
  return months.map(month => ({
    month,
    earned: monthlyData[month].earned,
    redeemed: monthlyData[month].redeemed,
    expiring: monthlyData[month].expiring
  })).filter(data => 
    data.earned > 0 || 
    data.redeemed > 0 || 
    data.expiring > 0 || 
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
        // Link to History My Request (Approved Request tab)
        onPageChange("history", { tab: "approved", showTotalEarned: true });
        break;
      case "miles-redeemed":
        // Link to My Vouchers "Total Miles Used"
        onPageChange("my-vouchers", { section: "total-used" });
        break;
      case "miles-expiring":
        // Link to Redeem Voucher "Available Miles"
        onPageChange("redeem", { section: "available-miles" });
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Miles Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Miles Earned This Year */}
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleMetricClick("total-miles")}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Total Miles Earned</span>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-blue-600">{memberData.totalMilesEarned.toLocaleString()}</p>
              <p className="text-xs text-gray-500">From approved requests</p>
            </div>
          </CardContent>
        </Card>

        {/* Miles Redeemed */}
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleMetricClick("miles-redeemed")}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Miles Redeemed</span>
              <Gift className="h-4 w-4 text-purple-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-purple-600">{memberData.totalMilesRedeemed.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Total used for vouchers</p>
            </div>
          </CardContent>
        </Card>

        {/* Miles Expiring by End of Year */}
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleMetricClick("miles-expiring")}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Miles Expiring</span>
              <Clock className="h-4 w-4 text-red-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-red-600">{memberData.milesExpiringEndOfYear.toLocaleString()}</p>
              <p className="text-xs text-gray-500">By {memberData.expiringDate}</p>
            </div>
          </CardContent>
        </Card>

        {/* Current Tier (Based on Total Miles) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Member Status</span>
              <TierIcon className={`h-4 w-4 ${tierInfo.color}`} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className={`text-2xl font-bold ${tierInfo.color}`}>{memberData.currentTier}</p>
              <p className="text-xs text-gray-500">Current level</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Member Tier Progress */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span>Member Tier Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  <span className="text-sm text-gray-500">Silver</span>
                  <span className="text-xs text-gray-400">(0 miles)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <span className="text-sm font-medium text-yellow-600">Gold</span>
                  <span className="text-xs text-gray-400">(25,000 miles)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-gray-200 border-2 border-purple-300"></div>
                  <span className="text-sm text-gray-600">Platinum</span>
                  <span className="text-xs text-gray-400">(75,000 miles)</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{memberData.currentTierMiles.toLocaleString()} / {memberData.nextTierRequired.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Miles to {memberData.nextTier}</p>
              </div>
            </div>
            <Progress value={memberData.progressPercentage} className="h-3" />
            <p className="text-sm text-gray-600">
              You need {(memberData.nextTierRequired - memberData.currentTierMiles).toLocaleString()} more miles to reach {memberData.nextTier} status.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Miles Chart - Synchronized with exact totals */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <span>Miles Activity Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                  dataKey="earned" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  name="Miles Earned"
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
                  dataKey="expiring" 
                  stroke="#EF4444" 
                  strokeWidth={3}
                  name="Miles Expiring"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Add summary to verify totals */}
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500">Chart Total Earned</p>
                <p className="font-medium text-blue-600">
                  {milesChartData.reduce((sum, data) => sum + data.earned, 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Chart Total Redeemed</p>
                <p className="font-medium text-purple-600">
                  {milesChartData.reduce((sum, data) => sum + data.redeemed, 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Chart Total Expiring</p>
                <p className="font-medium text-red-600">
                  {milesChartData.reduce((sum, data) => sum + data.expiring, 0).toLocaleString()}
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

        {/* Recent Activity - Updated with real data */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-500" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Show latest approved requests */}
              {requests
                .filter(request => request.status === 'approved')
                .slice(0, 3)
                .map((request, index) => (
                  <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-1 bg-green-100 rounded-full">
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">+{request.calculatedMiles.toLocaleString()} Miles Earned</p>
                        <p className="text-xs text-gray-500">Flight {request.flightNumber}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {index === 0 ? '2 hours ago' : index === 1 ? '1 day ago' : '3 days ago'}
                    </span>
                  </div>
                ))}
              
              {/* Add a redemption activity */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-1 bg-purple-100 rounded-full">
                    <Gift className="h-3 w-3 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">-15,000 Miles Redeemed</p>
                    <p className="text-xs text-gray-500">Free ticket to Bangkok</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">5 days ago</span>
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