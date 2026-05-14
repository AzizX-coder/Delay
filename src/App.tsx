import { useEffect, useState, lazy, Suspense } from "react";
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
import { SettingsPage } from "@/features/settings/SettingsPage";
import { OnboardingFlow } from "@/features/onboarding/OnboardingFlow";
import { KanbanPage } from "@/features/kanban/KanbanPage";
import { WhiteboardPage } from "@/features/whiteboard/WhiteboardPage";
import { VoiceStudioPage } from "@/features/voice-studio/VoiceStudioPage";
import { BucketPage } from "@/features/bucket/BucketPage";
import { CapturePage } from "@/features/capture/CapturePage";
import { StatusPage } from "@/features/status/StatusPage";
import { FlowsPage } from "@/features/flows/FlowsPage";
import { AppLock } from "@/components/ui/AppLock";
import { Logo } from "@/components/ui/Logo";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { QuickCaptureModal } from "@/components/ui/QuickCaptureModal";
import { motion } from "motion/react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useGamificationStore } from "@/stores/gamificationStore";
import { AuthPage } from "@/features/auth/AuthPage";
import { isSupabaseConfigured } from "@/lib/supabase";
import { PricingPage } from "@/features/pricing/PricingPage";
import { PublicNotePage } from "@/features/share/PublicNotePage";

const OFFLINE_KEY = "delay_offline_mode";

export default function App() {
  const { initTheme } = useThemeStore();
  const { onboarding_completed, usage_mode, loading, initSettings, setSetting, language, security_pin } = useSettingsStore();
  const [ready, setReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);
  const [skippedAuth, setSkippedAuth] = useState(
    () => sessionStorage.getItem(OFFLINE_KEY) === "1"
  );

  const { user, loading: authLoading } = useAuth();
  const { profile } = useProfile();
  const { setXP, setStreak } = useGamificationStore();

  // Hydrate gamification from cloud profile
  useEffect(() => {
    if (profile) {
      if (typeof profile.xp === "number") setXP(profile.xp);
      if (typeof profile.streak_days === "number") {
        setStreak(profile.streak_days, profile.streak_last_date ?? null);
      }
    }
  }, [profile?.id]);

  // Wire sync + online flush on login
  useEffect(() => {
    if (!user) return;
    // Set global userId for sync (used by stores)
    (window as any).__delayUserId = user.id;

    const flush = async () => {
      try {
        const { flushQueue } = await import("@/lib/sync");
        flushQueue(user.id);
      } catch {}
    };
    const pull = async () => {
      try {
        const { pullFromSupabase } = await import("@/lib/sync");
        const lastSync = parseInt(localStorage.getItem("delay_last_sync") ?? "0", 10);
        await pullFromSupabase(user.id, lastSync);
        localStorage.setItem("delay_last_sync", String(Math.floor(Date.now() / 1000)));
      } catch {}
    };

    pull();
    window.addEventListener("online", flush);
    return () => {
      window.removeEventListener("online", flush);
      (window as any).__delayUserId = null;
    };
  }, [user?.id]);

  // Cmd+K / Ctrl+Shift+S shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdkOpen((v) => !v);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setQuickCaptureOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

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

  const { accent_color, density, font_family, reduce_motion, rounded_corners } = useSettingsStore();
  useEffect(() => {
    const root = document.documentElement;
    if (accent_color) root.style.setProperty("--color-accent", accent_color);
    const densityScale = density === "compact" ? "0.92" : density === "spacious" ? "1.08" : "1";
    root.style.setProperty("--density-scale", densityScale);
    const fontStack: Record<string, string> = {
      sans: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      serif: "ui-serif, Georgia, 'Times New Roman', serif",
      mono: "ui-monospace, 'JetBrains Mono', SFMono-Regular, Menlo, monospace",
      rounded: "ui-rounded, 'SF Pro Rounded', 'Hiragino Maru Gothic Pro', system-ui, sans-serif",
    };
    root.style.setProperty("--font-app", fontStack[font_family] || fontStack.sans);
    document.body.style.fontFamily = "var(--font-app)";
    if (typeof rounded_corners === "number") {
      root.style.setProperty("--radius-base", `${rounded_corners}px`);
    }
    if (reduce_motion) root.classList.add("reduce-motion");
    else root.classList.remove("reduce-motion");
  }, [accent_color, density, font_family, reduce_motion, rounded_corners]);

  useEffect(() => {
    if (security_pin) setIsLocked(true);
  }, [security_pin]);

  if (!ready || loading || showSplash) {
    return <SplashScreen />;
  }

  if (isLocked && security_pin) {
    return <AppLock onUnlock={() => setIsLocked(false)} />;
  }

  if (!onboarding_completed) {
    return <OnboardingFlow />;
  }

  // Auth gate — only when Supabase is configured AND the user didn't choose
  // "Local Only" during onboarding. (usage_mode === null = legacy users who
  // onboarded before this choice existed → keep the old prompt-once behavior.)
  if (isSupabaseConfigured && usage_mode !== "local") {
    if (authLoading) return <SplashScreen />;
    if (!user && !skippedAuth) {
      return (
        <AuthPage
          onSkip={() => {
            setSetting("usage_mode", "local");
            sessionStorage.setItem(OFFLINE_KEY, "1");
            setSkippedAuth(true);
          }}
        />
      );
    }
  }

  return (
    <HashRouter>
      <CommandPalette open={cmdkOpen} onClose={() => setCmdkOpen(false)} />
      <QuickCaptureModal open={quickCaptureOpen} onClose={() => setQuickCaptureOpen(false)} />
      <Routes>
        {/* Public share routes — no auth required */}
        <Route path="share/note/:slug" element={<PublicNotePage />} />

        {/* Main app */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/notes" replace />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="timer" element={<TimerPage />} />
          <Route path="ai" element={<AIChatPage />} />
          <Route path="code-studio" element={<CodeStudioPage />} />
          <Route path="kanban" element={<KanbanPage />} />
          <Route path="whiteboard" element={<WhiteboardPage />} />
          <Route path="voice-studio" element={<VoiceStudioPage />} />
          <Route path="bucket" element={<BucketPage />} />
          <Route path="capture" element={<CapturePage />} />
          <Route path="status" element={<StatusPage />} />
          <Route path="flows" element={<FlowsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="pricing" element={<PricingPage />} />
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
