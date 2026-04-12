import { useNotesStore } from "@/stores/notesStore";
import { useTasksStore } from "@/stores/tasksStore";
import { useCalendarStore } from "@/stores/calendarStore";

interface ToolCall {
  name: string;
  arguments: Record<string, any>;
}

export async function processAgentRequest(
  input: string,
  onStream: (text: string) => void,
  callOllama: (prompt: string, onV: (v: string) => void) => Promise<string>
) {
  const systemPrompt = `You are Delay Agent, an advanced autonomous assistant built into the Delay desktop app.
You have the ability to execute tools to help the user.
Available tools:
1. createNote(title: string, content: string): Creates a new note.
2. createTask(title: string, listId: string = "default"): Creates a new task.
3. getTasks(): Returns all default tasks.
4. searchWeb(query: string): Searches the web for current information.

If you want to use a tool, output exactly this JSON block and nothing else in the message:
\`\`\`json
{
  "tool_call": {
    "name": "toolName",
    "arguments": { "arg1": "value" }
  }
}
\`\`\`
If you do not want to use a tool, just respond naturally to the user.`;

  const fullPrompt = `${systemPrompt}\n\nUser: ${input}\nAgent:`;
  let agentResponse = "";

  // 1. Initial reasoning loop
  await callOllama(fullPrompt, (chunk) => {
    agentResponse += chunk;
    onStream(chunk);
  });

  // Check if agent requested a tool call
  const toolCallMatch = agentResponse.match(/```json\n(.*?)\n```/s);
  if (toolCallMatch) {
    try {
      const parsed = JSON.parse(toolCallMatch[1]);
      if (parsed.tool_call) {
        onStream("\n\n*Executing tool: " + parsed.tool_call.name + "...*\n\n");
        const toolResult = await executeTool(parsed.tool_call);
        
        const finalPrompt = `${fullPrompt}${agentResponse}\nSystem Tool Result: ${toolResult}\nAgent (explain what you did based on the result without requesting another tool):`;
        
        let finalResponse = "";
        await callOllama(finalPrompt, (chunk) => {
          finalResponse += chunk;
          onStream(chunk);
        });
        return agentResponse + "\n\n" + finalResponse;
      }
    } catch {
      // Not a valid JSON tool call
    }
  }

  return agentResponse;
}

async function executeTool(toolCall: ToolCall): Promise<string> {
  try {
    switch (toolCall.name) {
      case "createNote": {
        const { createNote, updateNote } = useNotesStore.getState();
        const id = await createNote();
        await updateNote(id, {
          title: toolCall.arguments.title,
          content_text: toolCall.arguments.content,
          content: JSON.stringify({
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: toolCall.arguments.content }],
              },
            ],
          }),
        });
        return `Successfully created note "${toolCall.arguments.title}"`;
      }
      case "createTask": {
        const { createTask } = useTasksStore.getState();
        let listId = "inbox"; // fallback to default
        if (toolCall.arguments.listId !== "default") {
          listId = toolCall.arguments.listId;
        }
        await createTask(toolCall.arguments.title, listId);
        return `Successfully created task "${toolCall.arguments.title}"`;
      }
      case "getTasks": {
        const { tasks } = useTasksStore.getState();
        const listTasks = tasks.filter((t) => t.list_id === "inbox" && !t.completed);
        return listTasks.length === 0 
          ? "No pending tasks in inbox." 
          : JSON.stringify(listTasks.map(t => ({ id: t.id, title: t.title })));
      }
      case "searchWeb": {
        // DuckDuckGo instant answers API - free, no key
        const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(toolCall.arguments.query)}&format=json`);
        const json = await res.json();
        if (json.AbstractText) {
          return json.AbstractText;
        }
        return "No instant answer found. The user will need to manually search.";
      }
      default:
        return `Error: Tool ${toolCall.name} not recognized.`;
    }
  } catch (error: any) {
    return `Error executing tool: ${error.message}`;
  }
}
