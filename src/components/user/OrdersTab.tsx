/**
 * Orders Tab Component
 *
 * Displays user's order/purchase history in the user portal.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingBag, Package, CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserOrders } from "@/lib/store";
import { format } from "date-fns";

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "bg-yellow-500/10 text-yellow-600",
    badge: "secondary",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    color: "bg-green-500/10 text-green-600",
    badge: "default",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "bg-red-500/10 text-red-600",
    badge: "destructive",
  },
  refunded: {
    label: "Refunded",
    icon: FileText,
    color: "bg-gray-500/10 text-gray-600",
    badge: "outline",
  },
} as const;

type OrderStatus = keyof typeof statusConfig;

const OrdersTab = () => {
  const { user } = useAuth();
  const orders = useUserOrders(user?.id || "");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filter orders by status
  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "all") return true;
    return order.status === statusFilter;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-border">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="font-serif text-xl text-foreground">Order History</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {orders.length} {orders.length === 1 ? "order" : "orders"} total
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Filter:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length > 0 ? (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Order ID</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const config = statusConfig[order.status as OrderStatus];
                    const StatusIcon = config.icon;

                    return (
                      <TableRow key={order.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">
                          #{order.id.slice(-8).toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package size={16} className="text-muted-foreground" />
                            <span className="text-sm">
                              {order.items.length} {order.items.length === 1 ? "item" : "items"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(order.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          ${order.total.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={config.badge === "default" ? "default" : config.badge === "outline" ? "outline" : config.badge === "destructive" ? "destructive" : "secondary"} className="gap-1.5">
                            <StatusIcon size={12} />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-16 text-center">
              <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground/30" size={64} />
              <h3 className="mt-4 font-serif text-lg text-foreground">No orders found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {statusFilter === "all"
                  ? "You haven't placed any orders yet."
                  : `No ${statusFilter} orders found.`}
              </p>
              {statusFilter === "all" && (
                <Button className="mt-6 rounded-full" asChild>
                  <a href="/products">Browse Products</a>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OrdersTab;
