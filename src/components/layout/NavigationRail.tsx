import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  StickyNote, CheckSquare, Calendar, Sparkles, Timer, Code2,
  HardDrive, Settings, Columns3, PenTool, Mic, Plus, X, Archive, Bookmark, BarChart3, Clock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useTimerStore } from "@/stores/timerStore";
import { ALL_MODULES } from "@/types/settings";

const ICON_MAP: Record<string, any> = {
  StickyNote, CheckSquare, Calendar, Timer, Sparkles, Code2,
  HardDrive, Columns3, PenTool, Mic, Archive, Bookmark, BarChart3,
};

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const h = time.getHours();
  const m = time.getMinutes();
  const s = time.getSeconds();
  const hStr = String(h).padStart(2, "0");
  const mStr = String(m).padStart(2, "0");
  const sStr = String(s).padStart(2, "0");
  const dateStr = time.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  // Analog clock angles
  const sAngle = s * 6;
  const mAngle = m * 6 + s * 0.1;
  const hAngle = (h % 12) * 30 + m * 0.5;

  return (
    <div className="flex flex-col items-center gap-1 py-2 px-1">
      {/* Analog clock face */}
      <div className="relative w-[44px] h-[44px]">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2" className="text-border/30" />
          {/* Hour markers */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30 - 90) * Math.PI / 180;
            const x1 = 50 + 38 * Math.cos(angle);
            const y1 = 50 + 38 * Math.sin(angle);
            const x2 = 50 + 43 * Math.cos(angle);
            const y2 = 50 + 43 * Math.sin(angle);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth={i % 3 === 0 ? "3" : "1.5"} className="text-text-tertiary" strokeLinecap="round" />;
          })}
          {/* Hour hand */}
          <line x1="50" y1="50"
            x2={50 + 24 * Math.cos((hAngle - 90) * Math.PI / 180)}
            y2={50 + 24 * Math.sin((hAngle - 90) * Math.PI / 180)}
            stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-text-primary" />
          {/* Minute hand */}
          <line x1="50" y1="50"
            x2={50 + 32 * Math.cos((mAngle - 90) * Math.PI / 180)}
            y2={50 + 32 * Math.sin((mAngle - 90) * Math.PI / 180)}
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-text-secondary" />
          {/* Second hand */}
          <line x1="50" y1="50"
            x2={50 + 36 * Math.cos((sAngle - 90) * Math.PI / 180)}
            y2={50 + 36 * Math.sin((sAngle - 90) * Math.PI / 180)}
            stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="text-accent" />
          <circle cx="50" cy="50" r="3" fill="currentColor" className="text-accent" />
        </svg>
      </div>
      <span className="text-[10px] font-bold tabular-nums text-text-secondary">{hStr}:{mStr}<span className="text-text-tertiary">:{sStr}</span></span>
      <span className="text-[7px] text-text-tertiary font-medium hidden md:block">{dateStr}</span>
    </div>
  );
}

