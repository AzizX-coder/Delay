import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useCodeStudioStore, LANGUAGES } from "@/stores/codeStudioStore";
import { useAIStore } from "@/stores/aiStore";
import {
  Plus,
  Trash2,
  Copy,
  Check,
  ChevronDown,
  Code2,
  Sparkles,
  FileCode,
  FolderOpen,
  ExternalLink,
  X,
} from "lucide-react";

export function CodeStudioPage() {
  const {
    snippets,
    activeSnippetId,
    loading,
    loadSnippets,
    createSnippet,
    updateSnippet,
    deleteSnippet,
    setActiveSnippet,
  } = useCodeStudioStore();

  const { sendMessage } = useAIStore();
  const [copied, setCopied] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [aiLoading, setAILoading] = useState(false);
  const [folderFiles, setFolderFiles] = useState<{ name: string; content: string }[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadSnippets();
  }, []);

  const active = snippets.find((s) => s.id === activeSnippetId);

  const handleCopy = async () => {
    if (!active) return;
    await navigator.clipboard.writeText(active.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAIAssist = async () => {
    if (!active || !active.code.trim()) return;
    setAILoading(true);
    try {
      await sendMessage(
        `Explain and improve this ${active.language} code. Provide suggestions:\n\n\`\`\`${active.language}\n${active.code}\n\`\`\``,
        true
      );
    } finally {
      setAILoading(false);
    }
  };

  const handleOpenFolder = async () => {
    // Use File System Access API (modern browsers)
    try {
      const dirHandle = await (window as any).showDirectoryPicker();
      const files: { name: string; content: string }[] = [];
      for await (const entry of dirHandle.values()) {
        if (entry.kind === "file") {
          const ext = entry.name.split(".").pop()?.toLowerCase() || "";
          const codeExts = ["js", "ts", "tsx", "jsx", "py", "html", "css", "json", "sql", "md", "sh", "rs", "go", "java", "c", "cpp", "h", "yml", "yaml", "toml", "txt"];
          if (codeExts.includes(ext)) {
            try {
              const file = await entry.getFile();
              if (file.size < 100_000) {
                const content = await file.text();
                files.push({ name: entry.name, content });
              } else {
                files.push({ name: entry.name, content: `// File too large (${(file.size / 1024).toFixed(0)}KB)` });
              }
            } catch {}
          }
        }
      }
      // Create snippets from opened files
      for (const file of files.slice(0, 20)) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "";
        const langMap: Record<string, string> = {
          js: "javascript", ts: "typescript", tsx: "typescript", jsx: "javascript",
          py: "python", html: "html", css: "css", json: "json", sql: "sql",
          md: "markdown", sh: "bash", rs: "rust", go: "go", java: "java",
        };
        const lang = langMap[ext] || "plaintext";
        const id = await createSnippet(lang);
        await updateSnippet(id, { title: file.name, code: file.content });
      }
    } catch {
      // User cancelled or API not available
    }
  };

  const handleOpenInVSCode = () => {
    if (!active) return;
    // Create a temporary file via Electron and open it in VS Code
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.codeStudio?.openInVSCode) {
      electronAPI.codeStudio.openInVSCode(active.title, active.code, active.language);
    } else {
      // Fallback: use vscode:// protocol
      const encoded = encodeURIComponent(active.code);
      // Copy code to clipboard so user can paste in VS Code
      navigator.clipboard.writeText(active.code);
      window.open(`vscode://file/untitled`, "_blank");
    }
  };

  const lineCount = active ? (active.code.match(/\n/g) || []).length + 1 : 0;

  return (
    <div className="flex h-full">
      {/* Snippets sidebar */}
      <div className="w-56 h-full flex flex-col border-r border-border/40 bg-bg-secondary/30">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-bold text-text-primary tracking-tight">
              Code Studio
            </h2>
            <div className="flex items-center gap-1.5">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpenFolder}
                title="Open Folder"
                className="w-7 h-7 flex items-center justify-center rounded-lg
                  bg-bg-hover text-text-secondary cursor-pointer
                  hover:text-text-primary hover:bg-bg-active transition-all"
              >
                <FolderOpen size={14} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => createSnippet()}
                className="w-7 h-7 flex items-center justify-center rounded-lg
                  bg-accent text-bg-primary shadow-md shadow-accent/20 cursor-pointer
                  hover:opacity-90 transition-all"
              >
                <Plus size={16} />
              </motion.button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
          <AnimatePresence mode="popLayout">
            {snippets.map((snippet) => (
              <motion.div
                key={snippet.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={() => setActiveSnippet(snippet.id)}
                className={`group flex items-center gap-2 px-3 py-2.5
                  rounded-xl cursor-pointer transition-all duration-200
                  ${
                    activeSnippetId === snippet.id
                      ? "bg-accent/10 text-accent"
                      : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                  }`}
              >
                <FileCode size={14} className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium truncate">
                    {snippet.title}
                  </p>
                  <p className="text-[10px] text-text-tertiary truncate">
                    {snippet.language}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSnippet(snippet.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center
                    rounded-md text-text-tertiary hover:text-danger hover:bg-danger/10 transition-all"
                >
                  <Trash2 size={11} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {snippets.length === 0 && !loading && (
            <div className="text-center py-8">
              <Code2 size={24} className="mx-auto mb-2 text-text-tertiary" />
              <p className="text-[12px] text-text-tertiary">No snippets yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {active ? (
          <>
            {/* Editor toolbar */}
            <div className="flex items-center gap-3 px-5 py-2.5 border-b border-border/40 bg-bg-secondary/20">
              <input
                value={active.title}
                onChange={(e) =>
                  updateSnippet(active.id, { title: e.target.value })
                }
                className="text-[14px] font-semibold text-text-primary bg-transparent
                  outline-none flex-1 placeholder:text-text-tertiary"
                placeholder="Snippet title..."
              />

              {/* Language selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLangPicker(!showLangPicker)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                    bg-bg-secondary/50 border border-border/30 text-[11px] font-bold
                    text-text-secondary hover:text-text-primary transition-all cursor-pointer uppercase tracking-wider"
                >
                  {active.language}
                  <ChevronDown size={12} />
                </button>
                {showLangPicker && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowLangPicker(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="absolute top-full right-0 mt-1 w-48 max-h-56 overflow-y-auto
                        bg-bg-elevated border border-border/60 rounded-xl shadow-2xl z-50 p-1 backdrop-blur-xl"
                    >
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.value}
                          onClick={() => {
                            updateSnippet(active.id, { language: lang.value });
                            setShowLangPicker(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-[12px] font-medium
                            transition-all cursor-pointer
                            ${
                              active.language === lang.value
                                ? "bg-accent text-bg-primary"
                                : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                            }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                  bg-bg-secondary/50 border border-border/30 text-[11px] font-medium
                  text-text-secondary hover:text-text-primary transition-all cursor-pointer"
              >
                {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                {copied ? "Copied" : "Copy"}
              </button>

              {/* Open in VS Code */}
              <button
                onClick={handleOpenInVSCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                  bg-bg-secondary/50 border border-border/30 text-[11px] font-medium
                  text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                title="Open in VS Code"
              >
                <ExternalLink size={12} />
                VS Code
              </button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAIAssist}
                disabled={aiLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                  bg-accent/10 border border-accent/30 text-[11px] font-semibold
                  text-accent hover:bg-accent/15 transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles size={12} className={aiLoading ? "animate-spin" : ""} />
                AI Assist
              </motion.button>
            </div>

            {/* Code editor */}
            <div className="flex-1 flex overflow-hidden bg-bg-primary">
              {/* Line numbers */}
              <div className="w-12 shrink-0 py-4 pr-2 text-right bg-bg-secondary/20 border-r border-border/20 overflow-hidden select-none">
                {Array.from({ length: Math.max(lineCount, 20) }, (_, i) => (
                  <div
                    key={i}
                    className="text-[13px] leading-[1.6] text-text-tertiary/50 font-mono"
                  >
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={active.code}
                onChange={(e) =>
                  updateSnippet(active.id, { code: e.target.value })
                }
                className="code-editor-area flex-1 p-4 min-h-full"
                placeholder="Start writing code..."
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-accent/20 to-accent/5
                flex items-center justify-center mb-5 border border-accent/10"
            >
              <Code2 size={36} className="text-accent" />
            </motion.div>
            <h2 className="text-[20px] font-bold text-text-primary mb-2">
              Code Studio
            </h2>
            <p className="text-[13px] text-text-tertiary mb-6 max-w-xs text-center">
              Create and organize code snippets. Open folders or send code to VS Code.
            </p>
            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => createSnippet()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl
                  bg-accent text-bg-primary text-[13px] font-semibold
                  shadow-lg shadow-accent/20 cursor-pointer hover:opacity-90 transition-all"
              >
                <Plus size={16} />
                New Snippet
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleOpenFolder}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl
                  bg-bg-secondary/60 border border-border/40 text-text-secondary text-[13px] font-semibold
                  cursor-pointer hover:text-text-primary hover:bg-bg-hover transition-all"
              >
                <FolderOpen size={16} />
                Open Folder
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
