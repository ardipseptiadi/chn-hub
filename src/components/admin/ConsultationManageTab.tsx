/**
 * Consultation Management Tab Component
 *
 * Admin interface for managing consultation bookings.
 * View all bookings, update status, add notes and artifacts.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Search,
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Music,
  Video,
  Plus,
  Trash2,
  Save,
} from "lucide-react";
import { useConsultationBookings, useAvailabilitySlots } from "@/lib/store";
import { format, isAfter } from "date-fns";
import { consultationProducts } from "@/data/consultations";

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-yellow-500/10 text-yellow-600",
    icon: AlertCircle,
    badge: "secondary" as const,
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-green-500/10 text-green-600",
    icon: CheckCircle,
    badge: "default" as const,
  },
  completed: {
    label: "Completed",
    color: "bg-blue-500/10 text-blue-600",
    icon: CheckCircle,
    badge: "outline" as const,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-500/10 text-red-600",
    icon: XCircle,
    badge: "destructive" as const,
  },
};

const paymentStatusConfig = {
  pending: { label: "Pending", color: "text-yellow-600" },
  paid: { label: "Paid", color: "text-green-600" },
  refunded: { label: "Refunded", color: "text-red-600" },
};

const artifactIcons = {
  video: { icon: Video, color: "text-purple-500" },
  pdf: { icon: FileText, color: "text-red-500" },
  note: { icon: FileText, color: "text-blue-500" },
  audio: { icon: Music, color: "text-green-500" },
};

type BookingStatus = keyof typeof statusConfig;
type PaymentStatus = keyof typeof paymentStatusConfig;
type ArtifactType = keyof typeof artifactIcons;

const ConsultationManageTab = () => {
  const [bookings, setBookings] = useConsultationBookings();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<(typeof bookings)[0] | null>(null);
  const [editingNotes, setEditingNotes] = useState("");
  const [editingStatus, setEditingStatus] = useState<BookingStatus | "">("");
  const [editingPaymentStatus, setEditingPaymentStatus] = useState<PaymentStatus | "">("");
  const [newArtifactTitle, setNewArtifactTitle] = useState("");
  const [newArtifactType, setNewArtifactType] = useState<ArtifactType>("note");
  const [newArtifactUrl, setNewArtifactUrl] = useState("");

  // Get consultation details
  const getConsultationDetails = (productId: string) => {
    return consultationProducts.find((c) => c.id === productId);
  };

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      searchQuery === "" ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.productId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort by date (newest first)
  const sortedBookings = [...filteredBookings].sort(
    (a, b) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime()
  );

  const handleOpenBooking = (booking: (typeof bookings)[0]) => {
    setSelectedBooking(booking);
    setEditingNotes(booking.notes || "");
    setEditingStatus(booking.status);
    setEditingPaymentStatus(booking.paymentStatus);
  };

  const handleSaveChanges = () => {
    if (!selectedBooking) return;

    setBookings((prev) =>
      prev.map((b) =>
        b.id === selectedBooking.id
          ? {
              ...b,
              status: editingStatus as BookingStatus,
              paymentStatus: editingPaymentStatus as PaymentStatus,
              notes: editingNotes.trim(),
              updatedAt: new Date().toISOString(),
            }
          : b
      )
    );

    setSelectedBooking(null);
  };

  const handleAddArtifact = () => {
    if (!selectedBooking || !newArtifactTitle.trim() || !newArtifactUrl.trim()) return;

    const newArtifact = {
      id: crypto.randomUUID(),
      type: newArtifactType,
      title: newArtifactTitle.trim(),
      url: newArtifactUrl.trim(),
      uploadedAt: new Date().toISOString(),
    };

    setBookings((prev) =>
      prev.map((b) =>
        b.id === selectedBooking.id
          ? {
              ...b,
              artifacts: [...(b.artifacts || []), newArtifact],
              updatedAt: new Date().toISOString(),
            }
          : b
      )
    );

    setNewArtifactTitle("");
    setNewArtifactUrl("");
    setNewArtifactType("note");
  };

  const handleRemoveArtifact = (artifactId: string) => {
    if (!selectedBooking) return;

    setBookings((prev) =>
      prev.map((b) =>
        b.id === selectedBooking.id
          ? {
              ...b,
              artifacts: b.artifacts?.filter((a) => a.id !== artifactId) || [],
              updatedAt: new Date().toISOString(),
            }
          : b
      )
    );
  };

  // Stats
  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    upcoming: bookings.filter((b) => isAfter(new Date(b.scheduledTime), new Date())).length,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5 mb-6">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Bookings</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
            <div className="text-xs text-muted-foreground">Confirmed</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.upcoming}</div>
            <div className="text-xs text-muted-foreground">Upcoming</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardContent className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="font-serif text-xl text-foreground">Consultation Bookings</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage all consultation bookings and their statuses
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bookings Table */}
          {sortedBookings.length > 0 ? (
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Booking ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Consultation</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedBookings.map((booking) => {
                      const statusInfo = statusConfig[booking.status as BookingStatus];
                      const StatusIcon = statusInfo.icon;
                      const paymentInfo = paymentStatusConfig[booking.paymentStatus as PaymentStatus];
                      const consultation = getConsultationDetails(booking.productId);

                      return (
                        <TableRow key={booking.id} className="hover:bg-muted/30">
                          <TableCell className="font-mono text-sm">
                            {booking.id.slice(-8).toUpperCase()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <User size={14} className="text-primary" />
                              </div>
                              <span className="text-sm">{booking.userId.slice(-8).toUpperCase()}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {consultation ? (
                              <div>
                                <p className="text-sm font-medium text-foreground">{consultation.title}</p>
                                <p className="text-xs text-muted-foreground">{booking.duration} min</p>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">{booking.productId.slice(-8).toUpperCase()}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar size={14} className="text-muted-foreground" />
                              <span>{format(new Date(booking.scheduledTime), "MMM d, yyyy")}</span>
                              <Clock size={14} className="text-muted-foreground ml-2" />
                              <span>{format(new Date(booking.scheduledTime), "h:mm a")}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={booking.status === "confirmed" ? "default" : booking.status === "completed" ? "outline" : booking.status === "cancelled" ? "destructive" : "secondary"} className="gap-1">
                              <StatusIcon size={12} />
                              {statusInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={paymentInfo.color}>
                              {paymentInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenBooking(booking)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center">
              <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground/30" size={64} />
              <h3 className="mt-4 font-serif text-lg text-foreground">No bookings found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "No bookings match your filters."
                  : "No consultation bookings yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Detail Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        {selectedBooking && (
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">
                Booking #{selectedBooking.id.slice(-8).toUpperCase()}
              </DialogTitle>
              <DialogDescription>
                View and manage booking details, status, and artifacts
              </DialogDescription>
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
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">User ID</p>
                  <p className="font-medium text-foreground">{selectedBooking.userId.slice(-8).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Created</p>
                  <p className="font-medium text-foreground">
                    {format(new Date(selectedBooking.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
              </div>

              {/* Status Controls */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={editingStatus} onValueChange={(v) => setEditingStatus(v as BookingStatus)}>
                    <SelectTrigger id="status" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="payment">Payment Status</Label>
                  <Select value={editingPaymentStatus} onValueChange={(v) => setEditingPaymentStatus(v as PaymentStatus)}>
                    <SelectTrigger id="payment" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Admin Notes</Label>
                <Textarea
                  id="notes"
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="Add notes about this booking..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              {/* Artifacts */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Artifacts ({selectedBooking.artifacts?.length || 0})
                  </p>
                </div>

                {selectedBooking.artifacts && selectedBooking.artifacts.length > 0 ? (
                  <ScrollArea className="h-32 rounded-lg border border-border">
                    <div className="p-3 space-y-2">
                      {selectedBooking.artifacts.map((artifact) => {
                        const artifactIcon = artifactIcons[artifact.type as ArtifactType];
                        const ArtifactIcon = artifactIcon.icon;
                        return (
                          <div
                            key={artifact.id}
                            className="flex items-center gap-3 p-2 rounded-lg bg-muted"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background">
                              <ArtifactIcon className={artifactIcon.color} size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{artifact.title}</p>
                              <p className="text-xs text-muted-foreground uppercase">{artifact.type}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveArtifact(artifact.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-6 text-sm text-muted-foreground rounded-lg border border-dashed border-border">
                    No artifacts added yet
                  </div>
                )}

                {/* Add Artifact Form */}
                <div className="mt-3 p-3 rounded-lg bg-muted/50 space-y-3">
                  <p className="text-xs font-medium text-foreground">Add New Artifact</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Artifact title"
                      value={newArtifactTitle}
                      onChange={(e) => setNewArtifactTitle(e.target.value)}
                    />
                    <Select value={newArtifactType} onValueChange={(v) => setNewArtifactType(v as ArtifactType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="note">Note</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="audio">Audio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    placeholder="Artifact URL"
                    value={newArtifactUrl}
                    onChange={(e) => setNewArtifactUrl(e.target.value)}
                  />
                  <Button
                    size="sm"
                    onClick={handleAddArtifact}
                    disabled={!newArtifactTitle.trim() || !newArtifactUrl.trim()}
                    className="w-full"
                  >
                    <Plus size={14} className="mr-2" />
                    Add Artifact
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2 border-t border-border">
                <Button variant="outline" onClick={() => setSelectedBooking(null)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSaveChanges} className="flex-1">
                  <Save size={16} className="mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </motion.div>
  );
};

export default ConsultationManageTab;
