import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Upload, RotateCcw, Download, Contrast, Sun, Droplets, Crop, FlipHorizontal, RotateCw } from "lucide-react";

export function PhotoEditorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [filters, setFilters] = useState({ brightness: 100, contrast: 100, saturate: 100, blur: 0 });
  const [rotation, setRotation] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const loadImage = (file: File) => {
    const img = new Image();
    img.onload = () => { setImage(img); drawImage(img, filters, rotation, flipped); };
    img.src = URL.createObjectURL(file);
  };

  const drawImage = useCallback((img: HTMLImageElement, f: typeof filters, rot: number, flip: boolean) => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    c.width = img.width; c.height = img.height;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.save();
    ctx.translate(c.width/2, c.height/2);
    ctx.rotate((rot * Math.PI) / 180);
    if (flip) ctx.scale(-1, 1);
    ctx.filter = `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturate}%) blur(${f.blur}px)`;
    ctx.drawImage(img, -img.width/2, -img.height/2);
    ctx.restore();
  }, []);

  useEffect(() => { if (image) drawImage(image, filters, rotation, flipped); }, [filters, rotation, flipped, image, drawImage]);

  const handleUpload = () => {
    const input = document.createElement("input"); input.type = "file"; input.accept = "image/*";
    input.onchange = e => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) loadImage(f); };
    input.click();
  };

  const exportImage = () => {
    const c = canvasRef.current; if (!c) return;
    const a = document.createElement("a"); a.download = "edited.png"; a.href = c.toDataURL(); a.click();
  };

  const reset = () => { setFilters({ brightness: 100, contrast: 100, saturate: 100, blur: 0 }); setRotation(0); setFlipped(false); };

  const ADJUSTMENTS = [
    { key: "brightness", icon: Sun, label: "Brightness", min: 0, max: 200 },
    { key: "contrast", icon: Contrast, label: "Contrast", min: 0, max: 200 },
    { key: "saturate", icon: Droplets, label: "Saturation", min: 0, max: 200 },
    { key: "blur", icon: Droplets, label: "Blur", min: 0, max: 10 },
  ] as const;

  return (
    <div className="flex h-full bg-[#0a0a0b]">
      {/* Canvas area */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
        {image ? (
          <canvas ref={canvasRef} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
        ) : (
          <button onClick={handleUpload}
            className="flex flex-col items-center gap-4 p-12 rounded-3xl border-2 border-dashed border-white/10
              text-white/30 hover:text-accent hover:border-accent/30 cursor-pointer transition-all">
            <Upload size={48} />
            <span className="font-bold text-[14px]">Click to upload an image</span>
          </button>
        )}
      </div>

      {/* Controls panel */}
      <div className="w-72 border-l border-white/8 bg-[#111113] flex flex-col p-4 gap-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-extrabold text-white/40 uppercase tracking-widest">Adjustments</h3>
          <div className="flex gap-1">
            <button onClick={reset} className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/8 cursor-pointer">
              <RotateCcw size={13} />
            </button>
            <button onClick={exportImage} className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-accent hover:bg-accent/10 cursor-pointer">
              <Download size={13} />
            </button>
          </div>
        </div>

        {ADJUSTMENTS.map(adj => (
          <div key={adj.key} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-white/50 flex items-center gap-2"><adj.icon size={12} />{adj.label}</span>
              <span className="text-[10px] text-white/30 font-mono">{filters[adj.key]}</span>
            </div>
            <input type="range" min={adj.min} max={adj.max}
              value={filters[adj.key]}
              onChange={e => setFilters(prev => ({ ...prev, [adj.key]: +e.target.value }))}
              className="w-full accent-accent" />
          </div>
        ))}

        <div className="space-y-2 mt-2">
          <span className="text-[11px] font-extrabold text-white/40 uppercase tracking-widest">Transform</span>
          <div className="flex gap-2">
            <button onClick={() => setRotation(r => r - 90)}
              className="flex-1 h-9 flex items-center justify-center gap-2 rounded-lg bg-white/5 text-white/50 hover:text-white text-[11px] font-bold cursor-pointer">
              <RotateCcw size={13} /> -90°
            </button>
            <button onClick={() => setRotation(r => r + 90)}
              className="flex-1 h-9 flex items-center justify-center gap-2 rounded-lg bg-white/5 text-white/50 hover:text-white text-[11px] font-bold cursor-pointer">
              <RotateCw size={13} /> +90°
            </button>
            <button onClick={() => setFlipped(f => !f)}
              className={`flex-1 h-9 flex items-center justify-center gap-2 rounded-lg text-[11px] font-bold cursor-pointer
                ${flipped ? "bg-accent/20 text-accent" : "bg-white/5 text-white/50 hover:text-white"}`}>
              <FlipHorizontal size={13} /> Flip
            </button>
          </div>
        </div>

        {!image && (
          <button onClick={handleUpload}
            className="mt-auto w-full py-3 rounded-xl bg-accent text-white font-bold text-[13px] cursor-pointer">
            Upload Image
          </button>
        )}
      </div>
    </div>
  );
}
