import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "motion/react";
import {
  Square, Circle, Type, Minus, MousePointer, StickyNote,
  Diamond, Undo2, Trash2, ZoomIn, ZoomOut, Grid3X3, Pen,
} from "lucide-react";

/* ── Types ── */
type ToolType = "select" | "pen" | "sticky" | "rect" | "circle" | "diamond" | "line" | "text";
type BgMode = "blank" | "dots" | "grid";

interface WBObject {
  id: string;
  type: "sticky" | "rect" | "circle" | "diamond" | "line" | "text" | "path";
  x: number; y: number;
  w?: number; h?: number;
  x2?: number; y2?: number;
  text?: string;
  color: string;
  stroke?: string;
  points?: number[][];
}

const COLORS = ["#6366F1", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#8B5CF6", "#FFFFFF"];
const STICKY_COLORS = ["#FEF3C7", "#DBEAFE", "#D1FAE5", "#FCE7F3", "#EDE9FE", "#E0F2FE"];
const LS_KEY = "delay-whiteboard-v2";

function uid() { return Math.random().toString(36).slice(2, 10); }

/* ── Persistence ── */
function loadBoard(): WBObject[] {
  try { const d = localStorage.getItem(LS_KEY); return d ? JSON.parse(d) : []; } catch { return []; }
}
function saveBoard(objects: WBObject[]) { localStorage.setItem(LS_KEY, JSON.stringify(objects)); }

export function WhiteboardPage() {
  const [objects, setObjects] = useState<WBObject[]>(() => loadBoard());
  const [tool, setTool] = useState<ToolType>("select");
  const [color, setColor] = useState("#6366F1");
  const [bgMode, setBgMode] = useState<BgMode>("dots");
  const [selected, setSelected] = useState<string | null>(null);
  const [history, setHistory] = useState<WBObject[][]>([]);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState<{ id: string; ox: number; oy: number } | null>(null);
  const [drawing, setDrawing] = useState<{ startX: number; startY: number } | null>(null);
  const [penPoints, setPenPoints] = useState<number[][]>([]);
  const [editingText, setEditingText] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, px: 0, py: 0 });

  // Save whenever objects change
  useEffect(() => { saveBoard(objects); }, [objects]);

  const pushHistory = useCallback(() => {
    setHistory(prev => [...prev.slice(-30), objects]);
  }, [objects]);

  const undo = () => {
    if (history.length === 0) return;
    setObjects(history[history.length - 1]);
    setHistory(prev => prev.slice(0, -1));
  };

  const toSVG = (clientX: number, clientY: number) => {
    const r = svgRef.current!.getBoundingClientRect();
    return { x: (clientX - r.left - pan.x) / zoom, y: (clientY - r.top - pan.y) / zoom };
  };

  /* ── Mouse handlers ── */
  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      isPanning.current = true;
      panStart.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
      return;
    }

    const pt = toSVG(e.clientX, e.clientY);

    if (tool === "select") {
      // Check if clicking on an object
      const hit = [...objects].reverse().find(o => hitTest(o, pt.x, pt.y));
      if (hit) {
        setSelected(hit.id);
        setDragging({ id: hit.id, ox: pt.x - hit.x, oy: pt.y - hit.y });
      } else {
        setSelected(null);
      }
      return;
    }

    if (tool === "pen") {
      pushHistory();
      setPenPoints([[pt.x, pt.y]]);
      return;
    }

    pushHistory();
    setDrawing({ startX: pt.x, startY: pt.y });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (isPanning.current) {
      setPan({ x: panStart.current.px + (e.clientX - panStart.current.x), y: panStart.current.py + (e.clientY - panStart.current.y) });
      return;
    }

    const pt = toSVG(e.clientX, e.clientY);

    if (dragging) {
      setObjects(prev => prev.map(o => o.id === dragging.id ? { ...o, x: pt.x - dragging.ox, y: pt.y - dragging.oy } : o));
      return;
    }

    if (tool === "pen" && penPoints.length > 0) {
      setPenPoints(prev => [...prev, [pt.x, pt.y]]);
      return;
    }

    if (drawing) {
      // Live preview handled via drawing state
    }
  };

  const onMouseUp = (e: React.MouseEvent) => {
    isPanning.current = false;

    if (dragging) { setDragging(null); return; }

    const pt = toSVG(e.clientX, e.clientY);

    if (tool === "pen" && penPoints.length > 1) {
      setObjects(prev => [...prev, { id: uid(), type: "path", x: 0, y: 0, color, points: penPoints }]);
      setPenPoints([]);
      return;
    }

    if (!drawing) return;
    const { startX, startY } = drawing;
    const w = Math.abs(pt.x - startX);
    const h = Math.abs(pt.y - startY);
    const minX = Math.min(startX, pt.x);
    const minY = Math.min(startY, pt.y);

    if (tool === "sticky") {
      const sc = STICKY_COLORS[Math.floor(Math.random() * STICKY_COLORS.length)];
      setObjects(prev => [...prev, { id: uid(), type: "sticky", x: startX, y: startY, w: Math.max(w, 160), h: Math.max(h, 120), text: "Double-click to edit", color: sc }]);
    } else if (tool === "rect") {
      if (w > 5 && h > 5) setObjects(prev => [...prev, { id: uid(), type: "rect", x: minX, y: minY, w, h, color, stroke: color }]);
    } else if (tool === "circle") {
      if (w > 5 && h > 5) setObjects(prev => [...prev, { id: uid(), type: "circle", x: minX, y: minY, w, h, color, stroke: color }]);
    } else if (tool === "diamond") {
      if (w > 5 && h > 5) setObjects(prev => [...prev, { id: uid(), type: "diamond", x: minX, y: minY, w, h, color, stroke: color }]);
    } else if (tool === "line") {
      if (w > 3 || h > 3) setObjects(prev => [...prev, { id: uid(), type: "line", x: startX, y: startY, x2: pt.x, y2: pt.y, color, stroke: color }]);
    } else if (tool === "text") {
      const id = uid();
      setObjects(prev => [...prev, { id, type: "text", x: startX, y: startY, text: "Text", color }]);
      setEditingText(id);
    }

    setDrawing(null);
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.min(5, Math.max(0.1, z * delta)));
  };

  const deleteSelected = () => {
    if (!selected) return;
    pushHistory();
    setObjects(prev => prev.filter(o => o.id !== selected));
    setSelected(null);
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    const pt = toSVG(e.clientX, e.clientY);
    const hit = [...objects].reverse().find(o => hitTest(o, pt.x, pt.y));
    if (hit && (hit.type === "sticky" || hit.type === "text")) {
      setEditingText(hit.id);
    }
  };

  /* ── Keyboard ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") { if (selected && !editingText) deleteSelected(); }
      if (e.ctrlKey && e.key === "z") undo();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selected, editingText, history]);

  /* ── Background pattern ── */
  const renderBg = () => {
    if (bgMode === "dots") {
      return (
        <pattern id="dots" x={pan.x % (20 * zoom)} y={pan.y % (20 * zoom)} width={20 * zoom} height={20 * zoom} patternUnits="userSpaceOnUse">
          <circle cx={10 * zoom} cy={10 * zoom} r={1.2} fill="var(--color-border-light)" opacity="0.5" />
        </pattern>
      );
    }
    if (bgMode === "grid") {
      return (
        <pattern id="grid" x={pan.x % (30 * zoom)} y={pan.y % (30 * zoom)} width={30 * zoom} height={30 * zoom} patternUnits="userSpaceOnUse">
          <path d={`M ${30 * zoom} 0 L 0 0 0 ${30 * zoom}`} fill="none" stroke="var(--color-border-light)" strokeWidth="0.5" opacity="0.3" />
        </pattern>
      );
    }
    return null;
  };

  const TOOLS: { id: ToolType; icon: any; label: string }[] = [
    { id: "select", icon: MousePointer, label: "Select" },
    { id: "pen", icon: Pen, label: "Pen" },
    { id: "sticky", icon: StickyNote, label: "Sticky Note" },
    { id: "rect", icon: Square, label: "Rectangle" },
    { id: "circle", icon: Circle, label: "Circle" },
    { id: "diamond", icon: Diamond, label: "Diamond" },
    { id: "line", icon: Minus, label: "Line" },
    { id: "text", icon: Type, label: "Text" },
  ];

  return (
    <div className="flex h-full bg-bg-primary relative overflow-hidden">
      {/* ── Toolbar ── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1
        bg-bg-elevated/90 backdrop-blur-xl border border-border/30 rounded-2xl p-1.5 shadow-2xl">
        {TOOLS.map(t => (
          <button key={t.id} onClick={() => setTool(t.id)} title={t.label}
            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all cursor-pointer
              ${tool === t.id ? "bg-accent text-white shadow-md" : "text-text-tertiary hover:text-text-primary hover:bg-bg-hover"}`}>
            <t.icon size={16} />
          </button>
        ))}
        <div className="w-px h-6 bg-border/20 mx-0.5" />
        {COLORS.map(c => (
          <button key={c} onClick={() => setColor(c)}
            className={`w-5 h-5 rounded-full border-2 transition-all cursor-pointer ${color === c ? "border-accent scale-125" : "border-transparent hover:scale-110"}`}
            style={{ background: c }} />
        ))}
        <div className="w-px h-6 bg-border/20 mx-0.5" />
        <button onClick={() => setBgMode(bgMode === "blank" ? "dots" : bgMode === "dots" ? "grid" : "blank")} title="Toggle background"
          className="w-9 h-9 flex items-center justify-center rounded-xl text-text-tertiary hover:text-text-primary hover:bg-bg-hover cursor-pointer">
          <Grid3X3 size={16} />
        </button>
        <button onClick={undo} title="Undo"
          className="w-9 h-9 flex items-center justify-center rounded-xl text-text-tertiary hover:text-text-primary hover:bg-bg-hover cursor-pointer">
          <Undo2 size={16} />
        </button>
        {selected && (
          <button onClick={deleteSelected} title="Delete"
            className="w-9 h-9 flex items-center justify-center rounded-xl text-danger hover:bg-danger/10 cursor-pointer">
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* ── Zoom controls ── */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1 bg-bg-elevated/90 backdrop-blur-xl border border-border/30 rounded-xl p-1 shadow-xl">
        <button onClick={() => setZoom(z => Math.min(5, z * 1.2))} className="w-8 h-8 flex items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-hover cursor-pointer">
          <ZoomIn size={14} />
        </button>
        <span className="text-[11px] font-bold text-text-secondary w-12 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.max(0.1, z * 0.8))} className="w-8 h-8 flex items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-hover cursor-pointer">
          <ZoomOut size={14} />
        </button>
      </div>

      {/* ── Canvas ── */}
      <svg ref={svgRef} className="w-full h-full" style={{ cursor: tool === "select" ? "default" : "crosshair" }}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}
        onMouseLeave={() => { isPanning.current = false; setDragging(null); setDrawing(null); setPenPoints([]); }}
        onWheel={onWheel} onDoubleClick={onDoubleClick}>

        {/* Background */}
        <defs>{renderBg()}</defs>
        <rect width="100%" height="100%" fill="var(--color-bg-primary)" />
        {bgMode !== "blank" && <rect width="100%" height="100%" fill={`url(#${bgMode})`} />}

        {/* Transform group */}
        <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
          {objects.map(obj => (
            <WBObjectRenderer key={obj.id} obj={obj} isSelected={selected === obj.id}
              editingText={editingText} setEditingText={setEditingText}
              updateText={(id, text) => setObjects(prev => prev.map(o => o.id === id ? { ...o, text } : o))} />
          ))}

          {/* Live pen stroke */}
          {penPoints.length > 1 && (
            <polyline points={penPoints.map(p => p.join(",")).join(" ")}
              fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          )}

          {/* Live shape preview */}
          {drawing && tool !== "pen" && tool !== "select" && tool !== "text" && (
            <LivePreview tool={tool} start={drawing} color={color} svgRef={svgRef} pan={pan} zoom={zoom} />
          )}
        </g>
      </svg>
    </div>
  );
}

