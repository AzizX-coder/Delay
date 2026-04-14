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
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { useEffect, useRef, useState } from "react";
import { useNotesStore } from "@/stores/notesStore";
import { useAIStore } from "@/stores/aiStore";
import { useThemeStore } from "@/stores/themeStore";
import { useT } from "@/lib/i18n";
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
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Code2,
  Highlighter,
  Smile,
  Mic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Table as TableIcon,
  Sparkles,
} from "lucide-react";
import { VoiceBadge } from "@/components/ui/VoiceBadge";

interface NoteEditorProps {
  noteId: string;
}

export function NoteEditor({ noteId }: NoteEditorProps) {
  const { notes, updateNote } = useNotesStore();
  const { sendMessage } = useAIStore();
  const { theme } = useThemeStore();
  const t = useT();
  const note = notes.find((n) => n.id === noteId);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: t("notes.start_writing"),
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
        class:
          "tiptap outline-none min-h-full px-12 py-10 max-w-4xl mx-auto prose dark:prose-invert prose-sm sm:prose-base focus:outline-none",
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
        updateNote(noteId, { content: json, content_text: text, title });
      }, 500);
    },
  });

  const stopRecording = () => {
    try {
      recognitionRef.current?.stop();
    } catch {}
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) return stopRecording();

    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert("Speech recognition not supported.");
      return;
    }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || "en-US";

    let fullTranscript = "";

    const resetSilence = () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        try {
          recognition.stop();
        } catch {}
      }, 2000);
    };

    recognition.onstart = () => {
      setIsRecording(true);
      setLiveTranscript("");
      resetSilence();
    };
    recognition.onresult = (event: any) => {
      fullTranscript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join("");
      setLiveTranscript(fullTranscript);
      resetSilence();
    };
    recognition.onerror = () => stopRecording();
    recognition.onend = async () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      setIsRecording(false);
      setLiveTranscript("");
      if (fullTranscript.trim()) {
        try {
          setIsProcessing(true);
          await sendMessage(
            `Convert this voice dictation into a beautifully formatted note for "${note?.title}": ${fullTranscript}`,
            true
          );
        } finally {
          setIsProcessing(false);
        }
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
        if (parsed) editor.commands.setContent(parsed);
      }
    }
  }, [noteId]);

  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      try {
        recognitionRef.current?.stop();
      } catch {}
    };
  }, []);

  if (!editor || !note) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full bg-bg-primary relative"
    >
      <div className="flex items-center justify-center p-3 border-b border-border/40 backdrop-blur-md sticky top-0 z-40 gap-1.5 overflow-x-auto whitespace-nowrap">
        <Cluster>
          <TB
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
            icon={<Bold size={15} />}
            tooltip="Bold"
          />
          <TB
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            icon={<Italic size={15} />}
            tooltip="Italic"
          />
          <TB
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            icon={<UnderlineIcon size={15} />}
            tooltip="Underline"
          />
          <TB
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            icon={<Strikethrough size={15} />}
            tooltip="Strikethrough"
          />
          <TB
            active={editor.isActive("highlight")}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            icon={<Highlighter size={15} />}
            tooltip="Highlight"
          />
        </Cluster>

        <Cluster>
          <TB
            active={editor.isActive("heading", { level: 1 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            icon={<Heading1 size={15} />}
            tooltip="H1"
          />
          <TB
            active={editor.isActive("heading", { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            icon={<Heading2 size={15} />}
            tooltip="H2"
          />
          <TB
            active={editor.isActive("heading", { level: 3 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            icon={<Heading3 size={15} />}
            tooltip="H3"
          />
        </Cluster>

        <Cluster>
          <TB
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            icon={<List size={15} />}
            tooltip="Bullet list"
          />
          <TB
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            icon={<ListOrdered size={15} />}
            tooltip="Numbered list"
          />
          <TB
            active={editor.isActive("taskList")}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            icon={<ListChecks size={15} />}
            tooltip="Checklist"
          />
        </Cluster>

        <Cluster>
          <TB
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            icon={<Quote size={15} />}
            tooltip="Quote"
          />
          <TB
            active={editor.isActive("codeBlock")}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            icon={<Code2 size={15} />}
            tooltip="Code block"
          />
          <TB
            active={false}
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            icon={<Minus size={15} />}
            tooltip="Divider"
          />
        </Cluster>

        <Cluster>
          <TB
            active={editor.isActive({ textAlign: "left" })}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            icon={<AlignLeft size={15} />}
            tooltip="Align left"
          />
          <TB
            active={editor.isActive({ textAlign: "center" })}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            icon={<AlignCenter size={15} />}
            tooltip="Align center"
          />
          <TB
            active={editor.isActive({ textAlign: "right" })}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            icon={<AlignRight size={15} />}
            tooltip="Align right"
          />
        </Cluster>

        <Cluster>
          <TB
            active={false}
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
            icon={<TableIcon size={15} />}
            tooltip="Insert table"
          />
          <TB
            active={showEmojiPicker}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            icon={<Smile size={15} />}
            tooltip="Emoji"
          />
          <TB
            active={isRecording}
            onClick={toggleRecording}
            icon={<Mic size={15} />}
            tooltip="Voice dictation"
            danger={isRecording}
          />
        </Cluster>

        {showEmojiPicker && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50">
            <div
              className="fixed inset-0"
              onClick={() => setShowEmojiPicker(false)}
            />
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

      <div className="flex-1 relative overflow-y-auto bg-bg-primary">
        <EditorContent editor={editor} className="min-h-full" />

        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-bg-primary/40 backdrop-blur-md"
            >
              <div className="flex flex-col items-center gap-4 p-8 rounded-[32px] bg-bg-elevated/80 border border-border/40 shadow-2xl">
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-14 h-14 rounded-full border-2 border-accent/20 border-t-accent"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="text-accent" size={20} />
                  </div>
                </div>
                <p className="text-[13px] font-semibold text-text-primary tracking-tight">
                  Formatting your thoughts…
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <VoiceBadge
        active={isRecording}
        transcript={liveTranscript}
        onStop={stopRecording}
      />
    </motion.div>
  );
}

function Cluster({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center bg-bg-secondary/50 p-1 rounded-xl border border-border/40 shadow-sm gap-0.5">
      {children}
    </div>
  );
}

function TB({
  active,
  onClick,
  icon,
  tooltip,
  danger,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  tooltip?: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer
        ${
          danger
            ? "bg-danger text-white animate-pulse"
            : active
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
      const innerContent = node.content as
        | Array<{ text?: string }>
        | undefined;
      if (innerContent) {
        const text = innerContent.map((c) => c.text || "").join("");
        if (text.trim()) return text.trim().slice(0, 50);
      }
    }
  }
  return "";
}
