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
  const systemPrompt = `You are Delay Agent, a hyper-autonomous orchestrator. 
You think deeply before acting. You have full access to your memory and workspace tools.
You can execute up to 5 steps to solve a complex request.

When you think, use <think>...</think> tags.
When you act, use exactly this JSON block:
\`\`\`json
{
  "tool_call": {
    "name": "toolName",
    "arguments": { "arg1": "value" }
  }
}
\`\`\`

Available tools:
1. createNote(title: string, content: string)
2. updateNote(id: string, updates: Partial<Note>)
3. deleteNote(id: string)
4. createTask(title: string, listId: string = "inbox", due_date?: number)
5. updateTask(id: string, updates: Partial<Task>)
6. deleteTask(id: string)
7. getTasks(): Returns current pending tasks.
8. searchWeb(query: string): Real-time DuckDuckGo search.
9. createCalendarEvent(title: string, start: number, end: number)
10. saveMemory(fact: string): Store important info about the user permanently.
11. recallMemories(query: string): Search your long-term memory.

Be autonomous. If asked to "setup my day", check tasks, calendar, and memories to provide a plan.
Your Glubs (thoughts) should be detailed plans.`;

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

