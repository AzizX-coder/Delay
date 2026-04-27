import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Mic, Square, Play, Pause, Trash2, Download, Clock } from "lucide-react";

interface Recording { id: string; name: string; blob: Blob; url: string; duration: number; date: number; }
const uid = () => crypto.randomUUID();

export function VoiceStudioPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [waveform, setWaveform] = useState<number[]>(Array(40).fill(5));
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrame = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunks.current = [];
      recorder.ondataavailable = e => chunks.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setRecordings(prev => [
          { id: uid(), name: `Recording ${prev.length + 1}`, blob, url, duration: elapsed, date: Date.now() },
          ...prev
        ]);
        stream.getTracks().forEach(t => t.stop());
      };

      // Waveform visualization
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      analyserRef.current = analyser;

      const updateWaveform = () => {
        if (!analyserRef.current) return;
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const bars = Array.from({ length: 40 }, (_, i) => {
          const idx = Math.floor(i * data.length / 40);
          return Math.max(4, (data[idx] / 255) * 60);
        });
        setWaveform(bars);
        animFrame.current = requestAnimationFrame(updateWaveform);
      };
      updateWaveform();

      recorder.start();
      mediaRecorder.current = recorder;
      setIsRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } catch {}
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrame.current) cancelAnimationFrame(animFrame.current);
    setWaveform(Array(40).fill(5));
  };

  const playRecording = (rec: Recording) => {
    if (audioRef.current) { audioRef.current.pause(); }
    const audio = new Audio(rec.url);
    audio.play();
    audio.onended = () => setPlayingId(null);
    audioRef.current = audio;
    setPlayingId(rec.id);
  };

  const downloadRecording = (rec: Recording) => {
    const a = document.createElement("a");
    a.href = rec.url; a.download = `${rec.name}.webm`; a.click();
  };

  const formatTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;

  return (
    <div className="flex flex-col h-full bg-bg-primary">
      {/* Recording area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8">
        {/* Waveform */}
        <div className="flex items-end gap-[3px] h-[80px]">
          {waveform.map((h, i) => (
            <motion.div key={i} animate={{ height: h }}
              className={`w-[4px] rounded-full ${isRecording ? "bg-accent" : "bg-border/30"}`}
              transition={{ duration: 0.1 }} />
          ))}
        </div>

        {/* Timer */}
        <div className="text-[48px] font-black text-text-primary tracking-tight tabular-nums">
          {formatTime(elapsed)}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl cursor-pointer
              ${isRecording ? "bg-danger shadow-danger/30" : "bg-accent shadow-accent/30"}`}>
            {isRecording ? <Square size={28} className="text-white" fill="white" /> : <Mic size={32} className="text-white" />}
          </motion.button>
        </div>

        {isRecording && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-danger font-bold text-[13px]">
            <div className="w-2 h-2 bg-danger rounded-full animate-pulse" /> Recording...
          </motion.div>
        )}
      </div>

      {/* Recordings list */}
      <div className="border-t border-border/40 bg-bg-secondary/30 max-h-[35%] overflow-y-auto">
        <div className="p-4">
          <h3 className="text-[11px] font-extrabold text-text-tertiary uppercase tracking-widest mb-3">Recordings ({recordings.length})</h3>
          <div className="space-y-2">
            {recordings.map(rec => (
              <div key={rec.id} className="flex items-center gap-3 p-3 rounded-xl bg-bg-primary border border-border/20 group">
                <button onClick={() => playRecording(rec)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-accent/15 text-accent cursor-pointer">
                  {playingId === rec.id ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-text-primary truncate">{rec.name}</p>
                  <p className="text-[11px] text-text-tertiary flex items-center gap-2">
                    <Clock size={10} /> {formatTime(rec.duration)} · {new Date(rec.date).toLocaleDateString()}
                  </p>
                </div>
                <button onClick={() => downloadRecording(rec)}
                  className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-accent cursor-pointer transition-all">
                  <Download size={14} />
                </button>
                <button onClick={() => setRecordings(prev => prev.filter(r => r.id !== rec.id))}
                  className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-danger cursor-pointer transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