/* ── Object renderer ── */
function WBObjectRenderer({ obj, isSelected, editingText, setEditingText, updateText }: {
  obj: WBObject; isSelected: boolean; editingText: string | null;
  setEditingText: (id: string | null) => void;
  updateText: (id: string, text: string) => void;
}) {
  const outline = isSelected ? "2px solid #6366F1" : "none";

  if (obj.type === "sticky") {
    return (
      <foreignObject x={obj.x} y={obj.y} width={obj.w || 160} height={obj.h || 120} style={{ outline, borderRadius: 8 }}>
        <div style={{ width: "100%", height: "100%", background: obj.color, borderRadius: 8, padding: 10, fontSize: 13, fontFamily: "Inter, sans-serif", color: "#1a1a1a", overflow: "hidden" }}>
          {editingText === obj.id ? (
            <textarea autoFocus value={obj.text || ""} onChange={e => updateText(obj.id, e.target.value)}
              onBlur={() => setEditingText(null)} onKeyDown={e => { if (e.key === "Escape") setEditingText(null); }}
              style={{ width: "100%", height: "100%", background: "transparent", border: "none", outline: "none", resize: "none", fontSize: 13, fontFamily: "Inter, sans-serif", color: "#1a1a1a" }} />
          ) : (
            <p style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{obj.text || ""}</p>
          )}
        </div>
      </foreignObject>
    );
  }

  if (obj.type === "rect") {
    return <rect x={obj.x} y={obj.y} width={obj.w} height={obj.h} fill="none" stroke={obj.stroke} strokeWidth="2" rx="4" style={{ outline }} />;
  }

  if (obj.type === "circle") {
    return <ellipse cx={obj.x + (obj.w || 0) / 2} cy={obj.y + (obj.h || 0) / 2} rx={(obj.w || 0) / 2} ry={(obj.h || 0) / 2}
      fill="none" stroke={obj.stroke} strokeWidth="2" style={{ outline }} />;
  }

  if (obj.type === "diamond") {
    const cx = obj.x + (obj.w || 0) / 2, cy = obj.y + (obj.h || 0) / 2;
    const hw = (obj.w || 0) / 2, hh = (obj.h || 0) / 2;
    return <polygon points={`${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}`}
      fill="none" stroke={obj.stroke} strokeWidth="2" style={{ outline }} />;
  }

  if (obj.type === "line") {
    return <line x1={obj.x} y1={obj.y} x2={obj.x2} y2={obj.y2} stroke={obj.stroke} strokeWidth="2" strokeLinecap="round" style={{ outline: "none" }} />;
  }

  if (obj.type === "text") {
    if (editingText === obj.id) {
      return (
        <foreignObject x={obj.x} y={obj.y - 20} width="300" height="40">
          <input autoFocus value={obj.text || ""} onChange={e => updateText(obj.id, e.target.value)}
            onBlur={() => setEditingText(null)} onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") setEditingText(null); }}
            style={{ background: "transparent", border: "none", outline: "1px solid #6366F1", borderRadius: 4, padding: "4px 8px",
              fontSize: 16, fontFamily: "Inter, sans-serif", color: obj.color, width: "100%" }} />
        </foreignObject>
      );
    }
    return <text x={obj.x} y={obj.y} fill={obj.color} fontSize="16" fontFamily="Inter, sans-serif" fontWeight="600" style={{ outline, cursor: "move" }}>{obj.text}</text>;
  }

  if (obj.type === "path" && obj.points) {
    return <polyline points={obj.points.map(p => p.join(",")).join(" ")}
      fill="none" stroke={obj.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ outline: "none" }} />;
  }

  return null;
}

