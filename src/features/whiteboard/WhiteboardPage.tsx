import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Square, Circle, Type, Minus, Eraser, Undo2, Download, Palette, MousePointer } from "lucide-react";

type Tool = "select" | "pen" | "rect" | "circle" | "text" | "line" | "eraser";

export function WhiteboardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#6366F1");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const lastPos = useRef<{x:number;y:number}|null>(null);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    c.width = c.offsetWidth; c.height = c.offsetHeight;
    const ctx = c.getContext("2d"); if (!ctx) return;
    ctx.fillStyle = "#0a0a0b"; ctx.fillRect(0,0,c.width,c.height);
  }, []);

  const saveState = () => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    setHistory(prev => [...prev.slice(-30), ctx.getImageData(0,0,c.width,c.height)]);
  };

  const undo = () => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    if (history.length > 0) {
      const last = history[history.length - 1];
      ctx.putImageData(last, 0, 0);
      setHistory(prev => prev.slice(0, -1));
    }
  };

  const startDraw = (e: React.MouseEvent) => {
    saveState();
    setIsDrawing(true);
    const rect = canvasRef.current!.getBoundingClientRect();
    lastPos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (tool === "rect" || tool === "circle" || tool === "line") return;
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const c = canvasRef.current;
    const ctx = c.getContext("2d")!;
    const rect = c.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === "pen") {
      ctx.strokeStyle = color; ctx.lineWidth = strokeWidth;
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.lineTo(x, y); ctx.stroke();
    } else if (tool === "eraser") {
      ctx.strokeStyle = "#0a0a0b"; ctx.lineWidth = strokeWidth * 4;
      ctx.lineCap = "round"; ctx.lineTo(x, y); ctx.stroke();
    }
    lastPos.current = { x, y };
  };

  const endDraw = (e: React.MouseEvent) => {
    if (!isDrawing || !canvasRef.current || !lastPos.current) { setIsDrawing(false); return; }
    const c = canvasRef.current;
    const ctx = c.getContext("2d")!;
    const rect = c.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const start = lastPos.current;

    if (tool === "rect") {
      ctx.strokeStyle = color; ctx.lineWidth = strokeWidth;
      ctx.strokeRect(start.x, start.y, x - start.x, y - start.y);
    } else if (tool === "circle") {
      ctx.strokeStyle = color; ctx.lineWidth = strokeWidth;
      const rx = Math.abs(x - start.x) / 2; const ry = Math.abs(y - start.y) / 2;
      ctx.beginPath();
      ctx.ellipse(start.x + (x-start.x)/2, start.y+(y-start.y)/2, rx, ry, 0, 0, Math.PI*2);
      ctx.stroke();
    } else if (tool === "line") {
      ctx.strokeStyle = color; ctx.lineWidth = strokeWidth; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(x, y); ctx.stroke();
    }
    setIsDrawing(false);
    lastPos.current = null;
  };

  const exportCanvas = () => {
    const c = canvasRef.current; if (!c) return;
    const a = document.createElement("a"); a.download = "whiteboard.png";
    a.href = c.toDataURL(); a.click();
  };

  const COLORS = ["#6366F1","#EF4444","#10B981","#F59E0B","#8B5CF6","#06B6D4","#EC4899","#FFFFFF"];
  const TOOLS: {id: Tool; icon: any; label: string}[] = [
    { id: "select", icon: MousePointer, label: "Select" },
    { id: "pen", icon: Palette, label: "Pen" },
    { id: "rect", icon: Square, label: "Rectangle" },
    { id: "circle", icon: Circle, label: "Circle" },
    { id: "line", icon: Minus, label: "Line" },
    { id: "eraser", icon: Eraser, label: "Eraser" },
  ];

  return (
    <div className="flex h-full bg-[#0a0a0b] relative overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5
        bg-[#1a1a1e]/90 backdrop-blur-xl border border-white/8 rounded-2xl p-1.5 shadow-2xl">
        {TOOLS.map(t => (
          <button key={t.id} onClick={() => setTool(t.id)} title={t.label}
            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all cursor-pointer
              ${tool === t.id ? "bg-accent text-white" : "text-white/40 hover:text-white hover:bg-white/8"}`}>
            <t.icon size={16} />
          </button>
        ))}
        <div className="w-px h-6 bg-white/10 mx-1" />
        {COLORS.map(c => (
          <button key={c} onClick={() => setColor(c)}
            className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${color === c ? "border-white scale-110" : "border-transparent"}`}
            style={{ background: c }} />
        ))}
        <div className="w-px h-6 bg-white/10 mx-1" />
        <input type="range" min={1} max={12} value={strokeWidth} onChange={e => setStrokeWidth(+e.target.value)}
          className="w-20 accent-accent" />
        <button onClick={undo} className="w-9 h-9 flex items-center justify-center rounded-xl text-white/40 hover:text-white hover:bg-white/8 cursor-pointer" title="Undo">
          <Undo2 size={16} />
        </button>
        <button onClick={exportCanvas} className="w-9 h-9 flex items-center justify-center rounded-xl text-white/40 hover:text-white hover:bg-white/8 cursor-pointer" title="Export">
          <Download size={16} />
        </button>
      </div>

      <canvas ref={canvasRef} className="w-full h-full cursor-crosshair"
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw} />
    </div>
  );
}
