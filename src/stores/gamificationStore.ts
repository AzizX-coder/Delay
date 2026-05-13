import { create } from "zustand";

interface XPEvent {
  amount: number;
  label: string;
  timestamp: number;
}

interface GamificationState {
  xp: number;
  level: number;
  streak_days: number;
  streak_last_date: string | null;
  pending_xp: XPEvent | null;        // for floating animation
  show_level_up: boolean;

  loadGamification: () => void;
  addXP: (amount: number, label: string) => void;
  clearPendingXP: () => void;
  clearLevelUp: () => void;
  checkStreak: () => void;
}

const KEY = "delay_gamification";

function calcLevel(xp: number) {
  return Math.floor(xp / 500) + 1;
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  xp: 0,
  level: 1,
  streak_days: 0,
  streak_last_date: null,
  pending_xp: null,
  show_level_up: false,

  loadGamification: () => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const data = JSON.parse(raw);
        set({
          xp: data.xp || 0,
          level: calcLevel(data.xp || 0),
          streak_days: data.streak_days || 0,
          streak_last_date: data.streak_last_date || null,
        });
      }
    } catch {}
  },

  addXP: (amount, label) => {
    const state = get();
    const newXP = state.xp + amount;
    const oldLevel = state.level;
    const newLevel = calcLevel(newXP);
    const showLevelUp = newLevel > oldLevel;

    set({
      xp: newXP,
      level: newLevel,
      pending_xp: { amount, label, timestamp: Date.now() },
      show_level_up: showLevelUp,
    });

    localStorage.setItem(KEY, JSON.stringify({
      xp: newXP,
      streak_days: state.streak_days,
      streak_last_date: state.streak_last_date,
    }));
  },

  clearPendingXP: () => set({ pending_xp: null }),
  clearLevelUp: () => set({ show_level_up: false }),

  checkStreak: () => {
    const state = get();
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    if (state.streak_last_date === today) return; // already counted today

    let newStreak = 1;
    if (state.streak_last_date === yesterday) {
      newStreak = state.streak_days + 1;
    }

    set({ streak_days: newStreak, streak_last_date: today });
    localStorage.setItem(KEY, JSON.stringify({
      xp: state.xp,
      streak_days: newStreak,
      streak_last_date: today,
    }));

    // Streak bonus
    if (newStreak === 7) {
      get().addXP(100, "7-day streak! 🔥");
    }
  },
}));

// XP reward constants
export const XP_REWARDS = {
  COMPLETE_TASK: 10,
  COMPLETE_FOCUS: 25,
  CREATE_NOTE: 5,
  ALL_TASKS_DONE: 50,
  STREAK_7: 100,
} as const;
