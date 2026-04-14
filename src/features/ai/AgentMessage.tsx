import { motion } from "motion/react";
import { useState } from "react";
import {
  ChevronDown,
  Sparkles,
  Wrench,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

type Segment =
  | { kind: "text"; text: string }
  | { kind: "thought"; text: string }
  | { kind: "tool"; name: string; args: Record<string, unknown> }
  | { kind: "status"; text: string };

const TOOL_LABELS: Record<string, string> = {
  createNote: "Creating note",
  updateNote: "Updating note",
  deleteNote: "Deleting note",
  createTask: "Creating task",
  updateTask: "Updating task",
  deleteTask: "Deleting task",
  getTasks: "Reading tasks",
  searchWeb: "Searching the web",
  createCalendarEvent: "Creating calendar event",
  saveMemory: "Saving to memory",
  recallMemories: "Recalling memories",
};

function parseMessage(raw: string): Segment[] {
  const segments: Segment[] = [];
  let cursor = 0;

  const pushText = (text: string) => {
    if (!text.trim()) return;
    segments.push({ kind: "text", text });
  };

  while (cursor < raw.length) {
    const rest = raw.slice(cursor);

    // <think>...</think>
    const thinkStart = rest.indexOf("<think>");
    // ```json ... ```
    const jsonMatch = rest.match(/```json\s*([\s\S]*?)```/);
    // *Working: tool...*
    const workingMatch = rest.match(/\*Working:\s*([^*\n]+?)\*/);

    const candidates: { idx: number; kind: "think" | "json" | "working" }[] = [];
    if (thinkStart !== -1) candidates.push({ idx: thinkStart, kind: "think" });
    if (jsonMatch && jsonMatch.index !== undefined)
      candidates.push({ idx: jsonMatch.index, kind: "json" });
    if (workingMatch && workingMatch.index !== undefined)
      candidates.push({ idx: workingMatch.index, kind: "working" });

    if (candidates.length === 0) {
      pushText(rest);
      break;
    }

    candidates.sort((a, b) => a.idx - b.idx);
    const first = candidates[0];

    if (first.idx > 0) pushText(rest.slice(0, first.idx));

    if (first.kind === "think") {
      const end = rest.indexOf("</think>", first.idx + 7);
      if (end === -1) {
        segments.push({ kind: "thought", text: rest.slice(first.idx + 7) });
        break;
      }
      segments.push({ kind: "thought", text: rest.slice(first.idx + 7, end) });
      cursor += end + "</think>".length;
      continue;
    }

    if (first.kind === "json" && jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed?.tool_call?.name) {
          segments.push({
            kind: "tool",
            name: String(parsed.tool_call.name),
            args: parsed.tool_call.arguments ?? {},
          });
        }
      } catch {
        // swallow malformed JSON silently; no raw text leak
      }
      cursor += jsonMatch.index! + jsonMatch[0].length;
      continue;
    }

    if (first.kind === "working" && workingMatch) {
      segments.push({ kind: "status", text: workingMatch[1].trim() });
      cursor += workingMatch.index! + workingMatch[0].length;
      continue;
    }
  }

  return segments;
}

export function AgentMessage({
  content,
  streaming,
}: {
  content: string;
  streaming?: boolean;
}) {
  const segments = parseMessage(content);
  const hasText = segments.some((s) => s.kind === "text" && s.text.trim());

  return (
    <div className="space-y-2 w-full">
      {segments.map((seg, i) => {
        if (seg.kind === "thought") {
          return <ThoughtBubble key={i} text={seg.text} />;
        }
        if (seg.kind === "tool") {
          return <ToolCard key={i} name={seg.name} args={seg.args} done />;
        }
        if (seg.kind === "status") {
          return <WorkingPill key={i} text={seg.text} />;
        }
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="text-text-primary"
          >
            <MarkdownRenderer content={seg.text} />
          </motion.div>
        );
      })}
      {streaming && !hasText && (
        <div className="flex gap-1 items-center py-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-accent/70"
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
              transition={{
                repeat: Infinity,
                duration: 1,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ThoughtBubble({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const preview = text.trim().split("\n")[0].slice(0, 80);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border-light bg-bg-glass/60 backdrop-blur-md
        shadow-[0_1px_2px_rgba(0,0,0,0.03),0_4px_20px_rgba(0,122,255,0.04)]
        overflow-hidden"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left cursor-pointer
          hover:bg-bg-hover transition-colors"
      >
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0
            bg-gradient-to-br from-accent/20 to-accent/5 text-accent"
        >
          <Sparkles size={12} />
        </div>
        <span className="text-[12px] font-medium text-text-secondary">
          Glub — thinking
        </span>
        <span className="text-[12px] text-text-tertiary truncate flex-1">
          {preview}
        </span>
        <ChevronDown
          size={14}
          className={`text-text-tertiary transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="px-4 pb-3 pt-1 border-t border-border-light text-[12.5px]
            text-text-secondary whitespace-pre-wrap leading-relaxed"
        >
          {text.trim()}
        </motion.div>
      )}
    </motion.div>
  );
}

function ToolCard({
  name,
  args,
  done,
}: {
  name: string;
  args: Record<string, unknown>;
  done?: boolean;
}) {
  const label = TOOL_LABELS[name] ?? name;
  const primary =
    (args.title as string) ||
    (args.query as string) ||
    (args.fact as string) ||
    "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl
        bg-gradient-to-br from-accent/10 to-accent/5
        border border-accent/15
        shadow-[0_1px_2px_rgba(0,0,0,0.03),0_4px_20px_rgba(0,122,255,0.08)]"
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0
          bg-accent text-white shadow-[0_2px_8px_rgba(0,122,255,0.35)]"
      >
        {done ? <CheckCircle2 size={15} /> : <Wrench size={14} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-medium text-text-primary truncate">
          {label}
        </p>
        {primary && (
          <p className="text-[11.5px] text-text-tertiary truncate mt-0.5">
            {primary}
          </p>
        )}
      </div>
    </motion.div>
  );
}

function WorkingPill({ text }: { text: string }) {
  const label = TOOL_LABELS[text.replace(/\.+$/, "")] ?? text;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
        bg-accent/10 border border-accent/15
        text-[11.5px] font-medium text-accent"
    >
      <Loader2 size={12} className="animate-spin" />
      {label}
    </motion.div>
  );
}
