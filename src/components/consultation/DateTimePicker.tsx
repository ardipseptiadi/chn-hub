/**
 * DateTime Picker Component
 *
 * Date and time slot picker for consultation booking.
 * Shows available time slots based on admin-configured availability.
 */

import { useState, useEffect } from "react";
import { format, addDays, isBefore, isEqual } from "date-fns";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAvailabilitySlots } from "@/lib/store";

interface AvailableSlot {
  date: string;
  timeSlots: { time: string; available: boolean }[];
}

interface DateTimePickerProps {
  consultationDuration: number; // in minutes
  onSlotSelect: (date: string, time: string) => void;
  selectedDate?: string;
  selectedTime?: string;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  consultationDuration,
  onSlotSelect,
  selectedDate,
  selectedTime,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [availabilitySlots] = useAvailabilitySlots();

  // Generate available time slots for a date range
  useEffect(() => {
    const generateSlots = () => {
      const slots: AvailableSlot[] = [];
      const daysToShow = 14; // Show 2 weeks of availability

      for (let i = 0; i < daysToShow; i++) {
        const date = addDays(new Date(), i);

        // Skip past dates
        if (isBefore(date, new Date(), { dayStart: true })) continue;

        const dateStr = format(date, "yyyy-MM-dd");
        const dayOfWeek = date.getDay();

        // Get availability for this day of week
        const dayAvailability = availabilitySlots.find((slot) => slot.dayOfWeek === dayOfWeek && slot.enabled);

        if (dayAvailability) {
          // Generate time slots from start to end time
          const startTime = dayAvailability.startTime.split(":");
          const endTime = dayAvailability.endTime.split(":");

          const startHour = parseInt(startTime[0], 10);
          const startMinute = parseInt(startTime[1], 10);
          const endHour = parseInt(endTime[0], 10);
          const endMinute = parseInt(endTime[1], 10);

          const timeSlots: { time: string; available: boolean }[] = [];

          // Generate 30-minute slots
          let currentHour = startHour;
          let currentMinute = startMinute;

          while (currentHour < endHour || (currentHour === endHour && currentMinute <= endMinute)) {
            if (currentHour === endHour && currentMinute > endMinute) break;

            const time = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;
            timeSlots.push({ time, available: true });

            // Add consultation duration
            currentMinute += consultationDuration;
            while (currentMinute >= 60) {
              currentHour++;
              currentMinute -= 60;
            }

            // Skip to next 30-minute increment if needed
            if (currentMinute % 30 !== 0) {
              currentMinute = Math.ceil(currentMinute / 30) * 30;
              if (currentMinute >= 60) {
                currentHour++;
                currentMinute = 0;
              }
            }
          }

          slots.push({ date: dateStr, timeSlots });
        }
      }

      setAvailableSlots(slots);
    };

    generateSlots();
  }, [availabilitySlots, consultationDuration]);

  // Get dates for display
  const getVisibleDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(currentDate, i));
    }
    return dates;
  };

  const getWeekDates = () => {
    const weekStart = currentDate;
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  };

  const selectedDateData = selectedDate
    ? availableSlots.find((s) => s.date === selectedDate)
    : null;

  // Navigation
  const goToPrevWeek = () => setCurrentDate((prev) => addDays(prev, -7));
  const goToNextWeek = () => setCurrentDate((prev) => addDays(prev, 7));

  // Format date for display
  const formatDateDisplay = (date: Date) => {
    const today = new Date();
    const tomorrow = addDays(today, 1);

    if (isEqual(date, today)) return "Today";
    if (isEqual(date, tomorrow)) return "Tomorrow";
    return format(date, "EEE, MMM d");
  };

  // Check if a slot is selected
  const isSelected = (date: string, time: string) => {
    return selectedDate === date && selectedTime === time;
  };

  return (
    <div className="space-y-6">
      {/* Calendar Navigation */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPrevWeek}
              disabled={isBefore(addDays(currentDate, 7), new Date(), { dayStart: true })}
            >
              <ChevronLeft size={18} className="mr-1" /> Previous Week
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={goToNextWeek}
            >
              Next Week <ChevronRight size={18} className="ml-1" />
            </Button>
          </div>

          {/* Week View */}
          <div className="grid grid-cols-7 gap-2">
            {getWeekDates().map((date, i) => {
              const dateStr = format(date, "yyyy-MM-dd");
              const isSelectedDate = selectedDate === dateStr;
              const dateSlots = availableSlots.find((s) => s.date === dateStr);
              const hasAvailability = dateSlots && dateSlots.timeSlots.some((s) => s.available);

              return (
                <button
                  key={dateStr}
                  onClick={() => hasAvailability && onSlotSelect(dateStr, "")}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    isSelectedDate
                      ? "bg-primary text-primary-foreground border-primary"
                      : hasAvailability
                      ? "border-border hover:border-primary hover:bg-primary/5"
                      : "border-transparent opacity-30"
                  }`}
                  disabled={!hasAvailability}
                >
                  <div className="text-xs font-medium">
                    {format(date, "EEE")}
                  </div>
                  <div className="text-lg font-serif mt-1">{format(date, "d")}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDateDisplay(date)}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Time Slots */}
      {selectedDate && selectedDateData && (
        <Card className="border-border">
          <CardContent className="p-4">
            <h3 className="font-medium text-foreground mb-3">
              Available times for {formatDateDisplay(new Date(selectedDate))}
            </h3>

            <div className="space-y-2">
              {selectedDateData.timeSlots.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {selectedDateData.timeSlots.map((slot) => (
                    <Button
                      key={slot.time}
                      variant={isSelected(selectedDate, slot.time) ? "default" : "outline"}
                      disabled={!slot.available}
                      onClick={() => onSlotSelect(selectedDate, slot.time)}
                      className={`w-full ${
                        isSelected(selectedDate, slot.time) ? "bg-primary text-primary-foreground" : ""
                      }`}
                    >
                      <Clock size={14} className="mr-1" />
                      {slot.time}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No available slots for this date. Select another date.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Info */}
      {(selectedDate || selectedTime) && (
        <Card className="border-border bg-primary/5">
          <CardContent className="p-4">
            <h3 className="font-medium text-foreground mb-2">Selected Slot</h3>
            <div className="text-sm text-muted-foreground">
              {selectedDate && (
                <span>{formatDateDisplay(new Date(selectedDate))}</span>
              )}
              {selectedDate && selectedTime && " at "}
              {selectedTime && (
                <span className="font-medium text-foreground">{selectedTime}</span>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Duration: {consultationDuration} minutes
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DateTimePicker;
