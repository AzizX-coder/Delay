import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useDiskFlowsStore } from "@/stores/diskFlowsStore";
import {
  Download,
  Link2,
  Trash2,
  Play,
  CheckCircle2,
  AlertCircle,
  Loader2,
  HardDrive,
  Video,
  Camera,
  Globe,
  FolderOpen,
  ExternalLink,
  FileVideo,
  RotateCcw,
} from "lucide-react";

const PLATFORM_ICONS = {
  youtube: <Video size={16} />,
  instagram: <Camera size={16} />,
  other: <Globe size={16} />,
};

const PLATFORM_COLORS = {
  youtube: "#FF0000",
  instagram: "#E4405F",
  other: "#007AFF",
};

export function DiskFlowsPage() {
  const {
    downloads,
    loading,
    loadDownloads,
    addDownload,
    deleteDownload,
    startDownload,
  } = useDiskFlowsStore();

  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [saveToDownloads, setSaveToDownloads] = useState(false);

  useEffect(() => {
    loadDownloads();
  }, []);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text);
    } catch {}
  };

  const handleAdd = async () => {
    if (!url.trim()) return;

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const id = await addDownload(url.trim());
    startDownload(id);
    setUrl("");
    setError("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
  };

  const handleOpenFolder = () => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.diskFlows?.openFolder) {
      electronAPI.diskFlows.openFolder();
    }
  };

  const activeDownloads = downloads.filter(
    (d) => d.status === "downloading" || d.status === "pending"
  );
  const completedDownloads = downloads.filter(
    (d) => d.status === "completed"
  );
  const failedDownloads = downloads.filter((d) => d.status === "error");

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-8 pt-8 pb-4">
        <div className="flex items-center justify-between mb-1">
          <motion.h1
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[24px] font-bold text-text-primary tracking-tight"
          >
            Disk Flows
          </motion.h1>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenFolder}
            className="flex items-center gap-2 px-4 py-2 rounded-xl
              bg-bg-secondary/60 border border-border/40 text-[12px] font-semibold
              text-text-secondary hover:text-text-primary hover:bg-bg-hover
              transition-all cursor-pointer"
          >
            <FolderOpen size={14} />
            Open Downloads Folder
          </motion.button>
        </div>
        <p className="text-[13px] text-text-tertiary mb-6">
          Paste a YouTube or Instagram link to download and save videos locally.
        </p>

        {/* URL Input */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary">
              <Link2 size={18} />
            </div>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste YouTube or Instagram URL..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-bg-secondary/60 border border-border/40
                text-[14px] text-text-primary placeholder:text-text-tertiary
                outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handlePaste}
            className="px-4 py-3.5 rounded-2xl bg-bg-secondary/60 border border-border/40
              text-[13px] font-medium text-text-secondary hover:text-text-primary
              hover:bg-bg-hover transition-all cursor-pointer"
          >
            Paste
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAdd}
            disabled={!url.trim()}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl
              bg-accent text-bg-primary text-[14px] font-semibold
              shadow-lg shadow-accent/20 cursor-pointer hover:opacity-90
              transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            Download
          </motion.button>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[12px] text-danger mt-2 flex items-center gap-1.5"
          >
            <AlertCircle size={12} />
            {error}
          </motion.p>
        )}
      </div>

      {/* Downloads list */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {downloads.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-accent/15 to-accent/5
                flex items-center justify-center mb-5 border border-accent/10"
            >
              <HardDrive size={36} className="text-accent" />
            </motion.div>
            <h2 className="text-[18px] font-bold text-text-primary mb-2">
              No downloads yet
            </h2>
            <p className="text-[13px] text-text-tertiary max-w-xs text-center">
              Paste a video URL above to start downloading. Supports YouTube and
              Instagram.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Active downloads */}
            {activeDownloads.length > 0 && (
              <div className="mb-4">
                <h3 className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-2 px-1">
                  Active
                </h3>
                <div className="space-y-2">
                  {activeDownloads.map((download) => (
                    <DownloadCard
                      key={download.id}
                      download={download}
                      onDelete={() => deleteDownload(download.id)}
                      onRetry={() => startDownload(download.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed */}
            {completedDownloads.length > 0 && (
              <div className="mb-4">
                <h3 className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-2 px-1">
                  Completed ({completedDownloads.length})
                </h3>
                <div className="space-y-2">
                  {completedDownloads.map((download) => (
                    <DownloadCard
                      key={download.id}
                      download={download}
                      onDelete={() => deleteDownload(download.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Failed */}
            {failedDownloads.length > 0 && (
              <div>
                <h3 className="text-[11px] font-semibold text-danger uppercase tracking-wider mb-2 px-1">
                  Failed
                </h3>
                <div className="space-y-2">
                  {failedDownloads.map((download) => (
                    <DownloadCard
                      key={download.id}
                      download={download}
                      onDelete={() => deleteDownload(download.id)}
                      onRetry={() => startDownload(download.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DownloadCard({
  download,
  onDelete,
  onRetry,
}: {
  download: any;
  onDelete: () => void;
  onRetry?: () => void;
}) {
  const platformColor = PLATFORM_COLORS[download.platform as keyof typeof PLATFORM_COLORS] || "#007AFF";
  const platformIcon = PLATFORM_ICONS[download.platform as keyof typeof PLATFORM_ICONS] || <Globe size={16} />;

  const handleShowInFolder = () => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.diskFlows?.showInFolder && download.file_path) {
      electronAPI.diskFlows.showInFolder(download.file_path);
    } else if (electronAPI?.diskFlows?.openFolder) {
      electronAPI.diskFlows.openFolder();
    }
  };

  const handleMoveToDownloads = () => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.diskFlows?.moveToDownloads && download.file_path) {
      electronAPI.diskFlows.moveToDownloads(download.file_path);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 py-3.5 rounded-2xl
        bg-bg-secondary/40 border border-border/30 backdrop-blur-sm
        hover:border-border/50 transition-all group"
    >
      <div className="flex items-center gap-4">
        {/* Platform icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${platformColor}15`, color: platformColor }}
        >
          {platformIcon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-text-primary truncate">
            {download.title}
          </p>
          <p className="text-[11px] text-text-tertiary truncate">{download.url}</p>
        </div>

        {/* Status & actions */}
        <div className="flex items-center gap-2 shrink-0">
          {download.status === "downloading" && (
            <span className="text-[11px] font-bold text-accent tabular-nums">
              {download.progress}%
            </span>
          )}
          {download.status === "pending" && (
            <Loader2 size={16} className="text-text-tertiary animate-spin" />
          )}
          {download.status === "completed" && (
            <CheckCircle2 size={16} className="text-success" />
          )}
          {download.status === "error" && (
            <>
              <AlertCircle size={16} className="text-danger" />
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="w-7 h-7 flex items-center justify-center
                    rounded-lg text-text-tertiary hover:text-accent hover:bg-accent/10 transition-all cursor-pointer"
                  title="Retry"
                >
                  <RotateCcw size={13} />
                </button>
              )}
            </>
          )}

          <button
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center
              rounded-lg text-text-tertiary hover:text-danger hover:bg-danger/10 transition-all cursor-pointer"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {download.status === "downloading" && (
        <div className="mt-3 w-full h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: platformColor }}
            initial={{ width: 0 }}
            animate={{ width: `${download.progress}%` }}
            transition={{ type: "tween", duration: 0.3 }}
          />
        </div>
      )}

      {/* Completed: action buttons */}
      {download.status === "completed" && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/20">
          <button
            onClick={handleShowInFolder}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
              bg-bg-hover/60 text-[11px] font-semibold text-text-secondary
              hover:text-text-primary hover:bg-bg-active transition-all cursor-pointer"
          >
            <FolderOpen size={12} />
            Show in Folder
          </button>
          <button
            onClick={handleMoveToDownloads}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
              bg-bg-hover/60 text-[11px] font-semibold text-text-secondary
              hover:text-text-primary hover:bg-bg-active transition-all cursor-pointer"
          >
            <Download size={12} />
            Copy to Downloads
          </button>
          {download.file_path && (
            <span className="ml-auto text-[10px] text-text-tertiary truncate max-w-[200px] flex items-center gap-1">
              <FileVideo size={10} />
              {download.file_path}
            </span>
          )}
        </div>
      )}

      {/* Error message */}
      {download.status === "error" && download.error && (
        <p className="mt-2 text-[11px] text-danger/70 truncate">
          {download.error}
        </p>
      )}
    </motion.div>
  );
}
