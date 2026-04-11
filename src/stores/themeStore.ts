import { create } from "zustand";
import { db } from "@/lib/database";

type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  theme: ThemeMode;
  resolved: "light" | "dark";
  setTheme: (theme: ThemeMode) => void;
  initTheme: () => Promise<void>;
}

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(resolved: "light" | "dark") {
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "system",
  resolved: getSystemTheme(),

  setTheme: async (theme: ThemeMode) => {
    const resolved = theme === "system" ? getSystemTheme() : theme;
    applyTheme(resolved);
    set({ theme, resolved });
    try {
      await db.settings.put({ key: "theme", value: theme });
    } catch {
      // DB not ready during onboarding preview
    }
  },

  initTheme: async () => {
    try {
      const row = await db.settings.get("theme");
      const theme = (row?.value as ThemeMode) || "system";
      const resolved = theme === "system" ? getSystemTheme() : theme;
      applyTheme(resolved);
      set({ theme, resolved });
    } catch {
      const resolved = getSystemTheme();
      applyTheme(resolved);
      set({ resolved });
    }

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        const { theme } = get();
        if (theme === "system") {
          const resolved = getSystemTheme();
          applyTheme(resolved);
          set({ resolved });
        }
      });
  },
}));
