import Dexie, { type EntityTable } from "dexie";
import type { Note } from "@/types/note";
import type { Task, TaskList } from "@/types/task";
import type { CalendarEvent } from "@/types/event";
import type { AIConversation, AIMessage } from "@/types/ai";

interface SettingRow {
  key: string;
  value: string;
}

export const db = new Dexie("DelayDB") as Dexie & {
  settings: EntityTable<SettingRow, "key">;
  notes: EntityTable<Note, "id">;
  tasks: EntityTable<Task, "id">;
  taskLists: EntityTable<TaskList, "id">;
  events: EntityTable<CalendarEvent, "id">;
  aiConversations: EntityTable<AIConversation, "id">;
  aiMessages: EntityTable<AIMessage, "id">;
};

db.version(1).stores({
  settings: "key",
  notes: "id, pinned, updated_at, deleted_at",
  tasks: "id, list_id, completed, due_date, sort_order, deleted_at",
  taskLists: "id, sort_order",
  events: "id, start_time, end_time, deleted_at",
  aiConversations: "id, updated_at",
  aiMessages: "id, conversation_id, created_at",
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
