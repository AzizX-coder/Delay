import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, GripVertical, Edit3, LayoutGrid, FolderPlus, ChevronLeft } from "lucide-react";

interface Card { id: string; title: string; desc: string; color: string; }
interface Column { id: string; title: string; cards: Card[]; }
interface Board { id: string; name: string; columns: Column[]; color: string; }

const COLORS = ["#6366F1","#F59E0B","#10B981","#EF4444","#8B5CF6","#06B6D4","#EC4899"];
const uid = () => crypto.randomUUID();

function getBoards(): Board[] {
  try { return JSON.parse(localStorage.getItem("delay_kanban_boards") || "[]"); } catch { return []; }
}
function saveBoards(boards: Board[]) { localStorage.setItem("delay_kanban_boards", JSON.stringify(boards)); }

export function KanbanPage() {
  const [boards, setBoards] = useState<Board[]>(() => getBoards());
  const [activeBoardId, setActiveBoardId] = useState<string | null>(boards[0]?.id || null);
  const [dragCard, setDragCard] = useState<{card: Card; fromCol: string} | null>(null);
  const [editingBoard, setEditingBoard] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const activeBoard = boards.find(b => b.id === activeBoardId);

  const persist = (updated: Board[]) => { setBoards(updated); saveBoards(updated); };

  const createBoard = () => {
    const b: Board = { id: uid(), name: "New Board", color: COLORS[boards.length % COLORS.length], columns: [
      { id: uid(), title: "To Do", cards: [] },
      { id: uid(), title: "In Progress", cards: [] },
      { id: uid(), title: "Done", cards: [] },
    ]};
    const updated = [...boards, b];
    persist(updated);
    setActiveBoardId(b.id);
  };

  const deleteBoard = (id: string) => {
    const updated = boards.filter(b => b.id !== id);
    persist(updated);
    if (activeBoardId === id) setActiveBoardId(updated[0]?.id || null);
  };

  const renameBoard = (id: string, name: string) => {
    persist(boards.map(b => b.id === id ? { ...b, name } : b));
    setEditingBoard(null);
  };

  const updateBoard = (updater: (b: Board) => Board) => {
    if (!activeBoardId) return;
    persist(boards.map(b => b.id === activeBoardId ? updater(b) : b));
  };

  const addColumn = () => updateBoard(b => ({ ...b, columns: [...b.columns, { id: uid(), title: "New Column", cards: [] }] }));
  const deleteColumn = (colId: string) => updateBoard(b => ({ ...b, columns: b.columns.filter(c => c.id !== colId) }));
  const updateColumnTitle = (colId: string, title: string) => updateBoard(b => ({ ...b, columns: b.columns.map(c => c.id === colId ? { ...c, title } : c) }));

  const addCard = (colId: string) => {
    const card: Card = { id: uid(), title: "New Card", desc: "", color: COLORS[Math.floor(Math.random()*COLORS.length)] };
    updateBoard(b => ({ ...b, columns: b.columns.map(c => c.id === colId ? { ...c, cards: [...c.cards, card] } : c) }));
  };

  const deleteCard = (colId: string, cardId: string) => {
    updateBoard(b => ({ ...b, columns: b.columns.map(c => c.id === colId ? { ...c, cards: c.cards.filter(cd => cd.id !== cardId) } : c) }));
  };

  const updateCard = (colId: string, cardId: string, updates: Partial<Card>) => {
    updateBoard(b => ({ ...b, columns: b.columns.map(c => c.id === colId ? { ...c, cards: c.cards.map(cd => cd.id === cardId ? { ...cd, ...updates } : cd) } : c) }));
  };

  const handleDrop = (targetColId: string) => {
    if (!dragCard || !activeBoardId) return;
    updateBoard(b => {
      const cols = b.columns.map(c => ({ ...c, cards: c.id === dragCard.fromCol ? c.cards.filter(cd => cd.id !== dragCard.card.id) : c.cards }));
      return { ...b, columns: cols.map(c => c.id === targetColId ? { ...c, cards: [...c.cards, dragCard.card] } : c) };
    });
    setDragCard(null);
    setDragOverCol(null);
  };

  // No boards — show welcome
  if (boards.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center h-full bg-bg-primary">
        <div className="text-center">
          <LayoutGrid size={48} className="mx-auto mb-4 text-text-tertiary/20" />
          <h2 className="text-[18px] font-bold text-text-primary mb-2">No Kanban Boards</h2>
          <p className="text-[13px] text-text-tertiary mb-6">Create your first board to start organizing</p>
          <button onClick={createBoard}
            className="flex items-center gap-2 px-6 py-3 mx-auto rounded-xl bg-accent text-white font-bold text-[13px] cursor-pointer shadow-xl shadow-accent/20">
            <Plus size={16} /> Create Board
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-bg-primary">
      {/* Boards sidebar */}
      <div className="w-56 shrink-0 border-r border-border/40 bg-bg-secondary/30 flex flex-col">
        <div className="p-3 flex items-center justify-between border-b border-border/20">
          <h2 className="text-[11px] font-extrabold text-text-tertiary uppercase tracking-widest">Boards</h2>
          <button onClick={createBoard} className="w-7 h-7 flex items-center justify-center rounded-lg bg-accent text-white cursor-pointer">
            <Plus size={13} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {boards.map(b => (
            <div key={b.id} className={`group flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all
              ${activeBoardId === b.id ? "bg-accent/10 text-accent" : "text-text-secondary hover:bg-bg-hover"}`}>
              <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: b.color }} onClick={() => setActiveBoardId(b.id)} />
              {editingBoard === b.id ? (
                <input autoFocus value={b.name} onChange={e => persist(boards.map(bb => bb.id === b.id ? { ...bb, name: e.target.value } : bb))}
                  onBlur={() => setEditingBoard(null)} onKeyDown={e => { if (e.key === "Enter") setEditingBoard(null); }}
                  className="flex-1 bg-transparent text-[12px] font-bold outline-none" />
              ) : (
                <span className="flex-1 text-[12px] font-bold truncate" onClick={() => setActiveBoardId(b.id)}>{b.name}</span>
              )}
              <button onClick={() => setEditingBoard(b.id)} className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-accent cursor-pointer"><Edit3 size={10} /></button>
              <button onClick={() => deleteBoard(b.id)} className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-danger cursor-pointer"><Trash2 size={10} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Board content */}
      {activeBoard ? (
        <div className="flex-1 flex overflow-x-auto p-5 gap-4">
          <AnimatePresence mode="popLayout">
            {activeBoard.columns.map(col => (
              <motion.div key={col.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className={`w-[280px] shrink-0 flex flex-col rounded-2xl border overflow-hidden transition-all duration-200
                  ${dragOverCol === col.id ? "bg-accent/5 border-accent/30 scale-[1.01]" : "bg-bg-secondary/30 border-border/30"}`}
                onDragOver={e => { e.preventDefault(); setDragOverCol(col.id); }}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={() => handleDrop(col.id)}>
                <div className="flex items-center gap-2 p-3 border-b border-border/20">
                  <input value={col.title} onChange={e => updateColumnTitle(col.id, e.target.value)}
                    className="flex-1 bg-transparent font-bold text-[13px] text-text-primary outline-none" />
                  <span className="text-[10px] font-bold text-text-tertiary bg-bg-hover px-1.5 py-0.5 rounded-md">{col.cards.length}</span>
                  <button onClick={() => deleteColumn(col.id)} className="text-text-tertiary hover:text-danger cursor-pointer"><Trash2 size={12} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-[80px]">
                  {col.cards.map(card => (
                    <motion.div key={card.id} layout draggable onDragStart={() => setDragCard({ card, fromCol: col.id })} onDragEnd={() => setDragOverCol(null)}
                      className={`bg-bg-primary rounded-xl p-3 border border-border/20 cursor-grab active:cursor-grabbing hover:border-accent/30 hover:shadow-lg transition-all group
                        ${dragCard?.card.id === card.id ? "opacity-30 scale-95" : ""}`}>
                      <div className="flex items-start gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: card.color }} />
                        <input value={card.title} onChange={e => updateCard(col.id, card.id, { title: e.target.value })}
                          className="flex-1 bg-transparent text-[12px] font-bold text-text-primary outline-none" />
                        <button onClick={() => deleteCard(col.id, card.id)}
                          className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-danger cursor-pointer"><Trash2 size={11} /></button>
                      </div>
                      <textarea value={card.desc} onChange={e => updateCard(col.id, card.id, { desc: e.target.value })}
                        placeholder="Add description..."
                        className="w-full bg-transparent text-[11px] text-text-tertiary outline-none resize-none leading-relaxed placeholder:text-text-tertiary/40" rows={1} />
                    </motion.div>
                  ))}
                </div>
                <button onClick={() => addCard(col.id)}
                  className="flex items-center gap-2 px-3 py-2.5 text-[11px] font-bold text-text-tertiary hover:text-accent hover:bg-accent/5 transition-all cursor-pointer border-t border-border/10">
                  <Plus size={12} /> Add Card
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          <button onClick={addColumn}
            className="w-[280px] shrink-0 h-fit flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-border/30
              text-text-tertiary hover:text-accent hover:border-accent/40 transition-all cursor-pointer font-bold text-[12px]">
            <Plus size={14} /> Add Column
          </button>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-text-tertiary">Select a board</p>
        </div>
      )}
    </div>
  );
}
