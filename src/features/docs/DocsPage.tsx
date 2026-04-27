import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Plus, FileText, Trash2, Bold, Italic, List, Heading1, Heading2, Code, Table2 } from "lucide-react";

interface Doc { id: string; title: string; content: string; updated: number; }
const uid = () => crypto.randomUUID();

export function DocsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeDoc = docs.find(d => d.id === activeId);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: "Start writing your document..." }),
      Highlight, TaskList, TaskItem.configure({ nested: true }),
    ],
    content: activeDoc?.content || "",
    onUpdate: ({ editor }) => {
      if (activeId) {
        setDocs(prev => prev.map(d => d.id === activeId ? { ...d, content: editor.getHTML(), updated: Date.now() } : d));
      }
    },
  }, [activeId]);

  const createDoc = () => {
    const id = uid();
    setDocs(prev => [{ id, title: "Untitled Document", content: "", updated: Date.now() }, ...prev]);
    setActiveId(id);
  };

  const deleteDoc = (id: string) => {
    setDocs(prev => prev.filter(d => d.id !== id));
    if (activeId === id) setActiveId(null);
  };

  return (
    <div className="flex h-full">
      <div className="w-64 h-full border-r border-border/40 bg-bg-secondary/30 flex flex-col">
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-[14px] font-bold text-text-primary">Documents</h2>
          <button onClick={createDoc} className="w-7 h-7 flex items-center justify-center rounded-lg bg-accent text-white cursor-pointer">
            <Plus size={15} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
          {docs.map(doc => (
            <div key={doc.id} onClick={() => setActiveId(doc.id)}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all
                ${activeId === doc.id ? "bg-accent/10 text-accent" : "text-text-secondary hover:bg-bg-hover"}`}>
              <FileText size={14} className="shrink-0" />
              <span className="flex-1 text-[12px] font-medium truncate">{doc.title}</span>
              <button onClick={e => { e.stopPropagation(); deleteDoc(doc.id); }}
                className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-danger transition-all cursor-pointer">
                <Trash2 size={11} />
              </button>
            </div>
          ))}
          {docs.length === 0 && (
            <div className="text-center py-8">
              <FileText size={24} className="mx-auto mb-2 text-text-tertiary/40" />
              <p className="text-[12px] text-text-tertiary">Create your first document</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-bg-primary">
        {activeDoc ? (
          <>
            <div className="flex items-center gap-2 px-6 py-3 border-b border-border/40">
              <input value={activeDoc.title}
                onChange={e => setDocs(prev => prev.map(d => d.id === activeId ? { ...d, title: e.target.value } : d))}
                className="flex-1 bg-transparent text-[16px] font-bold text-text-primary outline-none" />
              {editor && (
                <div className="flex items-center gap-1">
                  {[
                    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold") },
                    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic") },
                    { icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive("heading", { level: 1 }) },
                    { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }) },
                    { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList") },
                    { icon: Code, action: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive("codeBlock") },
                  ].map((btn, i) => (
                    <button key={i} onClick={btn.action}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer
                        ${btn.active ? "bg-accent/15 text-accent" : "text-text-tertiary hover:bg-bg-hover"}`}>
                      <btn.icon size={15} />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="max-w-3xl mx-auto prose-styles">
                <EditorContent editor={editor} className="min-h-[400px] text-text-primary text-[15px] leading-relaxed outline-none" />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText size={48} className="mx-auto mb-4 text-text-tertiary/20" />
              <p className="text-[14px] text-text-tertiary">Select or create a document</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
