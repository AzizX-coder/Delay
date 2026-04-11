import { motion, AnimatePresence } from "motion/react";
import type { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className={`relative w-full ${sizeMap[size]} mx-4 bg-bg-elevated
              border border-border-light rounded-[--radius-xl]
              shadow-[0_8px_40px_var(--color-shadow-lg)] overflow-hidden`}
          >
            {title && (
              <div className="flex items-center justify-between px-6 pt-5 pb-1">
                <h2 className="text-[16px] font-semibold text-text-primary">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center rounded-full
                    text-text-tertiary hover:text-text-primary hover:bg-bg-hover
                    transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            <div className="px-6 pb-6 pt-3">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
