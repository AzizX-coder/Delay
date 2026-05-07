import { useState, useEffect, useRef } from "react";
import { useSavedStore, SavedItem } from "@/stores/savedStore";
import { motion, AnimatePresence } from "motion/react";
import {
  Send, Bookmark, Pin, PinOff, Trash2, Link2, CheckSquare,
  Search, X, ExternalLink, Filter, SmilePlus, Square, CheckSquare2,
  Copy, MoreHorizontal, MessageCircle,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

const REACTIONS = ["👍", "❤️", "🔥", "⭐", "🎯", "💡", "✅", "🚀", "👀", "💯"];

const isUrl = (text: string) => /^https?:\/\//i.test(text);

export function SavedPage() {
  const { items, loading, loadItems, addItem, removeItem, togglePin, toggleComplete, addReaction } = useSavedStore();
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [filter, setFilter] = useState<"all" | "links" | "todos" | "pinned">("all");
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadItems(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [items.length]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    if (text.startsWith("[] ") || text.startsWith("[ ] ")) {
      addItem({ type: "todo", content: text.replace(/^\[[\s]?\]\s*/, ""), completed: false });
    } else if (isUrl(text)) {
      addItem({ type: "link", content: text });
    } else {
      addItem({ type: "text", content: text });
    }
    setInput("");
    inputRef.current?.focus();
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const pinnedItems = items.filter(i => i.pinned);
  const regularItems = items.filter(i => !i.pinned);
  let all = [...pinnedItems, ...regularItems];

  if (filter === "links") all = all.filter(i => i.type === "link");
  if (filter === "todos") all = all.filter(i => i.type === "todo");
  if (filter === "pinned") all = all.filter(i => i.pinned);

  if (search) {
    all = all.filter(i => i.content.toLowerCase().includes(search.toLowerCase()));
  }

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" }) + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getDomain = (url: string) => { try { return new URL(url).hostname.replace("www.", ""); } catch { return url; } };

  const counts = {
    all: items.length,
    pinned: items.filter(i => i.pinned).length,
    links: items.filter(i => i.type === "link").length,
    todos: items.filter(i => i.type === "todo").length,
  };

  return (
    <div className="flex flex-col h-full bg-bg-primary" onClick={() => { setShowReactions(null); setContextMenu(null); }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border/30 bg-bg-secondary/30 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-lg shadow-accent/20">
            <Bookmark size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-[16px] font-bold text-text-primary">Saved Messages</h1>
            <p className="text-[10px] text-text-tertiary">{items.length} items · {counts.pinned} pinned</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {showSearch ? (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: "auto", opacity: 1 }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-bg-primary border border-border/30">
              <Search size={13} className="text-text-tertiary" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search messages..." autoFocus
                className="bg-transparent outline-none text-[12px] text-text-primary w-[100px] md:w-[180px]" />
              <button onClick={() => { setShowSearch(false); setSearch(""); }} className="text-text-tertiary cursor-pointer"><X size={13} /></button>
            </motion.div>
          ) : (
            <button onClick={() => setShowSearch(true)} className="p-2 rounded-xl hover:bg-bg-hover text-text-tertiary cursor-pointer"><Search size={16} /></button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1.5 px-4 md:px-6 py-2.5 border-b border-border/15 overflow-x-auto no-scrollbar shrink-0">
        {([
          { key: "all", label: "All", count: counts.all },
          { key: "pinned", label: "📌 Pinned", count: counts.pinned },
          { key: "links", label: "🔗 Links", count: counts.links },
          { key: "todos", label: "☑️ Todos", count: counts.todos },
        ] as const).map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer
              ${filter === f.key ? "bg-accent text-white shadow-md shadow-accent/20" : "bg-bg-secondary/50 text-text-tertiary hover:text-text-secondary hover:bg-bg-hover"}`}>
            {f.label}
            {f.count > 0 && <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${filter === f.key ? "bg-white/20" : "bg-border/20"}`}>{f.count}</span>}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 space-y-2.5">
        {loading ? (
          <div className="flex items-center justify-center h-full text-text-tertiary text-[12px]">Loading...</div>
        ) : all.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center">
              <Bookmark size={36} className="text-accent/40" />
            </div>
            <div className="text-center">
              <p className="text-[16px] font-bold text-text-primary mb-1">No saved messages</p>
              <p className="text-[12px] text-text-tertiary max-w-[240px]">
                Save text, links, or quick todos. Type <code className="px-1 py-0.5 rounded bg-bg-hover text-accent text-[11px]">[] task</code> for a checklist item.
              </p>
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {all.map(item => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: -80, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                onClick={e => e.stopPropagation()}
                className={`group max-w-[88%] md:max-w-[60%] ml-auto relative
                  ${item.pinned ? "" : ""}`}>
                
                {/* Message bubble */}
                <div className={`rounded-2xl rounded-br-sm p-3.5 border transition-all
                  ${item.pinned 
                    ? "bg-gradient-to-br from-accent/8 to-accent/3 border-accent/20 shadow-sm shadow-accent/5" 
                    : "bg-bg-secondary/60 border-border/20 hover:border-border/35"}`}>
                  
                  {/* Pin indicator */}
                  {item.pinned && (
                    <div className="flex items-center gap-1 mb-2">
                      <Pin size={10} className="text-accent" />
                      <span className="text-[9px] font-bold text-accent uppercase tracking-wider">Pinned</span>
                    </div>
                  )}

                  {/* Text */}
                  {item.type === "text" && (
                    <p className="text-[13px] text-text-primary whitespace-pre-wrap break-words leading-relaxed">{item.content}</p>
                  )}

                  {/* Link with rich preview card */}
                  {item.type === "link" && (
                    <a href={item.content} target="_blank" rel="noopener noreferrer" className="block group/link">
                      <div className="rounded-xl bg-bg-primary/60 border border-border/20 overflow-hidden hover:border-accent/25 transition-colors">
                        {/* Color bar */}
                        <div className="h-1 bg-gradient-to-r from-accent to-accent/40" />
                        <div className="flex items-start gap-3 p-3">
                          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                            <Link2 size={16} className="text-accent" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold text-accent truncate group-hover/link:underline">{getDomain(item.content)}</p>
                            <p className="text-[11px] text-text-tertiary truncate mt-0.5">{item.content}</p>
                          </div>
                          <ExternalLink size={12} className="text-text-tertiary shrink-0 mt-1 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </a>
                  )}

                  {/* Todo with checkbox */}
                  {item.type === "todo" && (
                    <div className="flex items-start gap-2.5 cursor-pointer" onClick={() => toggleComplete(item.id)}>
                      <motion.div whileTap={{ scale: 0.8 }}>
                        {item.completed ? (
                          <CheckSquare2 size={18} className="text-success shrink-0 mt-0.5" />
                        ) : (
                          <Square size={18} className="text-text-tertiary shrink-0 mt-0.5 hover:text-accent transition-colors" />
                        )}
                      </motion.div>
                      <p className={`text-[13px] leading-relaxed transition-all ${item.completed ? "line-through text-text-tertiary" : "text-text-primary"}`}>
                        {item.content}
                      </p>
                    </div>
                  )}

                  {/* Reaction badge */}
                  {item.emoji && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-bg-hover/80 border border-border/20 text-[15px] cursor-pointer hover:scale-110 transition-transform"
                        onClick={() => addReaction(item.id, item.emoji!)}>
                        {item.emoji} <span className="text-[10px] text-text-tertiary font-bold">1</span>
                      </span>
                    </motion.div>
                  )}

                  {/* Timestamp + actions */}
                  <div className="flex items-center justify-between mt-2.5 gap-2">
                    <span className="text-[9px] text-text-tertiary font-medium">{formatDate(item.created_at)}</span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setShowReactions(showReactions === item.id ? null : item.id)} className="p-1 rounded-lg text-text-tertiary hover:text-accent hover:bg-accent/10 cursor-pointer transition-colors"><SmilePlus size={12} /></button>
                      <button onClick={() => copyText(item.content)} className="p-1 rounded-lg text-text-tertiary hover:text-accent hover:bg-accent/10 cursor-pointer transition-colors"><Copy size={12} /></button>
                      <button onClick={() => togglePin(item.id)} className="p-1 rounded-lg text-text-tertiary hover:text-accent hover:bg-accent/10 cursor-pointer transition-colors">{item.pinned ? <PinOff size={12} /> : <Pin size={12} />}</button>
                      <button onClick={() => removeItem(item.id)} className="p-1 rounded-lg text-text-tertiary hover:text-danger hover:bg-danger/10 cursor-pointer transition-colors"><Trash2 size={12} /></button>
                    </div>
                  </div>
                </div>

                {/* Reaction picker */}
                <AnimatePresence>
                  {showReactions === item.id && (
                    <motion.div initial={{ opacity: 0, scale: 0.8, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 8 }}
                      className="absolute bottom-full mb-2 right-0 flex items-center gap-0.5 px-2.5 py-2 rounded-2xl bg-bg-elevated border border-border/40 shadow-2xl z-10"
                      onClick={e => e.stopPropagation()}>
                      {REACTIONS.map(e => (
                        <motion.button key={e} whileHover={{ scale: 1.3 }} whileTap={{ scale: 0.9 }}
                          onClick={() => { addReaction(item.id, e); setShowReactions(null); }}
                          className="text-[18px] cursor-pointer p-1 rounded-lg hover:bg-bg-hover transition-colors">{e}</motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={endRef} />
      </div>

      {/* Input bar */}
      <div className="shrink-0 border-t border-border/30 bg-bg-secondary/30 backdrop-blur-md px-3 md:px-6 py-3">
        <div className="flex items-center gap-2 max-w-3xl ml-auto">
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-bg-primary border border-border/30 focus-within:border-accent/40 transition-colors">
            <MessageCircle size={16} className="text-text-tertiary shrink-0" />
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Message, link, or [] todo..."
              className="flex-1 bg-transparent text-[13px] text-text-primary outline-none placeholder:text-text-tertiary"
            />
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleSend} disabled={!input.trim()}
            className="p-2.5 rounded-2xl bg-accent text-white hover:bg-accent/90 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shrink-0 shadow-lg shadow-accent/20">
            <Send size={18} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
