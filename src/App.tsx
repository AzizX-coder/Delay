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
import { TimerPage } from "@/features/timer/TimerPage";
import { CodeStudioPage } from "@/features/code-studio/CodeStudioPage";
import { DiskFlowsPage } from "@/features/disk-flows/DiskFlowsPage";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { OnboardingFlow } from "@/features/onboarding/OnboardingFlow";
import { KanbanPage } from "@/features/kanban/KanbanPage";
import { WhiteboardPage } from "@/features/whiteboard/WhiteboardPage";
import { VoiceStudioPage } from "@/features/voice-studio/VoiceStudioPage";
import { Logo } from "@/components/ui/Logo";
import { motion } from "motion/react";

export default function App() {
  const { initTheme } = useThemeStore();
  const { onboarding_completed, loading, initSettings, language } = useSettingsStore();
  const [ready, setReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    async function init() {
      await initSettings();
      await initTheme();
      setReady(true);
      const timer = setTimeout(() => setShowSplash(false), 600);
      return () => clearTimeout(timer);
    }
    init();
  }, []);

  useEffect(() => {
    if (!language) return;
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  if (!ready || loading || showSplash) {
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
          <Route path="timer" element={<TimerPage />} />
          <Route path="ai" element={<AIChatPage />} />
          <Route path="code-studio" element={<CodeStudioPage />} />
          <Route path="disk-flows" element={<DiskFlowsPage />} />
          <Route path="kanban" element={<KanbanPage />} />
          <Route path="whiteboard" element={<WhiteboardPage />} />
          <Route path="voice-studio" element={<VoiceStudioPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-primary">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex flex-col items-center gap-6"
      >
        <Logo size={56} />
        <div className="w-6 h-6 relative">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-[1.5px] border-border-light border-t-accent"
          />
        </div>
      </motion.div>
    </div>
  );
}
