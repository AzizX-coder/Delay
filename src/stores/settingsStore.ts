import { create } from "zustand";
import { db } from "@/lib/database";
import type { AppSettings } from "@/types/settings";
import { DEFAULT_SETTINGS } from "@/types/settings";

interface SettingsState extends AppSettings {
  loading: boolean;
  initSettings: () => Promise<void>;
  setSetting: <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  ...DEFAULT_SETTINGS,
  loading: true,

  initSettings: async () => {
    try {
      const rows = await db.settings.toArray();
      const settings: Partial<AppSettings> = {};
      for (const row of rows) {
        if (row.key === "onboarding_completed") {
          settings.onboarding_completed = row.value === "true";
        } else if (row.key === "sidebar_collapsed") {
          settings.sidebar_collapsed = row.value === "true";
        } else {
          (settings as Record<string, string>)[row.key] = row.value;
        }
      }
      set({ ...DEFAULT_SETTINGS, ...settings, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  setSetting: async (key, value) => {
    set({ [key]: value } as Partial<SettingsState>);
    try {
      await db.settings.put({ key, value: String(value) });
    } catch {
      // silent
    }
  },

  completeOnboarding: async () => {
    set({ onboarding_completed: true });
    try {
      await db.settings.put({ key: "onboarding_completed", value: "true" });
    } catch {
      // silent
    }
  },
}));
