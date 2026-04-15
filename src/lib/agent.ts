import { useNotesStore } from "@/stores/notesStore";
import { useTasksStore } from "@/stores/tasksStore";
import { useCalendarStore } from "@/stores/calendarStore";
import { db, generateId, now } from "@/lib/database";

interface ToolCall {
  name: string;
  arguments: Record<string, any>;
}

const MAX_TURNS = 10;

export async function processAgentRequest(
  input: string,
  onUpdate: (chunk: string | null, thought?: string | null) => void,
  callOllama: (prompt: string, onV: (v: string) => void) => Promise<string>
) {
  const nowUnix = Math.floor(Date.now() / 1000);
  const localNow = new Date().toISOString();

  // Pre-compute ambient context so the agent reasons over *real* state.
  const tasksSnapshot = useTasksStore.getState().tasks;
  const listsSnapshot = useTasksStore.getState().taskLists;
  const openTasks = tasksSnapshot
    .filter((t) => !t.completed)
    .slice(0, 12)
    .map((t) => ({
      id: t.id,
      title: t.title,
      list_id: t.list_id,
      priority: t.priority,
      due_date: t.due_date,
    }));
  const recentNotes = useNotesStore
    .getState()
    .notes.slice(0, 6)
    .map((n) => ({ id: n.id, title: n.title || "Untitled", preview: (n.content_text || "").slice(0, 80) }));
  const memSnapshot = (await db.memories.toArray()).slice(-8).map((m) => m.content);

  const systemPrompt = `Delay Agent — an autonomous, tool-using assistant embedded in a local-first productivity app.
Current time: ${localNow} (unix ${nowUnix}).

OPERATING PRINCIPLES
1. Be autonomous. Decide, act, verify. Don't ask the user to re-confirm obvious intent.
2. Prefer action over narration. Silence between tool calls is fine.
3. Chain multiple tools across turns when the goal needs it (up to ${MAX_TURNS} turns).
4. After each tool result, reason briefly (inside <think>) then act again or finish.
5. Final reply: short, friendly markdown. No JSON. No <think> in the final message.
6. Never invent IDs. Use IDs returned by getTasks / listNotes / recallMemories.
7. If a tool errors, read the error and try a different approach — don't loop.
8. Save durable facts about the user with saveMemory (preferences, recurring context).

TOOL CALL FORMAT (exactly one per turn, fenced JSON)
\`\`\`json
{ "tool_call": { "name": "<tool>", "arguments": { ... } } }
\`\`\`

TOOLS
- createNote({ title, content })  → creates a note, returns id
- updateNote({ id, updates })     → updates: title, content_text, pinned, color
- deleteNote({ id })
- listNotes({ query? })           → titles + previews, optional filter
- readNote({ id })                → full text of one note
- createTask({ title, listId?, due_date?, priority? })
- updateTask({ id, updates })     → updates: title, description, priority, due_date, completed
- deleteTask({ id })
- getTasks({ filter? })           → filter: "open"|"today"|"completed"|"all"
- createTaskList({ name, icon? })
- createCalendarEvent({ title, start, end, description? })
- listCalendarEvents({ from?, to? })
- searchWeb({ query })
- saveMemory({ fact })
- recallMemories({ query? })
- finish()                         → signal you're done (optional)

CURRENT STATE SNAPSHOT
open_tasks: ${JSON.stringify(openTasks)}
recent_notes: ${JSON.stringify(recentNotes)}
task_lists: ${JSON.stringify(listsSnapshot.map((l) => ({ id: l.id, name: l.name })))}
memories: ${JSON.stringify(memSnapshot)}`;

  let history = `\n\nUser: ${input}\nAgent:`;
  let turns = 0;

  while (turns < MAX_TURNS) {
    turns++;
    let currentTurnResponse = "";
    let isThinking = false;

    await callOllama(`${systemPrompt}${history}`, (token) => {
      currentTurnResponse += token;
      if (token.includes("<think>")) isThinking = true;
      if (isThinking) onUpdate(null, token);
      else onUpdate(token, null);
      if (token.includes("</think>")) isThinking = false;
    });

    history += currentTurnResponse;

    const toolMatch = currentTurnResponse.match(/```json\s*\n([\s\S]*?)\n```/);
    if (!toolMatch) break;

    let parsed: any;
    try {
      parsed = JSON.parse(toolMatch[1]);
    } catch (e: any) {
      history += `\nSystem Result: parse_error ${e.message}. Try again with valid JSON.\nAgent:`;
      continue;
    }

    if (!parsed?.tool_call?.name) break;
    const tc: ToolCall = parsed.tool_call;
    if (tc.name === "finish") break;

    onUpdate(`\n\n*Working: ${tc.name}…*\n\n`);
    const result = await executeTool(tc);
    history += `\nSystem Result (${tc.name}): ${result}\nAgent (reason, then either call the next tool or send the final markdown reply):`;
  }
}

