import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import {
  Upload, Scissors, Play, Pause, SkipBack, SkipForward, Volume2,
  Download, Film, Type, Paintbrush, ZoomIn, ZoomOut, RotateCcw,
  Contrast, Sun, Droplets, Square, Maximize, Settings2,
} from "lucide-react";

type Panel = "trim" | "filters" | "text";

const FILTERS = [
  { name: "None", css: "" },
  { name: "B&W", css: "grayscale(100%)" },
  { name: "Sepia", css: "sepia(80%)" },
  { name: "Warm", css: "saturate(130%) hue-rotate(-10deg)" },
  { name: "Cool", css: "saturate(110%) hue-rotate(20deg)" },
  { name: "Vivid", css: "saturate(180%) contrast(110%)" },
  { name: "Dramatic", css: "contrast(150%) saturate(120%)" },
  { name: "Fade", css: "brightness(110%) saturate(80%) contrast(90%)" },
];

export function VideoEditorPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [panel, setPanel] = useState<Panel>("trim");
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [activeFilter, setActiveFilter] = useState("");
  const [adjust, setAdjust] = useState({ brightness: 100, contrast: 100, saturate: 100 });
  const [textOverlay, setTextOverlay] = useState({ text: "", color: "#FFFFFF", size: 32, x: 50, y: 50 });
  const [showText, setShowText] = useState(false);

  const handleUpload = () => {
    const input = document.createElement("input"); input.type = "file"; input.accept = "video/*";
    input.onchange = e => {
      const f = (e.target as HTMLInputElement).files?.[0];
      if (f) { setVideoFile(f); setVideoUrl(URL.createObjectURL(f)); }
    };
    input.click();
  };

  const togglePlay = () => {
    const v = videoRef.current; if (!v) return;
    if (isPlaying) { v.pause(); } else { v.play(); }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current; if (!v) return;
    setCurrentTime(v.currentTime);
    // Stop at trim end
    if (trimEnd > 0 && v.currentTime >= trimEnd) {
      v.pause(); setIsPlaying(false);
    }
  };

  const handleLoadedMetadata = () => {
    const v = videoRef.current; if (!v) return;
    setDuration(v.duration);
    setTrimEnd(v.duration);
  };

  const seek = (time: number) => {
    const v = videoRef.current; if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration, time));
  };

  const seekPct = (pct: number) => seek((pct / 100) * duration);

  const skip = (secs: number) => {
    const v = videoRef.current; if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + secs));
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60); const sec = Math.floor(s % 60); const ms = Math.floor((s % 1) * 10);
    return `${m.toString().padStart(2,"0")}:${sec.toString().padStart(2,"0")}.${ms}`;
  };

  const getVideoFilter = () => {
    let f = `brightness(${adjust.brightness}%) contrast(${adjust.contrast}%) saturate(${adjust.saturate}%)`;
    if (activeFilter) f += ` ${activeFilter}`;
    return f;
  };

  // Capture current frame as image
  const captureFrame = () => {
    const v = videoRef.current; if (!v) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth; c.height = v.videoHeight;
    const ctx = c.getContext("2d")!;
    ctx.filter = getVideoFilter();
    ctx.drawImage(v, 0, 0);
    if (showText && textOverlay.text) {
      ctx.font = `bold ${textOverlay.size}px Inter, sans-serif`;
      ctx.fillStyle = textOverlay.color;
      ctx.textAlign = "center";
      ctx.fillText(textOverlay.text, c.width * textOverlay.x / 100, c.height * textOverlay.y / 100);
    }
    const a = document.createElement("a"); a.download = `frame-${Math.floor(currentTime)}s.png`;
    a.href = c.toDataURL(); a.click();
  };

  const PANELS: {id: Panel; icon: any; label: string}[] = [
    { id: "trim", icon: Scissors, label: "Trim" },
    { id: "filters", icon: Contrast, label: "Filters" },
    { id: "text", icon: Type, label: "Text" },
  ];

  return (
    <div className="flex h-full bg-bg-primary">
      {/* Preview area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6 overflow-hidden relative">
          {videoUrl ? (
            <div className="relative">
              <video ref={videoRef} src={videoUrl}
                onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={() => setIsPlaying(false)}
                className="max-w-full max-h-[60vh] rounded-xl shadow-2xl"
                style={{ filter: getVideoFilter() }} />
              {/* Text overlay preview */}
              {showText && textOverlay.text && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ top: `${textOverlay.y}%`, left: `${textOverlay.x}%`, transform: "translate(-50%, -50%)" }}>
                  <span style={{ color: textOverlay.color, fontSize: `${textOverlay.size}px`, fontWeight: "bold", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
                    {textOverlay.text}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <button onClick={handleUpload}
              className="flex flex-col items-center gap-4 p-16 rounded-3xl border-2 border-dashed border-border/30
                text-text-tertiary hover:text-accent hover:border-accent/30 cursor-pointer transition-all">
              <Film size={56} />
              <span className="font-bold text-[16px]">Import a video to start editing</span>
              <span className="text-[12px] opacity-50">Supports MP4, WebM, MOV</span>
            </button>
          )}
        </div>

        {/* Timeline */}
        {videoUrl && (
          <div className="border-t border-border/30 bg-bg-secondary">
            {/* Scrubber */}
            <div className="px-6 pt-3">
              <div className="relative h-12 bg-bg-hover rounded-xl overflow-hidden cursor-pointer"
                onClick={e => { const rect = e.currentTarget.getBoundingClientRect(); seekPct(((e.clientX - rect.left) / rect.width) * 100); }}>
                {/* Trim region */}
                <div className="absolute top-0 bottom-0 bg-accent/15 rounded"
                  style={{ left: `${(trimStart/duration)*100}%`, width: `${((trimEnd - trimStart)/duration)*100}%` }} />
                {/* Playhead */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-accent z-10"
                  style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }} />
                {/* Trim handles */}
                <div className="absolute top-0 bottom-0 w-1 bg-green-400 cursor-col-resize z-20 rounded"
                  style={{ left: `${(trimStart/duration)*100}%` }}
                  draggable onDrag={e => { if (e.clientX > 0) { const rect = e.currentTarget.parentElement!.getBoundingClientRect(); setTrimStart(Math.max(0, ((e.clientX - rect.left) / rect.width) * duration)); } }} />
                <div className="absolute top-0 bottom-0 w-1 bg-red-400 cursor-col-resize z-20 rounded"
                  style={{ left: `${(trimEnd/duration)*100}%` }}
                  draggable onDrag={e => { if (e.clientX > 0) { const rect = e.currentTarget.parentElement!.getBoundingClientRect(); setTrimEnd(Math.min(duration, ((e.clientX - rect.left) / rect.width) * duration)); } }} />
                {/* Waveform bars */}
                <div className="absolute inset-0 flex items-end gap-px px-1 opacity-20">
                  {Array.from({ length: 80 }).map((_, i) => (
                    <div key={i} className="flex-1 bg-accent/50 rounded-t" style={{ height: `${20 + Math.sin(i * 0.5) * 30 + Math.random() * 20}%` }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-mono text-text-tertiary">{formatTime(currentTime)} / {formatTime(duration)}</span>
                <span className="text-[10px] text-green-400 font-bold">IN {formatTime(trimStart)}</span>
                <span className="text-[10px] text-red-400 font-bold">OUT {formatTime(trimEnd)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => seek(trimStart)} className="w-8 h-8 flex items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-hover cursor-pointer" title="Go to trim start"><SkipBack size={14} /></button>
                <button onClick={() => skip(-5)} className="w-8 h-8 flex items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-hover cursor-pointer"><SkipBack size={14} /></button>
                <button onClick={togglePlay} className="w-12 h-12 flex items-center justify-center rounded-full bg-accent text-white shadow-xl shadow-accent/30 cursor-pointer">
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button onClick={() => skip(5)} className="w-8 h-8 flex items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-hover cursor-pointer"><SkipForward size={14} /></button>
                <button onClick={() => seek(trimEnd)} className="w-8 h-8 flex items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-hover cursor-pointer" title="Go to trim end"><SkipForward size={14} /></button>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Volume2 size={14} className="text-text-tertiary" />
                  <input type="range" min={0} max={100} value={volume}
                    onChange={e => { setVolume(+e.target.value); if (videoRef.current) videoRef.current.volume = +e.target.value / 100; }}
                    className="w-16 accent-accent" />
                </div>
                <select value={playbackRate}
                  onChange={e => { setPlaybackRate(+e.target.value); if (videoRef.current) videoRef.current.playbackRate = +e.target.value; }}
                  className="px-2 py-1 rounded-lg bg-bg-hover text-text-secondary text-[11px] font-bold border-none outline-none cursor-pointer">
                  {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 4].map(r => (<option key={r} value={r}>{r}x</option>))}
                </select>
                <button onClick={captureFrame} className="px-3 py-1.5 rounded-lg bg-bg-hover text-text-tertiary hover:text-text-primary text-[11px] font-bold cursor-pointer" title="Capture frame"><Download size={12} /></button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right panel */}
      {videoUrl && (
        <div className="w-64 border-l border-border/30 bg-bg-secondary flex flex-col">
          <div className="flex border-b border-border/30">
            {PANELS.map(p => (
              <button key={p.id} onClick={() => setPanel(p.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-bold cursor-pointer
                  ${panel === p.id ? "text-accent bg-accent/10" : "text-text-tertiary hover:text-text-secondary"}`}>
                <p.icon size={14} />{p.label}
              </button>
            ))}
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            {panel === "trim" && (
              <>
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-white/40">Trim Start</label>
                  <input type="range" min={0} max={duration} step={0.1} value={trimStart}
                    onChange={e => setTrimStart(+e.target.value)} className="w-full accent-green-400" />
                  <span className="text-[10px] text-green-400 font-mono">{formatTime(trimStart)}</span>
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-white/40">Trim End</label>
                  <input type="range" min={0} max={duration} step={0.1} value={trimEnd}
                    onChange={e => setTrimEnd(+e.target.value)} className="w-full accent-red-400" />
                  <span className="text-[10px] text-red-400 font-mono">{formatTime(trimEnd)}</span>
                </div>
                <div className="pt-2 border-t border-white/8">
                  <p className="text-[10px] text-white/30">Duration: {formatTime(trimEnd - trimStart)}</p>
                </div>
              </>
            )}

            {panel === "filters" && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {FILTERS.map(f => (
                    <button key={f.name} onClick={() => setActiveFilter(f.css)}
                      className={`p-2 rounded-lg border text-[10px] font-bold cursor-pointer
                        ${activeFilter === f.css ? "border-accent text-accent bg-accent/10" : "border-white/8 text-white/40"}`}>{f.name}</button>
                  ))}
                </div>
                <div className="space-y-3 pt-2 border-t border-white/8">
                  {([{k:"brightness",l:"Brightness",i:Sun},{k:"contrast",l:"Contrast",i:Contrast},{k:"saturate",l:"Saturation",i:Droplets}] as const).map(a => (
                    <div key={a.k}>
                      <div className="flex justify-between"><span className="text-[10px] text-white/40 font-bold flex items-center gap-1"><a.i size={10}/>{a.l}</span><span className="text-[9px] text-white/25 font-mono">{adjust[a.k]}</span></div>
                      <input type="range" min={0} max={200} value={adjust[a.k]} onChange={e => setAdjust(p => ({...p,[a.k]:+e.target.value}))} className="w-full accent-accent" />
                    </div>
                  ))}
                </div>
              </>
            )}

            {panel === "text" && (
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={showText} onChange={e => setShowText(e.target.checked)} className="accent-accent" />
                  <span className="text-[11px] text-white/50 font-bold">Show Text Overlay</span>
                </label>
                <input value={textOverlay.text} onChange={e => setTextOverlay(p => ({...p, text: e.target.value}))}
                  placeholder="Enter text..." className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[12px] text-white outline-none" />
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-[10px] text-white/30 block mb-1">Color</span>
                    <input type="color" value={textOverlay.color} onChange={e => setTextOverlay(p => ({...p, color: e.target.value}))} className="w-full h-8 rounded cursor-pointer" /></div>
                  <div><span className="text-[10px] text-white/30 block mb-1">Size: {textOverlay.size}</span>
                    <input type="range" min={12} max={120} value={textOverlay.size} onChange={e => setTextOverlay(p => ({...p, size: +e.target.value}))} className="w-full accent-accent" /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-[10px] text-white/30 block mb-1">X: {textOverlay.x}%</span>
                    <input type="range" min={0} max={100} value={textOverlay.x} onChange={e => setTextOverlay(p => ({...p, x: +e.target.value}))} className="w-full accent-accent" /></div>
                  <div><span className="text-[10px] text-white/30 block mb-1">Y: {textOverlay.y}%</span>
                    <input type="range" min={0} max={100} value={textOverlay.y} onChange={e => setTextOverlay(p => ({...p, y: +e.target.value}))} className="w-full accent-accent" /></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
