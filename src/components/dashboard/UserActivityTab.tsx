/**
 * User Activity Tab Component
 *
 * Admin dashboard for viewing user engagement metrics.
 * Displays active users, registrations, and activity timeline.
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  UserPlus,
  Activity,
  ShoppingBag,
  MessageSquare,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { useUsers, useAnalyticsEvents, getUserActivity, useOrders } from "@/lib/store";
import { format, subDays, startOfDay } from "date-fns";

type TimeRange = "7d" | "30d" | "90d" | "all";

const UserActivityTab = () => {
  const [users] = useUsers();
  const [events] = useAnalyticsEvents();
  const [orders] = useOrders();
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  // Filter events by time range
  const filteredEvents = useMemo(() => {
    if (timeRange === "all") return events;

    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const cutoff = subDays(new Date(), days);

    return events.filter((e) => new Date(e.timestamp) >= cutoff);
  }, [events, timeRange]);

  // Filter orders by time range
  const filteredOrders = useMemo(() => {
    if (timeRange === "all") return orders;

    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const cutoff = subDays(new Date(), days);

    return orders.filter((o) => new Date(o.createdAt) >= cutoff);
  }, [orders, timeRange]);

  // Calculate user activities
  const userActivities = useMemo(() => {
    return users.map((user) => {
      const userEvents = filteredEvents.filter((e) => e.userId === user.id);
      const userOrders = filteredOrders.filter((o) => o.userId === user.id && o.status === "completed");

      const lastActive = userEvents.length > 0
        ? userEvents[0].timestamp
        : user.createdAt;

      const totalSessions = new Set(
        userEvents.map((e) => e.timestamp.split("T")[0])
      ).size;

      const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0);

      return {
        user,
        totalEvents: userEvents.length,
        lastActive,
        totalSessions,
        totalPurchases: userOrders.length,
        totalSpent,
      };
    }).sort((a, b) => b.totalEvents - a.totalEvents);
  }, [users, filteredEvents, filteredOrders]);

  // Calculate totals
  const totals = useMemo(() => {
    return {
      totalUsers: users.length,
      activeUsers: userActivities.filter((a) => {
        const daysAgo = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
        const cutoff = subDays(new Date(), daysAgo);
        return new Date(a.lastActive) >= cutoff;
      }).length,
      newRegistrations: users.filter((u) => {
        const daysAgo = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
        const cutoff = subDays(new Date(), daysAgo);
        return new Date(u.createdAt) >= cutoff;
      }).length,
      totalPurchases: filteredOrders.filter((o) => o.status === "completed").length,
      totalRevenue: filteredOrders.filter((o) => o.status === "completed").reduce((sum, o) => sum + o.total, 0),
    };
  }, [users, userActivities, filteredOrders, timeRange]);

  // Daily registrations chart data
  const registrationData = useMemo(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const data: Array<{ date: string; registrations: number }> = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      const dateStr = format(date, "MMM dd");

      const count = users.filter((u) => {
        const createdDate = startOfDay(new Date(u.createdAt));
        return createdDate.getTime() === date.getTime();
      }).length;

      data.push({ date: dateStr, registrations: count });
    }

    return data;
  }, [users, timeRange]);

  // Activity by type
  const activityByType = useMemo(() => {
    const types: Record<string, number> = {
      view: 0,
      click: 0,
      purchase: 0,
      consultation_booking: 0,
    };

    filteredEvents.forEach((e) => {
      if (e.type in types) {
        types[e.type]++;
      }
    });

    return Object.entries(types).map(([type, count]) => ({
      type: type.split("_").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" "),
      count,
    }));
  }, [filteredEvents]);

  // Recent activity timeline
  const recentActivity = useMemo(() => {
    return filteredEvents.slice(0, 20).map((e) => {
      const user = users.find((u) => u.id === e.userId);
      return {
        ...e,
        userName: user?.name || "Unknown User",
        userEmail: user?.email || "",
      };
    });
  }, [filteredEvents, users]);

  // Top active users
  const topActiveUsers = userActivities.slice(0, 10);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "view":
        return <Activity size={14} />;
      case "click":
        return <Activity size={14} />;
      case "purchase":
        return <ShoppingBag size={14} />;
      case "consultation_booking":
        return <MessageSquare size={14} />;
      default:
        return <Activity size={14} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="font-serif text-xl text-foreground">User Activity</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor user engagement and platform activity
          </p>
        </div>
        <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
          <SelectTrigger className="w-[150px]">
            <Calendar size={16} className="mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground">{totals.totalUsers}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Users className="text-blue-500" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-green-600">{totals.activeUsers}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Activity className="text-green-500" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">New Registrations</p>
                <p className="text-2xl font-bold text-purple-600">{totals.newRegistrations}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <UserPlus className="text-purple-500" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-emerald-600">${totals.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="text-emerald-500" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Registrations Over Time */}
        <Card className="border-border">
          <CardContent className="p-6">
            <h3 className="font-medium text-foreground mb-4">User Registrations</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={registrationData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  className="text-xs text-muted-foreground"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis className="text-xs text-muted-foreground" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="registrations"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: "#8b5cf6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity by Type */}
        <Card className="border-border">
          <CardContent className="p-6">
            <h3 className="font-medium text-foreground mb-4">Activity by Type</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={activityByType}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="type"
                  className="text-xs text-muted-foreground"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis className="text-xs text-muted-foreground" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Active Users */}
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="text-primary" size={20} />
              <h3 className="font-medium text-foreground">Most Active Users</h3>
            </div>
            {topActiveUsers.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {topActiveUsers.map((activity, index) => (
                  <div
                    key={activity.user.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {activity.user.name}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{activity.totalSessions} sessions</span>
                        <span>•</span>
                        <span>{activity.totalPurchases} purchases</span>
                        <span>•</span>
                        <span className="text-green-600">${activity.totalSpent} spent</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No user activity data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Timeline */}
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="text-primary" size={20} />
              <h3 className="font-medium text-foreground">Recent Activity</h3>
            </div>
            {recentActivity.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{activity.userName}</span>
                        <span className="text-muted-foreground">
                          {" "}
                          {activity.type === "view" && "viewed a product"}
                          {activity.type === "click" && "clicked on a product"}
                          {activity.type === "purchase" && "made a purchase"}
                          {activity.type === "consultation_booking" && "booked a consultation"}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(activity.timestamp), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No recent activity to display
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default UserActivityTab;
