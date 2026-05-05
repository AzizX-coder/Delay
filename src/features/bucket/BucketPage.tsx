import { useState, useEffect, useRef } from "react";
import { useBucketStore, BucketItem } from "@/stores/bucketStore";
import { motion, AnimatePresence } from "motion/react";
import {
  Send, Paperclip, Pin, PinOff, Trash2, Link2, FileText,
  Archive, Download, Search, X, ExternalLink, Image as ImageIcon,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export function BucketPage() {
  const { items, loading, loadItems, addItem, removeItem, togglePin } = useBucketStore();
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items.length]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    // Detect links
    const isLink = /^https?:\/\//i.test(text);
    addItem({ type: isLink ? "link" : "text", content: text });
    setInput("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      addItem({
        type: "file",
        content: file.name,
        fileName: file.name,
        fileData: base64,
        fileType: file.type,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const downloadFile = (item: BucketItem) => {
    if (!item.fileData) return;
    const a = document.createElement("a");
    a.href = item.fileData;
    a.download = item.fileName || "file";
    a.click();
  };

  const pinnedItems = items.filter((i) => i.pinned);
  const regularItems = items.filter((i) => !i.pinned);
  const filtered = (search
    ? [...pinnedItems, ...regularItems].filter(
        (i) =>
          i.content.toLowerCase().includes(search.toLowerCase()) ||
          (i.fileName || "").toLowerCase().includes(search.toLowerCase())
      )
    : [...pinnedItems, ...regularItems]
  );

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString([], { month: "short", day: "numeric" }) + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const isImage = (item: BucketItem) => item.fileType?.startsWith("image/");

  return (
    <div className="flex flex-col h-full bg-bg-primary">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border/30 bg-bg-secondary/30 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
            <Archive size={18} className="text-accent" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-text-primary">Bucket</h1>
            <p className="text-[10px] text-text-tertiary">{items.length} saved items</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showSearch ? (
            <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-bg-primary border border-border/30">
              <Search size={13} className="text-text-tertiary" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="bg-transparent outline-none text-[12px] text-text-primary w-[120px] md:w-[200px]"
                autoFocus
              />
              <button onClick={() => { setShowSearch(false); setSearch(""); }} className="text-text-tertiary cursor-pointer">
                <X size={13} />
              </button>
            </div>
          ) : (
            <button onClick={() => setShowSearch(true)} className="p-2 rounded-lg hover:bg-bg-hover text-text-tertiary cursor-pointer">
              <Search size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-full text-text-tertiary text-[12px]">Loading...</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Archive size={40} />}
            title="Your Bucket is empty"
            description="Save text, links, and files here. They stay on your device, safe and private."
          />
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className={`group max-w-[85%] md:max-w-[60%] ml-auto rounded-2xl rounded-br-md p-3 border transition-all relative
                  ${item.pinned
                    ? "bg-accent/5 border-accent/20"
                    : "bg-bg-secondary/60 border-border/20 hover:border-border/40"
                  }`}
              >
                {item.pinned && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                    <Pin size={10} className="text-white" />
                  </div>
                )}

                {/* Content */}
                {item.type === "text" && (
                  <p className="text-[13px] text-text-primary whitespace-pre-wrap break-words leading-relaxed">{item.content}</p>
                )}
                {item.type === "link" && (
                  <a
                    href={item.content}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-accent text-[13px] font-medium hover:underline break-all"
                  >
                    <Link2 size={14} className="shrink-0" />
                    {item.content}
                    <ExternalLink size={11} className="shrink-0 opacity-60" />
                  </a>
                )}
                {item.type === "file" && (
                  <div>
                    {isImage(item) && item.fileData ? (
                      <img src={item.fileData} alt={item.fileName} className="rounded-lg max-h-[200px] w-auto mb-2 border border-border/10" />
                    ) : (
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-bg-hover flex items-center justify-center">
                          <FileText size={14} className="text-text-tertiary" />
                        </div>
                        <span className="text-[12px] font-bold text-text-primary truncate">{item.fileName}</span>
                      </div>
                    )}
                    <button
                      onClick={() => downloadFile(item)}
                      className="flex items-center gap-1.5 text-[10px] font-bold text-accent cursor-pointer hover:underline"
                    >
                      <Download size={11} /> Download
                    </button>
                  </div>
                )}

                {/* Meta row */}
                <div className="flex items-center justify-between mt-2 gap-2">
                  <span className="text-[9px] text-text-tertiary">{formatDate(item.created_at)}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => togglePin(item.id)}
                      className="p-1 rounded text-text-tertiary hover:text-accent cursor-pointer"
                      title={item.pinned ? "Unpin" : "Pin"}
                    >
                      {item.pinned ? <PinOff size={11} /> : <Pin size={11} />}
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 rounded text-text-tertiary hover:text-danger cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={endRef} />
      </div>

      {/* Input bar */}
      <div className="shrink-0 border-t border-border/30 bg-bg-secondary/30 backdrop-blur-md px-3 md:px-6 py-3">
        <div className="flex items-center gap-2">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl hover:bg-bg-hover text-text-tertiary hover:text-accent transition-colors cursor-pointer shrink-0"
            title="Attach file"
          >
            <Paperclip size={18} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Save a message, link, or note..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-bg-primary border border-border/30 text-[13px] text-text-primary outline-none placeholder:text-text-tertiary focus:border-accent/40 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2.5 rounded-xl bg-accent text-white hover:bg-accent/90 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
