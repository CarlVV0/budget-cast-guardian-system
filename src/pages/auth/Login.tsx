import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-sky-500 to-pink-400 px-4 text-white">
      
      {/* Logos Side by Side */}
      <div className="flex space-x-4 mb-4">
        <img src="/images/logo1.png" alt="Logo 1" className="h-20 w-20 rounded-full" />
        <img src="/images/logo2.png" alt="Logo 2" className="h-20 w-20 rounded-full" />
      </div>

      {/* System Name */}
      <h1 className="text-lg font-semibold mb-4">MDC-CAST BUDGET TRACKER SYSTEM FOR CAST STUDETS</h1>

      {/* Login Card */}
      <Card className="w-full max-w-md bg-white text-black shadow-lg">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-xl font-bold">Log in</CardTitle>
          <CardDescription>Enter your credentials below</CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Username</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "LOGIN"}
            </Button>
            <Button type="button" variant="outline" className="w-full" asChild>
              <Link to="/signup">SIGN UP</Link>
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
            {/* Forgot password? */}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
