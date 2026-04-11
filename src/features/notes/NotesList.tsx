import { motion, AnimatePresence } from "motion/react";
import { useNotesStore } from "@/stores/notesStore";
import {
  Plus,
  Search,
  Pin,
  Trash2,
  Palette,
  StickyNote,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { NOTE_COLORS } from "@/types/note";
import { EmptyState } from "@/components/ui/EmptyState";

export function NotesList() {
  const {
    notes,
    activeNoteId,
    searchQuery,
    createNote,
    deleteNote,
    updateNote,
    setActiveNote,
    setSearchQuery,
  } = useNotesStore();

  const [colorPickerNoteId, setColorPickerNoteId] = useState<string | null>(null);

  return (
    <div className="w-72 h-full flex flex-col border-r border-border-light bg-bg-secondary/40 backdrop-blur-xl">
      {/* Header */}
      <div className="px-3 pt-4 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-text-primary tracking-[-0.01em]">
            Notes
          </h2>
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            onClick={createNote}
            className="w-7 h-7 flex items-center justify-center rounded-lg
              bg-accent text-text-inverse cursor-pointer
              hover:bg-accent-hover transition-colors
              shadow-[0_2px_8px_rgba(0,122,255,0.25)]"
          >
            <Plus size={16} />
          </motion.button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 bg-bg-primary/70 border border-border-light
              rounded-xl text-[13px] text-text-primary placeholder:text-text-tertiary
              outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10
              transition-all"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <AnimatePresence mode="popLayout">
          {notes.length === 0 ? (
            <EmptyState
              size="sm"
              icon={<StickyNote size={22} strokeWidth={1.5} />}
              title="No notes yet"
              description="Tap + to create your first note."
            />
          ) : (
            notes.map((note) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                onClick={() => setActiveNote(note.id)}
                className={`group relative p-3 mb-1.5 rounded-xl cursor-pointer
                  transition-all duration-150
                  ${
                    activeNoteId === note.id
                      ? "bg-accent/10 border border-accent/25 shadow-[0_2px_12px_rgba(0,122,255,0.08)]"
                      : "hover:bg-bg-hover border border-transparent hover:border-border-light"
                  }`}
                style={
                  note.color
                    ? { backgroundColor: `var(--color-note-${note.color})` }
                    : undefined
                }
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-text-primary truncate">
                      {note.title || "Untitled"}
                    </p>
                    <p className="text-[12px] text-text-tertiary truncate mt-0.5">
                      {note.content_text?.slice(0, 60) || "No content"}
                    </p>
                    <p className="text-[11px] text-text-tertiary mt-1">
                      {formatDistanceToNow(note.updated_at * 1000, {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  {note.pinned ? (
                    <Pin
                      size={12}
                      className="text-accent mt-0.5 shrink-0"
                      fill="currentColor"
                    />
                  ) : null}
                </div>

                {/* Hover actions */}
                <div
                  className="absolute top-2 right-2 flex items-center gap-0.5
                    opacity-0 group-hover:opacity-100 translate-y-0.5 group-hover:translate-y-0
                    transition-all duration-150
                    bg-bg-glass-heavy backdrop-blur-md rounded-lg p-0.5 border border-border-light
                    shadow-[0_2px_10px_rgba(0,0,0,0.06)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() =>
                      updateNote(note.id, { pinned: note.pinned ? 0 : 1 })
                    }
                    className="w-6 h-6 flex items-center justify-center rounded-md
                      text-text-tertiary hover:text-accent hover:bg-accent/10
                      transition-colors"
                    title={note.pinned ? "Unpin" : "Pin"}
                  >
                    <Pin size={12} />
                  </button>
                  <button
                    onClick={() =>
                      setColorPickerNoteId(
                        colorPickerNoteId === note.id ? null : note.id
                      )
                    }
                    className="w-6 h-6 flex items-center justify-center rounded-md
                      text-text-tertiary hover:text-warning hover:bg-warning/10
                      transition-colors"
                    title="Color"
                  >
                    <Palette size={12} />
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="w-6 h-6 flex items-center justify-center rounded-md
                      text-text-tertiary hover:text-danger hover:bg-danger/10
                      transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                {/* Color picker popup */}
                {colorPickerNoteId === note.id && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full right-2 mt-1 z-10 flex items-center gap-1
                      bg-bg-elevated p-2 rounded-xl border border-border shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        updateNote(note.id, { color: null });
                        setColorPickerNoteId(null);
                      }}
                      className="w-6 h-6 rounded-full border-2 border-border bg-bg-primary
                        hover:scale-110 transition-transform"
                      title="Default"
                    />
                    {Object.entries(NOTE_COLORS).map(([name, color]) => (
                      <button
                        key={name}
                        onClick={() => {
                          updateNote(note.id, { color: name });
                          setColorPickerNoteId(null);
                        }}
                        className="w-6 h-6 rounded-full hover:scale-110 transition-transform
                          border border-border-light"
                        style={{ backgroundColor: color }}
                        title={name}
                      />
                    ))}
                  </motion.div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

