import { motion, AnimatePresence } from "motion/react";
import { Mic, X } from "lucide-react";

interface Props {
  active: boolean;
  transcript?: string;
  onStop: () => void;
}

export function VoiceBadge({ active, transcript, onStop }: Props) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          className="fixed bottom-6 right-6 z-[60] pointer-events-auto"
        >
          <div
            className="flex items-center gap-3 pl-3 pr-2 py-2
              rounded-full bg-bg-glass-heavy backdrop-blur-2xl
              border border-danger/30
              shadow-[0_8px_32px_rgba(255,59,48,0.22),0_1px_2px_rgba(0,0,0,0.08)]"
          >
            <div className="relative w-7 h-7 flex items-center justify-center">
              <motion.span
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-danger/35"
              />
              <motion.span
                animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0, 0.7] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  delay: 0.3,
                }}
                className="absolute inset-0 rounded-full bg-danger/25"
              />
              <div className="relative w-5 h-5 rounded-full bg-danger text-white flex items-center justify-center shadow-[0_0_0_3px_rgba(255,59,48,0.15)]">
                <Mic size={11} />
              </div>
            </div>

            <div className="flex items-center gap-2 max-w-[360px]">
              <div className="flex flex-col leading-tight">
                <span className="text-[11px] font-semibold text-danger uppercase tracking-wide">
                  Listening
                </span>
                {transcript ? (
                  <span className="text-[12.5px] text-text-primary truncate">
                    {transcript}
                  </span>
                ) : (
                  <Bars />
                )}
              </div>
              <button
                onClick={onStop}
                className="w-8 h-8 flex items-center justify-center rounded-full
                  bg-bg-hover hover:bg-danger hover:text-white
                  text-text-secondary transition-colors cursor-pointer"
                aria-label="Stop voice"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Bars() {
  return (
    <div className="flex items-end gap-[2px] h-3 mt-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.span
          key={i}
          className="w-[2px] bg-danger/80 rounded-full"
          animate={{ height: ["30%", "100%", "30%"] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.08,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
