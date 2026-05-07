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
  const hAngle = (h % 12) * 30 + m * 0.5;
  const mAngle = m * 6;
  const sAngle = s * 6;

  return (
    <div className="flex flex-col items-center gap-1 py-2">
      {/* Analog face */}
      <div className="relative w-[42px] h-[42px]">
        <svg viewBox="0 0 42 42" className="w-full h-full">
          <circle cx="21" cy="21" r="19" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-border/40" />
          {[0,30,60,90,120,150,180,210,240,270,300,330].map(a => (
            <line key={a} x1="21" y1="4" x2="21" y2={a % 90 === 0 ? "7" : "5.5"}
              stroke="currentColor" strokeWidth={a % 90 === 0 ? "1.5" : "0.8"}
              className="text-text-tertiary" transform={`rotate(${a} 21 21)`} />
          ))}
          {/* Hour */}
          <line x1="21" y1="21" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            className="text-text-primary" transform={`rotate(${hAngle} 21 21)`} />
          {/* Minute */}
          <line x1="21" y1="21" x2="21" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"
            className="text-accent" transform={`rotate(${mAngle} 21 21)`} />
          {/* Second */}
          <line x1="21" y1="21" x2="21" y2="6" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round"
            className="text-danger" transform={`rotate(${sAngle} 21 21)`} />
          <circle cx="21" cy="21" r="1.5" className="fill-accent" />
        </svg>
      </div>
      {/* Digital */}
      <span className="text-[9px] font-bold font-mono tabular-nums text-text-tertiary">
        {String(h).padStart(2,"0")}:{String(m).padStart(2,"0")}
      </span>
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

  // Item size classes based on style
  const itemClass = isTelegram
    ? "w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-200 cursor-pointer"
    : isCompact
    ? "flex flex-col items-center justify-center w-[40px] h-[40px] shrink-0 rounded-lg transition-all duration-200 cursor-pointer"
    : "group relative flex flex-col items-center justify-center w-[48px] h-[44px] shrink-0 rounded-xl transition-all duration-200 cursor-pointer";

  const renderItem = (item: typeof visibleItems[number]) => {
    const path = `/${item.id}`;
    const isActive = location.pathname.startsWith(path);
    const Icon = ICON_MAP[item.icon] || Sparkles;
    const isHovered = hoveredPath === path;

    if (isTelegram) {
      return (
        <button key={item.id} onClick={() => navigate(path)}
          className={`${itemClass} ${isActive ? "bg-accent/10 text-accent" : "text-text-secondary hover:bg-bg-hover"}`}>
          <Icon size={18} strokeWidth={isActive ? 2.2 : 1.7} />
          <span className="text-[13px] font-semibold flex-1">{item.label}</span>
          {item.id === "timer" && timerRunning && (
            <span className="text-[10px] font-mono font-bold tabular-nums animate-pulse text-accent">{timerDisplay}</span>
          )}
        </button>
      );
    }

    return (
      <button key={item.id} onClick={() => navigate(path)}
        onMouseEnter={() => setHoveredPath(path)} onMouseLeave={() => setHoveredPath(null)}
        className={itemClass} title={item.label}>
        {isActive && !isCompact && (
          <motion.div layoutId="nav-pill" className="absolute inset-0 rounded-xl bg-accent/12"
            transition={{ type: "spring", stiffness: 400, damping: 30 }} />
        )}
        {item.id === "timer" && timerRunning ? (
          <span className={`relative z-10 text-[10px] font-bold font-mono tabular-nums animate-pulse ${isActive ? "text-accent" : "text-text-secondary"}`}>{timerDisplay}</span>
        ) : (
          <>
            <Icon size={isCompact ? 17 : 19} strokeWidth={isActive ? 2.2 : 1.7}
              className={`relative z-10 transition-all duration-200 ${isActive ? "text-accent" : "text-text-tertiary group-hover:text-text-primary"}`} />
            {!isCompact && (
              <span className={`relative z-10 text-[8px] mt-0.5 font-medium transition-all duration-200 ${isActive ? "text-accent" : "text-text-tertiary group-hover:text-text-secondary"}`}>
                {item.label}
              </span>
            )}
          </>
        )}
        {isCompact && isActive && <div className="absolute bottom-0 w-4 h-[2px] rounded-full bg-accent" />}
        {!isTelegram && <AnimatedTooltip visible={isHovered && !isActive} label={item.id === "timer" && timerRunning ? timerDisplay : item.label} />}
      </button>
    );
  };

  const navWidth = isTelegram ? "md:w-[200px]" : isCompact ? "md:w-[52px]" : "md:w-[64px]";

  return (
    <nav className={`flex md:flex-col flex-row items-center ${navWidth} w-full md:h-full h-[56px] shrink-0 md:py-2 py-1 ${isTelegram ? "md:px-2 px-2" : "px-1 md:px-0"} gap-0.5
      bg-bg-sidebar md:border-r border-t md:border-t-0 border-border-light glass relative z-50 overflow-x-auto md:overflow-x-visible md:overflow-y-auto no-scrollbar`}>

      {/* Clock widget (desktop sidebar only) */}
      {show_clock && (
        <div className="hidden md:flex w-full justify-center border-b border-border/20 mb-1">
          <LiveClock />
        </div>
      )}

      {/* Module items */}
      {visibleItems.map(renderItem)}

      {/* Settings */}
      <button onClick={() => navigate("/settings")}
        onMouseEnter={() => setHoveredPath("/settings")} onMouseLeave={() => setHoveredPath(null)}
        className={`${isTelegram
          ? "w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-200 cursor-pointer md:mt-auto ml-auto md:ml-0"
          : `group relative flex flex-col items-center justify-center ${isCompact ? "w-[40px] h-[40px] rounded-lg" : "w-[48px] h-[44px] rounded-xl"} shrink-0 transition-all duration-200 cursor-pointer md:mt-auto ml-auto md:ml-0`}`}
        title="Settings">
        {location.pathname === "/settings" && !isTelegram && !isCompact && (
          <motion.div layoutId="nav-pill" className="absolute inset-0 rounded-xl bg-accent/12"
            transition={{ type: "spring", stiffness: 400, damping: 30 }} />
        )}
        <Settings size={isTelegram ? 18 : isCompact ? 17 : 19} strokeWidth={location.pathname === "/settings" ? 2.2 : 1.7}
          className={`relative z-10 transition-all ${location.pathname === "/settings"
            ? "text-accent"
            : isTelegram ? "text-text-secondary" : "text-text-tertiary group-hover:text-text-primary"}`} />
        {isTelegram ? (
          <span className={`text-[13px] font-semibold flex-1 ${location.pathname === "/settings" ? "text-accent" : "text-text-secondary"}`}>Settings</span>
        ) : !isCompact ? (
          <span className={`relative z-10 text-[8px] mt-0.5 font-medium ${location.pathname === "/settings" ? "text-accent" : "text-text-tertiary"}`}>Settings</span>
        ) : null}
      </button>

      {/* + Module Manager */}
      <button onClick={() => setShowManager(!showManager)}
        className={`${isTelegram
          ? "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-bg-hover/50 text-text-tertiary hover:text-accent hover:bg-accent/10 border border-border/20 md:mb-2"
          : `w-[36px] h-[36px] shrink-0 md:mb-2 ml-1 md:ml-0 flex items-center justify-center rounded-xl bg-bg-hover/50 text-text-tertiary hover:text-accent hover:bg-accent/10 border border-border/20`} transition-all cursor-pointer`}
        title="Customize Modules">
        {showManager ? <X size={14} /> : <Plus size={14} />}
        {isTelegram && <span className="text-[11px] font-bold">{showManager ? "Close" : "Modules"}</span>}
      </button>

      {/* Module Manager */}
      <AnimatePresence>
        {showManager && (
          <>
            <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setShowManager(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="fixed z-50 bg-bg-elevated/95 backdrop-blur-2xl border border-border/50 rounded-2xl shadow-2xl p-3 overflow-hidden
                bottom-[72px] left-2 right-2 md:bottom-14 md:left-[72px] md:right-auto md:w-72">
              <p className="text-[10px] font-extrabold text-text-tertiary uppercase tracking-widest mb-3 px-2">Manage Modules</p>
              <div className="max-h-[50vh] md:max-h-[400px] overflow-y-auto space-y-0.5">
                {ALL_MODULES.map(m => {
                  const Icon = ICON_MAP[m.icon] || Sparkles;
                  const enabled = enabled_modules.includes(m.id);
                  return (
                    <button key={m.id} onClick={() => toggleModule(m.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer
                        ${enabled ? "bg-accent/8 text-text-primary" : "text-text-tertiary hover:bg-bg-hover"}`}>
                      <Icon size={15} className={enabled ? "text-accent" : ""} />
                      <div className="flex-1 text-left">
                        <p className="text-[12px] font-bold">{m.label}</p>
                        <p className="text-[10px] opacity-60">{m.desc}</p>
                      </div>
                      <div className={`w-8 h-5 rounded-full transition-all relative ${enabled ? "bg-accent" : "bg-border/40"}`}>
                        <motion.div animate={{ x: enabled ? 14 : 2 }} className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
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
