import Dexie, { type EntityTable } from "dexie";
import type { Note } from "@/types/note";
import type { Task, TaskList } from "@/types/task";
import type { CalendarEvent } from "@/types/event";
import type { AIConversation, AIMessage } from "@/types/ai";

interface SettingRow {
  key: string;
  value: string;
}

export interface CodeSnippet {
  id: string;
  title: string;
  language: string;
  code: string;
  created_at: number;
  updated_at: number;
}

export interface TimerSession {
  id: string;
  type: "focus" | "short_break" | "long_break";
  duration: number; // seconds
  completed: boolean;
  started_at: number;
  ended_at: number;
}

export interface DiskFlowDownload {
  id: string;
  url: string;
  title: string;
  platform: "youtube" | "instagram" | "other";
  status: "pending" | "downloading" | "completed" | "error";
  progress: number;
  file_path: string | null;
  thumbnail: string | null;
  error: string | null;
  created_at: number;
}

export const db = new Dexie("DelayDB") as Dexie & {
  settings: EntityTable<SettingRow, "key">;
  notes: EntityTable<Note, "id">;
  tasks: EntityTable<Task, "id">;
  taskLists: EntityTable<TaskList, "id">;
  events: EntityTable<CalendarEvent, "id">;
  aiConversations: EntityTable<AIConversation, "id">;
  aiMessages: EntityTable<AIMessage, "id">;
  memories: EntityTable<{ id: string; content: string; created_at: number }, "id">;
  codeSnippets: EntityTable<CodeSnippet, "id">;
  timerSessions: EntityTable<TimerSession, "id">;
  diskFlows: EntityTable<DiskFlowDownload, "id">;
};

db.version(3).stores({
  settings: "key",
  notes: "id, pinned, updated_at, deleted_at",
  tasks: "id, list_id, completed, due_date, sort_order, deleted_at",
  taskLists: "id, sort_order",
  events: "id, start_time, end_time, deleted_at",
  aiConversations: "id, updated_at",
  aiMessages: "id, conversation_id, created_at",
  memories: "id, created_at",
  codeSnippets: "id, updated_at",
  timerSessions: "id, started_at",
  diskFlows: "id, created_at, status",
});

// Seed default task list
db.on("populate", () => {
  db.taskLists.add({
    id: "inbox",
    name: "Inbox",
    color: null,
    icon: "inbox",
    sort_order: 0,
    created_at: now(),
  });
});

export function generateId(): string {
  return crypto.randomUUID();
}

export function now(): number {
  return Math.floor(Date.now() / 1000);
}
