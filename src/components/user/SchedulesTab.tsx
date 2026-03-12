/**
 * Schedules Tab Component
 *
 * Displays user's upcoming and past schedules/meetings in the user portal.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, Video, FileText, Music, Eye, Filter } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserSchedules } from "@/lib/store";
import { format, isAfter, isBefore, startOfDay } from "date-fns";

const typeIcons = {
  consultation: { icon: Video, color: "text-purple-500", bg: "bg-purple-500/10" },
  meeting: { icon: Calendar, color: "text-blue-500", bg: "bg-blue-500/10" },
} as const;

const statusConfig = {
  scheduled: {
    label: "Scheduled",
    color: "bg-blue-500/10 text-blue-600",
    badge: "default",
  },
  completed: {
    label: "Completed",
    color: "bg-green-500/10 text-green-600",
    badge: "secondary",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-500/10 text-red-600",
    badge: "destructive",
  },
} as const;

type ScheduleType = keyof typeof typeIcons;
type ScheduleStatus = keyof typeof statusConfig;

const artifactIcons = {
  video: { icon: Video, color: "text-purple-500" },
  pdf: { icon: FileText, color: "text-red-500" },
  note: { icon: FileText, color: "text-blue-500" },
  audio: { icon: Music, color: "text-green-500" },
} as const;

const SchedulesTab = () => {
  const { user } = useAuth();
  const schedules = useUserSchedules(user?.id || "");
  const [filter, setFilter] = useState<string>("upcoming");
  const [selectedSchedule, setSelectedSchedule] = useState<(typeof schedules)[0] | null>(null);

  // Separate upcoming and past schedules
  const now = new Date();
  const upcomingSchedules = schedules.filter((s) => s.status === "scheduled" && isAfter(new Date(s.dateTime), now));
  const pastSchedules = schedules.filter((s) => s.status === "completed" || isBefore(new Date(s.dateTime), now));

  const filteredSchedules = filter === "upcoming" ? upcomingSchedules : pastSchedules;

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
              <h2 className="font-serif text-xl text-foreground">My Schedules</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {schedules.length} {schedules.length === 1 ? "meeting" : "meetings"} total
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Filter size={16} className="text-muted-foreground" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming ({upcomingSchedules.length})</SelectItem>
                  <SelectItem value="past">Past ({pastSchedules.length})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Schedules List */}
          {filteredSchedules.length > 0 ? (
            <div className="space-y-4">
              {filteredSchedules.map((schedule, index) => {
                const typeConfig = typeIcons[schedule.type as ScheduleType];
                const statusInfo = statusConfig[schedule.status as ScheduleStatus];
                const TypeIcon = typeConfig.icon;
                const isUpcoming = filter === "upcoming";

                return (
                  <motion.div
                    key={schedule.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group rounded-lg border border-border p-4 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => setSelectedSchedule(schedule)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Type Icon */}
                      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${typeConfig.bg} flex-shrink-0`}>
                        <TypeIcon className={typeConfig.color} size={24} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                              {schedule.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                              {schedule.description || "No description"}
                            </p>
                          </div>
                          <Badge variant={statusInfo.badge === "default" ? "default" : statusInfo.badge === "outline" ? "outline" : "destructive"} className="flex-shrink-0">
                            {statusInfo.label}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            <span>{format(new Date(schedule.dateTime), "MMM d, yyyy")}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock size={14} />
                            <span>{format(new Date(schedule.dateTime), "h:mm a")}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span>{schedule.duration} min</span>
                          </div>
                        </div>

                        {/* Artifacts indicator */}
                        {schedule.artifacts && schedule.artifacts.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                            <FileText size={12} />
                            <span>{schedule.artifacts.length} {schedule.artifacts.length === 1 ? "artifact" : "artifacts"} available</span>
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
                          setSelectedSchedule(schedule);
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
              <Calendar className="mx-auto h-16 w-16 text-muted-foreground/30" size={64} />
              <h3 className="mt-4 font-serif text-lg text-foreground">No schedules found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {filter === "upcoming"
                  ? "You don't have any upcoming meetings scheduled."
                  : "You don't have any past meetings yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Detail Dialog */}
      <Dialog open={!!selectedSchedule} onOpenChange={() => setSelectedSchedule(null)}>
        {selectedSchedule && (
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">{selectedSchedule.title}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* Meeting Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Date</p>
                  <p className="font-medium text-foreground">
                    {format(new Date(selectedSchedule.dateTime), "MMMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Time</p>
                  <p className="font-medium text-foreground">
                    {format(new Date(selectedSchedule.dateTime), "h:mm a")} ({selectedSchedule.duration} min)
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Type</p>
                  <p className="font-medium capitalize text-foreground">{selectedSchedule.type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p>
                  <Badge variant={selectedSchedule.status === "scheduled" ? "default" : selectedSchedule.status === "completed" ? "secondary" : "destructive"} className="mt-1">
                    {statusConfig[selectedSchedule.status as ScheduleStatus].label}
                  </Badge>
                </div>
              </div>

              {/* Description */}
              {selectedSchedule.description && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Description</p>
                  <p className="text-sm text-muted-foreground">{selectedSchedule.description}</p>
                </div>
              )}

              {/* Notes */}
              {selectedSchedule.notes && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Meeting Notes</p>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{selectedSchedule.notes}</p>
                  </div>
                </div>
              )}

              {/* Artifacts */}
              {selectedSchedule.artifacts && selectedSchedule.artifacts.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
                    Artifacts ({selectedSchedule.artifacts.length})
                  </p>
                  <ScrollArea className="h-40 rounded-lg border border-border">
                    <div className="p-4 space-y-2">
                      {selectedSchedule.artifacts.map((artifact) => {
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

export default SchedulesTab;
