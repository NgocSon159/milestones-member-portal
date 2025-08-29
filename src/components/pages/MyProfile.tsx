import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { toast } from "sonner";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Award,
  Edit,
  Save,
  X,
  LogOut,
  Lock,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";

interface MyProfileProps {
  user: {
    email: string;
    name: string;
  };
  onLogout?: () => void;
  onNameUpdate?: (firstName: string, lastName: string) => void;
}

export function MyProfile({ user, onLogout, onNameUpdate }: MyProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: user.email,
    phone: "",
    address: "",
    city: "",
    country: "",
    dateOfBirth: "",
    memberSince: "",
    tier: "",
    memberNumber: ""
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found. Please log in.");
        if (onLogout) {
          onLogout();
        }
        return;
      }

      try {
        const response = await fetch("https://mileswise-be.onrender.com/api/member/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProfileData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || user.email,
            phone: data.phoneNumber || "",
            address: data.streetAddress || "",
            city: data.city || "",
            country: data.country || "",
            dateOfBirth: data.dob ? new Date(data.dob).toISOString().split('T')[0] : "",
            memberSince: data.createdAt ? new Date(data.createdAt).toISOString().split('T')[0] : "",
            tier: data.memberships && data.memberships.length > 0 ? data.memberships[0].name : "Standard",
            memberNumber: data.customerNumber || "N/A"
          });
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || "Failed to fetch profile data.");
          if (response.status === 401 && onLogout) { // Unauthorized
            onLogout();
          }
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error("An unexpected error occurred while fetching profile data.");
      }
    };

    fetchProfileData();
  }, [user.email, onLogout]);

  const handleSave = () => {
    setIsEditing(false);
    // Update the name in notifications and other components
    if (onNameUpdate) {
      onNameUpdate(profileData.firstName, profileData.lastName);
    }
    toast.success("Profile updated successfully!");
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data if needed
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    if (onLogout) {
      onLogout();
    }
  };

  const handleChangePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    // Validate current password (check against the demo password)
    if (passwordData.currentPassword !== "Aa12345!") {
      toast.error("Current password is incorrect");
      return;
    }

    // Mock password change
    toast.success("Password changed successfully!");
    setShowChangePasswordDialog(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText !== "DELETE") {
      toast.error("Please type 'DELETE' to confirm account deletion");
      return;
    }

    // Mock account deletion
    toast.success("Account deletion request submitted. You will receive a confirmation email.");
    setShowDeleteAccountDialog(false);
    setDeleteConfirmText("");
    
    // Optionally logout the user after account deletion request
    setTimeout(() => {
      handleLogout();
    }, 2000);
  };

  const resetPasswordDialog = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const resetDeleteDialog = () => {
    setDeleteConfirmText("");
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="bg-blue-500 text-white text-xl">
                  {profileData.firstName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  MR.{profileData.firstName.toUpperCase()}
                </h2>
                <p className="text-gray-600">{profileData.email}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                    <Award className="h-3 w-3 mr-1" />
                    {profileData.tier} Member
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Member since {profileData.memberSince ? new Date(profileData.memberSince).toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    }) : "N/A"}
                  </span>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
            >
              {isEditing ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Personal Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!isEditing}
                  className={`pl-10 ${!isEditing ? "bg-gray-50" : ""}`}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!isEditing}
                  className={`pl-10 ${!isEditing ? "bg-gray-50" : ""}`}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  disabled={!isEditing}
                  className={`pl-10 ${!isEditing ? "bg-gray-50" : ""}`}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Address Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={profileData.address}
                onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                disabled={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={profileData.city}
                  onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={profileData.country}
                  onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Membership Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Membership Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Member Number</Label>
              <div className="p-3 bg-gray-50 rounded-lg font-mono text-sm">
                {profileData.memberNumber}
              </div>
            </div>

            <div>
              <Label>Current Tier</Label>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Badge className="bg-yellow-100 text-yellow-700">
                  <Award className="h-3 w-3 mr-1" />
                  {profileData.tier} Member
                </Badge>
              </div>
            </div>

            <div>
              <Label>Member Since</Label>
              <div className="p-3 bg-gray-50 rounded-lg">
                {profileData.memberSince ? new Date(profileData.memberSince).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : "N/A"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Changes Button */}
      {isEditing && (
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      )}

      {/* Change Password Dialog */}
      <Dialog open={showChangePasswordDialog} onOpenChange={(open) => {
        setShowChangePasswordDialog(open);
        if (!open) resetPasswordDialog();
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-blue-600" />
              <span>Change Password</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter your current password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter your new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm your new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              <p>Password requirements:</p>
              <ul className="list-disc list-inside mt-1">
                <li>At least 6 characters long</li>
                <li>Must contain letters and numbers</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowChangePasswordDialog(false);
                resetPasswordDialog();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleChangePassword}>
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteAccountDialog} onOpenChange={(open) => {
        setShowDeleteAccountDialog(open);
        if (!open) resetDeleteDialog();
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              <span>Delete Account</span>
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  This action cannot be undone. This will permanently delete your account and remove all of your data from our servers.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600 font-medium">
                    Warning: You will lose access to:
                  </p>
                  <ul className="text-sm text-red-600 mt-2 list-disc list-inside">
                    <li>Your miles and rewards</li>
                    <li>Flight history and bookings</li>
                    <li>Member benefits and tier status</li>
                    <li>All personal data and preferences</li>
                  </ul>
                </div>
                <div>
                  <Label htmlFor="delete-confirm">
                    Type <strong>DELETE</strong> to confirm:
                  </Label>
                  <Input
                    id="delete-confirm"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    className="mt-1"
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={resetDeleteDialog}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteConfirmText !== "DELETE"}
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
