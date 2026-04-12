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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-primary overflow-hidden">
      {/* Background ambient glow */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-[600px] h-[600px] bg-accent/20 rounded-full blur-[100px] pointer-events-none"
      />

      <div className="relative flex flex-col items-center justify-center">
        {/* Orbiting ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-[-40px] border border-accent/20 rounded-full border-dashed"
        />

        {/* Inner pulsing ring */}
        <motion.div
          animate={{
            scale: [0.9, 1.1, 0.9],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-[-20px] bg-accent/10 rounded-full"
        />

        {/* Logo and text container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 25,
          }}
          className="relative flex flex-col items-center gap-5 z-10 bg-bg-primary/50 backdrop-blur-md p-8 rounded-[32px] border border-border-light shadow-2xl"
        >
          <motion.div
            initial={{ rotate: -15 }}
            animate={{ rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 10,
              delay: 0.1,
            }}
          >
            <Logo size={72} />
          </motion.div>

          {/* Glowing text */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-[22px] font-bold text-text-primary tracking-[-0.02em] bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-accent"
            >
              Delay
            </motion.div>
          </div>
          
          {/* Loading bar */}
          <div className="w-32 h-1 bg-bg-secondary rounded-full overflow-hidden mt-2">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                repeat: Infinity,
                duration: 1.2,
                ease: "easeInOut",
              }}
              className="w-1/2 h-full bg-accent rounded-full"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
