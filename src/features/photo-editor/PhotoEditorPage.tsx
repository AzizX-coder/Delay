import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import {
  Upload, RotateCcw, Download, Contrast, Sun, Droplets, RotateCw,
  FlipHorizontal, FlipVertical, Crop, Type, Paintbrush, Sparkles,
  Maximize2, ZoomIn, ZoomOut, Palette,
} from "lucide-react";

type Tool = "adjust" | "crop" | "draw" | "text" | "filters";

const FILTERS = [
  { name: "None", filter: "" },
  { name: "Grayscale", filter: "grayscale(100%)" },
  { name: "Sepia", filter: "sepia(80%)" },
  { name: "Warm", filter: "saturate(130%) hue-rotate(-10deg)" },
  { name: "Cool", filter: "saturate(110%) hue-rotate(20deg)" },
  { name: "Vintage", filter: "sepia(40%) saturate(70%) contrast(110%)" },
  { name: "Dramatic", filter: "contrast(140%) saturate(120%)" },
  { name: "Fade", filter: "brightness(110%) saturate(80%) contrast(90%)" },
  { name: "Vivid", filter: "saturate(180%) contrast(110%)" },
  { name: "Noir", filter: "grayscale(100%) contrast(140%) brightness(90%)" },
  { name: "Cinematic", filter: "contrast(120%) saturate(85%) brightness(95%)" },
  { name: "Invert", filter: "invert(100%)" },
];

