/**
 * Register Page
 *
 * User registration page with email, password, and name fields.
 * Backend API ready - swap localStorage calls with API requests in production.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Lock, ArrowRight, Eye, EyeOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

// Password strength indicator
function checkPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (password.length === 0) return { score: 0, label: "", color: "bg-muted" };
  if (password.length < 6) return { score: 1, label: "Weak", color: "bg-destructive" };
  if (password.length < 10) return { score: 2, label: "Fair", color: "bg-orange-500" };
  if (password.length < 12) return { score: 3, label: "Good", color: "bg-yellow-500" };
  return { score: 4, label: "Strong", color: "bg-green-500" };
}

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate("/portal", { replace: true });
    return null;
  }

  const passwordStrength = checkPasswordStrength(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;
  const isFormValid =
    name.trim().length >= 2 &&
    email.trim().includes("@") &&
    password.length >= 6 &&
    passwordsMatch &&
    agreedToTerms;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isFormValid) {
      if (!agreedToTerms) {
        setError("Please agree to the terms and conditions");
      } else {
        setError("Please fill in all fields correctly");
      }
      return;
    }

    setIsLoading(true);

    try {
      const success = await register(email.trim(), password, name.trim());

      if (success) {
        toast({
          title: "Account created!",
          description: "Welcome to your portal. Let's get started!",
        });
        navigate("/portal");
      } else {
        setError("An account with this email already exists");
        toast({
          title: "Registration failed",
          description: "Please try a different email address.",
          variant: "destructive",
        });
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      toast({
        title: "Registration error",
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
            <div className="mb-6 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
              >
                <User className="text-primary" size={28} />
              </motion.div>
              <h1 className="font-serif text-2xl text-foreground">Create Account</h1>
              <p className="mt-2 text-sm text-muted-foreground">Join our community today</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <Label htmlFor="name">Full Name</Label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(""); }}
                    placeholder="John Doe"
                    className="pl-10"
                    autoComplete="name"
                    disabled={isLoading}
                  />
                </div>
              </div>

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
                    placeholder="Create a password"
                    className="pl-10 pr-10"
                    autoComplete="new-password"
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
                {/* Password Strength */}
                {password.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            level <= passwordStrength.score ? passwordStrength.color : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{passwordStrength.label}</span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                    placeholder="Confirm your password"
                    className="pl-10 pr-10"
                    autoComplete="new-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {/* Match indicator */}
                {confirmPassword.length > 0 && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                    {passwordsMatch ? (
                      <>
                        <Check size={14} className="text-green-500" />
                        <span className="text-green-600">Passwords match</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Passwords do not match</span>
                    )}
                  </div>
                )}
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => { setAgreedToTerms(e.target.checked); setError(""); }}
                  disabled={isLoading}
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground cursor-pointer">
                  I agree to the{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>
                  {" "}and{" "}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
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
                disabled={isLoading || !isFormValid}
              >
                {isLoading ? "Creating account..." : "Create Account"}
                {!isLoading && <ArrowRight size={16} className="ml-2" />}
              </Button>
            </form>

            {/* Footer Links */}
            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-primary hover:underline">
                  Sign in
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
      </motion.div>
    </div>
  );
};

export default Register;
