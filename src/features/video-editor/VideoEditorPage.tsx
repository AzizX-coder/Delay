import { useState, useRef } from "react";
import { motion } from "motion/react";
import { Upload, Scissors, Play, Pause, SkipBack, SkipForward, Volume2, Download, Film } from "lucide-react";

export function VideoEditorPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);
  const [volume, setVolume] = useState(100);
  const [playbackRate, setPlaybackRate] = useState(1);

  const handleUpload = () => {
    const input = document.createElement("input"); input.type = "file"; input.accept = "video/*";
    input.onchange = e => {
      const f = (e.target as HTMLInputElement).files?.[0];
      if (f) setVideoUrl(URL.createObjectURL(f));
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
  };

  const handleLoadedMetadata = () => {
    const v = videoRef.current; if (!v) return;
    setDuration(v.duration);
    setTrimEnd(100);
  };

  const seek = (pct: number) => {
    const v = videoRef.current; if (!v) return;
    v.currentTime = (pct / 100) * v.duration;
  };

  const skip = (secs: number) => {
    const v = videoRef.current; if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + secs));
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60); const sec = Math.floor(s % 60);
    return `${m.toString().padStart(2,"0")}:${sec.toString().padStart(2,"0")}`;
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0b]">
      {/* Preview area */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
        {videoUrl ? (
          <video ref={videoRef} src={videoUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            className="max-w-full max-h-full rounded-xl shadow-2xl" />
        ) : (
          <button onClick={handleUpload}
            className="flex flex-col items-center gap-4 p-16 rounded-3xl border-2 border-dashed border-white/10
              text-white/30 hover:text-accent hover:border-accent/30 cursor-pointer transition-all">
            <Film size={56} />
            <span className="font-bold text-[16px]">Import a video to start editing</span>
            <span className="text-[12px] opacity-50">Supports MP4, WebM, MOV</span>
          </button>
        )}
      </div>

      {/* Timeline & Controls */}
      {videoUrl && (
        <div className="border-t border-white/8 bg-[#111113]">
          {/* Timeline scrubber */}
          <div className="px-6 pt-4 pb-2">
            <div className="relative h-10 bg-white/5 rounded-xl overflow-hidden cursor-pointer"
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                seek(((e.clientX - rect.left) / rect.width) * 100);
              }}>
              {/* Trim handles */}
              <div className="absolute top-0 bottom-0 bg-accent/10 rounded"
                style={{ left: `${trimStart}%`, width: `${trimEnd - trimStart}%` }} />
              {/* Playhead */}
              <motion.div className="absolute top-0 bottom-0 w-0.5 bg-accent z-10"
                style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }} />
              {/* Waveform mockup */}
              <div className="absolute inset-0 flex items-end gap-px px-1 opacity-30">
                {Array.from({ length: 100 }).map((_, i) => (
                  <div key={i} className="flex-1 bg-accent/50 rounded-t"
                    style={{ height: `${20 + Math.random() * 60}%` }} />
                ))}
              </div>
            </div>
          </div>

          {/* Controls bar */}
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <span className="text-[12px] font-mono text-white/40">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => skip(-5)} className="w-9 h-9 flex items-center justify-center rounded-xl text-white/40 hover:text-white hover:bg-white/8 cursor-pointer">
                <SkipBack size={16} />
              </button>
              <button onClick={togglePlay}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-accent text-white shadow-xl shadow-accent/30 cursor-pointer">
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button onClick={() => skip(5)} className="w-9 h-9 flex items-center justify-center rounded-xl text-white/40 hover:text-white hover:bg-white/8 cursor-pointer">
                <SkipForward size={16} />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Volume2 size={14} className="text-white/30" />
                <input type="range" min={0} max={100} value={volume}
                  onChange={e => { setVolume(+e.target.value); if (videoRef.current) videoRef.current.volume = +e.target.value / 100; }}
                  className="w-20 accent-accent" />
              </div>
              <select value={playbackRate}
                onChange={e => { setPlaybackRate(+e.target.value); if (videoRef.current) videoRef.current.playbackRate = +e.target.value; }}
                className="px-2 py-1 rounded-lg bg-white/5 text-white/50 text-[11px] font-bold border-none outline-none cursor-pointer">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map(r => (
                  <option key={r} value={r}>{r}x</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
