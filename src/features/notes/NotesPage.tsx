import { useEffect } from "react";
import { useNotesStore } from "@/stores/notesStore";
import { NotesList } from "./NotesList";
import { NoteEditor } from "./NoteEditor";
import { StickyNote } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export function NotesPage() {
  const { activeNoteId, loadNotes } = useNotesStore();

  useEffect(() => {
    loadNotes();
  }, []);

  return (
    <div className="flex h-full">
      <NotesList />
      <div className="flex-1 h-full overflow-hidden">
        {activeNoteId ? (
          <NoteEditor key={activeNoteId} noteId={activeNoteId} />
        ) : (
          <div className="h-full flex items-center justify-center">
            <EmptyState
              size="lg"
              icon={<StickyNote size={30} strokeWidth={1.5} />}
              title="Select a note or create a new one"
              description="Your thoughts, beautifully organized."
            />
          </div>
        )}
      </div>
    </div>
  );
}
