export {};

declare global {
  interface Window {
    electronAPI?: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      isElectron: boolean;
      getVersion?: () => Promise<string>;
      relaunch?: () => void;
      updater?: {
        check: () => Promise<{ ok: boolean; error?: string; updateInfo?: unknown }>;
        download: () => Promise<{ ok: boolean; error?: string }>;
        quitAndInstall: () => void;
        onEvent: (
          cb: (data: { event: string; payload: unknown }) => void
        ) => () => void;
      };
      diskFlows?: {
        download: (url: string, id: string) => Promise<{ ok: boolean }>;
        openFolder: () => Promise<void>;
        onEvent: (
          cb: (data: { event: string; payload: any }) => void
        ) => () => void;
      };
    };
  }
}
