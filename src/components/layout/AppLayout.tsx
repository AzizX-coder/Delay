import { Outlet } from "react-router-dom";
import { TitleBar } from "./TitleBar";
import { NavigationRail } from "./NavigationRail";
import { UpdateToast } from "@/components/ui/UpdateToast";
import { useSettingsStore } from "@/stores/settingsStore";

export function AppLayout() {
  const { nav_position } = useSettingsStore();

  const isRight = nav_position === "right";
  const isBottom = nav_position === "bottom";

  return (
    <div className="flex flex-col h-full w-full bg-bg-primary overflow-hidden select-none">
      <TitleBar />
      <div className={`flex flex-1 overflow-hidden ${isBottom ? "flex-col" : isRight ? "flex-row-reverse" : "flex-col-reverse md:flex-row"}`}>
        {/* On mobile always show at bottom; on desktop follow nav_position */}
        {isBottom ? (
          <>
            <main className="flex-1 overflow-hidden bg-bg-primary"><Outlet /></main>
            <NavigationRail />
          </>
        ) : (
          <>
            <NavigationRail />
            <main className="flex-1 overflow-hidden bg-bg-primary"><Outlet /></main>
          </>
        )}
      </div>
      <UpdateToast />
    </div>
  );
}
