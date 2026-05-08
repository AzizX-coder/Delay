import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Pin, PinOff, Trash2, ArrowLeft, ChevronDown, GitBranch,
  ListTodo, FileText, Link2, ListOrdered, MoreHorizontal, Check, Search,
} from "lucide-react";
import { useFlowsStore, FLOW_COLORS, type BlockType, type Flow } from "@/stores/flowsStore";
import { DelayIcon } from "@/components/ui/DelayIcon";
import { EmptyState } from "@/components/ui/EmptyState";

const BLOCK_META: Record<BlockType, { icon: React.ReactNode; label: string }> = {
  tasks: { icon: <ListTodo size={14} />, label: "Tasks" },
  notes: { icon: <FileText size={14} />, label: "Notes" },
  links: { icon: <Link2 size={14} />, label: "Links" },
  steps: { icon: <ListOrdered size={14} />, label: "Steps" },
};

export function FlowsPage() {
  const { flows, loading, loadFlows, createFlow, updateFlow, removeFlow, togglePin } = useFlowsStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => { loadFlows(); }, []);

  const sorted = useMemo(() => {
    const f = search
      ? flows.filter(f => f.title.toLowerCase().includes(search.toLowerCase()) || f.description.toLowerCase().includes(search.toLowerCase()))
      : flows;
    return [...f].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updated_at - a.updated_at);
  }, [flows, search]);

  const selected = flows.find(f => f.id === selectedId);

  const handleCreate = () => {
    const id = createFlow("Untitled flow");
    setSelectedId(id);
  };

  return (
    <div className="flex flex-col md:flex-row h-full bg-bg-primary">
      {/* List */}
      <aside className={`md:w-[320px] md:border-r border-border/30 flex flex-col ${selected ? "hidden md:flex" : "flex"} h-full`}>
        <header className="px-4 py-3 border-b border-border/30 bg-bg-secondary/30 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent/30 to-accent/10 ring-1 ring-accent/30 flex items-center justify-center">
              <DelayIcon name="flows" size={18} />
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-text-primary leading-tight">Flows</h1>
              <p className="text-[10px] text-text-tertiary">{flows.length} project{flows.length === 1 ? "" : "s"}</p>
            </div>
          </div>
          <button onClick={handleCreate}
            className="w-9 h-9 rounded-xl bg-accent text-white flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer">
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </header>

        <div className="px-3 py-2 border-b border-border/20">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-bg-secondary/40 border border-border/20">
            <Search size={13} className="text-text-tertiary" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search flows..."
              className="bg-transparent outline-none text-[12px] text-text-primary flex-1 placeholder:text-text-tertiary" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
          {loading ? (
            <p className="text-[12px] text-text-tertiary text-center py-8">Loading...</p>
          ) : sorted.length === 0 ? (
            <div className="py-12">
              <EmptyState icon={<GitBranch size={36} />}
                title={search ? "No matches" : "No flows yet"}
                description={search ? "Try another keyword." : "Create a project to link tasks, notes, and steps together."} />
            </div>
          ) : (
            sorted.map(f => (
              <button key={f.id} onClick={() => setSelectedId(f.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2.5
                  ${selectedId === f.id ? "bg-accent/10 ring-1 ring-accent/20" : "hover:bg-bg-hover"}`}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `linear-gradient(135deg, ${f.color}33, ${f.color}10)`, border: `1px solid ${f.color}40` }}>
                  <span className="text-[14px]">{f.emoji || "✦"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-bold truncate ${selectedId === f.id ? "text-accent" : "text-text-primary"}`}>{f.title}</p>
                  <p className="text-[10px] text-text-tertiary">
                    {f.blocks.reduce((acc, b) => acc + b.items.length, 0)} items · {f.blocks.length} sections
                  </p>
                </div>
                {f.pinned && <Pin size={11} className="text-accent" />}
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Detail */}
      <main className={`flex-1 ${selected ? "flex" : "hidden md:flex"} flex-col overflow-hidden`}>
        {selected ? (
          <FlowDetail flow={selected} onBack={() => setSelectedId(null)}
            onUpdate={(p) => updateFlow(selected.id, p)}
            onDelete={() => { removeFlow(selected.id); setSelectedId(null); }}
            onTogglePin={() => togglePin(selected.id)} />
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center">
            <EmptyState icon={<DelayIcon name="flows" size={48} />}
              title="Pick or create a flow"
              description="A flow is a project that pulls together tasks, notes, links, and steps in one place." />
          </div>
        )}
      </main>
    </div>
  );
}

function FlowDetail({ flow, onBack, onUpdate, onDelete, onTogglePin }: {
  flow: Flow;
  onBack: () => void;
  onUpdate: (patch: Partial<Flow>) => void;
  onDelete: () => void;
  onTogglePin: () => void;
}) {
  const { addBlock, removeBlock, renameBlock, addItem, toggleItem, removeItem, updateItem } = useFlowsStore();
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const total = flow.blocks.reduce((acc, b) => acc + b.items.length, 0);
  const done = flow.blocks.reduce((acc, b) => acc + b.items.filter(i => i.done).length, 0);
  const progress = total ? Math.round((done / total) * 100) : 0;

  return (
    <>
      {/* Header */}
      <header className="px-4 md:px-8 py-4 border-b border-border/30 bg-bg-secondary/30 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <button onClick={onBack} className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-bg-hover text-text-secondary cursor-pointer">
            <ArrowLeft size={16} />
          </button>
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ring-1 ring-white/5"
            style={{ background: `linear-gradient(135deg, ${flow.color}40, ${flow.color}15)` }}>
            <span className="text-[20px]">{flow.emoji || "✦"}</span>
          </div>
          <input
            value={flow.title}
            onChange={e => onUpdate({ title: e.target.value })}
            className="flex-1 bg-transparent outline-none text-[20px] md:text-[22px] font-extrabold text-text-primary tracking-tight"
          />
          <button onClick={onTogglePin} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-bg-hover text-text-secondary cursor-pointer" title={flow.pinned ? "Unpin" : "Pin"}>
            {flow.pinned ? <PinOff size={15} /> : <Pin size={15} />}
          </button>
          <button onClick={() => setConfirmDelete(true)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-danger/10 text-text-secondary hover:text-danger cursor-pointer" title="Delete">
            <Trash2 size={15} />
          </button>
        </div>

        <textarea
          value={flow.description}
          onChange={e => onUpdate({ description: e.target.value })}
          placeholder="Describe what this flow is about..."
          rows={1}
          className="w-full bg-transparent outline-none text-[13px] text-text-secondary placeholder:text-text-tertiary resize-none mb-3"
        />

        {/* Color palette */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[10px] uppercase tracking-widest font-bold text-text-tertiary">Color</span>
          <div className="flex items-center gap-1.5">
            {FLOW_COLORS.map(c => (
              <button key={c} onClick={() => onUpdate({ color: c })}
                className={`w-5 h-5 rounded-full transition-all ${flow.color === c ? "ring-2 ring-offset-2 ring-offset-bg-secondary ring-text-primary scale-110" : "hover:scale-110"}`}
                style={{ background: c }} aria-label={`Color ${c}`} />
            ))}
          </div>

          {/* Progress */}
          {total > 0 && (
            <div className="ml-auto flex items-center gap-2 text-[11px] font-bold">
              <div className="w-32 h-1.5 rounded-full bg-border/30 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: flow.color }} />
              </div>
              <span style={{ color: flow.color }}>{progress}%</span>
              <span className="text-text-tertiary">· {done}/{total}</span>
            </div>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-5">
        {flow.blocks.map(block => (
          <BlockCard key={block.id} block={block} flowColor={flow.color}
            onRename={(t) => renameBlock(flow.id, block.id, t)}
            onRemove={() => removeBlock(flow.id, block.id)}
            onAddItem={(text) => addItem(flow.id, block.id, text)}
            onToggleItem={(id) => toggleItem(flow.id, block.id, id)}
            onRemoveItem={(id) => removeItem(flow.id, block.id, id)}
            onUpdateItem={(id, p) => updateItem(flow.id, block.id, id, p)}
          />
        ))}

        <div className="relative">
          <button onClick={() => setShowAddBlock(s => !s)}
            className="w-full px-4 py-3 rounded-2xl border border-dashed border-border/40 hover:border-accent/40 hover:bg-accent/5 transition-all flex items-center justify-center gap-2 text-[12px] font-bold text-text-tertiary hover:text-accent cursor-pointer">
            <Plus size={14} /> Add section
            <ChevronDown size={12} className={`transition-transform ${showAddBlock ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {showAddBlock && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                {(Object.entries(BLOCK_META) as [BlockType, typeof BLOCK_META[BlockType]][]).map(([t, meta]) => (
                  <button key={t} onClick={() => { addBlock(flow.id, t); setShowAddBlock(false); }}
                    className="px-3 py-2.5 rounded-xl bg-bg-secondary/60 border border-border/30 hover:border-accent/30 hover:bg-accent/5 transition-all flex items-center gap-2 cursor-pointer">
                    <span className="text-text-tertiary">{meta.icon}</span>
                    <span className="text-[12px] font-bold text-text-primary">{meta.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {flow.blocks.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-[13px] text-text-tertiary">Empty flow. Add a section to get started.</p>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDelete(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="fixed z-[101] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2
                w-[min(360px,calc(100vw-32px))] p-5 rounded-2xl bg-bg-elevated border border-border/40 shadow-2xl">
              <p className="text-[14px] font-bold text-text-primary">Delete this flow?</p>
              <p className="text-[12px] text-text-tertiary mt-1">This can't be undone. All sections and items will be removed.</p>
              <div className="flex items-center justify-end gap-2 mt-4">
                <button onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-text-secondary hover:bg-bg-hover cursor-pointer">Cancel</button>
                <button onClick={() => { setConfirmDelete(false); onDelete(); }}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-white bg-danger hover:opacity-90 cursor-pointer">Delete</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function BlockCard({ block, flowColor, onRename, onRemove, onAddItem, onToggleItem, onRemoveItem, onUpdateItem }: {
  block: ReturnType<typeof useFlowsStore.getState>["flows"][number]["blocks"][number];
  flowColor: string;
  onRename: (t: string) => void;
  onRemove: () => void;
  onAddItem: (text: string) => void;
  onToggleItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, p: Partial<{ text: string; done: boolean; url: string }>) => void;
}) {
  const meta = BLOCK_META[block.type];
  const [input, setInput] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  const isOrdered = block.type === "steps";
  const showCheckbox = block.type === "tasks" || block.type === "steps";

  return (
    <section className="rounded-2xl bg-bg-secondary/40 border border-border/30 backdrop-blur-sm overflow-hidden">
      <header className="flex items-center gap-2 px-4 py-2.5 border-b border-border/20 bg-bg-secondary/40">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${flowColor}20`, color: flowColor }}>{meta.icon}</div>
        <input value={block.title} onChange={e => onRename(e.target.value)}
          className="flex-1 bg-transparent outline-none text-[13px] font-bold text-text-primary" />
        <span className="text-[10px] text-text-tertiary font-mono">{block.items.length}</span>
        <button onClick={() => setShowMenu(m => !m)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-bg-hover text-text-tertiary cursor-pointer relative">
          <MoreHorizontal size={14} />
          {showMenu && (
            <div className="absolute top-full right-0 mt-1 z-10 bg-bg-elevated border border-border/40 rounded-xl shadow-xl py-1 min-w-[140px]">
              <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onRemove(); }}
                className="w-full text-left px-3 py-1.5 text-[12px] font-semibold text-danger hover:bg-danger/10 flex items-center gap-2">
                <Trash2 size={12} /> Delete section
              </button>
            </div>
          )}
        </button>
      </header>

      <div className="px-3 py-2 space-y-0.5">
        {block.items.length === 0 ? (
          <p className="text-[12px] text-text-tertiary text-center py-3">Empty section</p>
        ) : (
          block.items.map((it, idx) => (
            <div key={it.id} className="group flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-bg-hover/60 transition-colors">
              {showCheckbox ? (
                <button onClick={() => onToggleItem(it.id)}
                  className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 cursor-pointer ${it.done ? "bg-accent border-accent" : "border-border hover:border-accent"}`}>
                  {it.done && <Check size={10} className="text-white" strokeWidth={3} />}
                </button>
              ) : isOrdered ? (
                <span className="mt-0.5 w-5 text-[11px] font-bold tabular-nums text-text-tertiary text-center shrink-0">{idx + 1}.</span>
              ) : (
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-text-tertiary shrink-0" />
              )}
              <input
                value={it.text}
                onChange={(e) => onUpdateItem(it.id, { text: e.target.value })}
                className={`flex-1 bg-transparent outline-none text-[12.5px] ${it.done ? "line-through text-text-tertiary" : "text-text-primary"}`}
              />
              {it.url && (
                <a href={it.url} target="_blank" rel="noopener noreferrer"
                  className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-accent" title="Open link">
                  <Link2 size={12} />
                </a>
              )}
              <button onClick={() => onRemoveItem(it.id)}
                className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-danger" title="Remove">
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}

        <div className="flex items-center gap-2 px-2 py-2">
          <Plus size={13} className="text-text-tertiary shrink-0" />
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && input.trim()) {
                onAddItem(input);
                setInput("");
              }
            }}
            placeholder={`Add ${meta.label.toLowerCase()}...`}
            className="flex-1 bg-transparent outline-none text-[12.5px] text-text-primary placeholder:text-text-tertiary"
          />
        </div>
      </div>
    </section>
  );
}
