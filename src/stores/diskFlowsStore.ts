import { create } from "zustand";
import { db, generateId, now } from "@/lib/database";
import type { DiskFlowDownload } from "@/lib/database";

interface DiskFlowsState {
  downloads: DiskFlowDownload[];
  loading: boolean;

  loadDownloads: () => Promise<void>;
  addDownload: (url: string) => Promise<string>;
  updateDownload: (id: string, updates: Partial<DiskFlowDownload>) => void;
  deleteDownload: (id: string) => Promise<void>;
  startDownload: (id: string, formatId?: string) => void;
}

function detectPlatform(url: string): "youtube" | "instagram" | "other" {
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("instagram.com")) return "instagram";
  return "other";
}

function extractTitle(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace("www.", "") + u.pathname.slice(0, 30);
  } catch {
    return "Download";
  }
}

export const useDiskFlowsStore = create<DiskFlowsState>((set, get) => ({
  downloads: [],
  loading: true,

  loadDownloads: async () => {
    try {
      const downloads = await db.diskFlows.orderBy("created_at").reverse().toArray();
      set({ downloads, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addDownload: async (url: string) => {
    const id = generateId();
    const download: DiskFlowDownload = {
      id,
      url,
      title: extractTitle(url),
      platform: detectPlatform(url),
      status: "pending",
      progress: 0,
      file_path: null,
      thumbnail: null,
      error: null,
      created_at: now(),
    };

    set((state) => ({
      downloads: [download, ...state.downloads],
    }));

    try {
      await db.diskFlows.add(download);
    } catch {}

    return id;
  },

  updateDownload: (id, updates) => {
    set((state) => ({
      downloads: state.downloads.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
    }));
    db.diskFlows.update(id, updates).catch(() => {});
  },

  deleteDownload: async (id) => {
    set((state) => ({
      downloads: state.downloads.filter((d) => d.id !== id),
    }));
    try {
      await db.diskFlows.delete(id);
    } catch {}
  },

  startDownload: (id, formatId?: string) => {
    const download = get().downloads.find((d) => d.id === id);
    if (!download) return;

    // Check if Electron API is available for yt-dlp
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.diskFlows?.download) {
      get().updateDownload(id, { status: "downloading", progress: 0 });
      electronAPI.diskFlows.download(download.url, id, formatId || "best");
    } else {
      // Simulate progress in web mode for demo
      get().updateDownload(id, { status: "downloading", progress: 0 });
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          clearInterval(interval);
          get().updateDownload(id, {
            status: "completed",
            progress: 100,
            title: download.title || "Downloaded Video",
          });
        } else {
          get().updateDownload(id, { progress: Math.round(progress) });
        }
      }, 500);
    }
  },
}));
