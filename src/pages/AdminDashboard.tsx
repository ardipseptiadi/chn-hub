/**
 * Admin Dashboard Page
 *
 * Analytics dashboard for admin users.
 * Displays product analytics and user activity metrics.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BarChart3, Users, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getAdminPassword } from "@/lib/store";
import ProductAnalyticsTab from "@/components/dashboard/ProductAnalyticsTab";
import UserActivityTab from "@/components/dashboard/UserActivityTab";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");

  // Check for existing admin session
  useState(() => {
    const session = localStorage.getItem("admin_session");
    if (session === "true") {
      setAuthenticated(true);
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === getAdminPassword()) {
      setAuthenticated(true);
      setError("");
      localStorage.setItem("admin_session", "true");
      toast({
        title: "Welcome to Admin Dashboard",
        description: "You can now view analytics and reports.",
      });
    } else {
      setError("Incorrect password");
      toast({
        title: "Authentication failed",
        description: "Please check your admin password.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    localStorage.removeItem("admin_session");
    toast({
      title: "Logged out",
      description: "You have been logged out of the admin dashboard.",
    });
  };

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-sm border-border">
          <CardContent className="p-6">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Lock className="text-primary" size={22} />
              </div>
              <h1 className="font-serif text-2xl text-foreground">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-muted-foreground">Enter admin password to continue</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => { setPasswordInput(e.target.value); setError(""); }}
                  className="mt-1"
                  placeholder="Enter password"
                  autoFocus
                />
                {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
              </div>
              <Button type="submit" className="w-full">Sign In</Button>
            </form>
            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/back-office-manage")}
                className="text-muted-foreground hover:text-foreground"
              >
                Go to Back Office
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Site
            </Button>
            <h1 className="font-serif text-xl text-foreground">
              Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/back-office-manage"
              className="text-sm text-primary hover:underline"
            >
              Back Office
            </a>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8 text-center">
            <h2 className="font-serif text-3xl text-foreground">Analytics Overview</h2>
            <p className="mt-2 text-muted-foreground">
              Monitor your platform performance and user engagement
            </p>
          </div>

          <Tabs defaultValue="products" className="space-y-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="products" className="gap-2">
                <BarChart3 size={16} />
                Products
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users size={16} />
                Users
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <ProductAnalyticsTab />
            </TabsContent>

            <TabsContent value="users">
              <UserActivityTab />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminDashboard;
