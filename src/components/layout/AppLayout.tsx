import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { TitleBar } from "./TitleBar";
import { NavigationRail } from "./NavigationRail";
import { MobileClockWidget } from "./MobileClockWidget";
import { UpdateToast } from "@/components/ui/UpdateToast";
import { XPPopup, LevelUpOverlay } from "@/components/ui/Gamification";
import { useSettingsStore } from "@/stores/settingsStore";
import { useGamificationStore } from "@/stores/gamificationStore";

export function AppLayout() {
  const { nav_position } = useSettingsStore();
  const { loadGamification, checkStreak } = useGamificationStore();

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
          <Outlet />
        </main>
      </div>
      <UpdateToast />
      <MobileClockWidget />
      <XPPopup />
      <LevelUpOverlay />
    </div>
  );
}
