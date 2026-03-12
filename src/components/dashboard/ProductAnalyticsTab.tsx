/**
 * Product Analytics Tab Component
 *
 * Admin dashboard for viewing product performance metrics.
 * Displays views, clicks, purchases, revenue, and conversion rates.
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
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Eye,
  MousePointerClick,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Calendar,
  BarChart3,
} from "lucide-react";
import { useProducts, useAnalyticsEvents, getProductAnalytics, useUsers } from "@/lib/store";
import { format, subDays, startOfDay } from "date-fns";

type TimeRange = "7d" | "30d" | "90d" | "all";

const ProductAnalyticsTab = () => {
  const [products] = useProducts();
  const [events] = useAnalyticsEvents();
  const [users] = useUsers();
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [selectedProduct, setSelectedProduct] = useState<string>("all");

  // Filter events by time range
  const filteredEvents = useMemo(() => {
    if (timeRange === "all") return events;

    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const cutoff = subDays(new Date(), days);

    return events.filter((e) => new Date(e.timestamp) >= cutoff);
  }, [events, timeRange]);

  // Get analytics for all products
  const productAnalytics = useMemo(() => {
    return products
      .filter((p) => !p.disabled)
      .map((product) => {
        const productEvents = filteredEvents.filter((e) => e.productId === product.id);

        const views = productEvents.filter((e) => e.type === "view").length;
        const clicks = productEvents.filter((e) => e.type === "click").length;
        const purchases = productEvents.filter((e) => e.type === "purchase").length;

        const revenue = productEvents
          .filter((e) => e.type === "purchase")
          .reduce((sum, e) => sum + (Number(e.details?.price) || 0), 0);

        const conversionRate = views > 0 ? (purchases / views) * 100 : 0;

        return {
          product,
          views,
          clicks,
          purchases,
          revenue,
          conversionRate,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [products, filteredEvents]);

  // Filter by selected product
  const displayedAnalytics = selectedProduct === "all"
    ? productAnalytics
    : productAnalytics.filter((a) => a.product.id === selectedProduct);

  // Calculate totals
  const totals = useMemo(() => {
    return {
      views: displayedAnalytics.reduce((sum, a) => sum + a.views, 0),
      clicks: displayedAnalytics.reduce((sum, a) => sum + a.clicks, 0),
      purchases: displayedAnalytics.reduce((sum, a) => sum + a.purchases, 0),
      revenue: displayedAnalytics.reduce((sum, a) => sum + a.revenue, 0),
      conversionRate: displayedAnalytics.length > 0
        ? displayedAnalytics.reduce((sum, a) => sum + a.conversionRate, 0) / displayedAnalytics.length
        : 0,
    };
  }, [displayedAnalytics]);

  // Chart data - daily views/purchases over time
  const chartData = useMemo(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const data: Array<{ date: string; views: number; purchases: number; revenue: number }> = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      const dateStr = format(date, "MMM dd");

      const dayEvents = filteredEvents.filter((e) => {
        const eventDate = startOfDay(new Date(e.timestamp));
        return eventDate.getTime() === date.getTime();
      });

      const dayEventsFiltered = selectedProduct === "all"
        ? dayEvents
        : dayEvents.filter((e) => e.productId === selectedProduct);

      const views = dayEventsFiltered.filter((e) => e.type === "view").length;
      const purchases = dayEventsFiltered.filter((e) => e.type === "purchase").length;
      const revenue = dayEventsFiltered
        .filter((e) => e.type === "purchase")
        .reduce((sum, e) => sum + (Number(e.details?.price) || 0), 0);

      data.push({ date: dateStr, views, purchases, revenue });
    }

    return data;
  }, [filteredEvents, timeRange, selectedProduct]);

  // Category breakdown data
  const categoryData = useMemo(() => {
    const byCategory: Record<string, { views: number; revenue: number }> = {};

    displayedAnalytics.forEach((a) => {
      const cat = a.product.category;
      if (!byCategory[cat]) {
        byCategory[cat] = { views: 0, revenue: 0 };
      }
      byCategory[cat].views += a.views;
      byCategory[cat].revenue += a.revenue;
    });

    return Object.entries(byCategory).map(([category, data]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      views: data.views,
      revenue: data.revenue,
    }));
  }, [displayedAnalytics]);

  // Top performing products
  const topProducts = displayedAnalytics
    .slice(0, 5)
    .map((a) => ({
      id: a.product.id,
      title: a.product.title,
      views: a.views,
      revenue: a.revenue,
      conversionRate: a.conversionRate,
    }));

  const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="font-serif text-xl text-foreground">Product Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track product performance and customer engagement
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <SelectTrigger className="w-[120px]">
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
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {products.filter((p) => !p.disabled).map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5 mb-6">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold text-foreground">{totals.views.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Eye className="text-blue-500" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Clicks</p>
                <p className="text-2xl font-bold text-foreground">{totals.clicks.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <MousePointerClick className="text-purple-500" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Purchases</p>
                <p className="text-2xl font-bold text-foreground">{totals.purchases.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <ShoppingCart className="text-green-500" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold text-green-600">${totals.revenue.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="text-emerald-500" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Conversion</p>
                <p className="text-2xl font-bold text-primary">{totals.conversionRate.toFixed(1)}%</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="text-primary" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Views & Purchases Over Time */}
        <Card className="border-border">
          <CardContent className="p-6">
            <h3 className="font-medium text-foreground mb-4">Performance Over Time</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
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
                <Legend />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  name="Views"
                />
                <Line
                  type="monotone"
                  dataKey="purchases"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  name="Purchases"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Category */}
        <Card className="border-border">
          <CardContent className="p-6">
            <h3 className="font-medium text-foreground mb-4">Revenue by Category</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, revenue }) => `${category}: $${revenue.toFixed(0)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="text-primary" size={20} />
              <h3 className="font-medium text-foreground">Top Performing Products</h3>
            </div>
            {topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{product.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.views} views • {product.conversionRate.toFixed(1)}% conversion
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">${product.revenue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No product data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Performance Table */}
        <Card className="border-border">
          <CardContent className="p-6">
            <h3 className="font-medium text-foreground mb-4">All Products Performance</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {displayedAnalytics.length > 0 ? (
                displayedAnalytics.map((analytics) => (
                  <div
                    key={analytics.product.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {analytics.product.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye size={12} />
                          {analytics.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <ShoppingCart size={12} />
                          {analytics.purchases}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {analytics.product.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">
                        ${analytics.revenue.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {analytics.conversionRate.toFixed(1)}% conv.
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No analytics data available. Track some views and purchases first!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Help Text */}
      <Card className="border-border bg-muted/30 mt-6">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Tip:</strong> Analytics are tracked automatically when users view products, click on them, or make purchases.
            The data above is based on {timeRange === "all" ? "all recorded activity" : `the last ${timeRange.replace("d", " days")}`}.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProductAnalyticsTab;
