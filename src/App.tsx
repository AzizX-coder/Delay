import { useEffect, useState } from "react";
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useThemeStore } from "@/stores/themeStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { AppLayout } from "@/components/layout/AppLayout";
import { NotesPage } from "@/features/notes/NotesPage";
import { TasksPage } from "@/features/tasks/TasksPage";
import { CalendarPage } from "@/features/calendar/CalendarPage";
import { AIChatPage } from "@/features/ai/AIChatPage";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { OnboardingFlow } from "@/features/onboarding/OnboardingFlow";
import { Logo } from "@/components/ui/Logo";
import { motion } from "motion/react";

export default function App() {
  const { initTheme } = useThemeStore();
  const { onboarding_completed, loading, initSettings } = useSettingsStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      await initSettings();
      await initTheme();
      setReady(true);
    }
    init();
  }, []);

  if (!ready || loading) {
    return <SplashScreen />;
  }

  if (!onboarding_completed) {
    return <OnboardingFlow />;
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/notes" replace />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="ai" element={<AIChatPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

function SplashScreen() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-bg-primary">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex flex-col items-center gap-4"
      >
        <Logo size={64} />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-[18px] font-semibold text-text-primary tracking-[-0.01em]"
        >
          Delay
        </motion.div>
      </motion.div>
    </div>
  );
}