export function NavigationRail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [showManager, setShowManager] = useState(false);
  const { enabled_modules, toggleModule, ai_enabled, nav_style, show_clock } = useSettingsStore();

  const visibleItems = ALL_MODULES.filter(m => {
    if (!enabled_modules.includes(m.id)) return false;
    if (m.id === "ai" && !ai_enabled) return false;
    return true;
  });
  const { isRunning: timerRunning, remaining: timerRemaining } = useTimerStore();
  const timerMin = Math.floor(timerRemaining / 60);
  const timerSec = timerRemaining % 60;
  const timerDisplay = `${timerMin}:${String(timerSec).padStart(2, '0')}`;

  const isTelegram = nav_style === "telegram";
  const isCompact = nav_style === "compact";

  return (
    <nav
      className={`flex md:flex-col flex-row items-center shrink-0 md:py-2 py-1 px-1 md:px-0 gap-0.5
        bg-bg-sidebar md:border-r border-t md:border-t-0 border-border-light glass relative z-50 overflow-x-auto no-scrollbar
        ${isTelegram ? "md:w-[220px] w-full md:h-full h-[56px]" : isCompact ? "md:w-[52px] w-full md:h-full h-[52px]" : "md:w-[64px] w-full md:h-full h-[56px]"}`}
    >
      {/* Clock widget - desktop sidebar only */}
      {show_clock && !isTelegram && (
        <div className="hidden md:block w-full border-b border-border/20 mb-1">
          <LiveClock />
        </div>
      )}

      {visibleItems.map((item) => {
        const path = `/${item.id}`;
        const isActive = location.pathname.startsWith(path);
        const Icon = ICON_MAP[item.icon] || Sparkles;
        const isHovered = hoveredPath === path;

        if (isTelegram) {
          // Telegram-style: horizontal list item with label
          return (
            <button
              key={item.id}
              onClick={() => navigate(path)}
              className={`hidden md:flex w-full items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer text-left
                ${isActive ? "bg-accent/12 text-accent" : "text-text-tertiary hover:bg-bg-hover hover:text-text-primary"}`}
            >
              <Icon size={17} strokeWidth={isActive ? 2.2 : 1.6} />
              <span className={`text-[13px] font-semibold truncate ${isActive ? "text-accent" : ""}`}>{item.label}</span>
            </button>
          );
        }

        // Mobile: always show compact bottom bar
        // Desktop: rail or compact style
        return (
          <button
            key={item.id}
            onClick={() => navigate(path)}
            onMouseEnter={() => setHoveredPath(path)}
            onMouseLeave={() => setHoveredPath(null)}
            className={`group relative flex flex-col items-center justify-center shrink-0 rounded-xl transition-all duration-200 cursor-pointer
              ${isCompact ? "w-[40px] h-[38px]" : "w-[48px] h-[44px]"}`}
            title={item.label}
          >
            {isActive && (
              <motion.div
                layoutId="nav-pill"
                className="absolute inset-0 rounded-xl bg-accent/12"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {item.id === "timer" && timerRunning ? (
              <span className={`relative z-10 text-[10px] font-bold font-mono tabular-nums animate-pulse ${
                isActive ? "text-accent" : "text-text-secondary"
              }`}>{timerDisplay}</span>
            ) : (
              <>
                <Icon
                  size={isCompact ? 17 : 19}
                  strokeWidth={isActive ? 2.2 : 1.7}
                  className={`relative z-10 transition-all duration-200 ${
                    isActive ? "text-accent" : "text-text-tertiary group-hover:text-text-primary"
                  }`}
                />
                {!isCompact && (
                  <span className={`relative z-10 text-[8px] mt-0.5 font-medium transition-all duration-200 ${
                    isActive ? "text-accent" : "text-text-tertiary group-hover:text-text-secondary"
                  }`}>
                    {item.label}
                  </span>
                )}
              </>
            )}
            {!isTelegram && <AnimatedTooltip visible={isHovered && !isActive} label={item.id === "timer" && timerRunning ? timerDisplay : item.label} />}
          </button>
        );
      })}

      {/* Telegram style: mobile bottom tab items */}
      {isTelegram && visibleItems.map((item) => {
        const path = `/${item.id}`;
        const isActive = location.pathname.startsWith(path);
        const Icon = ICON_MAP[item.icon] || Sparkles;
        return (
          <button key={item.id} onClick={() => navigate(path)}
            className={`md:hidden flex flex-col items-center justify-center w-[48px] h-[44px] shrink-0 rounded-xl cursor-pointer
              ${isActive ? "text-accent" : "text-text-tertiary"}`}>
            <Icon size={18} strokeWidth={isActive ? 2.2 : 1.6} />
            <span className="text-[7px] mt-0.5 font-medium">{item.label}</span>
          </button>
        );
      })}

      {/* Settings */}
      {isTelegram ? (
        <>
          <button onClick={() => navigate("/settings")}
            className={`hidden md:flex w-full items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer mt-auto text-left
              ${location.pathname === "/settings" ? "bg-accent/12 text-accent" : "text-text-tertiary hover:bg-bg-hover hover:text-text-primary"}`}>
            <Settings size={17} strokeWidth={location.pathname === "/settings" ? 2.2 : 1.6} />
            <span className="text-[13px] font-semibold">Settings</span>
          </button>
          <button onClick={() => navigate("/settings")}
            className={`md:hidden flex flex-col items-center justify-center w-[48px] h-[44px] shrink-0 rounded-xl cursor-pointer ml-auto
              ${location.pathname === "/settings" ? "text-accent" : "text-text-tertiary"}`}>
            <Settings size={18} strokeWidth={location.pathname === "/settings" ? 2.2 : 1.6} />
            <span className="text-[7px] mt-0.5 font-medium">Settings</span>
          </button>
        </>
      ) : (
        <button
          onClick={() => navigate("/settings")}
          onMouseEnter={() => setHoveredPath("/settings")}
          onMouseLeave={() => setHoveredPath(null)}
          className={`group relative flex flex-col items-center justify-center shrink-0 rounded-xl transition-all duration-200 cursor-pointer md:mt-auto ml-auto md:ml-0
            ${isCompact ? "w-[40px] h-[38px]" : "w-[48px] h-[44px]"}`}
          title="Settings"
        >
          {location.pathname === "/settings" && (
            <motion.div layoutId="nav-pill" className="absolute inset-0 rounded-xl bg-accent/12"
              transition={{ type: "spring", stiffness: 400, damping: 30 }} />
          )}
          <Settings size={isCompact ? 17 : 19} strokeWidth={location.pathname === "/settings" ? 2.2 : 1.7}
            className={`relative z-10 transition-all ${location.pathname === "/settings" ? "text-accent" : "text-text-tertiary group-hover:text-text-primary"}`} />
          {!isCompact && (
            <span className={`relative z-10 text-[8px] mt-0.5 font-medium ${location.pathname === "/settings" ? "text-accent" : "text-text-tertiary"}`}>
              Settings
            </span>
          )}
        </button>
      )}

      {/* Add/Remove modules button */}
      <button
        onClick={(e) => { e.stopPropagation(); setShowManager(!showManager); }}
        className={`shrink-0 md:mb-2 ml-1 md:ml-0 flex items-center justify-center rounded-xl
          bg-bg-hover/50 text-text-tertiary hover:text-accent hover:bg-accent/10
          transition-all cursor-pointer border border-border/20
          ${isTelegram ? "w-full md:py-2 md:w-auto md:mx-2 w-[36px] h-[36px]" : "w-[36px] h-[36px]"}`}
        title="Customize Modules"
      >
        {showManager ? <X size={14} /> : <Plus size={14} />}
        {isTelegram && <span className="hidden md:inline text-[11px] font-bold ml-2">Modules</span>}
      </button>

      {/* Module Manager Popover */}
      <AnimatePresence>
        {showManager && (
          <>
            <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setShowManager(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="fixed z-50 bg-bg-elevated/95 backdrop-blur-2xl border border-border/50 rounded-2xl shadow-2xl p-3 overflow-hidden
                bottom-[72px] left-2 right-2 md:bottom-14 md:left-[72px] md:right-auto md:w-72"
            >
              <p className="text-[10px] font-extrabold text-text-tertiary uppercase tracking-widest mb-3 px-2">
                Manage Modules
              </p>
              <div className="max-h-[50vh] md:max-h-[400px] overflow-y-auto space-y-0.5">
                {ALL_MODULES.map(m => {
                  const Icon = ICON_MAP[m.icon] || Sparkles;
                  const enabled = enabled_modules.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() => toggleModule(m.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer
                        ${enabled ? "bg-accent/8 text-text-primary" : "text-text-tertiary hover:bg-bg-hover"}`}
                    >
                      <Icon size={15} className={enabled ? "text-accent" : ""} />
                      <div className="flex-1 text-left">
                        <p className="text-[12px] font-bold">{m.label}</p>
                        <p className="text-[10px] opacity-60">{m.desc}</p>
                      </div>
                      <div className={`w-8 h-5 rounded-full transition-all relative ${enabled ? "bg-accent" : "bg-border/40"}`}>
                        <motion.div
                          animate={{ x: enabled ? 14 : 2 }}
                          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile pull-up clock */}
      {show_clock && (
        <div className="md:hidden flex items-center gap-1 px-2 shrink-0">
          <Clock size={12} className="text-text-tertiary" />
          <MobileClock />
        </div>
      )}
    </nav>
  );
}

function MobileClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="text-[10px] font-bold tabular-nums text-text-tertiary">
      {String(time.getHours()).padStart(2,"0")}:{String(time.getMinutes()).padStart(2,"0")}
    </span>
  );
}

function AnimatedTooltip({ visible, label }: { visible: boolean; label: string }) {
  if (!visible) return null;
  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -4 }}
      className="absolute left-full ml-3 z-50 px-2.5 py-1.5 rounded-lg
        bg-bg-elevated border border-border/40 shadow-lg
        text-[11px] font-semibold text-text-primary whitespace-nowrap pointer-events-none"
    >
      {label}
    </motion.div>
  );
}
