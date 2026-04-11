import { useEffect, useState } from "react";
import { useCalendarStore } from "@/stores/calendarStore";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalIcon,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  setHours,
  setMinutes,
} from "date-fns";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EVENT_COLORS, type CalendarView } from "@/types/event";

export function CalendarPage() {
  const {
    events,
    currentDate,
    view,
    loadEvents,
    createEvent,
    deleteEvent,
    setView,
    navigate,
    getEventsForDate,
  } = useCalendarStore();

  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventColor, setEventColor] = useState(EVENT_COLORS[0]);
  const [eventAllDay, setEventAllDay] = useState(true);
  const [eventStartTime, setEventStartTime] = useState("09:00");
  const [eventEndTime, setEventEndTime] = useState("10:00");

  useEffect(() => {
    loadEvents();
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setShowEventModal(true);
    setEventTitle("");
    setEventColor(EVENT_COLORS[0]);
    setEventAllDay(true);
  };

  const handleCreateEvent = () => {
    if (!eventTitle.trim() || !selectedDate) return;

    let startTime: number;
    let endTime: number;

    if (eventAllDay) {
      startTime = Math.floor(selectedDate.setHours(0, 0, 0, 0) / 1000);
      endTime = startTime + 86400;
    } else {
      const [sh, sm] = eventStartTime.split(":").map(Number);
      const [eh, em] = eventEndTime.split(":").map(Number);
      startTime = Math.floor(
        setMinutes(setHours(selectedDate, sh), sm).getTime() / 1000
      );
      endTime = Math.floor(
        setMinutes(setHours(selectedDate, eh), em).getTime() / 1000
      );
    }

    createEvent({
      title: eventTitle.trim(),
      description: "",
      start_time: startTime,
      end_time: endTime,
      all_day: eventAllDay ? 1 : 0,
      color: eventColor,
      recurrence: null,
    });

    setShowEventModal(false);
  };

  const viewButtons: { view: CalendarView; label: string }[] = [
    { view: "month", label: "Month" },
    { view: "week", label: "Week" },
    { view: "day", label: "Day" },
  ];

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          <h1 className="text-[22px] font-bold text-text-primary">
            {format(currentDate, "MMMM yyyy")}
          </h1>
          <div className="flex items-center gap-1">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("prev")}
              className="w-8 h-8 flex items-center justify-center rounded-lg
                text-text-secondary hover:bg-bg-hover transition-colors cursor-pointer"
            >
              <ChevronLeft size={18} />
            </motion.button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("today")}
            >
              Today
            </Button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("next")}
              className="w-8 h-8 flex items-center justify-center rounded-lg
                text-text-secondary hover:bg-bg-hover transition-colors cursor-pointer"
            >
              <ChevronRight size={18} />
            </motion.button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-bg-secondary rounded-lg p-0.5 border border-border-light">
            {viewButtons.map((vb) => (
              <button
                key={vb.view}
                onClick={() => setView(vb.view)}
                className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors cursor-pointer
                  ${
                    view === vb.view
                      ? "bg-bg-primary text-text-primary shadow-sm"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
              >
                {vb.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Grid — Month view */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-[11px] font-medium text-text-tertiary uppercase tracking-wider py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 flex-1 gap-px bg-border-light rounded-[--radius-lg] overflow-hidden border border-border-light">
          {days.map((day, i) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const today = isToday(day);

            return (
              <motion.div
                key={i}
                whileHover={{ backgroundColor: "var(--color-bg-hover)" }}
                onClick={() => handleDayClick(day)}
                className={`min-h-[90px] p-1.5 cursor-pointer transition-colors
                  bg-bg-primary
                  ${!isCurrentMonth ? "opacity-40" : ""}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[12px] w-6 h-6 flex items-center justify-center rounded-full
                      ${
                        today
                          ? "bg-accent text-white font-semibold"
                          : "text-text-secondary font-medium"
                      }`}
                  >
                    {format(day, "d")}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="px-1.5 py-0.5 rounded text-[10px] font-medium truncate cursor-pointer
                        text-white"
                      style={{ backgroundColor: event.color || EVENT_COLORS[0] }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-[10px] text-text-tertiary pl-1.5">
                      +{dayEvents.length - 3} more
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Event creation modal */}
      <Modal
        open={showEventModal}
        onClose={() => setShowEventModal(false)}
        title={
          selectedDate
            ? `New Event — ${format(selectedDate, "MMM d, yyyy")}`
            : "New Event"
        }
      >
        <div className="space-y-4">
          <Input
            label="Event title"
            placeholder="Meeting, Lunch, Workout..."
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateEvent()}
            autoFocus
          />

          {/* All day toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={eventAllDay}
              onChange={(e) => setEventAllDay(e.target.checked)}
              className="w-4 h-4 rounded border-border accent-accent"
            />
            <span className="text-[13px] text-text-secondary">All day</span>
          </label>

          {/* Time pickers */}
          {!eventAllDay && (
            <div className="flex gap-3">
              <Input
                label="Start"
                type="time"
                value={eventStartTime}
                onChange={(e) => setEventStartTime(e.target.value)}
              />
              <Input
                label="End"
                type="time"
                value={eventEndTime}
                onChange={(e) => setEventEndTime(e.target.value)}
              />
            </div>
          )}

          {/* Color picker */}
          <div>
            <label className="text-[13px] font-medium text-text-secondary block mb-2">
              Color
            </label>
            <div className="flex gap-2">
              {EVENT_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setEventColor(color)}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer
                    ${eventColor === color ? "scale-110 ring-2 ring-offset-2 ring-accent" : "hover:scale-105"}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => setShowEventModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateEvent}>Create Event</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
