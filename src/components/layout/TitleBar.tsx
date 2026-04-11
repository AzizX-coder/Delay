import { Logo } from "@/components/ui/Logo";

export function TitleBar() {
  const isElectron = !!window.electronAPI?.isElectron;

  return (
    <div
      className="flex items-center h-11 px-4 glass-heavy border-b border-border-light select-none shrink-0"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      {/* Brand */}
      <div className="flex items-center gap-2">
        <Logo size={22} />
        <span className="text-[13px] font-semibold text-text-primary tracking-[-0.01em]">
          Delay
        </span>
      </div>

      <div className="flex-1" />

      {/* Window controls */}
      {isElectron && (
        <div
          className="flex items-center -mr-2"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          <button
            onClick={() => window.electronAPI?.minimize()}
            className="w-[46px] h-[32px] flex items-center justify-center
              text-text-secondary hover:bg-bg-hover transition-colors rounded-md cursor-pointer"
            aria-label="Minimize"
          >
            <svg width="10" height="1" viewBox="0 0 10 1">
              <rect width="10" height="1" fill="currentColor" />
            </svg>
          </button>
          <button
            onClick={() => window.electronAPI?.maximize()}
            className="w-[46px] h-[32px] flex items-center justify-center
              text-text-secondary hover:bg-bg-hover transition-colors rounded-md cursor-pointer"
            aria-label="Maximize"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <rect x="0.5" y="0.5" width="9" height="9" stroke="currentColor" strokeWidth="1" />
            </svg>
          </button>
          <button
            onClick={() => window.electronAPI?.close()}
            className="w-[46px] h-[32px] flex items-center justify-center
              text-text-secondary hover:bg-[#E81123] hover:text-white transition-colors rounded-md cursor-pointer"
            aria-label="Close"
          >
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
