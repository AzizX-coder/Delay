import { useNotesStore } from "@/stores/notesStore";
import { useTasksStore } from "@/stores/tasksStore";
import { useCalendarStore } from "@/stores/calendarStore";
import { db, generateId, now } from "@/lib/database";

interface ToolCall {
  name: string;
  arguments: Record<string, any>;
}

export async function processAgentRequest(
  input: string,
  onUpdate: (chunk: string | null, thought?: string | null) => void,
  callOllama: (prompt: string, onV: (v: string) => void) => Promise<string>
) {
  const nowUnix = Math.floor(Date.now() / 1000);
  const systemPrompt = `Delay Agent — autonomous local-app assistant. Unix: ${nowUnix}.

RULES
- Act silently, finish the job. Final reply: short markdown, no JSON, no <think>.
- Optional planning: <think>1 sentence</think>.
- Tool call format (emit one at a time):
\`\`\`json
{ "tool_call": { "name": "...", "arguments": {} } }
\`\`\`
- Up to 5 tool calls per turn. No narration between them.
- Default to action; don't ask obvious confirmations.

TOOLS
createNote(title,content) · updateNote(id,updates) · deleteNote(id)
createTask(title,listId?,due_date?) · updateTask(id,updates) · deleteTask(id) · getTasks()
createCalendarEvent(title,start,end) · searchWeb(query)
saveMemory(fact) · recallMemories(query)`;

  let history = `\n\nUser: ${input}\nAgent:`;
  let totalTurns = 0;
  const maxTurns = 5;

  while (totalTurns < maxTurns) {
    totalTurns++;
    let currentTurnResponse = "";
    let isThinking = false;

    await callOllama(`${systemPrompt}${history}`, (token) => {
      currentTurnResponse += token;
      if (token.includes("<think>")) isThinking = true;
      if (isThinking) {
        onUpdate(null, token);
      } else {
        onUpdate(token, null);
      }
      if (token.includes("</think>")) isThinking = false;
    });

    history += currentTurnResponse;

    const toolMatch = currentTurnResponse.match(/```json\n(.*?)\n```/s);
    if (!toolMatch) break; // Finished or didn't use a tool

    try {
      const parsed = JSON.parse(toolMatch[1]);
      if (parsed.tool_call) {
        onUpdate(`\n\n*Working: ${parsed.tool_call.name}...*\n\n`);
        const result = await executeTool(parsed.tool_call);
        history += `\nSystem Result: ${result}\nAgent (Analyze result and continue or finalize):`;
      } else {
        break;
      }
    } catch (e) {
      onUpdate(`\nError parsing agent intent: ${e}`);
      break;
    }
  }
}

async function executeTool(toolCall: ToolCall): Promise<string> {
  try {
    const { name, arguments: args } = toolCall;
    
    switch (name) {
      case "createNote": {
        const id = await useNotesStore.getState().createNote();
        await useNotesStore.getState().updateNote(id, { 
          title: args.title, 
          content_text: args.content,
          content: JSON.stringify({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: args.content }] }] })
        });
        return `Created note: ${args.title} (ID: ${id})`;
      }
      case "updateNote":
        await useNotesStore.getState().updateNote(args.id, args.updates);
        return `Updated note ${args.id}`;
      case "deleteNote":
        await useNotesStore.getState().deleteNote(args.id);
        return `Deleted note ${args.id}`;
      case "createTask":
        await useTasksStore.getState().createTask(args.title, args.listId);
        if (args.due_date) {
            const tasks = useTasksStore.getState().tasks;
            const newId = tasks[0]?.id;
            if (newId) await useTasksStore.getState().updateTask(newId, { due_date: args.due_date });
        }
        return `Created task: ${args.title}`;
      case "updateTask":
        await useTasksStore.getState().updateTask(args.id, args.updates);
        return `Updated task ${args.id}`;
      case "deleteTask":
        await useTasksStore.getState().deleteTask(args.id);
        return `Deleted task ${args.id}`;
      case "getTasks":
        return JSON.stringify(useTasksStore.getState().tasks.filter(t => !t.completed).slice(0, 10));
      case "searchWeb":
        const sRes = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(args.query)}&format=json`);
        const sData = await sRes.json();
        return sData.AbstractText || "No abstract found, tell user to browse manually.";
      case "createCalendarEvent":
        await useCalendarStore.getState().createEvent({
          title: args.title,
          start_time: args.start,
          end_time: args.end,
          all_day: 0,
          color: "#4F8AE6",
          description: "",
          recurrence: "none",
        });
        return `Created calendar event: ${args.title}`;
      case "saveMemory":
        await db.memories.add({ id: generateId(), content: args.fact, created_at: now() });
        return `Memory saved: ${args.fact}`;
      case "recallMemories":
        const mems = await db.memories.toArray();
        const matches = mems.filter(m => m.content.toLowerCase().includes(args.query.toLowerCase()));
        return JSON.stringify(matches.map(m => m.content));
      default:
        return "Unknown tool";
    }
  } catch (err: any) {
    return `Tool Error: ${err.message}`;
  }
}

