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
import { useEffect, useRef, useState } from "react";
import { useNotesStore } from "@/stores/notesStore";
import { useThemeStore } from "@/stores/themeStore";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { motion } from "motion/react";
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
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

interface NoteEditorProps {
  noteId: string;
}

export function NoteEditor({ noteId }: NoteEditorProps) {
  const { notes, updateNote } = useNotesStore();
  const { theme } = useThemeStore();
  const note = notes.find((n) => n.id === noteId);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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
      Color,
      Typography,
      Link.configure({ openOnClick: false }),
    ],
    editorProps: {
      attributes: {
        class: "tiptap outline-none min-h-full px-8 py-6",
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

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  if (!editor || !note) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full"
      style={
        note.color
          ? { backgroundColor: `var(--color-note-${note.color})` }
          : undefined
      }
    >
      {/* Toolbar */}
      <div className="relative flex items-center gap-0.5 px-6 py-2 border-b border-border-light overflow-x-auto">
        <ToolbarButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          icon={<Bold size={15} />}
        />
        <ToolbarButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          icon={<Italic size={15} />}
        />
        <ToolbarButton
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          icon={<UnderlineIcon size={15} />}
        />
        <ToolbarButton
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          icon={<Strikethrough size={15} />}
        />
        <Divider />
        <div className="relative">
          <ToolbarButton
            active={showEmojiPicker}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            icon={<Smile size={15} />}
          />
          {showEmojiPicker && (
            <div className="absolute top-full left-0 mt-2 z-50 shadow-2xl rounded-xl border border-border-light bg-bg-elevated overflow-hidden">
              <Picker
                data={data}
                set="apple"
                theme={theme === "dark" ? "dark" : "light"}
                onEmojiSelect={(emoji: any) => {
                  editor.chain().focus().insertContent(emoji.native).run();
                  setShowEmojiPicker(false);
                }}
              />
            </div>
          )}
        </div>
        <Divider />
        <ToolbarButton
          active={editor.isActive("heading", { level: 1 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          icon={<Heading1 size={15} />}
        />
        <ToolbarButton
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          icon={<Heading2 size={15} />}
        />
        <Divider />
        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          icon={<List size={15} />}
        />
        <ToolbarButton
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          icon={<ListOrdered size={15} />}
        />
        <ToolbarButton
          active={editor.isActive("taskList")}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          icon={<ListChecks size={15} />}
        />
        <Divider />
        <ToolbarButton
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          icon={<Quote size={15} />}
        />
        <ToolbarButton
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
          icon={<Code size={15} />}
        />
        <ToolbarButton
          active={editor.isActive("highlight")}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          icon={<Highlighter size={15} />}
        />
        <Divider />
        <ToolbarButton
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          icon={<AlignLeft size={15} />}
        />
        <ToolbarButton
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          icon={<AlignCenter size={15} />}
        />
        <ToolbarButton
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          icon={<AlignRight size={15} />}
        />
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </motion.div>
  );
}

function ToolbarButton({
  active,
  onClick,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-7 h-7 flex items-center justify-center rounded-md
        transition-colors duration-100 cursor-pointer
        ${
          active
            ? "bg-accent/15 text-accent"
            : "text-text-tertiary hover:text-text-primary hover:bg-bg-hover"
        }`}
    >
      {icon}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-border mx-1" />;
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
        if (text.trim()) return text.trim().slice(0, 100);
      }
    }
  }
  return "";
}
