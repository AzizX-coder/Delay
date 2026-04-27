import { create } from "zustand";
import { db, generateId, now } from "@/lib/database";
import type { CodeSnippet } from "@/lib/database";

export const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "sql", label: "SQL" },
  { value: "markdown", label: "Markdown" },
  { value: "bash", label: "Bash" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "java", label: "Java" },
  { value: "plaintext", label: "Plain Text" },
];

interface CodeStudioState {
  snippets: CodeSnippet[];
  activeSnippetId: string | null;
  loading: boolean;

  loadSnippets: () => Promise<void>;
  createSnippet: (language?: string) => Promise<string>;
  updateSnippet: (id: string, updates: Partial<CodeSnippet>) => Promise<void>;
  deleteSnippet: (id: string) => Promise<void>;
  setActiveSnippet: (id: string | null) => void;
}

export const useCodeStudioStore = create<CodeStudioState>((set, get) => ({
  snippets: [],
  activeSnippetId: null,
  loading: true,

  loadSnippets: async () => {
    try {
      const snippets = await db.codeSnippets.orderBy("updated_at").reverse().toArray();
      set({ snippets, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createSnippet: async (language = "javascript") => {
    const id = generateId();
    const timestamp = now();
    const snippet: CodeSnippet = {
      id,
      title: "Untitled Snippet",
      language,
      code: "",
      created_at: timestamp,
      updated_at: timestamp,
    };

    set((state) => ({
      snippets: [snippet, ...state.snippets],
      activeSnippetId: id,
    }));

    try {
      await db.codeSnippets.add(snippet);
    } catch {}

    return id;
  },

  updateSnippet: async (id, updates) => {
    const updatedFields = { ...updates, updated_at: now() };
    set((state) => ({
      snippets: state.snippets.map((s) =>
        s.id === id ? { ...s, ...updatedFields } : s
      ),
    }));
    try {
      await db.codeSnippets.update(id, updatedFields);
    } catch {}
  },

  deleteSnippet: async (id) => {
    set((state) => ({
      snippets: state.snippets.filter((s) => s.id !== id),
      activeSnippetId: state.activeSnippetId === id ? null : state.activeSnippetId,
    }));
    try {
      await db.codeSnippets.delete(id);
    } catch {}
  },

  setActiveSnippet: (id) => set({ activeSnippetId: id }),
}));
