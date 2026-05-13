import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { TitleBar } from "./TitleBar";
import { NavigationRail } from "./NavigationRail";
import { MobileClockWidget } from "./MobileClockWidget";
import { UpdateToast } from "@/components/ui/UpdateToast";
import { XPPopup, LevelUpOverlay } from "@/components/ui/Gamification";
import { useSettingsStore } from "@/stores/settingsStore";
import { useGamificationStore } from "@/stores/gamificationStore";
import { motion, AnimatePresence } from "motion/react";

export function AppLayout() {
  const { nav_position } = useSettingsStore();
  const { loadGamification, checkStreak } = useGamificationStore();
  const location = useLocation();

  useEffect(() => {
    loadGamification();
    checkStreak();
  }, []);

  const isBottom = nav_position === "bottom";
  const isRight = nav_position === "right";

  return (
    <div className="flex flex-col h-full w-full bg-bg-primary overflow-hidden select-none">
      <TitleBar />
      <div className={`flex flex-1 overflow-hidden ${
        isBottom ? "flex-col-reverse"
        : isRight ? "flex-col-reverse md:flex-row-reverse"
        : "flex-col-reverse md:flex-row"
      }`}>
        <NavigationRail />
        <main className="flex-1 overflow-hidden bg-bg-primary min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <UpdateToast />
      <MobileClockWidget />
      <XPPopup />
      <LevelUpOverlay />
    </div>
  );
}
