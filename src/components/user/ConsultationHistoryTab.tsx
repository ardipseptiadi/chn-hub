/**
 * Consultation History Tab Component
 *
 * Displays user's consultation bookings with filtering and search.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Search, Calendar, Clock, Video, FileText, Music, Eye, Filter } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserConsultationBookings } from "@/lib/store";
import { format, isAfter } from "date-fns";

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-yellow-500/10 text-yellow-600",
    badge: "secondary",
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-green-500/10 text-green-600",
    badge: "default",
  },
  completed: {
    label: "Completed",
    color: "bg-blue-500/10 text-blue-600",
    badge: "outline",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-500/10 text-red-600",
    badge: "destructive",
  },
} as const;

const paymentStatusConfig = {
  pending: { label: "Pending", color: "text-yellow-600" },
  paid: { label: "Paid", color: "text-green-600" },
  refunded: { label: "Refunded", color: "text-red-600" },
} as const;

const artifactIcons = {
  video: { icon: Video, color: "text-purple-500" },
  pdf: { icon: FileText, color: "text-red-500" },
  note: { icon: FileText, color: "text-blue-500" },
  audio: { icon: Music, color: "text-green-500" },
} as const;

type BookingStatus = keyof typeof statusConfig;
type PaymentStatus = keyof typeof paymentStatusConfig;

const ConsultationHistoryTab = () => {
  const { user } = useAuth();
  const bookings = useUserConsultationBookings(user?.id || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<(typeof bookings)[0] | null>(null);

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      searchQuery === "" ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.productId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort by date (newest first)
  const sortedBookings = [...filteredBookings].sort(
    (a, b) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime()
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-border">
        <CardContent className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="font-serif text-xl text-foreground">Consultation History</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {bookings.length} {bookings.length === 1 ? "consultation" : "consultations"} booked
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search consultations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-3">
              <Filter size={16} className="text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bookings List */}
          {sortedBookings.length > 0 ? (
            <div className="space-y-4">
              {sortedBookings.map((booking, index) => {
                const statusInfo = statusConfig[booking.status as BookingStatus];
                const paymentInfo = paymentStatusConfig[booking.paymentStatus as PaymentStatus];
                const isUpcoming = isAfter(new Date(booking.scheduledTime), new Date());

                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group rounded-lg border border-border p-4 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 flex-shrink-0">
                        <MessageSquare className="text-purple-500" size={24} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                              Consultation #{booking.id.slice(-8).toUpperCase()}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              Product ID: {booking.productId.slice(-8).toUpperCase()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={statusInfo.badge === "default" ? "default" : statusInfo.badge === "outline" ? "outline" : statusInfo.badge === "destructive" ? "destructive" : "secondary"}>
                              {statusInfo.label}
                            </Badge>
                            <Badge variant="outline" className={paymentInfo.color}>
                              {paymentInfo.label}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            <span>{format(new Date(booking.scheduledTime), "MMM d, yyyy")}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock size={14} />
                            <span>{format(new Date(booking.scheduledTime), "h:mm a")}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span>{booking.duration} min</span>
                          </div>
                        </div>

                        {/* Notes preview */}
                        {booking.notes && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                            {booking.notes}
                          </p>
                        )}

                        {/* Artifacts indicator */}
                        {booking.artifacts && booking.artifacts.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                            <FileText size={12} />
                            <span>{booking.artifacts.length} {booking.artifacts.length === 1 ? "artifact" : "artifacts"} available</span>
                          </div>
                        )}
                      </div>

                      {/* View Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBooking(booking);
                        }}
                      >
                        <Eye size={16} />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center">
              <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground/30" size={64} />
              <h3 className="mt-4 font-serif text-lg text-foreground">No consultations found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "No consultations match your filters."
                  : "You haven't booked any consultations yet."}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button className="mt-6 rounded-full" asChild>
                  <a href="/consultations">Browse Consultations</a>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Detail Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        {selectedBooking && (
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">
                Consultation #{selectedBooking.id.slice(-8).toUpperCase()}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* Booking Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Date & Time</p>
                  <p className="font-medium text-foreground">
                    {format(new Date(selectedBooking.scheduledTime), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Duration</p>
                  <p className="font-medium text-foreground">{selectedBooking.duration} minutes</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p>
                  <Badge variant={selectedBooking.status === "confirmed" ? "default" : selectedBooking.status === "completed" ? "outline" : selectedBooking.status === "cancelled" ? "destructive" : "secondary"} className="mt-1">
                    {statusConfig[selectedBooking.status as BookingStatus].label}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Payment</p>
                  <Badge variant="outline" className={paymentStatusConfig[selectedBooking.paymentStatus as PaymentStatus].color + " mt-1"}>
                    {paymentStatusConfig[selectedBooking.paymentStatus as PaymentStatus].label}
                  </Badge>
                </div>
              </div>

              {/* Product Info */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Product</p>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm font-medium text-foreground">{selectedBooking.productId}</p>
                </div>
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Notes</p>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{selectedBooking.notes}</p>
                  </div>
                </div>
              )}

              {/* Artifacts */}
              {selectedBooking.artifacts && selectedBooking.artifacts.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
                    Artifacts ({selectedBooking.artifacts.length})
                  </p>
                  <ScrollArea className="h-40 rounded-lg border border-border">
                    <div className="p-4 space-y-2">
                      {selectedBooking.artifacts.map((artifact) => {
                        const artifactIcon = artifactIcons[artifact.type as keyof typeof artifactIcons];
                        const ArtifactIcon = artifactIcon.icon;
                        return (
                          <div
                            key={artifact.id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-card hover:bg-muted transition-colors cursor-pointer"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                              <ArtifactIcon className={artifactIcon.color} size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{artifact.title}</p>
                              <p className="text-xs text-muted-foreground uppercase">{artifact.type}</p>
                            </div>
                            <Button variant="ghost" size="sm">
                              Open
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </motion.div>
  );
};

export default ConsultationHistoryTab;
