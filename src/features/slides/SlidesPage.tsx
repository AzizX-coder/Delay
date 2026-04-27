import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, Play, ChevronLeft, ChevronRight, Presentation, Maximize2 } from "lucide-react";

interface Slide { id: string; content: string; bg: string; }
const uid = () => crypto.randomUUID();
const BG_OPTIONS = ["#09090B","#1e1b4b","#0c4a6e","#14532d","#7f1d1d","#3f3f46"];

export function SlidesPage() {
  const [slides, setSlides] = useState<Slide[]>([
    { id: uid(), content: "# Welcome to Delay Slides\n\nClick to edit this slide", bg: "#09090B" }
  ]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [presenting, setPresenting] = useState(false);

  const active = slides[activeIdx];

  const addSlide = () => {
    const s: Slide = { id: uid(), content: "# New Slide\n\nAdd your content here", bg: "#09090B" };
    setSlides(prev => [...prev, s]);
    setActiveIdx(slides.length);
  };

  const deleteSlide = (idx: number) => {
    if (slides.length <= 1) return;
    setSlides(prev => prev.filter((_, i) => i !== idx));
    if (activeIdx >= slides.length - 1) setActiveIdx(Math.max(0, slides.length - 2));
  };

  const updateSlide = (content: string) => {
    setSlides(prev => prev.map((s, i) => i === activeIdx ? { ...s, content } : s));
  };

  const nextSlide = () => setActiveIdx(i => Math.min(i + 1, slides.length - 1));
  const prevSlide = () => setActiveIdx(i => Math.max(i - 1, 0));

  // Presentation mode
  if (presenting) {
    return (
      <div className="fixed inset-0 z-[999] bg-black flex items-center justify-center cursor-pointer"
        onClick={nextSlide} onContextMenu={e => { e.preventDefault(); prevSlide(); }}>
        <div className="w-full max-w-5xl aspect-video rounded-xl p-16 flex items-center justify-center" style={{ background: active.bg }}>
          <div className="text-white text-center whitespace-pre-wrap text-[32px] font-bold leading-relaxed">
            {active.content.replace(/^#+ /gm, "").trim()}
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); setPresenting(false); }}
          className="absolute top-4 right-4 text-white/40 hover:text-white text-[12px] font-bold px-3 py-1.5 rounded-lg bg-white/10 cursor-pointer">
          Exit
        </button>
        <div className="absolute bottom-4 text-white/30 text-[12px] font-bold">
          {activeIdx + 1} / {slides.length}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Slide thumbnails */}
      <div className="w-52 h-full border-r border-border/40 bg-bg-secondary/30 flex flex-col">
        <div className="p-3 flex items-center justify-between border-b border-border/20">
          <h2 className="text-[11px] font-extrabold text-text-tertiary uppercase tracking-widest">Slides</h2>
          <div className="flex gap-1">
            <button onClick={() => setPresenting(true)}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-accent/20 text-accent hover:bg-accent hover:text-white cursor-pointer">
              <Play size={13} />
            </button>
            <button onClick={addSlide}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-accent text-white cursor-pointer">
              <Plus size={13} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {slides.map((slide, i) => (
            <div key={slide.id} onClick={() => setActiveIdx(i)}
              className={`group relative aspect-video rounded-xl border-2 p-3 cursor-pointer transition-all overflow-hidden
                ${i === activeIdx ? "border-accent shadow-lg shadow-accent/10" : "border-border/20 hover:border-border/40"}`}
              style={{ background: slide.bg }}>
              <p className="text-[8px] text-white/60 truncate font-medium leading-tight">
                {slide.content.split("\n")[0].replace(/^#+ /, "")}
              </p>
              <span className="absolute bottom-1 left-2 text-[9px] text-white/30 font-bold">{i + 1}</span>
              {slides.length > 1 && (
                <button onClick={e => { e.stopPropagation(); deleteSlide(i); }}
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center
                    rounded-md bg-black/50 text-white/60 hover:text-danger cursor-pointer transition-all">
                  <Trash2 size={10} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col bg-bg-primary">
        <div className="flex items-center gap-3 px-6 py-3 border-b border-border/40">
          <Presentation size={16} className="text-accent" />
          <span className="text-[13px] font-bold text-text-primary">Slide {activeIdx + 1}</span>
          <div className="flex-1" />
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-text-tertiary font-bold mr-2">Background:</span>
            {BG_OPTIONS.map(bg => (
              <button key={bg} onClick={() => setSlides(prev => prev.map((s, i) => i === activeIdx ? { ...s, bg } : s))}
                className={`w-6 h-6 rounded-full border-2 cursor-pointer ${active.bg === bg ? "border-accent" : "border-transparent"}`}
                style={{ background: bg }} />
            ))}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-4xl aspect-video rounded-2xl border border-border/30 shadow-2xl
            flex items-center justify-center p-12 relative transition-all" style={{ background: active.bg }}>
            <textarea
              value={active.content}
              onChange={e => updateSlide(e.target.value)}
              className="w-full h-full bg-transparent text-white text-center text-[24px] font-bold
                outline-none resize-none leading-relaxed placeholder:text-white/20"
              placeholder="Type your slide content..."
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 py-3 border-t border-border/40">
          <button onClick={prevSlide} disabled={activeIdx === 0}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-bg-hover text-text-tertiary disabled:opacity-30 cursor-pointer">
            <ChevronLeft size={16} />
          </button>
          <span className="text-[12px] font-bold text-text-tertiary">{activeIdx + 1} / {slides.length}</span>
          <button onClick={nextSlide} disabled={activeIdx === slides.length - 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-bg-hover text-text-tertiary disabled:opacity-30 cursor-pointer">
            <ChevronRight size={16} />
          </button>
          <button onClick={() => setPresenting(true)}
            className="ml-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white font-bold text-[12px] cursor-pointer">
            <Maximize2 size={14} /> Present
          </button>
        </div>
      </div>
    </div>
  );
}
