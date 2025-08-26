import { ReactNode, useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset
} from "./ui/sidebar";
import { 
  Plane, 
  User, 
  Calendar, 
  Award,
  History,
  MessageCircle,
  Home,
  LogOut,
  Bell,
  Settings,
  Ticket
} from "lucide-react";
import { useEarnMiles } from "./EarnMilesContext";

interface LayoutProps {
  children: ReactNode;
  user: {
    email: string;
    name: string;
  };
  currentPage: string;
  onPageChange: (page: string, params?: any) => void;
  onLogout: () => void;
}

const navigationItems = [
  { key: "dashboard", label: "Dashboard", icon: Home },
  { key: "profile", label: "My Profile", icon: User },
  { key: "flights", label: "My Flights", icon: Calendar },
  { key: "redeem", label: "Redeem Voucher", icon: Award },
  { key: "my-vouchers", label: "My Vouchers", icon: Ticket },
  { key: "history", label: "History My Request", icon: History },
];

export function Layout({ children, user, currentPage, onPageChange, onLogout }: LayoutProps) {
  const { requests } = useEarnMiles();
  
  // Calculate unread notifications count (approved requests that are considered "new")
  const unreadNotifications = requests.filter(req => req.status === 'approved').length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar className="border-r border-gray-200">
          <SidebarHeader className="border-b border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Plane className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Member Portal</h2>
                <p className="text-sm text-gray-500">Aviation Miles</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = currentPage === item.key;
                    
                    return (
                      <SidebarMenuItem key={item.key}>
                        <SidebarMenuButton 
                          onClick={() => onPageChange(item.key)}
                          className={`w-full justify-start ${
                            isActive 
                              ? 'bg-blue-500 text-white hover:bg-blue-600' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <IconComponent className="h-4 w-4 mr-3" />
                          {item.label}
                          {item.key === 'notifications' && unreadNotifications > 0 && (
                            <Badge variant="destructive" className="ml-auto text-xs px-2 py-0">
                              {unreadNotifications}
                            </Badge>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* User Section */}
            <SidebarGroup className="mt-auto">
              <SidebarGroupLabel>Account</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <div className="p-3 border rounded-lg mx-2 mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={onLogout}
                      className="w-full justify-start text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Logout
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1">
          {/* Top Header */}
          <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {navigationItems.find(item => item.key === currentPage)?.label || "Dashboard"}
                  </h1>
                  <p className="text-sm text-gray-500">
                    Welcome back, {user.name}!
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onPageChange("notifications")}
                  className={`relative ${currentPage === "notifications" ? "bg-blue-100 text-blue-600" : ""}`}
                >
                  <Bell className="h-4 w-4" />
                  {unreadNotifications > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 text-xs px-1 py-0 min-w-[16px] h-4"
                    >
                      {unreadNotifications}
                    </Badge>
                  )}
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}