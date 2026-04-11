import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[13px] font-medium text-text-secondary">
          {label}
        </label>
      )}
      <input
        className={`h-10 px-3.5 bg-bg-secondary border border-border rounded-[--radius-sm]
          text-[14px] text-text-primary placeholder:text-text-tertiary
          outline-none transition-all duration-150
          focus:border-accent focus:ring-2 focus:ring-accent/20
          ${error ? "border-danger" : ""} ${className}`}
        spellCheck={false}
        autoComplete="off"
        {...props}
      />
      {error && <span className="text-[12px] text-danger">{error}</span>}
    </div>
  );
}