async function executeTool(toolCall: ToolCall): Promise<string> {
  try {
    const { name, arguments: args } = toolCall;
    switch (name) {
      case "createNote": {
        const id = await useNotesStore.getState().createNote();
        const text: string = args.content ?? "";
        await useNotesStore.getState().updateNote(id, {
          title: args.title,
          content_text: text,
          content: JSON.stringify({
            type: "doc",
            content: [
              { type: "paragraph", content: text ? [{ type: "text", text }] : [] },
            ],
          }),
        });
        return `ok id=${id}`;
      }
      case "updateNote":
        await useNotesStore.getState().updateNote(args.id, args.updates);
        return `ok`;
      case "deleteNote":
        await useNotesStore.getState().deleteNote(args.id);
        return `ok`;
      case "listNotes": {
        const notes = useNotesStore.getState().notes;
        const q = (args?.query || "").toLowerCase();
        const list = (q
          ? notes.filter(
              (n) =>
                (n.title || "").toLowerCase().includes(q) ||
                (n.content_text || "").toLowerCase().includes(q)
            )
          : notes
        )
          .slice(0, 15)
          .map((n) => ({ id: n.id, title: n.title || "Untitled", preview: (n.content_text || "").slice(0, 100) }));
        return JSON.stringify(list);
      }
      case "readNote": {
        const note = useNotesStore.getState().notes.find((n) => n.id === args.id);
        if (!note) return `not_found`;
        return JSON.stringify({ id: note.id, title: note.title, content: note.content_text });
      }
      case "createTask": {
        await useTasksStore.getState().createTask(args.title, args.listId);
        const tasks = useTasksStore.getState().tasks;
        const newId = tasks[0]?.id;
        if (newId && (args.due_date || args.priority)) {
          await useTasksStore.getState().updateTask(newId, {
            ...(args.due_date ? { due_date: args.due_date } : {}),
            ...(args.priority ? { priority: args.priority } : {}),
          });
        }
        return `ok id=${newId}`;
      }
      case "updateTask":
        await useTasksStore.getState().updateTask(args.id, args.updates);
        return `ok`;
      case "deleteTask":
        await useTasksStore.getState().deleteTask(args.id);
        return `ok`;
      case "getTasks": {
        const all = useTasksStore.getState().tasks;
        const filter = args?.filter || "open";
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const todayUnix = Math.floor(today.getTime() / 1000);
        let list = all;
        if (filter === "open") list = all.filter((t) => !t.completed);
        else if (filter === "completed") list = all.filter((t) => t.completed);
        else if (filter === "today")
          list = all.filter((t) => !t.completed && t.due_date && t.due_date <= todayUnix);
        return JSON.stringify(
          list
            .slice(0, 20)
            .map((t) => ({ id: t.id, title: t.title, priority: t.priority, due: t.due_date, completed: !!t.completed, list_id: t.list_id }))
        );
      }
      case "createTaskList": {
        await useTasksStore.getState().createTaskList(args.name, undefined, args.icon);
        return `ok`;
      }
      case "createCalendarEvent":
        await useCalendarStore.getState().createEvent({
          title: args.title,
          start_time: args.start,
          end_time: args.end,
          all_day: 0,
          color: "#4F8AE6",
          description: args.description || "",
          recurrence: "none",
        });
        return `ok`;
      case "listCalendarEvents": {
        const events = useCalendarStore.getState().events;
        const from = args?.from ?? 0;
        const to = args?.to ?? Number.MAX_SAFE_INTEGER;
        return JSON.stringify(
          events
            .filter((e) => e.start_time >= from && e.start_time <= to)
            .slice(0, 20)
            .map((e) => ({ id: e.id, title: e.title, start: e.start_time, end: e.end_time }))
        );
      }
      case "searchWeb": {
        const sRes = await fetch(
          `https://api.duckduckgo.com/?q=${encodeURIComponent(args.query)}&format=json&no_redirect=1`
        );
        const sData = await sRes.json();
        const abstract = sData.AbstractText || sData.Heading || "";
        const related = (sData.RelatedTopics || [])
          .slice(0, 3)
          .map((r: any) => r.Text)
          .filter(Boolean)
          .join(" | ");
        return abstract || related || "no_results";
      }
      case "saveMemory":
        await db.memories.add({ id: generateId(), content: args.fact, created_at: now() });
        return `ok`;
      case "recallMemories": {
        const mems = await db.memories.toArray();
        const q = (args?.query || "").toLowerCase();
        const matches = q
          ? mems.filter((m) => m.content.toLowerCase().includes(q))
          : mems.slice(-10);
        return JSON.stringify(matches.map((m) => m.content));
      }
      default:
        return `unknown_tool:${name}`;
    }
  } catch (err: any) {
    return `error: ${err.message}`;
  }
}
