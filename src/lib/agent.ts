import { useNotesStore } from "@/stores/notesStore";
import { useTasksStore } from "@/stores/tasksStore";
import { useCalendarStore } from "@/stores/calendarStore";

interface ToolCall {
  name: string;
  arguments: Record<string, any>;
}

export async function processAgentRequest(
  input: string,
  onUpdate: (chunk: string | null, thought?: string | null) => void,
  callOllama: (prompt: string, onV: (v: string) => void) => Promise<string>
) {
  const systemPrompt = `You are Delay Agent, a hyper-autonomous assistant. 
You think deeply before acting. You have full access to the user's workspace.

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
4. createTask(title: string, listId: string = "inbox")
5. updateTask(id: string, updates: Partial<Task>)
6. deleteTask(id: string)
7. getTasks(): Returns current pending tasks.
8. searchWeb(query: string): Real-time DuckDuckGo search.
9. createCalendarEvent(title: string, start: number, end: number)

Be autonomous. If asked to "clean up my notes", find them and delete them.
Your Glubs (thoughts) should be detailed.`;

  const fullPrompt = `${systemPrompt}\n\nUser: ${input}\nAgent:`;
  let currentResponse = "";
  let isThinking = false;

  await callOllama(fullPrompt, (token) => {
    currentResponse += token;
    
    // Simple tag-based thought detection
    if (token.includes("<think>")) isThinking = true;
    
    if (isThinking) {
      onUpdate(null, token);
    } else {
      onUpdate(token, null);
    }
    
    if (token.includes("</think>")) isThinking = false;
  });

  // Tool handling loop
  const toolMatch = currentResponse.match(/```json\n(.*?)\n```/s);
  if (toolMatch) {
    try {
      const parsed = JSON.parse(toolMatch[1]);
      if (parsed.tool_call) {
        onUpdate(`\n\n*Working: ${parsed.tool_call.name}...*\n\n`);
        const result = await executeTool(parsed.tool_call);
        
        const finalPrompt = `${fullPrompt}${currentResponse}\nSystem Result: ${result}\nAgent (Confirm exactly what was done):`;
        await callOllama(finalPrompt, (token) => onUpdate(token));
      }
    } catch (e) {
      onUpdate(`\nError parsing agent intent: ${e}`);
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
        const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(args.query)}&format=json`);
        const data = await res.json();
        return data.AbstractText || "No abstract found, tell user to browse manually.";
      case "createCalendarEvent":
        await useCalendarStore.getState().createEvent({
          title: args.title,
          start_time: args.start,
          end_time: args.end,
          all_day: 0
        });
        return `Created calendar event: ${args.title}`;
      default:
        return "Unknown tool";
    }
  } catch (err: any) {
    return `Tool Error: ${err.message}`;
  }
}

