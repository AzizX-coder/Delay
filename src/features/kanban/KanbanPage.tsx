import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, Reorder } from "motion/react";
import { Plus, MoreHorizontal, Trash2, GripVertical } from "lucide-react";

interface Card { id: string; title: string; desc: string; color: string; }
interface Column { id: string; title: string; cards: Card[]; }

const COLORS = ["#6366F1","#F59E0B","#10B981","#EF4444","#8B5CF6","#06B6D4"];
const uid = () => crypto.randomUUID();

export function KanbanPage() {
  const [columns, setColumns] = useState<Column[]>([
    { id: uid(), title: "To Do", cards: [] },
    { id: uid(), title: "In Progress", cards: [] },
    { id: uid(), title: "Done", cards: [] },
  ]);
  const [dragCard, setDragCard] = useState<{card: Card; fromCol: string} | null>(null);

  const addColumn = () => {
    setColumns(prev => [...prev, { id: uid(), title: "New Column", cards: [] }]);
  };

  const deleteColumn = (colId: string) => {
    setColumns(prev => prev.filter(c => c.id !== colId));
  };

  const addCard = (colId: string) => {
    setColumns(prev => prev.map(col =>
      col.id === colId ? { ...col, cards: [...col.cards, { id: uid(), title: "New Card", desc: "", color: COLORS[Math.floor(Math.random()*COLORS.length)] }] } : col
    ));
  };

  const deleteCard = (colId: string, cardId: string) => {
    setColumns(prev => prev.map(col =>
      col.id === colId ? { ...col, cards: col.cards.filter(c => c.id !== cardId) } : col
    ));
  };

  const updateColumnTitle = (colId: string, title: string) => {
    setColumns(prev => prev.map(col => col.id === colId ? { ...col, title } : col));
  };

  const updateCardTitle = (colId: string, cardId: string, title: string) => {
    setColumns(prev => prev.map(col =>
      col.id === colId ? { ...col, cards: col.cards.map(c => c.id === cardId ? { ...c, title } : c) } : col
    ));
  };

  const handleDrop = (targetColId: string) => {
    if (!dragCard) return;
    setColumns(prev => {
      const newCols = prev.map(col => ({
        ...col,
        cards: col.id === dragCard.fromCol ? col.cards.filter(c => c.id !== dragCard.card.id) : col.cards
      }));
      return newCols.map(col =>
        col.id === targetColId ? { ...col, cards: [...col.cards, dragCard.card] } : col
      );
    });
    setDragCard(null);
  };

  return (
    <div className="flex h-full overflow-x-auto p-6 gap-5 bg-bg-primary">
      <AnimatePresence mode="popLayout">
        {columns.map(col => (
          <motion.div
            key={col.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-[300px] shrink-0 flex flex-col bg-bg-secondary/30 rounded-2xl border border-border/30 overflow-hidden"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(col.id)}
          >
            <div className="flex items-center gap-2 p-4 border-b border-border/20">
              <input
                value={col.title}
                onChange={e => updateColumnTitle(col.id, e.target.value)}
                className="flex-1 bg-transparent font-bold text-[14px] text-text-primary outline-none"
              />
              <span className="text-[11px] font-bold text-text-tertiary bg-bg-hover px-2 py-0.5 rounded-md">
                {col.cards.length}
              </span>
              <button onClick={() => deleteColumn(col.id)}
                className="text-text-tertiary hover:text-danger transition-colors cursor-pointer">
                <Trash2 size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[100px]">
              {col.cards.map(card => (
                <motion.div
                  key={card.id}
                  layout
                  draggable
                  onDragStart={() => setDragCard({ card, fromCol: col.id })}
                  className="bg-bg-primary rounded-xl p-3 border border-border/20 cursor-grab active:cursor-grabbing
                    hover:border-accent/30 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: card.color }} />
                    <input
                      value={card.title}
                      onChange={e => updateCardTitle(col.id, card.id, e.target.value)}
                      className="flex-1 bg-transparent text-[13px] font-medium text-text-primary outline-none"
                    />
                    <button onClick={() => deleteCard(col.id, card.id)}
                      className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-danger transition-all cursor-pointer">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <button onClick={() => addCard(col.id)}
              className="flex items-center gap-2 px-4 py-3 text-[12px] font-bold text-text-tertiary
                hover:text-accent hover:bg-accent/5 transition-all cursor-pointer border-t border-border/10">
              <Plus size={14} /> Add Card
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      <button onClick={addColumn}
        className="w-[300px] shrink-0 h-fit flex items-center justify-center gap-2 p-4 rounded-2xl
          border-2 border-dashed border-border/30 text-text-tertiary hover:text-accent hover:border-accent/40
          transition-all cursor-pointer font-bold text-[13px]">
        <Plus size={16} /> Add Column
      </button>
    </div>
  );
}
