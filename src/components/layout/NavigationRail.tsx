import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  StickyNote,
  CheckSquare,
  Calendar,
  Sparkles,
  Timer,
  Code2,
  HardDrive,
  Settings,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { path: "/notes", icon: StickyNote, label: "Notes" },
  { path: "/tasks", icon: CheckSquare, label: "Tasks" },
  { path: "/calendar", icon: Calendar, label: "Calendar" },
  { path: "/timer", icon: Timer, label: "Timer" },
  { path: "/ai", icon: Sparkles, label: "AI" },
  { path: "/code-studio", icon: Code2, label: "Code" },
  { path: "/disk-flows", icon: HardDrive, label: "Disk" },
  { path: "/settings", icon: Settings, label: "Settings" },
] as const;

export function NavigationRail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  return (
    <nav
      className="flex flex-col items-center w-[64px] shrink-0 py-3 gap-0.5
        bg-bg-sidebar border-r border-border-light glass"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname.startsWith(item.path);
        const Icon = item.icon;
        const isHovered = hoveredPath === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            onMouseEnter={() => setHoveredPath(item.path)}
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

            {/* Tooltip */}
            <AnimatedTooltip visible={isHovered && !isActive} label={item.label} />
          </button>
        );
      })}
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
