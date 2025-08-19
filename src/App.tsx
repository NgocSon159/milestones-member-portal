import { useState, useEffect } from "react";
import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { MyProfile } from "./components/pages/MyProfile";
import { MyFlights } from "./components/pages/MyFlights";
import { Notifications } from "./components/pages/Notifications";
import { RedeemVoucher } from "./components/pages/RedeemVoucher";
import { MyVouchers } from "./components/pages/MyVouchers";
import { History } from "./components/pages/History";
import { SupportChat } from "./components/pages/SupportChat";
import { RewardDetails } from "./components/pages/RewardDetails";
import { EarnMilesProvider } from "./components/EarnMilesContext";

interface PageParams {
  tab?: string;
  filter?: string;
  section?: string;
  [key: string]: string | undefined;
}

export default function App() {
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [pageParams, setPageParams] = useState<PageParams>({});
  const [showRegister, setShowRegister] = useState(false);
  const [memberName, setMemberName] = useState("JOHN");
  const [isInitializing, setIsInitializing] = useState(true);

  // Check for existing authentication on app initialization
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const storedPage = localStorage.getItem('currentPage');
      const storedParams = localStorage.getItem('pageParams');
      
      if (token) {
        try {
          // Validate token by making a test API call
          const response = await fetch('https://mileswise-be.onrender.com/api/member/my-flights?status=upcoming', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            // Token is valid, restore user session
            const userData = {
              email: localStorage.getItem('userEmail') || 'user@example.com',
              name: localStorage.getItem('userName') || 'User'
            };
            setUser(userData);
            
            // Restore current page and params
            if (storedPage) {
              setCurrentPage(storedPage);
            }
            if (storedParams) {
              try {
                setPageParams(JSON.parse(storedParams));
              } catch {
                setPageParams({});
              }
            }
          } else {
            // Token is invalid, clear localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('id');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userName');
            localStorage.removeItem('currentPage');
            localStorage.removeItem('pageParams');
          }
        } catch (error) {
          // Network error or other issues, clear localStorage
          console.error('Error validating token:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('id');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userName');
          localStorage.removeItem('currentPage');
          localStorage.removeItem('pageParams');
        }
      }
      
      setIsInitializing(false);
    };

    initializeAuth();
  }, []);

  const handleLoginSuccess = (userData: { email: string; name: string }) => {
    setUser(userData);
    // Store user data in localStorage for session persistence
    localStorage.setItem('userEmail', userData.email);
    localStorage.setItem('userName', userData.name);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage("dashboard");
    setPageParams({});
    setShowRegister(false);
    // Clear all localStorage data
    localStorage.removeItem('token');
    localStorage.removeItem('id');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('currentPage');
    localStorage.removeItem('pageParams');
  };

  const handlePageChange = (page: string, params?: PageParams) => {
    setCurrentPage(page);
    setPageParams(params || {});
    // Store current page state in localStorage for persistence
    localStorage.setItem('currentPage', page);
    localStorage.setItem('pageParams', JSON.stringify(params || {}));
  };

  const handleNameUpdate = (firstName: string) => {
    setMemberName(firstName.toUpperCase());
  };

  const renderPageContent = () => {
    if (!user) return null;

    switch (currentPage) {
      case "dashboard":
        return <Dashboard user={user} onPageChange={handlePageChange} />;
      case "profile":
        return <MyProfile user={user} onLogout={handleLogout} onNameUpdate={handleNameUpdate} />;
      case "flights":
        return <MyFlights onPageChange={handlePageChange} initialTab={pageParams.tab} initialFilter={pageParams.filter} />;
      case "notifications":
        return <Notifications user={user} memberName={memberName} />;
      case "redeem":
        return <RedeemVoucher user={user} section={pageParams.section} onPageChange={handlePageChange} />;
      case "my-vouchers":
        return <MyVouchers user={user} />;
      case "history":
        return <History />;
      case "support":
        return <SupportChat />;
      case "reward-details":
        return <RewardDetails onPageChange={handlePageChange} />;
      default:
        return <Dashboard user={user} onPageChange={handlePageChange} />;
    }
  };

  // Show loading screen during initialization
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (showRegister) {
      return (
        <RegisterForm
          onRegisterSuccess={handleLoginSuccess}
          onBackToLogin={() => setShowRegister(false)}
        />
      );
    }
    return (
      <LoginForm
        onLoginSuccess={handleLoginSuccess}
        onRegisterClick={() => setShowRegister(true)}
      />
    );
  }

  return (
    <EarnMilesProvider>
      <Layout
        user={user}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onLogout={handleLogout}
      >
        {renderPageContent()}
      </Layout>
    </EarnMilesProvider>
  );
}