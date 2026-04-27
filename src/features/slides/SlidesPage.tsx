import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, Play, ChevronLeft, ChevronRight, Presentation, Maximize2, Type, Square, Circle } from "lucide-react";

interface Element {
  id: string; type: "text" | "shape"; content?: string;
  x: number; y: number; w: number; h: number;
  fontSize?: number; color: string; bgColor?: string; shapeType?: "rect" | "circle";
}

interface Slide { id: string; bg: string; elements: Element[]; }
const uid = () => crypto.randomUUID();

const BG_OPTIONS = [
  "#FFFFFF", "#1E1E1E", "#F8FAFC", "#0F172A", "#1e1b4b", "#0c4a6e", "#14532d", "#7f1d1d", 
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(to right, #4facfe 0%, #00f2fe 100%)"
];

function getSlides(): Slide[] {
  try { return JSON.parse(localStorage.getItem("delay_slides") || "[]"); } catch { return []; }
}
function saveSlides(slides: Slide[]) { localStorage.setItem("delay_slides", JSON.stringify(slides)); }

export function SlidesPage() {
  const [slides, setSlides] = useState<Slide[]>(() => {
    const s = getSlides();
    return s.length > 0 ? s : [{
      id: uid(), bg: "#FFFFFF",
      elements: [{ id: uid(), type: "text", content: "Presentation Title", x: 25, y: 40, w: 50, h: 20, fontSize: 48, color: "#000000" }]
    }];
  });
  const [activeIdx, setActiveIdx] = useState(0);
  const [presenting, setPresenting] = useState(false);
  const [selectedElId, setSelectedElId] = useState<string | null>(null);

  const active = slides[activeIdx];
  const persist = (updated: Slide[]) => { setSlides(updated); saveSlides(updated); };

  const updateActiveSlide = (updater: (s: Slide) => Slide) => {
    persist(slides.map((s, i) => i === activeIdx ? updater(s) : s));
  };

  const addSlide = () => {
    const s: Slide = { id: uid(), bg: "#FFFFFF", elements: [{ id: uid(), type: "text", content: "New Slide", x: 25, y: 45, w: 50, h: 10, fontSize: 32, color: "#000000" }] };
    persist([...slides, s]);
    setActiveIdx(slides.length);
  };

  const deleteSlide = (idx: number) => {
    if (slides.length <= 1) return;
    const upd = slides.filter((_, i) => i !== idx);
    persist(upd);
    if (activeIdx >= upd.length) setActiveIdx(upd.length - 1);
  };

  const addText = () => updateActiveSlide(s => ({ ...s, elements: [...s.elements, { id: uid(), type: "text", content: "Text", x: 10, y: 10, w: 30, h: 10, fontSize: 24, color: s.bg.includes("linear") || s.bg !== "#FFFFFF" ? "#FFFFFF" : "#000000" }] }));
  const addShape = (shapeType: "rect" | "circle") => updateActiveSlide(s => ({ ...s, elements: [...s.elements, { id: uid(), type: "shape", shapeType, x: 10, y: 10, w: 20, h: 20, color: "transparent", bgColor: "#6366F1" }] }));

  const updateElement = (elId: string, updates: Partial<Element>) => {
    updateActiveSlide(s => ({ ...s, elements: s.elements.map(el => el.id === elId ? { ...el, ...updates } : el) }));
  };
  const deleteElement = (elId: string) => updateActiveSlide(s => ({ ...s, elements: s.elements.filter(el => el.id !== elId) }));

  const nextSlide = () => setActiveIdx(i => Math.min(i + 1, slides.length - 1));
  const prevSlide = () => setActiveIdx(i => Math.max(i - 1, 0));

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (presenting) {
        if (e.key === "ArrowRight" || e.key === " ") nextSlide();
        if (e.key === "ArrowLeft") prevSlide();
        if (e.key === "Escape") setPresenting(false);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [presenting]);

  if (presenting) {
    return (
      <div className="fixed inset-0 z-[999] bg-black flex items-center justify-center cursor-none select-none"
        onClick={nextSlide} onContextMenu={e => { e.preventDefault(); prevSlide(); }}>
        <AnimatePresence mode="wait">
          <motion.div key={activeIdx}
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}
            className="w-full h-full max-w-7xl max-h-[56.25vw] aspect-video relative overflow-hidden" 
            style={{ background: active.bg }}>
            {active.elements.map(el => (
              <div key={el.id} className="absolute flex items-center justify-center"
                style={{
                  left: `${el.x}%`, top: `${el.y}%`, width: `${el.w}%`, height: `${el.h}%`,
                  color: el.color, fontSize: `${el.fontSize || 24}px`, background: el.bgColor || "transparent",
                  borderRadius: el.shapeType === "circle" ? "50%" : "0"
                }}>
                {el.type === "text" ? <span className="font-bold text-center block w-full outline-none" style={{ wordBreak: "break-word" }}>{el.content}</span> : null}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-bg-primary">
      {/* Thumbnails */}
      <div className="w-48 h-full border-r border-border/40 bg-bg-secondary/30 flex flex-col shrink-0">
        <div className="p-3 flex items-center justify-between border-b border-border/20">
          <h2 className="text-[11px] font-extrabold text-text-tertiary uppercase tracking-widest">Slides</h2>
          <button onClick={addSlide} className="w-6 h-6 flex items-center justify-center rounded bg-accent text-white hover:opacity-90 cursor-pointer shadow-md shadow-accent/20">
            <Plus size={12} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {slides.map((slide, i) => (
            <div key={slide.id} onClick={() => { setActiveIdx(i); setSelectedElId(null); }}
              className={`group relative aspect-video rounded-lg border-2 cursor-pointer transition-all overflow-hidden
                ${i === activeIdx ? "border-accent shadow-md shadow-accent/10" : "border-border/20 hover:border-border/40"}`}
              style={{ background: slide.bg }}>
              {/* Mini render */}
              <div className="w-full h-full absolute inset-0 pointer-events-none" style={{ transform: "scale(0.2)", transformOrigin: "top left", width: "500%", height: "500%" }}>
                {slide.elements.map(el => (
                  <div key={el.id} className="absolute flex items-center justify-center"
                    style={{
                      left: `${el.x}%`, top: `${el.y}%`, width: `${el.w}%`, height: `${el.h}%`,
                      color: el.color, fontSize: `${el.fontSize || 24}px`, background: el.bgColor || "transparent",
                      borderRadius: el.shapeType === "circle" ? "50%" : "0"
                    }}>
                    {el.type === "text" && <span className="font-bold text-center w-full">{el.content}</span>}
                  </div>
                ))}
              </div>
              <span className="absolute bottom-1 left-1.5 text-[9px] text-black/50 mix-blend-difference font-bold">{i + 1}</span>
              {slides.length > 1 && (
                <button onClick={e => { e.stopPropagation(); deleteSlide(i); }}
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded bg-black/60 text-white hover:text-danger cursor-pointer transition-all">
                  <Trash2 size={10} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col bg-[#0A0A0B]">
        {/* Top toolbar */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-border/40 bg-bg-secondary/20 h-14 shrink-0">
          <Presentation size={16} className="text-accent" />
          <div className="h-6 w-px bg-border/40 mx-1" />
          <button onClick={addText} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-bg-hover text-text-secondary hover:text-text-primary hover:bg-bg-active text-[11px] font-bold cursor-pointer transition-colors"><Type size={12} /> Text</button>
          <button onClick={() => addShape("rect")} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-bg-hover text-text-secondary hover:text-text-primary hover:bg-bg-active text-[11px] font-bold cursor-pointer transition-colors"><Square size={12} /> Shape</button>
          <button onClick={() => addShape("circle")} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-bg-hover text-text-secondary hover:text-text-primary hover:bg-bg-active text-[11px] font-bold cursor-pointer transition-colors"><Circle size={12} /> Circle</button>
          <div className="h-6 w-px bg-border/40 mx-1" />
          <div className="flex items-center gap-1.5 select-none">
            {BG_OPTIONS.map(bg => (
              <div key={bg} onClick={() => updateActiveSlide(s => ({ ...s, bg }))}
                className={`w-6 h-6 rounded-full cursor-pointer border-2 transition-transform ${active.bg === bg ? "border-accent scale-110 shadow-md shadow-accent/20" : "border-border/30 hover:scale-105"}`}
                style={{ background: bg }} title="Slide Background" />
            ))}
          </div>
          <div className="flex-1" />
          <button onClick={() => setPresenting(true)} className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-accent text-white font-bold text-[12px] cursor-pointer shadow-lg shadow-accent/20 hover:opacity-90">
            <Play size={14} fill="currentColor" /> Present
          </button>
        </div>

        {/* Canvas wrapper */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-hidden relative" onClick={() => setSelectedElId(null)}>
          <div className="w-full max-w-4xl aspect-video bg-white shadow-2xl relative select-none" style={{ background: active.bg }}>
            {active.elements.map(el => (
              <div key={el.id} onClick={e => { e.stopPropagation(); setSelectedElId(el.id); }}
                className={`absolute flex items-center justify-center cursor-move transition-shadow
                  ${selectedElId === el.id ? "ring-2 ring-accent ring-offset-2 z-10" : "hover:ring-1 hover:ring-border/50"}`}
                style={{
                  left: `${el.x}%`, top: `${el.y}%`, width: `${el.w}%`, height: `${el.h}%`,
                  color: el.color, fontSize: `${el.fontSize || 24}px`, background: el.bgColor || "transparent",
                  borderRadius: el.shapeType === "circle" ? "50%" : "0"
                }}>
                {el.type === "text" ? (
                  <input value={el.content} onChange={e => updateElement(el.id, { content: e.target.value })}
                    className="w-full h-full bg-transparent outline-none text-center font-bold font-sans" style={{ color: el.color }} />
                ) : null}

                {/* Resize handle (dummy/visual for now) */}
                {selectedElId === el.id && (
                  <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-accent rounded-full border-2 border-white cursor-se-resize" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Properties panel */}
      {selectedElId && (
        <div className="w-64 border-l border-border/40 bg-bg-secondary/30 p-4 shrink-0 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[12px] font-bold text-text-primary">Element Properties</h3>
            <button onClick={() => deleteElement(selectedElId)} className="w-7 h-7 flex items-center justify-center rounded bg-danger/10 text-danger hover:bg-danger/20 cursor-pointer">
              <Trash2 size={13} />
            </button>
          </div>
          {active.elements.map(el => el.id === selectedElId && (
             <div key={el.id} className="space-y-4">
               <div>
                 <span className="text-[10px] uppercase font-bold text-text-tertiary block mb-1.5">Position & Size (%)</span>
                 <div className="grid grid-cols-2 gap-2">
                   <input type="number" value={el.x} onChange={e => updateElement(el.id, { x: +e.target.value })} className="bg-bg-primary text-[12px] px-2 py-1 rounded border border-border/30" placeholder="X" />
                   <input type="number" value={el.y} onChange={e => updateElement(el.id, { y: +e.target.value })} className="bg-bg-primary text-[12px] px-2 py-1 rounded border border-border/30" placeholder="Y" />
                   <input type="number" value={el.w} onChange={e => updateElement(el.id, { w: +e.target.value })} className="bg-bg-primary text-[12px] px-2 py-1 rounded border border-border/30" placeholder="W" />
                   <input type="number" value={el.h} onChange={e => updateElement(el.id, { h: +e.target.value })} className="bg-bg-primary text-[12px] px-2 py-1 rounded border border-border/30" placeholder="H" />
                 </div>
               </div>
               
               {el.type === "text" && (
                 <div>
                   <span className="text-[10px] uppercase font-bold text-text-tertiary block mb-1.5">Typography</span>
                   <div className="flex items-center gap-2 mb-2">
                     <span className="text-[11px] text-text-secondary w-8">Size</span>
                     <input type="range" min={12} max={120} value={el.fontSize} onChange={e => updateElement(el.id, { fontSize: +e.target.value })} className="flex-1 accent-accent" />
                     <span className="text-[10px] font-mono w-6 text-right">{el.fontSize}</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <span className="text-[11px] text-text-secondary w-8">Color</span>
                     <input type="color" value={el.color} onChange={e => updateElement(el.id, { color: e.target.value })} className="w-full h-8 rounded shrink-0" />
                   </div>
                 </div>
               )}

               {el.type === "shape" && (
                 <div>
                   <span className="text-[10px] uppercase font-bold text-text-tertiary block mb-1.5">Fill Color</span>
                   <input type="color" value={el.bgColor} onChange={e => updateElement(el.id, { bgColor: e.target.value })} className="w-full h-10 rounded shrink-0 cursor-pointer" />
                 </div>
               )}
             </div>
          ))}
        </div>
      )}
    </div>
  );
}
