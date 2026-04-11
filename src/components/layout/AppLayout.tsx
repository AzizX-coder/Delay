import { Outlet } from "react-router-dom";
import { TitleBar } from "./TitleBar";
import { NavigationRail } from "./NavigationRail";

export function AppLayout() {
  return (
    <div className="flex flex-col h-full w-full bg-bg-primary overflow-hidden select-none">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <NavigationRail />
        <main className="flex-1 overflow-hidden bg-bg-primary">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
