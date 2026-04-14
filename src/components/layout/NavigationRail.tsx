import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  StickyNote,
  CheckSquare,
  Calendar,
  Sparkles,
  Settings,
} from "lucide-react";
import { useT } from "@/lib/i18n";

const NAV_ITEMS = [
  { path: "/notes", icon: StickyNote, key: "app.notes" },
  { path: "/tasks", icon: CheckSquare, key: "app.tasks" },
  { path: "/calendar", icon: Calendar, key: "app.calendar" },
  { path: "/ai", icon: Sparkles, key: "app.ai" },
  { path: "/settings", icon: Settings, key: "app.settings" },
] as const;

export function NavigationRail() {
  const location = useLocation();
  const navigate = useNavigate();
  const t = useT();

  return (
    <nav
      className="flex flex-col items-center w-[68px] shrink-0 py-3 gap-1
        bg-bg-sidebar border-r border-border-light glass"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname.startsWith(item.path);
        const Icon = item.icon;
        const label = t(item.key);
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="group relative flex flex-col items-center justify-center
              w-[52px] h-[48px] rounded-xl transition-colors duration-200 cursor-pointer"
            title={label}
          >
            {isActive && (
              <motion.div
                layoutId="nav-pill"
                className="absolute inset-0 rounded-xl bg-accent/12"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Icon
              size={20}
              strokeWidth={isActive ? 2.2 : 1.7}
              className={`relative z-10 transition-colors duration-200 ${
                isActive
                  ? "text-accent"
                  : "text-text-tertiary group-hover:text-text-secondary"
              }`}
            />
            <span
              className={`relative z-10 text-[9px] mt-0.5 font-medium transition-colors duration-200 ${
                isActive
                  ? "text-accent"
                  : "text-text-tertiary group-hover:text-text-secondary"
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