export function PhotoEditorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [tool, setTool] = useState<Tool>("adjust");
  const [adjust, setAdjust] = useState({ brightness: 100, contrast: 100, saturate: 100, blur: 0, hueRotate: 0, opacity: 100 });
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [activeFilter, setActiveFilter] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState("#FF0000");
  const [drawSize, setDrawSize] = useState(4);
  const [textOverlays, setTextOverlays] = useState<{x:number;y:number;text:string;color:string;size:number}[]>([]);
  const [zoom, setZoom] = useState(100);
  const lastPos = useRef<{x:number;y:number}|null>(null);

  const loadImage = (file: File) => {
    const img = new Image();
    img.onload = () => { setImage(img); };
    img.src = URL.createObjectURL(file);
  };

  const getFilterString = useCallback(() => {
    let f = `brightness(${adjust.brightness}%) contrast(${adjust.contrast}%) saturate(${adjust.saturate}%) blur(${adjust.blur}px) hue-rotate(${adjust.hueRotate}deg) opacity(${adjust.opacity}%)`;
    if (activeFilter) f += ` ${activeFilter}`;
    return f;
  }, [adjust, activeFilter]);

  const drawCanvas = useCallback(() => {
    const c = canvasRef.current; if (!c || !image) return;
    const ctx = c.getContext("2d")!;
    c.width = image.width; c.height = image.height;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.save();
    ctx.translate(c.width/2, c.height/2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.filter = getFilterString();
    ctx.drawImage(image, -image.width/2, -image.height/2);
    ctx.restore();
    // Draw text overlays
    textOverlays.forEach(t => {
      ctx.font = `bold ${t.size}px Inter, sans-serif`;
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
    });
  }, [image, adjust, rotation, flipH, flipV, activeFilter, textOverlays, getFilterString]);

  useEffect(() => { if (image) drawCanvas(); }, [drawCanvas, image]);

  const handleUpload = () => {
    const input = document.createElement("input"); input.type = "file"; input.accept = "image/*";
    input.onchange = e => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) loadImage(f); };
    input.click();
  };

  const exportImage = () => {
    const c = canvasRef.current; if (!c) return;
    // Merge overlay drawings
    const ov = overlayRef.current;
    if (ov) {
      const ctx = c.getContext("2d")!;
      ctx.drawImage(ov, 0, 0);
    }
    const a = document.createElement("a"); a.download = "edited.png"; a.href = c.toDataURL("image/png"); a.click();
  };

  const reset = () => {
    setAdjust({ brightness: 100, contrast: 100, saturate: 100, blur: 0, hueRotate: 0, opacity: 100 });
    setRotation(0); setFlipH(false); setFlipV(false); setActiveFilter(""); setTextOverlays([]);
    const ov = overlayRef.current; if (ov) { const ctx = ov.getContext("2d"); ctx?.clearRect(0, 0, ov.width, ov.height); }
  };

  // Drawing on overlay canvas
  const startDraw = (e: React.MouseEvent) => {
    if (tool !== "draw") return;
    setIsDrawing(true);
    const ov = overlayRef.current!; const rect = ov.getBoundingClientRect();
    const scaleX = ov.width / rect.width; const scaleY = ov.height / rect.height;
    lastPos.current = { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
    const ctx = ov.getContext("2d")!;
    ctx.beginPath(); ctx.moveTo(lastPos.current.x, lastPos.current.y);
  };

  const doDraw = (e: React.MouseEvent) => {
    if (!isDrawing || tool !== "draw") return;
    const ov = overlayRef.current!; const rect = ov.getBoundingClientRect();
    const scaleX = ov.width / rect.width; const scaleY = ov.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX; const y = (e.clientY - rect.top) * scaleY;
    const ctx = ov.getContext("2d")!;
    ctx.strokeStyle = drawColor; ctx.lineWidth = drawSize; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.lineTo(x, y); ctx.stroke();
    lastPos.current = { x, y };
  };

  const endDraw = () => { setIsDrawing(false); lastPos.current = null; };

  // Add text on click
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (tool !== "text") return;
    const c = canvasRef.current!; const rect = c.getBoundingClientRect();
    const scaleX = c.width / rect.width; const scaleY = c.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX; const y = (e.clientY - rect.top) * scaleY;
    const text = prompt("Enter text:");
    if (text) { setTextOverlays(prev => [...prev, { x, y, text, color: drawColor, size: 32 }]); }
  };

  // Setup overlay canvas
  useEffect(() => {
    if (image && overlayRef.current) {
      overlayRef.current.width = image.width;
      overlayRef.current.height = image.height;
    }
  }, [image]);

  const ADJUSTMENTS = [
    { key: "brightness", icon: Sun, label: "Brightness", min: 0, max: 200, step: 1 },
    { key: "contrast", icon: Contrast, label: "Contrast", min: 0, max: 200, step: 1 },
    { key: "saturate", icon: Droplets, label: "Saturation", min: 0, max: 300, step: 1 },
    { key: "hueRotate", icon: Palette, label: "Hue", min: -180, max: 180, step: 1 },
    { key: "blur", icon: Sparkles, label: "Blur", min: 0, max: 20, step: 0.5 },
    { key: "opacity", icon: Maximize2, label: "Opacity", min: 0, max: 100, step: 1 },
  ] as const;

  const TOOLS: {id: Tool; icon: any; label: string}[] = [
    { id: "adjust", icon: Sun, label: "Adjust" },
    { id: "filters", icon: Sparkles, label: "Filters" },
    { id: "draw", icon: Paintbrush, label: "Draw" },
    { id: "text", icon: Type, label: "Text" },
  ];

  const DRAW_COLORS = ["#FF0000","#00FF00","#0000FF","#FFFF00","#FF00FF","#00FFFF","#FFFFFF","#000000"];

  return (
    <div className="flex h-full bg-[#0a0a0b]">
      <div className="flex-1 flex items-center justify-center p-6 overflow-hidden relative">
        {image ? (
          <div className="relative" style={{ transform: `scale(${zoom/100})` }}>
            <canvas ref={canvasRef} className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl" />
            <canvas ref={overlayRef}
              className="absolute inset-0 w-full h-full"
              style={{ cursor: tool === "draw" ? "crosshair" : tool === "text" ? "text" : "default" }}
              onMouseDown={startDraw} onMouseMove={doDraw} onMouseUp={endDraw} onMouseLeave={endDraw}
              onClick={handleCanvasClick} />
          </div>
        ) : (
          <button onClick={handleUpload}
            className="flex flex-col items-center gap-4 p-12 rounded-3xl border-2 border-dashed border-white/10
              text-white/30 hover:text-accent hover:border-accent/30 cursor-pointer transition-all">
            <Upload size={48} />
            <span className="font-bold text-[14px]">Click to upload an image</span>
            <span className="text-[12px] opacity-50">Supports PNG, JPG, WebP, SVG</span>
          </button>
        )}
        {/* Zoom controls */}
        {image && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#1a1a1e]/90 backdrop-blur-xl rounded-xl px-3 py-1.5 border border-white/8">
            <button onClick={() => setZoom(z => Math.max(25, z - 25))} className="text-white/40 hover:text-white cursor-pointer"><ZoomOut size={14} /></button>
            <span className="text-[11px] text-white/50 font-bold w-10 text-center">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(400, z + 25))} className="text-white/40 hover:text-white cursor-pointer"><ZoomIn size={14} /></button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="w-72 border-l border-white/8 bg-[#111113] flex flex-col overflow-y-auto">
        {/* Tool tabs */}
        <div className="flex border-b border-white/8">
          {TOOLS.map(t => (
            <button key={t.id} onClick={() => setTool(t.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-bold cursor-pointer transition-all
                ${tool === t.id ? "text-accent bg-accent/10" : "text-white/30 hover:text-white/60"}`}>
              <t.icon size={14} />{t.label}
            </button>
          ))}
        </div>

        <div className="p-4 flex-1 space-y-4">
          {/* Actions bar */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              <button onClick={handleUpload} className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/8 cursor-pointer"><Upload size={13} /></button>
              <button onClick={reset} className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/8 cursor-pointer"><RotateCcw size={13} /></button>
              <button onClick={exportImage} className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-accent hover:bg-accent/10 cursor-pointer"><Download size={13} /></button>
            </div>
          </div>

          {/* Adjust panel */}
          {tool === "adjust" && (
            <>
              {ADJUSTMENTS.map(adj => (
                <div key={adj.key} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white/50 flex items-center gap-2"><adj.icon size={12} />{adj.label}</span>
                    <span className="text-[10px] text-white/30 font-mono">{adjust[adj.key]}</span>
                  </div>
                  <input type="range" min={adj.min} max={adj.max} step={adj.step}
                    value={adjust[adj.key]} onChange={e => setAdjust(prev => ({ ...prev, [adj.key]: +e.target.value }))}
                    className="w-full accent-accent" />
                </div>
              ))}
              <div className="space-y-2 pt-2 border-t border-white/8">
                <span className="text-[11px] font-extrabold text-white/40 uppercase tracking-widest">Transform</span>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setRotation(r => r - 90)} className="h-8 flex items-center justify-center gap-1.5 rounded-lg bg-white/5 text-white/50 hover:text-white text-[10px] font-bold cursor-pointer"><RotateCcw size={12} />-90°</button>
                  <button onClick={() => setRotation(r => r + 90)} className="h-8 flex items-center justify-center gap-1.5 rounded-lg bg-white/5 text-white/50 hover:text-white text-[10px] font-bold cursor-pointer"><RotateCw size={12} />+90°</button>
                  <button onClick={() => setFlipH(f => !f)} className={`h-8 flex items-center justify-center gap-1.5 rounded-lg text-[10px] font-bold cursor-pointer ${flipH ? "bg-accent/20 text-accent" : "bg-white/5 text-white/50 hover:text-white"}`}><FlipHorizontal size={12} />Flip H</button>
                  <button onClick={() => setFlipV(f => !f)} className={`h-8 flex items-center justify-center gap-1.5 rounded-lg text-[10px] font-bold cursor-pointer ${flipV ? "bg-accent/20 text-accent" : "bg-white/5 text-white/50 hover:text-white"}`}><FlipVertical size={12} />Flip V</button>
                </div>
              </div>
            </>
          )}

          {/* Filters panel */}
          {tool === "filters" && (
            <div className="grid grid-cols-2 gap-2">
              {FILTERS.map(f => (
                <button key={f.name} onClick={() => setActiveFilter(f.filter)}
                  className={`p-3 rounded-xl border text-[11px] font-bold cursor-pointer transition-all
                    ${activeFilter === f.filter ? "border-accent bg-accent/10 text-accent" : "border-white/8 text-white/40 hover:border-white/20"}`}>
                  {f.name}
                </button>
              ))}
            </div>
          )}

          {/* Draw panel */}
          {tool === "draw" && (
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold text-white/40 mb-2 block">Brush Color</span>
                <div className="flex gap-2 flex-wrap">
                  {DRAW_COLORS.map(c => (
                    <button key={c} onClick={() => setDrawColor(c)}
                      className={`w-7 h-7 rounded-full border-2 cursor-pointer ${drawColor === c ? "border-white scale-110" : "border-transparent"}`}
                      style={{ background: c }} />
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[11px] font-bold text-white/40 mb-1 block">Brush Size: {drawSize}px</span>
                <input type="range" min={1} max={30} value={drawSize} onChange={e => setDrawSize(+e.target.value)} className="w-full accent-accent" />
              </div>
            </div>
          )}

          {/* Text panel */}
          {tool === "text" && (
            <div className="space-y-3">
              <p className="text-[11px] text-white/40">Click anywhere on the image to add text</p>
              <div>
                <span className="text-[11px] font-bold text-white/40 mb-2 block">Text Color</span>
                <div className="flex gap-2 flex-wrap">
                  {DRAW_COLORS.map(c => (
                    <button key={c} onClick={() => setDrawColor(c)}
                      className={`w-7 h-7 rounded-full border-2 cursor-pointer ${drawColor === c ? "border-white scale-110" : "border-transparent"}`}
                      style={{ background: c }} />
                  ))}
                </div>
              </div>
              {textOverlays.length > 0 && (
                <div className="space-y-1 pt-2">
                  <span className="text-[10px] font-bold text-white/30">Text Layers ({textOverlays.length})</span>
                  {textOverlays.map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-white/50">
                      <span className="flex-1 truncate">{t.text}</span>
                      <button onClick={() => setTextOverlays(prev => prev.filter((_, j) => j !== i))}
                        className="text-white/20 hover:text-danger cursor-pointer">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {!image && (
          <div className="p-4 border-t border-white/8">
            <button onClick={handleUpload} className="w-full py-3 rounded-xl bg-accent text-white font-bold text-[13px] cursor-pointer">Upload Image</button>
          </div>
        )}
      </div>
    </div>
  );
}
