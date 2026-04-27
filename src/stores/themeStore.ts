import { create } from "zustand";
import { db } from "@/lib/database";

type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  theme: ThemeMode;
  resolved: "light" | "dark";
  customBgData: string | null;
  setTheme: (theme: ThemeMode) => void;
  setCustomBg: (dataUrl: string | null) => Promise<void>;
  initTheme: () => Promise<void>;
}

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(resolved: "light" | "dark", bgData: string | null = null) {
  document.documentElement.classList.toggle("dark", resolved === "dark");
  
  if (bgData) {
    document.documentElement.classList.add("custom-bg");
    document.body.style.backgroundImage = `url(${bgData})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundAttachment = "fixed";
  } else {
    document.documentElement.classList.remove("custom-bg");
    document.body.style.backgroundImage = "";
  }
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "system",
  resolved: getSystemTheme(),
  customBgData: null,

  setTheme: async (theme: ThemeMode) => {
    const resolved = theme === "system" ? getSystemTheme() : theme;
    applyTheme(resolved, get().customBgData);
    set({ theme, resolved });
    try {
      await db.settings.put({ key: "theme", value: theme });
    } catch {}
  },

  setCustomBg: async (dataUrl: string | null) => {
    applyTheme(get().resolved, dataUrl);
    set({ customBgData: dataUrl });
    try {
      if (dataUrl) {
        await db.settings.put({ key: "custom_bg", value: dataUrl });
      } else {
        await db.settings.delete("custom_bg");
      }
    } catch {}
  },

  initTheme: async () => {
    try {
      const rowTheme = await db.settings.get("theme");
      const rowBg = await db.settings.get("custom_bg");
      
      const theme = (rowTheme?.value as ThemeMode) || "system";
      const customBgData = (rowBg?.value as string) || null;
      
      const resolved = theme === "system" ? getSystemTheme() : theme;
      applyTheme(resolved, customBgData);
      set({ theme, resolved, customBgData });
    } catch {
      const resolved = getSystemTheme();
      applyTheme(resolved, null);
      set({ resolved });
    }

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        const { theme, customBgData } = get();
        if (theme === "system") {
          const resolved = getSystemTheme();
          applyTheme(resolved, customBgData);
          set({ resolved });
        }
      });
  },
}));
