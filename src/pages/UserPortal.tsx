/**
 * User Portal Page
 *
 * Main user dashboard with tabs for orders, schedules, and consultations.
 * Protected route - requires authentication.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User as UserIcon,
  ShoppingBag,
  Calendar,
  MessageSquare,
  LogOut,
  Settings,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserOrders, useUserSchedules, useUserConsultationBookings } from "@/lib/store";
import OrdersTab from "@/components/user/OrdersTab";
import SchedulesTab from "@/components/user/SchedulesTab";
import ConsultationHistoryTab from "@/components/user/ConsultationHistoryTab";

const UserPortal = () => {
  const { user, logout } = useAuth();
  const orders = useUserOrders(user?.id || "");
  const schedules = useUserSchedules(user?.id || "");
  const consultationBookings = useUserConsultationBookings(user?.id || "");

  // Calculate stats
  const activeOrders = orders.filter((o) => o.status === "pending" || o.status === "completed").length;
  const upcomingSchedules = schedules.filter(
    (s) => s.status === "scheduled" && new Date(s.dateTime) > new Date()
  ).length;
  const upcomingConsultations = consultationBookings.filter(
    (b) => b.status === "confirmed" && new Date(b.scheduledTime) > new Date()
  ).length;

  if (!user) {
    return null; // Should be handled by ProtectedRoute
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="font-serif text-xl text-foreground">
                {user.name.split(" ")[0]}'s Portal
              </Link>
              <Badge variant="secondary" className="capitalize">
                {user.role}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">← Back to Site</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-serif text-3xl text-foreground md:text-4xl">
            Welcome back, {user.name.split(" ")[0]}!
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your orders, schedules, and consultations all in one place.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <ShoppingBag className="text-primary" size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{orders.length}</p>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                    <Calendar className="text-blue-500" size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{upcomingSchedules}</p>
                    <p className="text-sm text-muted-foreground">Upcoming Meetings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
                    <MessageSquare className="text-purple-500" size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{upcomingConsultations}</p>
                    <p className="text-sm text-muted-foreground">Consultations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                    <UserIcon className="text-green-500" size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {new Date().toLocaleDateString("en-US", { month: "short" })}
                    </p>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingBag size={16} />
              Orders
            </TabsTrigger>
            <TabsTrigger value="schedules" className="gap-2">
              <Calendar size={16} />
              Schedules
            </TabsTrigger>
            <TabsTrigger value="consultations" className="gap-2">
              <MessageSquare size={16} />
              Consultations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <OrdersTab />
          </TabsContent>

          <TabsContent value="schedules">
            <SchedulesTab />
          </TabsContent>

          <TabsContent value="consultations">
            <ConsultationHistoryTab />
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="border-border bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-6">
              <h3 className="font-serif text-lg text-foreground mb-4">Quick Actions</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/products">
                    <ShoppingBag size={16} className="mr-2" />
                    Browse Products
                    <ChevronRight size={14} className="ml-auto" />
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/consultations">
                    <MessageSquare size={16} className="mr-2" />
                    Book Consultation
                    <ChevronRight size={14} className="ml-auto" />
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/contact">
                    <MessageSquare size={16} className="mr-2" />
                    Contact Support
                    <ChevronRight size={14} className="ml-auto" />
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/portal/settings">
                    <Settings size={16} className="mr-2" />
                    Account Settings
                    <ChevronRight size={14} className="ml-auto" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default UserPortal;
