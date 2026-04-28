import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  StickyNote, CheckSquare, Calendar, Sparkles, Timer, Code2,
  HardDrive, Settings, Columns3, FileText, Table2, Presentation,
  PenTool, Mic, Image, Film, Plus, X, GripVertical, LayoutDashboard,
} from "lucide-react";
import { useState } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { ALL_MODULES } from "@/types/settings";

const ICON_MAP: Record<string, any> = {
  StickyNote, CheckSquare, Calendar, Timer, Sparkles, Code2,
  HardDrive, Columns3, FileText, Table2, Presentation,
  PenTool, Mic, Image, Film, LayoutDashboard,
};

export function NavigationRail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [showManager, setShowManager] = useState(false);
  const { enabled_modules, toggleModule } = useSettingsStore();

  const visibleItems = ALL_MODULES.filter(m => enabled_modules.includes(m.id));

  return (
    <nav
      className="flex flex-col items-center w-[64px] shrink-0 py-3 gap-0.5
        bg-bg-sidebar border-r border-border-light glass relative"
    >
      {visibleItems.map((item) => {
        const path = `/${item.id}`;
        const isActive = location.pathname.startsWith(path);
        const Icon = ICON_MAP[item.icon] || Sparkles;
        const isHovered = hoveredPath === path;
        return (
          <button
            key={item.id}
            onClick={() => navigate(path)}
            onMouseEnter={() => setHoveredPath(path)}
            onMouseLeave={() => setHoveredPath(null)}
            className="group relative flex flex-col items-center justify-center
              w-[48px] h-[44px] rounded-xl transition-all duration-200 cursor-pointer"
            title={item.label}
          >
            {isActive && (
              <motion.div
                layoutId="nav-pill"
                className="absolute inset-0 rounded-xl bg-accent/12"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Icon
              size={19}
              strokeWidth={isActive ? 2.2 : 1.7}
              className={`relative z-10 transition-all duration-200 ${
                isActive
                  ? "text-accent"
                  : "text-text-tertiary group-hover:text-text-primary"
              }`}
            />
            <span
              className={`relative z-10 text-[8px] mt-0.5 font-medium transition-all duration-200 ${
                isActive
                  ? "text-accent"
                  : "text-text-tertiary group-hover:text-text-secondary"
              }`}
            >
              {item.label}
            </span>
            <AnimatedTooltip visible={isHovered && !isActive} label={item.label} />
          </button>
        );
      })}

      {/* Settings - always visible */}
      <button
        onClick={() => navigate("/settings")}
        onMouseEnter={() => setHoveredPath("/settings")}
        onMouseLeave={() => setHoveredPath(null)}
        className="group relative flex flex-col items-center justify-center
          w-[48px] h-[44px] rounded-xl transition-all duration-200 cursor-pointer mt-auto"
        title="Settings"
      >
        {location.pathname === "/settings" && (
          <motion.div layoutId="nav-pill" className="absolute inset-0 rounded-xl bg-accent/12"
            transition={{ type: "spring", stiffness: 400, damping: 30 }} />
        )}
        <Settings size={19} strokeWidth={location.pathname === "/settings" ? 2.2 : 1.7}
          className={`relative z-10 transition-all ${location.pathname === "/settings" ? "text-accent" : "text-text-tertiary group-hover:text-text-primary"}`} />
        <span className={`relative z-10 text-[8px] mt-0.5 font-medium ${location.pathname === "/settings" ? "text-accent" : "text-text-tertiary"}`}>
          Settings
        </span>
      </button>

      {/* Add/Remove modules button */}
      <button
        onClick={() => setShowManager(!showManager)}
        className="w-[36px] h-[36px] mb-2 flex items-center justify-center rounded-xl
          bg-bg-hover/50 text-text-tertiary hover:text-accent hover:bg-accent/10
          transition-all cursor-pointer border border-border/20"
        title="Customize Modules"
      >
        {showManager ? <X size={14} /> : <Plus size={14} />}
      </button>

      {/* Module Manager Popover */}
      <AnimatePresence>
        {showManager && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowManager(false)} />
            <motion.div
              initial={{ opacity: 0, x: -10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, scale: 0.95 }}
              className="absolute bottom-14 left-[72px] z-50 w-72 bg-bg-elevated/95 backdrop-blur-2xl
                border border-border/50 rounded-2xl shadow-2xl p-3 overflow-hidden"
            >
              <p className="text-[10px] font-extrabold text-text-tertiary uppercase tracking-widest mb-3 px-2">
                Manage Modules
              </p>
              <div className="max-h-[400px] overflow-y-auto space-y-0.5">
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
