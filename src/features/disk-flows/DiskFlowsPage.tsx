import { useEffect, useState, useRef } from "react";
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
  Video as VideoIcon,
  Camera,
  Globe,
  FolderOpen,
  FileVideo,
  RotateCcw,
  X,
  Settings2
} from "lucide-react";

const PLATFORM_ICONS = {
  youtube: <VideoIcon size={16} />,
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
  const [fetchingFormats, setFetchingFormats] = useState(false);
  const [checkingDep, setCheckingDep] = useState(true);
  const [formatsModal, setFormatsModal] = useState<{ url: string, formats: any[], title: string, thumb: string } | null>(null);

  useEffect(() => {
    loadDownloads();
    const checkYtDlp = async () => {
      const electronAPI = (window as any).electronAPI;
      if (electronAPI?.diskFlows?.checkDependency) {
        try {
          await electronAPI.diskFlows.checkDependency();
        } catch (e) {
          console.error("Failed to check or download yt-dlp", e);
        }
      }
      setCheckingDep(false);
    };
    checkYtDlp();
  }, []);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text);
    } catch {}
  };

  const handleAddFlow = async () => {
    if (!url.trim()) return;

    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.diskFlows?.getFormats) {
      setFetchingFormats(true);
      setError("");
      const res = await electronAPI.diskFlows.getFormats(url.trim());
      setFetchingFormats(false);
      
      if (res && res.ok && res.formats && res.formats.length > 0) {
        // Filter out absurdly long lists to just top ones: best audio/video muxed, or high res
        const validFormats = res.formats.reverse().slice(0, 15); // reverse to get best first
        setFormatsModal({ url: url.trim(), formats: validFormats, title: res.title, thumb: res.thumbnail });
      } else {
        // Fallback to auto best download if getFormats fails
        const id = await addDownload(url.trim());
        startDownload(id, "best");
        setUrl("");
      }
    } else {
      const id = await addDownload(url.trim());
      startDownload(id, "best");
      setUrl("");
    }
  };

  const handleSelectFormat = async (formatId: string) => {
    if (!formatsModal) return;
    const id = await addDownload(formatsModal.url);
    startDownload(id, formatId);
    setFormatsModal(null);
    setUrl("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAddFlow();
  };

  const handleOpenFolder = () => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.diskFlows?.openFolder) {
      electronAPI.diskFlows.openFolder();
    }
  };

  const activeDownloads = downloads.filter((d) => d.status === "downloading" || d.status === "pending");
  const completedDownloads = downloads.filter((d) => d.status === "completed");
  const failedDownloads = downloads.filter((d) => d.status === "error");

  return (
    <div className="flex flex-col h-full relative">
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
              disabled={fetchingFormats || checkingDep}
              placeholder={checkingDep ? "Downloading yt-dlp dependencies..." : "Paste YouTube or Instagram URL..."}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-bg-secondary/60 border border-border/40
                text-[14px] text-text-primary placeholder:text-text-tertiary
                outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all disabled:opacity-50"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handlePaste}
            disabled={fetchingFormats}
            className="px-4 py-3.5 rounded-2xl bg-bg-secondary/60 border border-border/40
              text-[13px] font-medium text-text-secondary hover:text-text-primary
              hover:bg-bg-hover transition-all cursor-pointer disabled:opacity-50"
          >
            Paste
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddFlow}
            disabled={!url.trim() || fetchingFormats}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl
              bg-accent text-bg-primary text-[14px] font-semibold
              shadow-lg shadow-accent/20 cursor-pointer hover:opacity-90
              transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {fetchingFormats ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            Fetch
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
            {activeDownloads.length > 0 && (
              <div className="mb-4">
                <h3 className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-2 px-1">
                  Active
                </h3>
                <div className="space-y-2">
                  {activeDownloads.map((d) => (
                    <DownloadCard key={d.id} download={d} onDelete={() => deleteDownload(d.id)} onRetry={() => startDownload(d.id, "best")} />
                  ))}
                </div>
              </div>
            )}
            
            {completedDownloads.length > 0 && (
              <div className="mb-4">
                <h3 className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-2 px-1">
                  Completed ({completedDownloads.length})
                </h3>
                <div className="space-y-2">
                  {completedDownloads.map((d) => (
                    <DownloadCard key={d.id} download={d} onDelete={() => deleteDownload(d.id)} />
                  ))}
                </div>
              </div>
            )}

            {failedDownloads.length > 0 && (
              <div>
                <h3 className="text-[11px] font-semibold text-danger uppercase tracking-wider mb-2 px-1">
                  Failed
                </h3>
                <div className="space-y-2">
                  {failedDownloads.map((d) => (
                    <DownloadCard key={d.id} download={d} onDelete={() => deleteDownload(d.id)} onRetry={() => startDownload(d.id, "best")} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Formats Selection Modal */}
      <AnimatePresence>
        {formatsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm p-8"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="w-full max-w-2xl max-h-full flex flex-col bg-bg-elevated border border-border shadow-2xl rounded-3xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-border/40">
                <h3 className="text-[16px] font-bold flex items-center gap-2">
                  <Settings2 size={18} className="text-accent" /> Select Quality
                </h3>
                <button onClick={() => setFormatsModal(null)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-bg-hover transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="flex items-start gap-4 p-5 border-b border-border/40 bg-bg-secondary/20">
                {formatsModal.thumb && (
                  <img src={formatsModal.thumb} alt="thumbnail" className="w-32 h-20 object-cover rounded-xl shadow-md bg-bg-tertiary" />
                )}
                <p className="text-[14px] font-medium text-text-primary line-clamp-3">{formatsModal.title}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                <button 
                  onClick={() => handleSelectFormat('best')}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-border/60 hover:border-accent hover:bg-accent/5 transition-all text-left"
                >
                  <div>
                    <p className="font-bold text-[14px]">Best Available (Auto)</p>
                    <p className="text-[12px] text-text-tertiary">Let yt-dlp select the optimal video + audio mux</p>
                  </div>
                  <Download size={18} className="text-accent" />
                </button>
                <div className="h-px bg-border/40 my-3" />
                
                {formatsModal.formats.map((f, i) => {
                  const sizeRaw = f.filesize ? (f.filesize / 1024 / 1024).toFixed(1) + " MB" : "Unknown size";
                  const isAudioOnly = f.vcodec === 'none';
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelectFormat(f.format_id)}
                      className="w-full flex items-center justify-between p-3 rounded-xl border border-transparent hover:bg-bg-hover transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isAudioOnly ? 'bg-indigo-500/10 text-indigo-500' : 'bg-rose-500/10 text-rose-500'}`}>
                           {isAudioOnly ? <Play size={16} /> : <VideoIcon size={16} />}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-text-primary capitalize">
                            {isAudioOnly ? "Audio Only" : f.resolution} <span className="text-[10px] text-text-tertiary ml-1 font-mono uppercase bg-bg-tertiary px-1.5 py-0.5 rounded">{f.ext}</span>
                          </p>
                          <p className="text-[11px] text-text-tertiary mt-0.5">
                            {f.format_note || (isAudioOnly ? "Audio format" : "Video format")} • {sizeRaw}
                          </p>
                        </div>
                      </div>
                      <Download size={16} className="text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DownloadCard({ download, onDelete, onRetry }: { download: any; onDelete: () => void; onRetry?: () => void; }) {
  const [showPlayer, setShowPlayer] = useState(false);
  const platformColor = PLATFORM_COLORS[download.platform as keyof typeof PLATFORM_COLORS] || "#007AFF";
  const platformIcon = PLATFORM_ICONS[download.platform as keyof typeof PLATFORM_ICONS] || <Globe size={16} />;

  const handleShowInFolder = () => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.diskFlows?.showInFolder && download.file_path) {
      electronAPI.diskFlows.showInFolder(download.file_path);
    } else {
      alert("This feature requires the desktop app. On mobile, files are managed in the Vault.");
    }
  };

  const handleMoveToDownloads = () => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.diskFlows?.moveToDownloads && download.file_path) {
      electronAPI.diskFlows.moveToDownloads(download.file_path);
    } else {
      // On web/mobile, try to open the URL directly
      if (download.url) {
        window.open(download.url, "_blank");
      } else {
        alert("This feature requires the desktop app.");
      }
    }
  };

  const isPlayable = download.file_path && (download.file_path.endsWith('.mp4') || download.file_path.endsWith('.webm') || download.file_path.endsWith('.m4a'));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 py-3.5 rounded-2xl bg-bg-secondary/40 border border-border/30 backdrop-blur-sm hover:border-border/50 transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${platformColor}15`, color: platformColor }}>
          {platformIcon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-text-primary truncate">{download.title}</p>
          <p className="text-[11px] text-text-tertiary truncate">{download.url}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {download.status === "downloading" && <span className="text-[11px] font-bold text-accent tabular-nums">{download.progress}%</span>}
          {download.status === "pending" && <Loader2 size={16} className="text-text-tertiary animate-spin" />}
          {download.status === "completed" && <CheckCircle2 size={16} className="text-success" />}
          {download.status === "error" && (
            <>
              <AlertCircle size={16} className="text-danger" />
              {onRetry && (
                <button onClick={onRetry} className="w-7 h-7 flex items-center justify-center rounded-lg text-text-tertiary hover:text-accent hover:bg-accent/10 transition-all">
                  <RotateCcw size={13} />
                </button>
              )}
            </>
          )}
          <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg text-text-tertiary hover:text-danger hover:bg-danger/10 transition-all">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {download.status === "downloading" && (
        <div className="mt-3 w-full h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full" style={{ backgroundColor: platformColor }} initial={{ width: 0 }} animate={{ width: `${download.progress}%` }} />
        </div>
      )}

      {download.status === "completed" && (
        <div className="flex flex-col mt-3">
          {showPlayer && isPlayable && (
            <div className="mt-2 mb-4 rounded-xl overflow-hidden border border-border shadow-lg bg-black">
              <video src={`file://${download.file_path}`} controls className="w-full max-h-[300px] object-contain" autoPlay />
            </div>
          )}
          <div className="flex items-center gap-2 pt-3 border-t border-border/20">
            {isPlayable && (
              <button onClick={() => setShowPlayer(!showPlayer)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-[11px] font-bold text-accent hover:bg-accent/20 transition-all cursor-pointer">
                <Play size={12} className={showPlayer ? "fill-current" : ""} />
                {showPlayer ? "Close Player" : "Play Video"}
              </button>
            )}
            <button onClick={handleShowInFolder} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-hover/60 text-[11px] font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-active transition-all cursor-pointer">
              <FolderOpen size={12} /> Show
            </button>
            <button onClick={handleMoveToDownloads} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-hover/60 text-[11px] font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-active transition-all cursor-pointer">
              <Download size={12} /> Save
            </button>
            {download.file_path && (
              <span className="ml-auto text-[10px] text-text-tertiary truncate max-w-[150px] flex items-center gap-1" title={download.file_path}>
                <FileVideo size={10} /> {download.file_path.split('\\').pop()?.split('/').pop()}
              </span>
            )}
          </div>
        </div>
      )}
      
      {download.status === "error" && download.error && (
        <p className="mt-2 text-[11px] text-danger/70 truncate">{download.error}</p>
      )}
    </motion.div>
  );
}
