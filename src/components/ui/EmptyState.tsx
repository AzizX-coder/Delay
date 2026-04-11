import { motion } from "motion/react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: {
    wrapper: "py-10",
    iconBox: "w-12 h-12 rounded-2xl",
    title: "text-[13px]",
    description: "text-[12px]",
  },
  md: {
    wrapper: "py-14",
    iconBox: "w-14 h-14 rounded-[20px]",
    title: "text-[14px]",
    description: "text-[12px]",
  },
  lg: {
    wrapper: "py-20",
    iconBox: "w-[72px] h-[72px] rounded-3xl",
    title: "text-[15px]",
    description: "text-[13px]",
  },
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  size = "md",
  className = "",
}: EmptyStateProps) {
  const s = sizeMap[size];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      className={`flex flex-col items-center justify-center ${s.wrapper} ${className}`}
    >
      <div
        className={`${s.iconBox} flex items-center justify-center
          bg-gradient-to-br from-accent/15 to-accent/5
          border border-accent/10
          text-accent mb-4
          shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_20px_rgba(0,122,255,0.08)]`}
      >
        {icon}
      </div>
      <p className={`${s.title} font-medium text-text-secondary`}>{title}</p>
      {description && (
        <p className={`${s.description} text-text-tertiary mt-1 text-center max-w-[260px]`}>
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
