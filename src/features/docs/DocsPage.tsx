import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import CharacterCount from "@tiptap/extension-character-count";
import Underline from "@tiptap/extension-underline";
import { 
  Plus, FileText, Trash2, Bold, Italic, Underline as UnderlineIcon, List, 
  Heading1, Heading2, Heading3, Code, Table2, Quote, Link as LinkIcon, 
  Image as ImageIcon, MoreHorizontal, FileDown, Type
} from "lucide-react";

interface Doc { id: string; title: string; content: string; updated: number; }
const uid = () => crypto.randomUUID();

function getDocs(): Doc[] {
  try { return JSON.parse(localStorage.getItem("delay_docs") || "[]"); } catch { return []; }
}
function saveDocs(docs: Doc[]) { localStorage.setItem("delay_docs", JSON.stringify(docs)); }

export function DocsPage() {
  const [docs, setDocs] = useState<Doc[]>(() => getDocs());
  const [activeId, setActiveId] = useState<string | null>(docs[0]?.id || null);

  const activeDoc = docs.find(d => d.id === activeId);

  const persist = (updated: Doc[]) => { setDocs(updated); saveDocs(updated); };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: "Start writing your document... Use '/' for commands" }),
      Highlight, TaskList, TaskItem.configure({ nested: true }),
      Link.configure({ openOnClick: false }),
      Image, Table.configure({ resizable: true }), TableRow, TableHeader, TableCell,
      CharacterCount, Underline
    ],
    content: activeDoc?.content || "",
    onUpdate: ({ editor }) => {
      if (activeId) {
        persist(docs.map(d => d.id === activeId ? { ...d, content: editor.getHTML(), updated: Date.now() } : d));
      }
    },
  }, [activeId]);

  // Update editor content when switching docs
  useEffect(() => {
    if (editor && activeDoc && editor.getHTML() !== activeDoc.content) {
      editor.commands.setContent(activeDoc.content);
    }
  }, [activeId]); // eslint-disable-line

  const createDoc = () => {
    const id = uid();
    const newDocs = [{ id, title: "Untitled Document", content: "", updated: Date.now() }, ...docs];
    persist(newDocs);
    setActiveId(id);
  };

  const deleteDoc = (id: string) => {
    const newDocs = docs.filter(d => d.id !== id);
    persist(newDocs);
    if (activeId === id) setActiveId(newDocs[0]?.id || null);
  };

  const setDocTitle = (title: string) => {
    if (!activeId) return;
    persist(docs.map(d => d.id === activeId ? { ...d, title, updated: Date.now() } : d));
  };

  const addImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url && editor) editor.chain().focus().setImage({ src: url }).run();
  };

  const addLink = () => {
    if (!editor) return;
    const prevUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", prevUrl);
    if (url === null) return;
    if (url === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const exportPlainTxt = () => {
    if (!editor || !activeDoc) return;
    const a = document.createElement("a");
    a.download = `${activeDoc.title.replace(/ /g, "_")}.txt`;
    a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(editor.getText());
    a.click();
  };

  return (
    <div className="flex h-full bg-bg-primary">
      {/* Sidebar */}
      <div className="w-64 h-full border-r border-border/40 bg-bg-secondary/30 flex flex-col shrink-0">
        <div className="p-4 flex items-center justify-between border-b border-border/20">
          <h2 className="text-[11px] font-extrabold text-text-tertiary uppercase tracking-widest">Documents</h2>
          <button onClick={createDoc} className="w-7 h-7 flex items-center justify-center rounded-lg bg-accent text-white hover:opacity-90 cursor-pointer shadow-lg shadow-accent/20">
            <Plus size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {docs.map(doc => (
            <div key={doc.id} onClick={() => setActiveId(doc.id)}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all
                ${activeId === doc.id ? "bg-accent/10 text-accent" : "text-text-secondary hover:bg-bg-hover"}`}>
              <FileText size={14} className="shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium truncate">{doc.title}</p>
                <p className="text-[9px] text-text-tertiary mt-0.5 truncate">{new Date(doc.updated).toLocaleDateString()}</p>
              </div>
              <button onClick={e => { e.stopPropagation(); deleteDoc(doc.id); }}
                className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-danger transition-all cursor-pointer">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          {docs.length === 0 && (
             <div className="text-center py-10 px-4">
               <div className="w-12 h-12 bg-accent/10 text-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                 <FileText size={20} />
               </div>
               <h3 className="text-[13px] font-bold text-text-primary mb-1">No Documents</h3>
               <p className="text-[11px] text-text-tertiary">Create your first document to get started</p>
             </div>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeDoc && editor ? (
          <>
            {/* Toolbar Top */}
            <div className="flex items-center gap-4 px-6 py-3 border-b border-border/40 bg-bg-secondary/20">
              <input value={activeDoc.title} onChange={e => setDocTitle(e.target.value)}
                className="flex-1 bg-transparent text-[18px] font-bold text-text-primary outline-none placeholder:text-text-tertiary/50" 
                placeholder="Document Title" />
              
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-text-tertiary font-mono px-2">
                  {editor.storage.characterCount.words()} words
                </span>
                <button onClick={exportPlainTxt} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-lg cursor-pointer transition-all">
                  <FileDown size={12} /> Export
                </button>
              </div>
            </div>

            {/* Formatting Toolbar */}
            <div className="flex items-center gap-1 px-6 py-2 border-b border-border/20 bg-bg-primary overflow-x-auto select-none scrollbar-hide">
              {[
                { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold"), title: "Bold" },
                { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic"), title: "Italic" },
                { icon: UnderlineIcon, action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive("underline"), title: "Underline" },
                { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive("blockquote"), title: "Quote" },
                { div: true },
                { icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive("heading", { level: 1 }), title: "H1" },
                { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }), title: "H2" },
                { icon: Heading3, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive("heading", { level: 3 }), title: "H3" },
                { div: true },
                { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList"), title: "Bullet List" },
                { icon: Code, action: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive("codeBlock"), title: "Code Block" },
                { div: true },
                { icon: LinkIcon, action: addLink, active: editor.isActive("link"), title: "Link" },
                { icon: ImageIcon, action: addImage, active: editor.isActive("image"), title: "Image" },
                { icon: Table2, action: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(), active: editor.isActive("table"), title: "Table" },
              ].map((btn, i) => btn.div ? (
                <div key={i} className="w-px h-4 bg-border/40 mx-1" />
              ) : (
                <button key={i} onClick={btn.action!} title={btn.title}
                  className={`w-7 h-7 flex items-center justify-center rounded-md transition-all cursor-pointer
                    ${btn.active ? "bg-accent/15 text-accent" : "text-text-tertiary hover:bg-bg-hover hover:text-text-primary"}`}>
                  {btn.icon && <btn.icon size={13} />}
                </button>
              ))}
            </div>

            {/* Editor Canvas */}
            <div className="flex-1 overflow-y-auto bg-bg-secondary/10">
              <div className="max-w-4xl mx-auto my-8 bg-bg-primary border border-border/20 shadow-sm rounded-xl min-h-[800px]">
                <div className="p-12 prose-styles">
                  <EditorContent editor={editor} className="outline-none" />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-bg-secondary/10">
            <div className="text-center">
              <FileText size={48} className="mx-auto mb-4 text-text-tertiary/20" />
              <p className="text-[14px] text-text-tertiary">Select or create a document to start writing</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
