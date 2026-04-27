import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useTimerStore, TIMER_PRESETS } from "@/stores/timerStore";
import {
  Play,
  Pause,
  RotateCcw,
  Flame,
  Coffee,
  Sunset,
  Clock,
  Zap,
} from "lucide-react";

export function TimerPage() {
  const {
    mode,
    duration,
    remaining,
    isRunning,
    sessions,
    totalFocusSessions,
    setMode,
    setCustomDuration,
    start,
    pause,
    reset,
    loadSessions,
  } = useTimerStore();

  const [customMin, setCustomMin] = useState("");

  useEffect(() => {
    loadSessions();
  }, []);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = duration > 0 ? (duration - remaining) / duration : 0;

  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  const preset = TIMER_PRESETS.find((p) => p.mode === mode);
  const accentColor = preset?.color || "#007AFF";

  const modeIcons = {
    focus: <Flame size={18} />,
    short_break: <Coffee size={18} />,
    long_break: <Sunset size={18} />,
  };

  const todaySessions = sessions.filter((s) => {
    const today = new Date();
    const sessionDate = new Date(s.started_at * 1000);
    return (
      s.type === "focus" &&
      s.completed &&
      sessionDate.toDateString() === today.toDateString()
    );
  });

  const totalFocusMinutes = todaySessions.reduce(
    (acc, s) => acc + Math.round(s.duration / 60),
    0
  );

  return (
    <div className="flex flex-col h-full items-center justify-center relative overflow-hidden">
      {/* Ambient BG */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${accentColor} 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Mode selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-bg-secondary/60 border border-border/40 mb-10 backdrop-blur-sm">
          {TIMER_PRESETS.map((p) => (
            <motion.button
              key={p.mode}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode(p.mode)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer
                ${
                  mode === p.mode
                    ? "text-bg-primary shadow-lg"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
                }`}
              style={mode === p.mode ? { backgroundColor: p.color } : {}}
            >
              {modeIcons[p.mode]}
              {p.label}
            </motion.button>
          ))}
        </div>

        {/* Circular timer */}
        <div className="relative w-[320px] h-[320px] flex items-center justify-center mb-10">
          <svg
            className="timer-ring absolute inset-0"
            width="320"
            height="320"
            viewBox="0 0 320 320"
          >
            {/* Background ring */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-border"
              opacity="0.3"
            />
            {/* Progress ring */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              fill="none"
              stroke={accentColor}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ filter: `drop-shadow(0 0 8px ${accentColor}40)` }}
            />
          </svg>

          {/* Center content */}
          <div className="relative flex flex-col items-center">
            <motion.span
              key={remaining}
              className="text-[72px] font-bold tracking-[-0.04em] text-text-primary leading-none tabular-nums"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </motion.span>
            <span
              className="text-[13px] font-semibold uppercase tracking-widest mt-2"
              style={{ color: accentColor }}
            >
              {remaining === 0 && duration > 0
                ? "Complete!"
                : isRunning
                ? "Running"
                : "Paused"}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={reset}
            className="w-12 h-12 flex items-center justify-center rounded-2xl
              bg-bg-secondary/60 text-text-secondary hover:text-text-primary
              border border-border/40 transition-all cursor-pointer"
          >
            <RotateCcw size={20} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={isRunning ? pause : start}
            className="w-16 h-16 flex items-center justify-center rounded-full
              text-white shadow-2xl transition-all cursor-pointer"
            style={{
              backgroundColor: accentColor,
              boxShadow: `0 8px 32px ${accentColor}40`,
            }}
          >
            {isRunning ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
          </motion.button>

          {/* Custom time */}
          <div className="relative">
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl
              bg-bg-secondary/60 border border-border/40">
              <input
                type="number"
                placeholder="∞"
                value={customMin}
                onChange={(e) => {
                  setCustomMin(e.target.value);
                  const val = parseInt(e.target.value);
                  if (val > 0 && val <= 180) setCustomDuration(val);
                }}
                className="w-full h-full text-center bg-transparent text-[13px] font-bold text-text-primary
                  outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                min={1}
                max={180}
              />
            </div>
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-text-tertiary whitespace-nowrap">
              min
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
              <Zap size={16} className="text-accent" />
            </div>
            <div>
              <p className="text-[18px] font-bold text-text-primary">
                {todaySessions.length}
              </p>
              <p className="text-[10px] text-text-tertiary font-medium uppercase tracking-wider">
                Sessions
              </p>
            </div>
          </div>
          <div className="w-px h-10 bg-border/40" />
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center">
              <Flame size={16} className="text-success" />
            </div>
            <div>
              <p className="text-[18px] font-bold text-text-primary">
                {totalFocusMinutes}
              </p>
              <p className="text-[10px] text-text-tertiary font-medium uppercase tracking-wider">
                Focus min
              </p>
            </div>
          </div>
          <div className="w-px h-10 bg-border/40" />
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-warning/10 flex items-center justify-center">
              <Clock size={16} className="text-warning" />
            </div>
            <div>
              <p className="text-[18px] font-bold text-text-primary">
                {totalFocusSessions}
              </p>
              <p className="text-[10px] text-text-tertiary font-medium uppercase tracking-wider">
                All-time
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
