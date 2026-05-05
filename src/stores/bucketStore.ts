import { create } from "zustand";
import { db } from "@/lib/database";

export interface BucketItem {
  id: string;
  type: "text" | "link" | "file";
  content: string;       // text content or URL
  fileName?: string;     // original filename for files
  fileData?: string;     // base64 data for files
  fileType?: string;     // MIME type
  pinned: boolean;
  created_at: number;
}

interface BucketState {
  items: BucketItem[];
  loading: boolean;
  loadItems: () => Promise<void>;
  addItem: (item: Omit<BucketItem, "id" | "created_at" | "pinned">) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
}

export const useBucketStore = create<BucketState>((set, get) => ({
  items: [],
  loading: true,

  loadItems: async () => {
    try {
      const raw = localStorage.getItem("delay_bucket");
      if (raw) {
        set({ items: JSON.parse(raw), loading: false });
      } else {
        set({ loading: false });
      }
    } catch {
      set({ loading: false });
    }
  },

  addItem: async (partial) => {
    const item: BucketItem = {
      ...partial,
      id: crypto.randomUUID(),
      pinned: false,
      created_at: Date.now(),
    };
    const next = [item, ...get().items];
    set({ items: next });
    localStorage.setItem("delay_bucket", JSON.stringify(next));
  },

  removeItem: async (id) => {
    const next = get().items.filter((i) => i.id !== id);
    set({ items: next });
    localStorage.setItem("delay_bucket", JSON.stringify(next));
  },

  togglePin: async (id) => {
    const next = get().items.map((i) =>
      i.id === id ? { ...i, pinned: !i.pinned } : i
    );
    set({ items: next });
    localStorage.setItem("delay_bucket", JSON.stringify(next));
  },
}));
