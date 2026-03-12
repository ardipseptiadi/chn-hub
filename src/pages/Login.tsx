/**
 * Login Page
 *
 * User authentication page with email/password login.
 * Backend API ready - swap localStorage calls with API requests in production.
 */

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  if (isAuthenticated) {
    const from = (location.state as { from?: string })?.from || "/portal";
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(email.trim(), password);

      if (success) {
        toast({
          title: "Welcome back!",
          description: "You've been logged in successfully.",
        });
        const from = (location.state as { from?: string })?.from || "/portal";
        navigate(from, { replace: true });
      } else {
        setError("Invalid email or password");
        toast({
          title: "Login failed",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      toast({
        title: "Login error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-border">
          <CardContent className="p-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
              >
                <Lock className="text-primary" size={28} />
              </motion.div>
              <h1 className="font-serif text-2xl text-foreground">Welcome Back</h1>
              <p className="mt-2 text-sm text-muted-foreground">Sign in to access your portal</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="your@email.com"
                    className="pl-10"
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full rounded-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
                {!isLoading && <ArrowRight size={16} className="ml-2" />}
              </Button>
            </form>

            {/* Footer Links */}
            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="font-medium text-primary hover:underline">
                  Create one
                </Link>
              </p>
              <div className="mt-4">
                <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  ← Back to home
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-xs text-muted-foreground"
        >
          <p>Demo mode: Register a new account or use your existing credentials.</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
