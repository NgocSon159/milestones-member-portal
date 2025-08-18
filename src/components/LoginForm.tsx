import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Plane, Mail, Lock, Eye, EyeOff, UserPlus, LogIn, AlertCircle } from "lucide-react";

interface LoginFormProps {
  onLoginSuccess: (user: { email: string; name: string }) => void;
  onRegisterClick?: () => void;
}

export function LoginForm({ onLoginSuccess, onRegisterClick }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Valid credentials
  const VALID_EMAIL = "member01@gmail.com";
  const VALID_PASSWORD = "Aa12345!";

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      // Login successful
      onLoginSuccess({
        email: email,
        name: "MR.JOHN"
      });
    } else {
      // Login failed
      setError("Invalid email or password. Please try again.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-lg">
        {/* Header */}
        <CardHeader className="bg-blue-500 text-white rounded-t-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <Plane className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">Member Portal</h1>
          <p className="text-blue-100 text-sm">
            Welcome back! Please sign in to your account
          </p>
        </CardHeader>

        <CardContent className="p-8">
          <form onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2 mb-6">
              <Label htmlFor="email" className="text-gray-700">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2 mb-4">
              <Label htmlFor="password" className="text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right mb-6">
              <a
                href="#"
                className="text-blue-500 hover:text-blue-600 text-sm font-medium"
              >
                Forgot Password?
              </a>
            </div>

            {/* Sign In Button */}
            <Button 
              type="submit"
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium mb-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700 font-medium mb-1">Demo Credentials:</p>
            <p className="text-xs text-blue-600">Email: member01@gmail.com</p>
            <p className="text-xs text-blue-600">Password: Aa12345!</p>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">or</span>
            </div>
          </div>

          {/* Register Section */}
          <div className="text-center mb-6">
            <p className="text-gray-600 text-sm mb-4">Don't have an account?</p>
            <Button
              variant="outline"
              className="w-full h-12 border-blue-500 text-blue-500 hover:bg-blue-50 font-medium"
              onClick={onRegisterClick}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Register Now!
            </Button>
          </div>

          {/* Footer Links */}
          <div className="flex justify-center space-x-6 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-700">
              Terms of Service
            </a>
            <span>•</span>
            <a href="#" className="hover:text-gray-700">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="#" className="hover:text-gray-700">
              Help
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}