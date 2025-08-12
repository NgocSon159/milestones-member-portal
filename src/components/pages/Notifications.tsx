import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { useEarnMiles } from "../EarnMilesContext";
import { getMemberData } from "../shared/memberData";
import {
  Bell,
  CheckCircle,
  Clock,
  AlertCircle,
  Award,
  Plane,
  Calendar,
  TrendingUp,
  User,
  Star
} from "lucide-react";

interface NotificationsProps {
  user: { email: string; name: string };
  memberName?: string;
}

interface Notification {
  id: string;
  type: 'miles_credited' | 'account_update' | 'tier_promotion' | 'general' | 'voucher_expiry' | 'voucher_redeemed' | 'miles_to_voucher';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  relatedData?: any;
}

export function Notifications({ user, memberName = "JOHN" }: NotificationsProps) {
  const { requests } = useEarnMiles();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Get member data from shared function
  const memberData = getMemberData(requests);

  // Member account info synchronized with Dashboard
  const memberInfo = {
    name: `MR.${memberName}`,
    memberNumber: "920029843",
    tier: "Gold Member", // Match My Profile
    currentMiles: memberData.totalMilesEarned, // Same as Dashboard Total Miles
    expiringMiles: memberData.milesExpiringEndOfYear, // Same as Dashboard Expiring Miles
    expiryDate: "Dec 31, 2024",
    tierStatus: memberData.currentTier,
    nextTier: memberData.nextTier,
    nextTierMiles: memberData.nextTierRequired,
    milesNeeded: memberData.nextTierRequired - memberData.currentTierMiles // Same calculation as Dashboard
  };

  // Generate notifications from approved earn miles requests
  useEffect(() => {
    const approvedRequests = requests.filter(req => req.status === 'approved');
    
    const milesNotifications: Notification[] = approvedRequests.map(req => ({
      id: `notif_miles_${req.id}`,
      type: 'miles_credited',
      title: 'Miles Credited to Your Account',
      message: `${req.calculatedMiles.toLocaleString()} miles have been credited for flight ${req.flightNumber} (${req.from} → ${req.to.split(' - ')[0]}). Your request has been approved and processed.`,
      date: req.processedDate || req.submittedDate,
      isRead: false,
      relatedData: req
    }));

    // Sample other notifications including voucher-related
    const otherNotifications: Notification[] = [
      {
        id: 'notif_001',
        type: 'voucher_expiry',
        title: 'Voucher Expiring Soon!',
        message: 'Your Hotel Discount Voucher (Code: HOTEL25OFF) will expire in 12 days on August 24, 2024. Use it before it expires!',
        date: '2024-08-12',
        isRead: false
      },
      {
        id: 'notif_002',
        type: 'miles_to_voucher',
        title: 'Miles Successfully Converted',
        message: '5,000 miles have been converted to Hotel Discount Voucher (25% off). Your voucher code is HOTEL25OFF and is valid until August 24, 2024.',
        date: '2024-08-10',
        isRead: false
      },
      {
        id: 'notif_003',
        type: 'voucher_redeemed',
        title: 'Voucher Successfully Claimed',
        message: 'You have successfully claimed Car Rental Discount Voucher (20% off). Check your My Vouchers section for details.',
        date: '2024-08-08',
        isRead: true
      },
      {
        id: 'notif_004',
        type: 'tier_promotion',
        title: 'You\'re Close to Platinum Status!',
        message: `You need ${memberInfo.milesNeeded.toLocaleString()} more miles to reach ${memberInfo.nextTier} tier. Keep flying to unlock exclusive benefits!`,
        date: '2024-08-05',
        isRead: false
      },
      {
        id: 'notif_005',
        type: 'account_update',
        title: 'Miles Expiry Reminder',
        message: `${memberInfo.expiringMiles.toLocaleString()} miles will expire on ${memberInfo.expiryDate}. Use them before they expire!`,
        date: '2024-08-03',
        isRead: true
      },
      {
        id: 'notif_006',
        type: 'general',
        title: 'New Vouchers Available',
        message: 'Check out our latest voucher offerings in the Redeem section. Special discounts on hotels and car rentals!',
        date: '2024-08-01',
        isRead: true
      }
    ];

    setNotifications([...milesNotifications, ...otherNotifications].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
  }, [requests, memberInfo.milesNeeded, memberInfo.nextTier, memberInfo.expiringMiles, memberInfo.expiryDate]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'miles_credited':
        return <Award className="h-5 w-5 text-green-600" />;
      case 'tier_promotion':
        return <Star className="h-5 w-5 text-yellow-600" />;
      case 'account_update':
        return <Bell className="h-5 w-5 text-blue-600" />;
      case 'voucher_expiry':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case 'voucher_redeemed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'miles_to_voucher':
        return <Award className="h-5 w-5 text-purple-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Account Notifications</h1>
          <p className="text-gray-600 mt-1">
            Manage your account notifications and stay updated
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {unreadCount} unread
        </Badge>
      </div>

      {/* Member Account Summary */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 rounded-full">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{memberInfo.name}</h2>
                <p className="text-blue-100">
                  Member #{memberInfo.memberNumber} | {memberInfo.tier}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {memberInfo.currentMiles.toLocaleString()}
              </div>
              <p className="text-blue-100">Current Miles</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-5 w-5" />
                <span className="font-medium">Expiring Soon</span>
              </div>
              <div className="text-2xl font-bold text-orange-300">
                {memberInfo.expiringMiles.toLocaleString()}
              </div>
              <p className="text-sm text-blue-100">Expires: {memberInfo.expiryDate}</p>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="h-5 w-5" />
                <span className="font-medium">Current Status</span>
              </div>
              <div className="text-xl font-bold">{memberInfo.tierStatus}</div>
              <p className="text-sm text-blue-100">Next: {memberInfo.nextTier}</p>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5" />
                <span className="font-medium">To Next Tier</span>
              </div>
              <div className="text-xl font-bold">
                {memberInfo.milesNeeded.toLocaleString()}
              </div>
              <p className="text-sm text-blue-100">miles needed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Only - Removed Account Statement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Recent Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs px-2 py-0">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    notification.isRead 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{notification.title}</h4>
                          {!notification.isRead && (
                            <Badge variant="secondary" className="text-xs">New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(notification.date).toLocaleDateString()}</span>
                          </span>
                          {notification.relatedData?.flightNumber && (
                            <span className="flex items-center space-x-1">
                              <Plane className="h-3 w-3" />
                              <span>Flight {notification.relatedData.flightNumber}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {!notification.isRead && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-500">You're all caught up! Check back later for updates.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}