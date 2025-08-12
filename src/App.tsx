import { useState } from "react";
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
import { EarnMilesProvider } from "./components/EarnMilesContext";

export default function App() {
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [pageParams, setPageParams] = useState<any>({});
  const [showRegister, setShowRegister] = useState(false);
  const [memberName, setMemberName] = useState("JOHN");

  const handleLoginSuccess = (userData: { email: string; name: string }) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage("dashboard");
    setPageParams({});
    setShowRegister(false);
  };

  const handlePageChange = (page: string, params?: any) => {
    setCurrentPage(page);
    setPageParams(params || {});
  };

  const handleNameUpdate = (firstName: string, lastName: string) => {
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
        return <RedeemVoucher user={user} section={pageParams.section} />;
      case "my-vouchers":
        return <MyVouchers user={user} />;
      case "history":
        return <History />;
      case "support":
        return <SupportChat />;
      default:
        return <Dashboard user={user} onPageChange={handlePageChange} />;
    }
  };

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