import { motion, AnimatePresence } from "motion/react";
import { Mic, X, Send, Keyboard } from "lucide-react";
import { useState, useEffect } from "react";

interface Props {
  active: boolean;
  transcript?: string;
  onStop: () => void;
  onSend?: (text: string) => void;
}

export function VoiceBadge({ active, transcript, onStop, onSend }: Props) {
  const [silenceCountdown, setSilenceCountdown] = useState(0);

  useEffect(() => {
    if (!active) {
      setSilenceCountdown(0);
      return;
    }
    // Reset countdown when transcript changes
    setSilenceCountdown(0);
  }, [active, transcript]);

  const handleSend = () => {
    if (transcript?.trim() && onSend) {
      onSend(transcript.trim());
    }
    onStop();
  };

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="fixed bottom-0 inset-x-0 z-[60] pointer-events-auto"
        >
          {/* Frosted glass overlay bar */}
          <div className="mx-auto max-w-2xl mb-5 px-4">
            <div
              className="relative rounded-[24px] bg-bg-glass-heavy backdrop-blur-3xl
                border border-border/50
                shadow-[0_12px_48px_rgba(0,0,0,0.2),0_2px_8px_rgba(0,0,0,0.1)]
                overflow-hidden"
            >
              {/* Pulsing accent indicator at top */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: "linear-gradient(90deg, transparent, #FF3B30, transparent)" }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />

              <div className="flex items-center gap-4 p-4">
                {/* Animated mic */}
                <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
                  <motion.span
                    animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-danger/30"
                  />
                  <motion.span
                    animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{
                      duration: 1.4,
                      repeat: Infinity,
                      delay: 0.25,
                    }}
                    className="absolute inset-0 rounded-full bg-danger/20"
                  />
                  <div className="relative w-9 h-9 rounded-full bg-danger text-white flex items-center justify-center shadow-lg shadow-danger/30">
                    <Mic size={16} />
                  </div>
                </div>

                {/* Transcript area */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold text-danger uppercase tracking-widest">
                      Listening
                    </span>
                    <WaveformBars />
                  </div>
                  {transcript ? (
                    <motion.p
                      key={transcript}
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: 1 }}
                      className="text-[14px] text-text-primary font-medium leading-tight line-clamp-2"
                    >
                      {transcript}
                    </motion.p>
                  ) : (
                    <p className="text-[13px] text-text-tertiary italic">
                      Start speaking...
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {transcript && onSend && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleSend}
                      className="w-10 h-10 flex items-center justify-center rounded-xl
                        bg-accent text-white shadow-lg shadow-accent/30
                        cursor-pointer hover:opacity-90 transition-all"
                    >
                      <Send size={16} />
                    </motion.button>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onStop}
                    className="w-10 h-10 flex items-center justify-center rounded-xl
                      bg-bg-hover text-text-secondary hover:bg-danger hover:text-white
                      transition-all cursor-pointer"
                    aria-label="Stop voice"
                  >
                    <X size={16} />
                  </motion.button>
                </div>
              </div>

              {/* Keyboard shortcut hints */}
              <div className="flex items-center justify-center gap-4 px-4 pb-3 pt-0">
                <span className="text-[10px] text-text-tertiary flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-bg-hover text-[9px] font-mono font-bold">Esc</kbd>
                  Cancel
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function WaveformBars() {
  return (
    <div className="flex items-center gap-[2px] h-3">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <motion.span
          key={i}
          className="w-[2px] bg-danger/70 rounded-full"
          animate={{ height: ["20%", "100%", "20%"] }}
          transition={{
            duration: 0.7 + i * 0.05,
            repeat: Infinity,
            delay: i * 0.06,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
