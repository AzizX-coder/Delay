import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useWhiteboardStore, ToolType, WBObject, Connector } from "@/stores/whiteboardStore";
import {
  Square, Circle, Type, Minus, MousePointer, StickyNote,
  Diamond, Undo2, Trash2, ZoomIn, ZoomOut, Grid3X3, Pen,
  ArrowRight, Layers, Settings2, Plus, ChevronDown, Lock, Eye, EyeOff,
  BringToFront, SendToBack, ChevronRight, Link2, AlignLeft, AlignCenter, AlignRight
} from "lucide-react";

/* ── Constants ── */
const COLORS = ["#6366F1", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#8B5CF6", "#FFFFFF", "#1E293B"];
const FILL_COLORS = ["transparent", "#FFFFFF", "#6366F1", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#1E293B"];
const STICKY_COLORS = ["#FEF3C7", "#DBEAFE", "#D1FAE5", "#FCE7F3", "#EDE9FE", "#E0F2FE"];
const FONTS = ["Inter", "JetBrains Mono", "Georgia", "Arial", "Caveat"];

/* ── Helpers ── */
function uid() { return Math.random().toString(36).slice(2, 10); }

function getBounds(obj: WBObject) {
  if (obj.type === "line" || obj.type === "arrow") {
    const minX = Math.min(obj.x, obj.x2 || obj.x);
    const minY = Math.min(obj.y, obj.y2 || obj.y);
    const w = Math.abs(obj.x - (obj.x2 || obj.x));
    const h = Math.abs(obj.y - (obj.y2 || obj.y));
    return { x: minX, y: minY, w, h };
  }
  if (obj.type === "path" && obj.points) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    obj.points.forEach(([px, py]) => {
      minX = Math.min(minX, px); minY = Math.min(minY, py);
      maxX = Math.max(maxX, px); maxY = Math.max(maxY, py);
    });
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }
  return { x: obj.x, y: obj.y, w: obj.w || 160, h: obj.h || 120 };
}

function hitTest(obj: WBObject, px: number, py: number): boolean {
  if (obj.hidden) return false;
  if (obj.type === "line" || obj.type === "arrow") {
    const d = distToLine(obj.x, obj.y, obj.x2 || obj.x, obj.y2 || obj.y, px, py);
    return d < 8;
  }
  if (obj.type === "path" && obj.points) {
    // Rough bounding box hit test for path
    const { x, y, w, h } = getBounds(obj);
    return px >= x && px <= x + w && py >= y && py <= y + h;
  }
  if (obj.type === "text") return px >= obj.x - 5 && px <= obj.x + 200 && py >= obj.y - 20 && py <= obj.y + 20;
  
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

// Spline smoothing for pen
function smoothPoints(points: number[][]): number[][] {
  if (points.length < 3) return points;
  const smoothed: number[][] = [];
  smoothed.push(points[0]);
  for (let i = 1; i < points.length - 1; i++) {
    const xc = (points[i][0] + points[i + 1][0]) / 2;
    const yc = (points[i][1] + points[i + 1][1]) / 2;
    smoothed.push([xc, yc]);
  }
  smoothed.push(points[points.length - 1]);
  return smoothed;
}

export function WhiteboardPage() {
  const store = useWhiteboardStore();
  const {
    boards, activeBoardId, loadBoards, createBoard, switchBoard, deleteBoard,
    tool, setTool, color, setColor, bgMode, setBgMode, selectedId, setSelectedId,
    pan, setPan, zoom, setZoom, updateObjects, pushHistory, undo, deleteSelected,
    bringForward, sendBackward, addConnector, removeConnector
  } = store;


  // Local ephemeral state
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showBoardsMenu, setShowBoardsMenu] = useState(false);
  const [editingText, setEditingText] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; ox: number; oy: number } | null>(null);
  const [resizing, setResizing] = useState<{ id: string; handle: string; startW: number; startH: number; startX: number; startY: number } | null>(null);
  const [drawing, setDrawing] = useState<{ startX: number; startY: number } | null>(null);
  const [penPoints, setPenPoints] = useState<number[][]>([]);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, px: 0, py: 0 });

  useEffect(() => { loadBoards(); }, []);

  const activeBoard = boards.find(b => b.id === activeBoardId);
  const currentObjects = activeBoard?.objects || [];
  const connectors = activeBoard?.connectors || [];
  const selectedObj = currentObjects.find(o => o.id === selectedId);

  /* ── Canvas Interactivity ── */
  const toSVG = (clientX: number, clientY: number) => {
    const r = svgRef.current!.getBoundingClientRect();
    return { x: (clientX - r.left - pan.x) / zoom, y: (clientY - r.top - pan.y) / zoom };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey) || tool === "select" && e.button === 0 && e.altKey) {
      isPanning.current = true;
      panStart.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
      return;
    }

    const pt = toSVG(e.clientX, e.clientY);

    // Check resize handles first if an object is selected
    if (tool === "select" && selectedObj && !selectedObj.locked) {
      const handle = (e.target as HTMLElement).getAttribute("data-handle");
      if (handle) {
        setResizing({ id: selectedObj.id, handle, startW: selectedObj.w || 0, startH: selectedObj.h || 0, startX: pt.x, startY: pt.y });
        return;
      }
    }

    if (tool === "select") {
      const hit = [...currentObjects].reverse().find(o => hitTest(o, pt.x, pt.y));
      if (hit) {
        setSelectedId(hit.id);
        if (!hit.locked) setDragging({ id: hit.id, ox: pt.x - hit.x, oy: pt.y - hit.y });
      } else {
        setSelectedId(null);
      }
      return;
    }

    if (tool === "connector") {
      const hit = [...currentObjects].reverse().find(o => hitTest(o, pt.x, pt.y) && o.type !== "path" && o.type !== "line" && o.type !== "arrow");
      if (hit) {
        if (connectingFrom && connectingFrom !== hit.id) {
          addConnector(connectingFrom, hit.id, color);
          setConnectingFrom(null);
          setTool("select");
        } else {
          setConnectingFrom(hit.id);
        }
      } else {
        setConnectingFrom(null);
      }
      return;
    }

    if (tool === "pen") {
      pushHistory();
      setPenPoints([[pt.x, pt.y]]);
      return;
    }

    pushHistory();
    setSelectedId(null);
    setDrawing({ startX: pt.x, startY: pt.y });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (isPanning.current) {
      setPan({ x: panStart.current.px + (e.clientX - panStart.current.x), y: panStart.current.py + (e.clientY - panStart.current.y) });
      return;
    }

    const pt = toSVG(e.clientX, e.clientY);

    if (resizing && selectedObj) {
      const dx = pt.x - resizing.startX;
      const dy = pt.y - resizing.startY;
      updateObjects(objs => objs.map(o => {
        if (o.id !== resizing.id) return o;
        const no = { ...o };
        if (resizing.handle.includes("e")) no.w = Math.max(10, resizing.startW + dx);
        if (resizing.handle.includes("s")) no.h = Math.max(10, resizing.startH + dy);
        return no;
      }));
      return;
    }

    if (dragging) {
      updateObjects(objs => objs.map(o => o.id === dragging.id ? { ...o, x: pt.x - dragging.ox, y: pt.y - dragging.oy } : o));
      return;
    }

    if (tool === "pen" && penPoints.length > 0) {
      setPenPoints(prev => [...prev, [pt.x, pt.y]]);
      return;
    }
  };

  const onMouseUp = (e: React.MouseEvent) => {
    isPanning.current = false;
    if (dragging) { setDragging(null); return; }
    if (resizing) { setResizing(null); return; }

    const pt = toSVG(e.clientX, e.clientY);

    if (tool === "pen" && penPoints.length > 1) {
      const smoothed = smoothPoints(penPoints);
      updateObjects(prev => [...prev, { id: uid(), type: "path", x: 0, y: 0, color, points: smoothed }]);
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
      updateObjects(prev => [...prev, { id: uid(), type: "sticky", x: startX, y: startY, w: Math.max(w, 160), h: Math.max(h, 120), text: "Double-click to edit", color: sc }]);
    } else if (tool === "rect" || tool === "circle" || tool === "diamond") {
      if (w > 5 && h > 5) updateObjects(prev => [...prev, { id: uid(), type: tool, x: minX, y: minY, w, h, color, stroke: color }]);
    } else if (tool === "line" || tool === "arrow") {
      if (w > 3 || h > 3) updateObjects(prev => [...prev, { id: uid(), type: tool, x: startX, y: startY, x2: pt.x, y2: pt.y, color, stroke: color }]);
    } else if (tool === "text") {
      const id = uid();
      updateObjects(prev => [...prev, { id, type: "text", x: startX, y: startY, text: "Text", color, fontSize: 16 }]);
      setEditingText(id);
      setSelectedId(id);
    }
    
    setTool("select");
    setDrawing(null);
  };

  const onWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(z => Math.min(5, Math.max(0.1, z * delta)));
    } else {
      setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
    }
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    const pt = toSVG(e.clientX, e.clientY);
    const hit = [...currentObjects].reverse().find(o => hitTest(o, pt.x, pt.y));
    if (hit && (hit.type === "sticky" || hit.type === "text")) {
      setEditingText(hit.id);
      setSelectedId(hit.id);
    }
  };

  // Global Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId && !editingText) {
        deleteSelected();
      }
      if (e.ctrlKey && e.key === "z") undo();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedId, editingText]);

  if (!activeBoard) return null;

  return (
    <div className="flex h-full bg-bg-primary overflow-hidden font-sans text-text-primary">
      
      {/* ─── LEFT PANEL (Layers / Boards) ─── */}
      <AnimatePresence initial={false}>
        {showLeftPanel && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full border-r border-border/40 bg-bg-secondary/30 flex flex-col shrink-0"
          >
            {/* Boards Dropdown */}
            <div className="p-3 border-b border-border/40 relative">
              <button 
                onClick={() => setShowBoardsMenu(!showBoardsMenu)}
                className="w-full flex items-center justify-between bg-bg-primary px-3 py-2 rounded-lg border border-border text-[12px] font-bold shadow-sm"
              >
                <span className="truncate">{activeBoard.name}</span>
                <ChevronDown size={14} className="text-text-tertiary" />
              </button>
              
              <AnimatePresence>
                {showBoardsMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full left-3 right-3 mt-1 bg-bg-elevated border border-border shadow-2xl rounded-xl z-50 overflow-hidden"
                  >
                    <div className="max-h-48 overflow-y-auto py-1">
                      {boards.map(b => (
                        <div 
                          key={b.id} 
                          onClick={() => { switchBoard(b.id); setShowBoardsMenu(false); }}
                          className={`px-3 py-2 text-[12px] cursor-pointer hover:bg-bg-hover flex items-center justify-between
                            ${b.id === activeBoardId ? "text-accent font-bold" : "text-text-secondary"}
                          `}
                        >
                          <span className="truncate">{b.name}</span>
                          {boards.length > 1 && b.id !== activeBoardId && (
                            <button onClick={(e) => { e.stopPropagation(); deleteBoard(b.id); }} className="text-text-tertiary hover:text-danger">
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="p-2 border-t border-border/40 bg-bg-secondary/50">
                      <button 
                        onClick={() => { createBoard("New Board"); setShowBoardsMenu(false); }}
                        className="w-full flex items-center gap-1.5 justify-center px-2 py-1.5 bg-accent/10 text-accent rounded-lg text-[11px] font-bold hover:bg-accent hover:text-white transition-colors"
                      >
                        <Plus size={12} /> Create Board
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Layers List */}
            <div className="p-3 pb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-text-tertiary">
              <Layers size={14} /> Layers
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {[...currentObjects].reverse().map(obj => (
                <div 
                  key={obj.id}
                  onClick={() => setSelectedId(obj.id)}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-lg mb-0.5 cursor-pointer text-[12px]
                    ${selectedId === obj.id ? "bg-accent/15 text-accent font-medium" : "text-text-secondary hover:bg-bg-hover"}
                  `}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: obj.color }} />
                    <span className="capitalize">{obj.type} {obj.text ? `- ${obj.text.slice(0, 10)}` : ""}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); updateObjects(os => os.map(o => o.id === obj.id ? { ...o, hidden: !o.hidden } : o)) }}
                      className="text-text-tertiary hover:text-text-primary p-0.5"
                    >
                      {obj.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); updateObjects(os => os.map(o => o.id === obj.id ? { ...o, locked: !o.locked } : o)) }}
                      className={`p-0.5 ${obj.locked ? "text-danger" : "text-text-tertiary hover:text-text-primary"}`}
                    >
                      <Lock size={12} />
                    </button>
                  </div>
                </div>
              ))}
              {currentObjects.length === 0 && (
                <p className="text-[11px] text-text-tertiary text-center mt-4 italic">No layers yet</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── MAIN CANVAS AREA ─── */}
      <div className="flex-1 flex flex-col relative">
        
        {/* Top Floating Toolbar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1
          bg-bg-elevated/95 backdrop-blur-xl border border-border/40 rounded-2xl p-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <button onClick={() => setShowLeftPanel(!showLeftPanel)} className="w-8 h-8 flex items-center justify-center rounded-xl text-text-tertiary hover:bg-bg-hover mr-1">
             <Layers size={14} />
          </button>
          <div className="w-px h-5 bg-border/40 mx-1" />
          
          {[
            { id: "select", icon: MousePointer, tooltip: "Select (V)" },
            { id: "pen", icon: Pen, tooltip: "Pen (P)" },
            { id: "text", icon: Type, tooltip: "Text (T)" },
            { id: "sticky", icon: StickyNote, tooltip: "Sticky Note (S)" },
            { id: "rect", icon: Square, tooltip: "Rectangle (R)" },
            { id: "circle", icon: Circle, tooltip: "Circle (O)" },
            { id: "diamond", icon: Diamond, tooltip: "Diamond (D)" },
            { id: "line", icon: Minus, tooltip: "Line (L)" },
            { id: "arrow", icon: ArrowRight, tooltip: "Arrow (A)" },
            { id: "connector", icon: Link2, tooltip: "Connector (C)" },
          ].map(t => (
            <button 
              key={t.id} 
              onClick={() => setTool(t.id as ToolType)} 
              title={t.tooltip}
              className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all cursor-pointer
                ${tool === t.id ? "bg-accent text-white shadow-md scale-105" : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"}`}
            >
              <t.icon size={16} />
            </button>
          ))}
          
          <div className="w-px h-5 bg-border/40 mx-2" />
          <button onClick={undo} title="Undo (Ctrl+Z)" className="w-9 h-9 flex items-center justify-center rounded-xl text-text-tertiary hover:text-text-primary hover:bg-bg-hover cursor-pointer">
            <Undo2 size={16} />
          </button>
          <button onClick={() => setBgMode(bgMode === "blank" ? "dots" : bgMode === "dots" ? "grid" : "blank")} title="Toggle Background" className="w-9 h-9 flex items-center justify-center rounded-xl text-text-tertiary hover:text-text-primary hover:bg-bg-hover cursor-pointer">
            <Grid3X3 size={16} />
          </button>
          
          <div className="w-px h-5 bg-border/40 mx-1" />
          <button onClick={() => setShowRightPanel(!showRightPanel)} className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${showRightPanel ? "bg-bg-secondary text-text-primary" : "text-text-tertiary hover:bg-bg-hover"}`}>
             <Settings2 size={14} />
          </button>
        </div>

        {/* Canvas SVG */}
        <svg 
          ref={svgRef} 
          className="w-full h-full outline-none" 
          style={{ cursor: tool === "select" ? "default" : tool === "pen" ? "crosshair" : "cell" }}
          onMouseDown={onMouseDown} 
          onMouseMove={onMouseMove} 
          onMouseUp={onMouseUp}
          onMouseLeave={() => { isPanning.current = false; setDragging(null); setDrawing(null); setPenPoints([]); setResizing(null); }}
          onWheel={onWheel} 
          onDoubleClick={onDoubleClick}
          tabIndex={0}
        >
          {/* Background Patterns */}
          <defs>
            <pattern id="dots" x={pan.x % (20 * zoom)} y={pan.y % (20 * zoom)} width={20 * zoom} height={20 * zoom} patternUnits="userSpaceOnUse">
              <circle cx={10 * zoom} cy={10 * zoom} r={1.2} fill="var(--color-border-light)" opacity="0.6" />
            </pattern>
            <pattern id="grid" x={pan.x % (40 * zoom)} y={pan.y % (40 * zoom)} width={40 * zoom} height={40 * zoom} patternUnits="userSpaceOnUse">
              <path d={`M ${40 * zoom} 0 L 0 0 0 ${40 * zoom}`} fill="none" stroke="var(--color-border-light)" strokeWidth="0.5" opacity="0.4" />
            </pattern>
            
            {/* Arrowhead Marker */}
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
            </marker>
          </defs>

          <rect width="100%" height="100%" fill="var(--color-bg-primary)" />
          {bgMode !== "blank" && <rect width="100%" height="100%" fill={`url(#${bgMode})`} />}

          {/* Group for Pan/Zoom */}
          <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
            
            {/* Connectors */}
            {connectors.map(c => {
              const from = currentObjects.find(o => o.id === c.fromId);
              const to = currentObjects.find(o => o.id === c.toId);
              if (!from || !to) return null;
              const fb = getBounds(from);
              const tb = getBounds(to);
              const fx = fb.x + fb.w / 2, fy = fb.y + fb.h / 2;
              const tx = tb.x + tb.w / 2, ty = tb.y + tb.h / 2;
              const dashArr = c.dash === "dashed" ? "8,4" : c.dash === "dotted" ? "2,4" : undefined;
              return (
                <line key={c.id} x1={fx} y1={fy} x2={tx} y2={ty}
                  stroke={c.color} strokeWidth={c.strokeWidth || 2} strokeLinecap="round"
                  markerEnd="url(#arrowhead)" style={{ color: c.color }}
                  strokeDasharray={dashArr} opacity={0.8} />
              );
            })}

            {/* Connecting-from highlight */}
            {connectingFrom && (() => {
              const obj = currentObjects.find(o => o.id === connectingFrom);
              if (!obj) return null;
              const b = getBounds(obj);
              return <rect x={b.x - 6} y={b.y - 6} width={b.w + 12} height={b.h + 12}
                fill="none" stroke="#6366F1" strokeWidth="2" strokeDasharray="6,3" rx="6" className="animate-pulse" />;
            })()}

            {currentObjects.filter(o => !o.hidden).map(obj => {
              const isSelected = selectedId === obj.id;
              const isEditing = editingText === obj.id;
              
              let content = null;
              if (obj.type === "sticky") {
                content = (
                  <foreignObject x={obj.x} y={obj.y} width={obj.w} height={obj.h} style={{ overflow: "visible" }}>
                    <div style={{ width: "100%", height: "100%", background: obj.color, borderRadius: obj.borderRadius || 4, padding: 12, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)", opacity: obj.opacity || 1 }}>
                      {isEditing ? (
                        <textarea autoFocus value={obj.text || ""} onChange={e => updateObjects(os => os.map(o => o.id === obj.id ? { ...o, text: e.target.value } : o))}
                          onBlur={() => setEditingText(null)}
                          style={{ width: "100%", height: "100%", background: "transparent", border: "none", outline: "none", resize: "none", fontSize: obj.fontSize || 14, fontFamily: "Inter, sans-serif", color: "#1a1a1a" }} />
                      ) : (
                        <div style={{ fontSize: obj.fontSize || 14, fontFamily: "Inter, sans-serif", color: "#1a1a1a", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{obj.text}</div>
                      )}
                    </div>
                  </foreignObject>
                );
              } else if (obj.type === "rect") {
                const dashArr = obj.dash === "dashed" ? "8,4" : obj.dash === "dotted" ? "2,4" : undefined;
                content = <rect x={obj.x} y={obj.y} width={obj.w} height={obj.h} fill={obj.fill || "none"} stroke={obj.stroke} strokeWidth={obj.strokeWidth || 3} rx={obj.borderRadius || 4} opacity={obj.opacity || 1} strokeDasharray={dashArr} />;
              } else if (obj.type === "circle") {
                const dashArr = obj.dash === "dashed" ? "8,4" : obj.dash === "dotted" ? "2,4" : undefined;
                content = <ellipse cx={obj.x + (obj.w || 0) / 2} cy={obj.y + (obj.h || 0) / 2} rx={(obj.w || 0) / 2} ry={(obj.h || 0) / 2} fill={obj.fill || "none"} stroke={obj.stroke} strokeWidth={obj.strokeWidth || 3} opacity={obj.opacity || 1} strokeDasharray={dashArr} />;
              } else if (obj.type === "diamond") {
                const cx = obj.x + (obj.w || 0) / 2, cy = obj.y + (obj.h || 0) / 2;
                const hw = (obj.w || 0) / 2, hh = (obj.h || 0) / 2;
                const dashArr = obj.dash === "dashed" ? "8,4" : obj.dash === "dotted" ? "2,4" : undefined;
                content = <polygon points={`${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}`} fill={obj.fill || "none"} stroke={obj.stroke} strokeWidth={obj.strokeWidth || 3} opacity={obj.opacity || 1} strokeDasharray={dashArr} />;
              } else if (obj.type === "line") {
                const dashArr = obj.dash === "dashed" ? "8,4" : obj.dash === "dotted" ? "2,4" : undefined;
                content = <line x1={obj.x} y1={obj.y} x2={obj.x2} y2={obj.y2} stroke={obj.stroke} strokeWidth={obj.strokeWidth || 3} strokeLinecap="round" opacity={obj.opacity || 1} strokeDasharray={dashArr} />;
              } else if (obj.type === "arrow") {
                const dashArr = obj.dash === "dashed" ? "8,4" : obj.dash === "dotted" ? "2,4" : undefined;
                content = <line x1={obj.x} y1={obj.y} x2={obj.x2} y2={obj.y2} stroke={obj.stroke} strokeWidth={obj.strokeWidth || 3} strokeLinecap="round" markerEnd="url(#arrowhead)" style={{ color: obj.stroke }} opacity={obj.opacity || 1} strokeDasharray={dashArr} />;
              } else if (obj.type === "text") {
                const ff = obj.fontFamily || "Inter";
                content = isEditing ? (
                  <foreignObject x={obj.x} y={obj.y - 10} width={Math.max(200, (obj.w || 200))} height={(obj.h || 50) + 20} style={{ overflow: "visible" }}>
                    <textarea autoFocus value={obj.text || ""} onChange={e => updateObjects(os => os.map(o => o.id === obj.id ? { ...o, text: e.target.value } : o))}
                      onBlur={() => setEditingText(null)}
                      style={{ width: "100%", height: "100%", background: "transparent", border: "none", outline: "2px solid #6366F1", borderRadius: 4, padding: 8, fontSize: obj.fontSize || 16, fontFamily: `${ff}, sans-serif`, color: obj.color, resize: "none", textAlign: obj.textAlign || "left" }} />
                  </foreignObject>
                ) : (
                  <text x={obj.x} y={obj.y + (obj.fontSize || 16)} fill={obj.color} fontSize={obj.fontSize || 16} fontFamily={`${ff}, sans-serif`} fontWeight="500" opacity={obj.opacity || 1} textAnchor={obj.textAlign === "center" ? "middle" : obj.textAlign === "right" ? "end" : "start"} style={{ cursor: obj.locked ? "default" : "move" }}>
                    {obj.text}
                  </text>
                );
              } else if (obj.type === "path" && obj.points) {
                content = <polyline points={obj.points.map(p => p.join(",")).join(" ")} fill="none" stroke={obj.color} strokeWidth={obj.strokeWidth || 3} strokeLinecap="round" strokeLinejoin="round" opacity={obj.opacity || 1} />;
              }

              // Bounding box for selection & resize handles
              return (
                <g key={obj.id} style={{ opacity: obj.locked ? 0.7 : 1 }}>
                  {content}
                  {isSelected && !isEditing && obj.type !== "line" && obj.type !== "arrow" && obj.type !== "path" && (
                    <g>
                      <rect x={obj.x - 4} y={obj.y - 4} width={(obj.w || 0) + 8} height={(obj.h || 0) + 8} fill="none" stroke="#6366F1" strokeWidth="1.5" strokeDasharray="4 4" pointerEvents="none" />
                      {!obj.locked && (
                        <>
                          <circle data-handle="e" cx={obj.x + (obj.w || 0) + 4} cy={obj.y + (obj.h || 0) / 2} r="5" fill="#fff" stroke="#6366F1" strokeWidth="2" style={{ cursor: "ew-resize" }} />
                          <circle data-handle="s" cx={obj.x + (obj.w || 0) / 2} cy={obj.y + (obj.h || 0) + 4} r="5" fill="#fff" stroke="#6366F1" strokeWidth="2" style={{ cursor: "ns-resize" }} />
                          <circle data-handle="se" cx={obj.x + (obj.w || 0) + 4} cy={obj.y + (obj.h || 0) + 4} r="5" fill="#fff" stroke="#6366F1" strokeWidth="2" style={{ cursor: "nwse-resize" }} />
                        </>
                      )}
                    </g>
                  )}
                  {isSelected && (obj.type === "line" || obj.type === "arrow") && (
                    <g>
                       <circle cx={obj.x} cy={obj.y} r="4" fill="#fff" stroke="#6366F1" strokeWidth="2" />
                       <circle cx={obj.x2} cy={obj.y2} r="4" fill="#fff" stroke="#6366F1" strokeWidth="2" />
                    </g>
                  )}
                </g>
              );
            })}

            {/* Live Drawing Preview */}
            {drawing && tool !== "pen" && tool !== "select" && tool !== "text" && (
               <LivePreview tool={tool} start={drawing} color={color} svgRef={svgRef} pan={pan} zoom={zoom} />
            )}

            {/* Live Pen Points */}
            {penPoints.length > 1 && (
              <polyline points={penPoints.map(p => p.join(",")).join(" ")} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            )}
            
          </g>
        </svg>

        {/* Minimap (Bottom Left) */}
        <div className="absolute bottom-4 left-4 w-32 h-24 bg-bg-elevated/80 backdrop-blur-md border border-border/40 rounded-xl shadow-lg overflow-hidden pointer-events-none">
           <div className="w-full h-full relative" style={{ transform: 'scale(0.1)', transformOrigin: 'top left' }}>
              {currentObjects.filter(o => !o.hidden).map(o => {
                 const { x, y, w, h } = getBounds(o);
                 return <div key={o.id} className="absolute" style={{ left: x, top: y, width: w, height: h, backgroundColor: o.color || '#ccc', opacity: 0.5 }} />;
              })}
           </div>
           {/* Viewport representation */}
           <div className="absolute border-2 border-accent/50 bg-accent/10" 
             style={{ 
               left: Math.max(0, -pan.x / zoom * 0.1), 
               top: Math.max(0, -pan.y / zoom * 0.1), 
               width: `${100 / zoom}%`, 
               height: `${100 / zoom}%`,
               maxWidth: '100%', maxHeight: '100%'
             }} 
           />
        </div>

      </div>

      {/* ─── RIGHT PANEL (Properties) ─── */}
      <AnimatePresence initial={false}>
        {showRightPanel && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full border-l border-border/40 bg-bg-secondary/30 flex flex-col shrink-0 overflow-y-auto"
          >
            <div className="p-3 border-b border-border/40 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-text-tertiary">
              <Settings2 size={14} /> Properties
            </div>

            {selectedObj ? (
              <div className="p-4 flex flex-col gap-5">
                
                {/* Actions */}
                <div>
                   <label className="text-[10px] font-bold text-text-tertiary uppercase mb-2 block">Actions</label>
                   <div className="flex items-center gap-2">
                      <button onClick={bringForward} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-bg-primary border border-border rounded-lg text-[11px] font-medium hover:bg-bg-hover text-text-secondary"><BringToFront size={12} /> Forward</button>
                      <button onClick={sendBackward} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-bg-primary border border-border rounded-lg text-[11px] font-medium hover:bg-bg-hover text-text-secondary"><SendToBack size={12} /> Back</button>
                   </div>
                </div>

                {/* Geometry */}
                {(selectedObj.w !== undefined || selectedObj.h !== undefined) && (
                  <div>
                    <label className="text-[10px] font-bold text-text-tertiary uppercase mb-2 block">Geometry</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center bg-bg-primary border border-border rounded-lg px-2 py-1">
                        <span className="text-[10px] text-text-tertiary w-4">W</span>
                        <input type="number" value={Math.round(selectedObj.w || 0)} onChange={e => updateObjects(os => os.map(o => o.id === selectedObj.id ? { ...o, w: Number(e.target.value) } : o))} className="w-full bg-transparent border-none outline-none text-[12px] text-text-primary text-right font-mono" />
                      </div>
                      <div className="flex items-center bg-bg-primary border border-border rounded-lg px-2 py-1">
                        <span className="text-[10px] text-text-tertiary w-4">H</span>
                        <input type="number" value={Math.round(selectedObj.h || 0)} onChange={e => updateObjects(os => os.map(o => o.id === selectedObj.id ? { ...o, h: Number(e.target.value) } : o))} className="w-full bg-transparent border-none outline-none text-[12px] text-text-primary text-right font-mono" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Color */}
                <div>
                  <label className="text-[10px] font-bold text-text-tertiary uppercase mb-2 block">Color</label>
                  <div className="flex flex-wrap gap-1.5">
                    {COLORS.map(c => (
                      <button key={c} onClick={() => updateObjects(os => os.map(o => o.id === selectedObj.id ? { ...o, stroke: c, color: c } : o))}
                        className={`w-6 h-6 rounded-md border transition-all ${selectedObj.stroke === c || selectedObj.color === c ? "border-accent scale-110 shadow-sm" : "border-border/40 hover:scale-105"}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>

                {/* Fill Color */}
                {(selectedObj.type === "rect" || selectedObj.type === "circle" || selectedObj.type === "diamond") && (
                  <div>
                    <label className="text-[10px] font-bold text-text-tertiary uppercase mb-2 block">Fill</label>
                    <div className="flex flex-wrap gap-1.5">
                      {FILL_COLORS.map(c => (
                        <button key={c} onClick={() => updateObjects(os => os.map(o => o.id === selectedObj.id ? { ...o, fill: c } : o))}
                          className={`w-6 h-6 rounded-md border transition-all ${selectedObj.fill === c ? "border-accent scale-110 shadow-sm" : "border-border/40 hover:scale-105"}`}
                          style={{ backgroundColor: c === "transparent" ? undefined : c, backgroundImage: c === "transparent" ? "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)" : undefined, backgroundSize: c === "transparent" ? "6px 6px" : undefined, backgroundPosition: c === "transparent" ? "0 0, 3px 3px" : undefined }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Stroke Width */}
                {(selectedObj.type === "rect" || selectedObj.type === "circle" || selectedObj.type === "diamond" || selectedObj.type === "line" || selectedObj.type === "arrow") && (
                  <div>
                    <label className="text-[10px] font-bold text-text-tertiary uppercase mb-2 block">Stroke Width</label>
                    <input type="range" min="1" max="8" value={selectedObj.strokeWidth || 3}
                      onChange={e => updateObjects(os => os.map(o => o.id === selectedObj.id ? { ...o, strokeWidth: Number(e.target.value) } : o))}
                      className="w-full accent-accent" />
                    <div className="text-right text-[11px] text-text-tertiary mt-1">{selectedObj.strokeWidth || 3}px</div>
                  </div>
                )}

                {/* Stroke Style */}
                {(selectedObj.type !== "text" && selectedObj.type !== "sticky" && selectedObj.type !== "path") && (
                  <div>
                    <label className="text-[10px] font-bold text-text-tertiary uppercase mb-2 block">Stroke Style</label>
                    <div className="flex gap-1">
                      {(["solid", "dashed", "dotted"] as const).map(d => (
                        <button key={d} onClick={() => updateObjects(os => os.map(o => o.id === selectedObj.id ? { ...o, dash: d } : o))}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold capitalize border transition-all ${(selectedObj.dash || "solid") === d ? "bg-accent/15 text-accent border-accent/30" : "bg-bg-primary border-border text-text-secondary hover:bg-bg-hover"}`}
                        >{d}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Font Family */}
                {(selectedObj.type === "text" || selectedObj.type === "sticky") && (
                  <div>
                    <label className="text-[10px] font-bold text-text-tertiary uppercase mb-2 block">Font</label>
                    <select value={selectedObj.fontFamily || "Inter"}
                      onChange={e => updateObjects(os => os.map(o => o.id === selectedObj.id ? { ...o, fontFamily: e.target.value } : o))}
                      className="w-full bg-bg-primary border border-border rounded-lg px-2 py-1.5 text-[12px] text-text-primary outline-none cursor-pointer">
                      {FONTS.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                    </select>
                  </div>
                )}

                {/* Text Size */}
                {(selectedObj.type === "text" || selectedObj.type === "sticky") && (
                   <div>
                     <label className="text-[10px] font-bold text-text-tertiary uppercase mb-2 block">Text Size</label>
                     <input type="range" min="10" max="64" value={selectedObj.fontSize || 14} 
                        onChange={e => updateObjects(os => os.map(o => o.id === selectedObj.id ? { ...o, fontSize: Number(e.target.value) } : o))}
                        className="w-full accent-accent" />
                     <div className="text-right text-[11px] text-text-tertiary mt-1">{selectedObj.fontSize || 14}px</div>
                   </div>
                )}

                {/* Text Alignment */}
                {(selectedObj.type === "text" || selectedObj.type === "sticky") && (
                  <div>
                    <label className="text-[10px] font-bold text-text-tertiary uppercase mb-2 block">Alignment</label>
                    <div className="flex gap-1">
                      {([["left", AlignLeft], ["center", AlignCenter], ["right", AlignRight]] as const).map(([align, Icon]) => (
                        <button key={align} onClick={() => updateObjects(os => os.map(o => o.id === selectedObj.id ? { ...o, textAlign: align as "left"|"center"|"right" } : o))}
                          className={`flex-1 py-1.5 flex items-center justify-center rounded-lg border transition-all ${(selectedObj.textAlign || "left") === align ? "bg-accent/15 text-accent border-accent/30" : "bg-bg-primary border-border text-text-secondary hover:bg-bg-hover"}`}
                        ><Icon size={14} /></button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Border Radius */}
                {(selectedObj.type === "rect" || selectedObj.type === "sticky") && (
                  <div>
                    <label className="text-[10px] font-bold text-text-tertiary uppercase mb-2 block">Corner Radius</label>
                    <input type="range" min="0" max="40" value={selectedObj.borderRadius || 4}
                      onChange={e => updateObjects(os => os.map(o => o.id === selectedObj.id ? { ...o, borderRadius: Number(e.target.value) } : o))}
                      className="w-full accent-accent" />
                    <div className="text-right text-[11px] text-text-tertiary mt-1">{selectedObj.borderRadius || 4}px</div>
                  </div>
                )}

                {/* Position */}
                <div>
                  <label className="text-[10px] font-bold text-text-tertiary uppercase mb-2 block">Position</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center bg-bg-primary border border-border rounded-lg px-2 py-1">
                      <span className="text-[10px] text-text-tertiary w-4">X</span>
                      <input type="number" value={Math.round(selectedObj.x)} onChange={e => updateObjects(os => os.map(o => o.id === selectedObj.id ? { ...o, x: Number(e.target.value) } : o))} className="w-full bg-transparent border-none outline-none text-[12px] text-text-primary text-right font-mono" />
                    </div>
                    <div className="flex items-center bg-bg-primary border border-border rounded-lg px-2 py-1">
                      <span className="text-[10px] text-text-tertiary w-4">Y</span>
                      <input type="number" value={Math.round(selectedObj.y)} onChange={e => updateObjects(os => os.map(o => o.id === selectedObj.id ? { ...o, y: Number(e.target.value) } : o))} className="w-full bg-transparent border-none outline-none text-[12px] text-text-primary text-right font-mono" />
                    </div>
                  </div>
                </div>

                {/* Opacity */}
                <div>
                   <label className="text-[10px] font-bold text-text-tertiary uppercase mb-2 block">Opacity</label>
                   <input type="range" min="10" max="100" value={(selectedObj.opacity || 1) * 100} 
                      onChange={e => updateObjects(os => os.map(o => o.id === selectedObj.id ? { ...o, opacity: Number(e.target.value) / 100 } : o))}
                      className="w-full accent-accent" />
                </div>
                
              </div>
            ) : (
              <div className="p-6 flex flex-col items-center justify-center text-center h-full opacity-50">
                <MousePointer size={32} className="mb-3 text-text-tertiary" />
                <p className="text-[12px] font-medium text-text-secondary">Select an object on the board to edit its properties.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

/* ── Live Preview Sub-Component ── */
function LivePreview({ tool, start, color, svgRef, pan, zoom }: {
  tool: string; start: { startX: number; startY: number }; color: string;
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
  }, [pan, zoom, svgRef]);

  const x = Math.min(start.startX, pos.x), y = Math.min(start.startY, pos.y);
  const w = Math.abs(pos.x - start.startX), h = Math.abs(pos.y - start.startY);

  if (tool === "rect" || tool === "sticky") return <rect x={x} y={y} width={w} height={h} fill="none" stroke={color} strokeWidth="2" strokeDasharray="5,5" rx="4" opacity="0.6" />;
  if (tool === "circle") return <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} fill="none" stroke={color} strokeWidth="2" strokeDasharray="5,5" opacity="0.6" />;
  if (tool === "diamond") {
    const cx = x + w / 2, cy2 = y + h / 2;
    return <polygon points={`${cx},${y} ${x + w},${cy2} ${cx},${y + h} ${x},${cy2}`} fill="none" stroke={color} strokeWidth="2" strokeDasharray="5,5" opacity="0.6" />;
  }
  if (tool === "line") return <line x1={start.startX} y1={start.startY} x2={pos.x} y2={pos.y} stroke={color} strokeWidth="2" strokeDasharray="5,5" opacity="0.6" />;
  if (tool === "arrow") return <line x1={start.startX} y1={start.startY} x2={pos.x} y2={pos.y} stroke={color} strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead)" style={{ color }} opacity={0.6} />;

  return null;
}
