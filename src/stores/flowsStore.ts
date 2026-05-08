import { create } from "zustand";

export type BlockType = "tasks" | "notes" | "links" | "steps";

export interface FlowItem {
  id: string;
  text: string;
  done?: boolean;
  url?: string;
}

export interface FlowBlock {
  id: string;
  type: BlockType;
  title: string;
  items: FlowItem[];
}

export interface Flow {
  id: string;
  title: string;
  description: string;
  color: string;     // accent hex
  emoji?: string;    // 1-glyph for header
  blocks: FlowBlock[];
  pinned: boolean;
  created_at: number;
  updated_at: number;
}

interface FlowsState {
  flows: Flow[];
  loading: boolean;
  loadFlows: () => void;
  createFlow: (title: string) => string;
  updateFlow: (id: string, patch: Partial<Flow>) => void;
  removeFlow: (id: string) => void;
  togglePin: (id: string) => void;

  addBlock: (flowId: string, type: BlockType, title?: string) => void;
  removeBlock: (flowId: string, blockId: string) => void;
  renameBlock: (flowId: string, blockId: string, title: string) => void;

  addItem: (flowId: string, blockId: string, text: string) => void;
  toggleItem: (flowId: string, blockId: string, itemId: string) => void;
  updateItem: (flowId: string, blockId: string, itemId: string, patch: Partial<FlowItem>) => void;
  removeItem: (flowId: string, blockId: string, itemId: string) => void;
}

const KEY = "delay_flows";
const COLORS = ["#6366F1", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6"];

const persist = (flows: Flow[]) => {
  try { localStorage.setItem(KEY, JSON.stringify(flows)); } catch {}
};

const uid = () => crypto.randomUUID();
const now = () => Date.now();

const defaultBlocks = (): FlowBlock[] => [
  { id: uid(), type: "tasks", title: "Tasks",  items: [] },
  { id: uid(), type: "notes", title: "Notes",  items: [] },
  { id: uid(), type: "steps", title: "Steps",  items: [] },
];

export const useFlowsStore = create<FlowsState>((set, get) => ({
  flows: [],
  loading: true,

  loadFlows: () => {
    try {
      const raw = localStorage.getItem(KEY);
      set({ flows: raw ? JSON.parse(raw) : [], loading: false });
    } catch { set({ loading: false }); }
  },

  createFlow: (title) => {
    const flow: Flow = {
      id: uid(),
      title: title.trim() || "Untitled flow",
      description: "",
      color: COLORS[get().flows.length % COLORS.length],
      blocks: defaultBlocks(),
      pinned: false,
      created_at: now(),
      updated_at: now(),
    };
    const next = [flow, ...get().flows];
    set({ flows: next });
    persist(next);
    return flow.id;
  },

  updateFlow: (id, patch) => {
    const next = get().flows.map(f => f.id === id ? { ...f, ...patch, updated_at: now() } : f);
    set({ flows: next }); persist(next);
  },

  removeFlow: (id) => {
    const next = get().flows.filter(f => f.id !== id);
    set({ flows: next }); persist(next);
  },

  togglePin: (id) => {
    const next = get().flows.map(f => f.id === id ? { ...f, pinned: !f.pinned, updated_at: now() } : f);
    set({ flows: next }); persist(next);
  },

  addBlock: (flowId, type, title) => {
    const titles: Record<BlockType, string> = { tasks: "Tasks", notes: "Notes", links: "Links", steps: "Steps" };
    const block: FlowBlock = { id: uid(), type, title: title || titles[type], items: [] };
    const next = get().flows.map(f => f.id === flowId ? { ...f, blocks: [...f.blocks, block], updated_at: now() } : f);
    set({ flows: next }); persist(next);
  },

  removeBlock: (flowId, blockId) => {
    const next = get().flows.map(f => f.id === flowId ? { ...f, blocks: f.blocks.filter(b => b.id !== blockId), updated_at: now() } : f);
    set({ flows: next }); persist(next);
  },

  renameBlock: (flowId, blockId, title) => {
    const next = get().flows.map(f => f.id === flowId
      ? { ...f, blocks: f.blocks.map(b => b.id === blockId ? { ...b, title } : b), updated_at: now() }
      : f);
    set({ flows: next }); persist(next);
  },

  addItem: (flowId, blockId, text) => {
    const t = text.trim(); if (!t) return;
    const isUrl = /^https?:\/\//i.test(t);
    const item: FlowItem = { id: uid(), text: t, url: isUrl ? t : undefined };
    const next = get().flows.map(f => f.id === flowId
      ? { ...f, blocks: f.blocks.map(b => b.id === blockId ? { ...b, items: [...b.items, item] } : b), updated_at: now() }
      : f);
    set({ flows: next }); persist(next);
  },

  toggleItem: (flowId, blockId, itemId) => {
    const next = get().flows.map(f => f.id === flowId
      ? { ...f, blocks: f.blocks.map(b => b.id === blockId
          ? { ...b, items: b.items.map(i => i.id === itemId ? { ...i, done: !i.done } : i) }
          : b), updated_at: now() }
      : f);
    set({ flows: next }); persist(next);
  },

  updateItem: (flowId, blockId, itemId, patch) => {
    const next = get().flows.map(f => f.id === flowId
      ? { ...f, blocks: f.blocks.map(b => b.id === blockId
          ? { ...b, items: b.items.map(i => i.id === itemId ? { ...i, ...patch } : i) }
          : b), updated_at: now() }
      : f);
    set({ flows: next }); persist(next);
  },

  removeItem: (flowId, blockId, itemId) => {
    const next = get().flows.map(f => f.id === flowId
      ? { ...f, blocks: f.blocks.map(b => b.id === blockId
          ? { ...b, items: b.items.filter(i => i.id !== itemId) }
          : b), updated_at: now() }
      : f);
    set({ flows: next }); persist(next);
  },
}));

export const FLOW_COLORS = COLORS;
