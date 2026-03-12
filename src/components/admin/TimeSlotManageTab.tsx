/**
 * Time Slot Management Tab Component
 *
 * Admin interface for managing consultation availability slots.
 * Configure which days and times are available for bookings.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Plus, Trash2, Save, Settings } from "lucide-react";
import { useAvailabilitySlots } from "@/lib/store";

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const TIME_SLOTS = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00",
];

const TimeSlotManageTab = () => {
  const [slots, setSlots] = useAvailabilitySlots();
  const [editingSlot, setEditingSlot] = useState<{ day: number; startTime: string; endTime: string; enabled: boolean } | null>(null);

  // Group slots by day
  const slotsByDay = DAYS_OF_WEEK.map((day) => ({
    ...day,
    slots: slots.filter((s) => s.dayOfWeek === day.value),
  }));

  const handleAddSlot = (dayValue: number) => {
    const newSlot = {
      id: crypto.randomUUID(),
      dayOfWeek: dayValue,
      startTime: "09:00",
      endTime: "17:00",
      enabled: true,
    };
    setSlots((prev) => [...prev, newSlot]);
    setEditingSlot({
      day: dayValue,
      startTime: "09:00",
      endTime: "17:00",
      enabled: true,
    });
  };

  const handleUpdateSlot = (slotId: string, updates: Partial<typeof slots[0]>) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, ...updates } : s))
    );
  };

  const handleDeleteSlot = (slotId: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== slotId));
  };

  const handleSaveEditingSlot = () => {
    if (!editingSlot) return;
    handleAddSlot(editingSlot.day);
    const newSlot = {
      id: crypto.randomUUID(),
      dayOfWeek: editingSlot.day,
      startTime: editingSlot.startTime,
      endTime: editingSlot.endTime,
      enabled: editingSlot.enabled,
    };
    setSlots((prev) => [...prev, newSlot]);
    setEditingSlot(null);
  };

  const toggleSlotEnabled = (slotId: string) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, enabled: !s.enabled } : s))
    );
  };

  // Stats
  const stats = {
    totalSlots: slots.length,
    enabledSlots: slots.filter((s) => s.enabled).length,
    daysConfigured: new Set(slots.map((s) => s.dayOfWeek)).size,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{stats.totalSlots}</div>
            <div className="text-xs text-muted-foreground">Total Time Slots</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.enabledSlots}</div>
            <div className="text-xs text-muted-foreground">Active Slots</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.daysConfigured}</div>
            <div className="text-xs text-muted-foreground">Days Configured</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardContent className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="font-serif text-xl text-foreground">Availability Time Slots</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Configure which days and times are available for consultation bookings
            </p>
          </div>

          {/* Time Slots Grid */}
          <div className="space-y-4">
            {slotsByDay.map((day) => (
              <div key={day.value} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-foreground">{day.label}</h3>
                    {day.slots.length > 0 && (
                      <Badge variant={day.slots.some((s) => s.enabled) ? "default" : "secondary"} className="text-xs">
                        {day.slots.filter((s) => s.enabled).length}/{day.slots.length} active
                      </Badge>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddSlot(day.value)}
                  >
                    <Plus size={14} className="mr-2" />
                    Add Slot
                  </Button>
                </div>

                {day.slots.length === 0 ? (
                  <div className="text-center py-6 text-sm text-muted-foreground rounded-md bg-muted/30">
                    No availability configured for {day.label.toLowerCase()}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {day.slots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          slot.enabled ? "bg-card" : "bg-muted/50 opacity-60"
                        }`}
                      >
                        <Switch
                          checked={slot.enabled}
                          onCheckedChange={() => toggleSlotEnabled(slot.id)}
                        />

                        <Clock size={18} className="text-muted-foreground" />

                        <div className="flex items-center gap-2 flex-1">
                          <Select
                            value={slot.startTime}
                            onValueChange={(value) => handleUpdateSlot(slot.id, { startTime: value })}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TIME_SLOTS.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <span className="text-muted-foreground">to</span>

                          <Select
                            value={slot.endTime}
                            onValueChange={(value) => handleUpdateSlot(slot.id, { endTime: value })}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TIME_SLOTS.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {slot.enabled && (
                            <Badge variant="outline" className="ml-2">
                              Active
                            </Badge>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 rounded-lg bg-muted/50">
            <div className="flex items-start gap-3">
              <Settings size={18} className="text-muted-foreground mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground">How Time Slots Work</p>
                <p className="text-muted-foreground mt-1">
                  Time slots define when users can book consultations. Each slot represents a range of availability
                  on a specific day. Users will see available 30-minute time slots within these ranges based on
                  the consultation duration.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TimeSlotManageTab;
