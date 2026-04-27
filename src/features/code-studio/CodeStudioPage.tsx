import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Editor } from "@monaco-editor/react";
import { useCodeStudioStore, LANGUAGES } from "@/stores/codeStudioStore";
import { useAIStore } from "@/stores/aiStore";
import { useThemeStore } from "@/stores/themeStore";
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
  Send,
  Loader2,
  X,
} from "lucide-react";

export function CodeStudioPage() {
  const {
    snippets,
    activeSnippetId,
    loading: snippetsLoading,
    loadSnippets,
    createSnippet,
    updateSnippet,
    deleteSnippet,
    setActiveSnippet,
  } = useCodeStudioStore();

  const { sendMessage, isStreaming } = useAIStore();
  const { resolved: themeResolved } = useThemeStore();
  
  const [copied, setCopied] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showAIInput, setShowAIInput] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const aiInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSnippets();
  }, []);

  useEffect(() => {
    if (showAIInput && aiInputRef.current) {
      aiInputRef.current.focus();
    }
  }, [showAIInput]);

  const active = snippets.find((s) => s.id === activeSnippetId);

  const handleCopy = async () => {
    if (!active) return;
    await navigator.clipboard.writeText(active.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAISubmit = async () => {
    if (!active || !aiInput.trim() || isStreaming) return;
    
    // Fire to the Agent using agent mode (mode=true)
    const prompt = `INSTRUCTION: Modifying user's active code snippet titled "${active.title}" (${active.language}).\nREQUEST: ${aiInput}\n\nCURRENT CODE:\n\`\`\`${active.language}\n${active.code}\n\`\`\`\n\nPlease output ONLY the modified code snippet wrapped in a codeblock without extra explanation, or use your tools if needed.`;
    
    sendMessage(prompt, true);
    setAiInput("");
    setShowAIInput(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAISubmit();
    }
    if (e.key === "Escape") {
      setShowAIInput(false);
    }
  };

  const handleOpenFolder = async () => {
    try {
      const dirHandle = await (window as any).showDirectoryPicker();
      const files: { name: string; content: string }[] = [];
      for await (const entry of dirHandle.values()) {
        if (entry.kind === "file") {
          const ext = entry.name.split(".").pop()?.toLowerCase() || "";
          const codeExts = ["js", "ts", "tsx", "jsx", "py", "html", "css", "json", "sql", "md", "sh", "rs", "go", "java", "c", "cpp", "h", "yml", "yaml", "toml", "txt", "cjs", "mjs"];
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
      for (const file of files.slice(0, 20)) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "";
        const langMap: Record<string, string> = {
          js: "javascript", ts: "typescript", tsx: "typescript", jsx: "javascript",
          py: "python", html: "html", css: "css", json: "json", sql: "sql",
          md: "markdown", sh: "shell", rs: "rust", go: "go", java: "java",
        };
        const lang = langMap[ext] || "plaintext";
        const id = await createSnippet(lang);
        await updateSnippet(id, { title: file.name, code: file.content });
      }
    } catch {}
  };

  const handleOpenInVSCode = () => {
    if (!active) return;
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.codeStudio?.openInVSCode) {
      electronAPI.codeStudio.openInVSCode(active.title, active.code, active.language);
    } else {
      navigator.clipboard.writeText(active.code);
      window.open(`vscode://file/untitled`, "_blank");
    }
  };

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

          {snippets.length === 0 && !snippetsLoading && (
            <div className="text-center py-8">
              <Code2 size={24} className="mx-auto mb-2 text-text-tertiary" />
              <p className="text-[12px] text-text-tertiary">No snippets yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-bg-primary">
        {active ? (
          <>
            {/* Editor toolbar */}
            <div className="flex z-10 items-center gap-3 px-5 py-2.5 border-b border-border/40 bg-bg-secondary/40 backdrop-blur-md">
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
                onClick={() => setShowAIInput(!showAIInput)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                  border text-[11px] font-semibold transition-all cursor-pointer
                  ${showAIInput || isStreaming ? 'bg-accent text-bg-primary border-accent/30' : 'bg-accent/10 text-accent border-accent/20 hover:bg-accent/20'}`}
              >
                {isStreaming ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Sparkles size={12} />
                )}
                Agent
              </motion.button>
            </div>

            {/* Monaco Editor area */}
            <div className="flex-1 relative">
              <Editor
                height="100%"
                language={active.language}
                theme={themeResolved === "dark" ? "vs-dark" : "light"}
                value={active.code}
                onChange={(val) => updateSnippet(active.id, { code: val || "" })}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: "on",
                  fontFamily: "var(--font-mono, 'JetBrains Mono', 'Fira Code', monospace)",
                  padding: { top: 16 },
                  scrollBeyondLastLine: false,
                  lineNumbersMinChars: 4,
                  scrollbar: {
                    verticalScrollbarSize: 8,
                    horizontalScrollbarSize: 8,
                  },
                }}
              />

              {/* Centered Floating AI Prompt */}
              <AnimatePresence>
                {showAIInput && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-lg z-20"
                  >
                    <div className="overflow-hidden rounded-2xl bg-bg-elevated border border-border shadow-2xl backdrop-blur-xl">
                      <div className="flex items-center gap-2 p-1.5">
                        <div className="pl-3 py-2 flex items-center justify-center text-accent shrink-0">
                          <Sparkles size={16} />
                        </div>
                        <input
                          ref={aiInputRef}
                          value={aiInput}
                          onChange={(e) => setAiInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          disabled={isStreaming}
                          placeholder="Ask the agent to edit or explain this code..."
                          className="flex-1 bg-transparent py-2.5 text-[13px] text-text-primary 
                            placeholder:text-text-tertiary outline-none min-w-0 disabled:opacity-50"
                        />
                        <div className="flex items-center gap-1 pr-1.5 shrink-0">
                          <button
                            onClick={handleAISubmit}
                            disabled={!aiInput.trim() || isStreaming}
                            className="w-8 h-8 rounded-xl flex items-center justify-center
                              bg-accent text-bg-primary hover:opacity-90 transition-all
                              disabled:bg-bg-hover disabled:text-text-tertiary cursor-pointer"
                          >
                            {isStreaming ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                          </button>
                          <button
                            onClick={() => setShowAIInput(false)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center
                              text-text-tertiary hover:bg-bg-hover hover:text-text-primary transition-all cursor-pointer"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
