import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Typography from "@tiptap/extension-typography";
import Link from "@tiptap/extension-link";
import FontFamily from "@tiptap/extension-font-family";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { useEffect, useRef, useState } from "react";
import { useNotesStore } from "@/stores/notesStore";
import { useAIStore } from "@/stores/aiStore";
import { useThemeStore } from "@/stores/themeStore";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Code,
  Highlighter,
  Smile,
  Mic,
  MicOff,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Table as TableIcon,
  Plus,
  Trash2,
  MoreVertical,
} from "lucide-react";

interface NoteEditorProps {
  noteId: string;
}

export function NoteEditor({ noteId }: NoteEditorProps) {
  const { notes, updateNote } = useNotesStore();
  const { sendMessage } = useAIStore();
  const { theme } = useThemeStore();
  const note = notes.find((n) => n.id === noteId);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: "Start writing...",
      }),
      Highlight.configure({ multicolor: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      FontFamily,
      Color,
      Typography,
      Link.configure({ openOnClick: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    editorProps: {
      attributes: {
        class: "tiptap outline-none min-h-full px-12 py-10 max-w-4xl mx-auto prose dark:prose-invert prose-sm sm:prose-base focus:outline-none",
        spellcheck: "false",
      },
    },
    content: note?.content ? tryParseJSON(note.content) : "",
    onUpdate: ({ editor }) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        const json = JSON.stringify(editor.getJSON());
        const text = editor.getText();
        const title = extractTitle(editor.getJSON());
        updateNote(noteId, {
          content: json,
          content_text: text,
          title,
        });
      }, 500);
    },
  });

  // Voice Dictation Logic
  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result) => result.transcript)
        .join("");
      
      if (event.results[0].isFinal) {
        // Send to AI for formatting when finished or use as is
        // For now, we'll let the user stop it manually to send it to AI
      }
    };

    recognition.onend = async () => {
      setIsRecording(false);
      const finalTranscript = recognition.lastTranscript; // We'd need to track this better
      // Real implementation would capture the final result
    };

    // Improved recording handler
    let fullTranscript = "";
    recognition.onresult = (event: any) => {
      fullTranscript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join("");
    };

    recognition.onend = async () => {
      setIsRecording(false);
      if (fullTranscript.trim()) {
        // Send to Agent to convert to a note
        await sendMessage(`Convert this voice dictation into a beautifully formatted note for my document "${note?.title}": ${fullTranscript}`, true);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  useEffect(() => {
    if (editor && note) {
      const currentJSON = JSON.stringify(editor.getJSON());
      if (note.content && note.content !== currentJSON) {
        const parsed = tryParseJSON(note.content);
        if (parsed) {
          editor.commands.setContent(parsed);
        }
      }
    }
  }, [noteId]);

  if (!editor || !note) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full bg-bg-primary"
    >
      {/* Designer Toolbar (Icons Panel) */}
      <div className="flex items-center justify-center p-3 border-b border-border/40 backdrop-blur-md sticky top-0 z-40 gap-1 overflow-x-auto whitespace-nowrap">
        <div className="flex items-center bg-bg-secondary/50 p-1 rounded-xl border border-border/40 shadow-sm gap-0.5">
          <ToolbarButton
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
            icon={<Bold size={16} />}
            tooltip="Bold"
          />
          <ToolbarButton
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            icon={<Italic size={16} />}
            tooltip="Italic"
          />
          <ToolbarButton
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            icon={<UnderlineIcon size={16} />}
            tooltip="Underline"
          />
        </div>

        <div className="flex items-center bg-bg-secondary/50 p-1 rounded-xl border border-border/40 shadow-sm gap-0.5">
          <ToolbarButton
            active={editor.isActive("heading", { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            icon={<Heading1 size={16} />}
          />
          <ToolbarButton
            active={editor.isActive("heading", { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            icon={<Heading2 size={16} />}
          />
        </div>

        <div className="flex items-center bg-bg-secondary/50 p-1 rounded-xl border border-border/40 shadow-sm gap-0.5">
          <ToolbarButton
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            icon={<List size={16} />}
          />
          <ToolbarButton
            active={editor.isActive("taskList")}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            icon={<ListChecks size={16} />}
          />
        </div>

        <div className="flex items-center bg-bg-secondary/50 p-1 rounded-xl border border-border/40 shadow-sm gap-0.5">
          <ToolbarButton
            active={false}
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            icon={<TableIcon size={16} />}
          />
          <ToolbarButton
            active={false}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            icon={<Smile size={16} />}
          />
        </div>

        <div className="flex items-center bg-bg-secondary/50 p-1 rounded-xl border border-border/40 shadow-sm gap-0.5">
          <button
            onClick={toggleRecording}
            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all
              ${isRecording 
                ? "bg-danger text-white animate-pulse" 
                : "text-text-secondary hover:bg-bg-hover"}`}
          >
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        </div>

        {showEmojiPicker && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50">
            <div className="fixed inset-0" onClick={() => setShowEmojiPicker(false)} />
            <div className="relative shadow-2xl rounded-2xl overflow-hidden border border-border/60">
              <Picker
                data={data}
                set="native"
                theme={theme === "dark" ? "dark" : "light"}
                onEmojiSelect={(emoji: any) => {
                  editor.chain().focus().insertContent(emoji.native).run();
                  setShowEmojiPicker(false);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Editor Surface */}
      <div className="flex-1 overflow-y-auto bg-bg-primary">
        <EditorContent editor={editor} className="min-h-full" />
      </div>
    </motion.div>
  );
}

function ToolbarButton({
  active,
  onClick,
  icon,
  tooltip,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  tooltip?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`w-8 h-8 flex items-center justify-center rounded-lg
        transition-all cursor-pointer
        ${active
          ? "bg-accent text-bg-primary shadow-sm"
          : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
        }`}
    >
      {icon}
    </button>
  );
}

function tryParseJSON(str: string): object | string {
  try {
    return JSON.parse(str);
  } catch {
    return str || "";
  }
}

function extractTitle(doc: Record<string, unknown>): string {
  const content = doc.content as Array<Record<string, unknown>> | undefined;
  if (!content) return "";
  for (const node of content) {
    if (node.type === "heading" || node.type === "paragraph") {
      const innerContent = node.content as Array<{ text?: string }> | undefined;
      if (innerContent) {
        const text = innerContent.map((c) => c.text || "").join("");
        if (text.trim()) return text.trim().slice(0, 50);
      }
    }
  }
  return "";
}