/* ── Live shape preview while dragging ── */
function LivePreview({ tool, start, color, svgRef, pan, zoom }: {
  tool: ToolType; start: { startX: number; startY: number }; color: string;
  svgRef: React.RefObject<SVGSVGElement | null>; pan: { x: number; y: number }; zoom: number;
}) {
  const [pos, setPos] = useState({ x: start.startX, y: start.startY });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!svgRef.current) return;
      const r = svgRef.current.getBoundingClientRect();
      setPos({ x: (e.clientX - r.left - pan.x) / zoom, y: (e.clientY - r.top - pan.y) / zoom });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const x = Math.min(start.startX, pos.x), y = Math.min(start.startY, pos.y);
  const w = Math.abs(pos.x - start.startX), h = Math.abs(pos.y - start.startY);

  if (tool === "rect" || tool === "sticky") return <rect x={x} y={y} width={w} height={h} fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="5,5" rx="4" opacity="0.6" />;
  if (tool === "circle") return <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="5,5" opacity="0.6" />;
  if (tool === "diamond") {
    const cx = x + w / 2, cy2 = y + h / 2;
    return <polygon points={`${cx},${y} ${x + w},${cy2} ${cx},${y + h} ${x},${cy2}`} fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="5,5" opacity="0.6" />;
  }
  if (tool === "line") return <line x1={start.startX} y1={start.startY} x2={pos.x} y2={pos.y} stroke={color} strokeWidth="1.5" strokeDasharray="5,5" opacity="0.6" />;

  return null;
}

/* ── Hit testing ── */
function hitTest(obj: WBObject, px: number, py: number): boolean {
  if (obj.type === "line") {
    const d = distToLine(obj.x, obj.y, obj.x2 || obj.x, obj.y2 || obj.y, px, py);
    return d < 8;
  }
  if (obj.type === "path") return false; // paths are hard to hit-test, skip
  if (obj.type === "text") return px >= obj.x - 5 && px <= obj.x + 200 && py >= obj.y - 20 && py <= obj.y + 5;
  const w = obj.w || 160, h = obj.h || 120;
  return px >= obj.x && px <= obj.x + w && py >= obj.y && py <= obj.y + h;
}

function distToLine(x1: number, y1: number, x2: number, y2: number, px: number, py: number): number {
  const A = px - x1, B = py - y1, C = x2 - x1, D = y2 - y1;
  const dot = A * C + B * D, lenSq = C * C + D * D;
  let t = lenSq !== 0 ? dot / lenSq : -1;
  t = Math.max(0, Math.min(1, t));
  const xx = x1 + t * C, yy = y1 + t * D;
  return Math.sqrt((px - xx) ** 2 + (py - yy) ** 2);
}
