import { useEffect, useState, useRef } from "react";
import { useAIStore } from "@/stores/aiStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { listOllamaModels, checkOllamaStatus } from "@/lib/ollama";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Send,
  Square,
  Bot,
  User,
  Trash2,
  ChevronDown,
  Wifi,
  WifiOff,
  MessageSquare,
} from "lucide-react";
import type { OllamaModel } from "@/types/ai";

export function AIChatPage() {
  const {
    conversations,
    activeConversationId,
    messages,
    isStreaming,
    streamingContent,
    model,
    loadConversations,
    createConversation,
    deleteConversation,
    setActiveConversation,
    sendMessage,
    setModel,
    stopStreaming,
  } = useAIStore();

  const [input, setInput] = useState("");
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [ollamaOnline, setOllamaOnline] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadConversations();
    checkOllamaStatus().then(setOllamaOnline);
    listOllamaModels().then(setModels);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input.trim());
    setInput("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full">
      {/* Conversations sidebar */}
      <div className="w-64 h-full flex flex-col border-r border-border-light bg-bg-secondary/30">
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-semibold text-text-primary">
              AI Chat
            </h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={createConversation}
              className="w-7 h-7 flex items-center justify-center rounded-lg
                bg-accent text-text-inverse cursor-pointer
                hover:bg-accent-hover transition-colors"
            >
              <Plus size={16} />
            </motion.button>
          </div>

          <div
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] mb-2 border border-border-light
              ${
                ollamaOnline
                  ? "bg-bg-primary text-text-secondary"
                  : "bg-danger/5 text-danger border-danger/10"
              }`}
          >
            {ollamaOnline ? <Wifi size={12} className="text-text-tertiary" /> : <WifiOff size={12} />}
            {ollamaOnline ? "Ollama Connected" : "Ollama Offline"}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2">
          <AnimatePresence mode="popLayout">
            {conversations.map((convo) => (
              <motion.div
                key={convo.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                onClick={() => setActiveConversation(convo.id)}
                className={`group flex items-center gap-2 px-2.5 py-2 mb-0.5
                  rounded-[--radius-sm] cursor-pointer transition-colors
                  ${
                    activeConversationId === convo.id
                      ? "bg-accent/10 text-accent"
                      : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                  }`}
              >
                <MessageSquare size={14} className="shrink-0" />
                <span className="text-[13px] truncate flex-1">
                  {convo.title}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(convo.id);
                  }}
                  className="hidden group-hover:flex items-center justify-center w-5 h-5
                    rounded text-text-tertiary hover:text-danger transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {conversations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-text-tertiary">
              <Bot size={24} />
              <p className="text-[12px] mt-2">No conversations yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Model selector bar */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-border-light">
          <span className="text-[12px] text-text-tertiary">Model:</span>
          <div className="relative">
            <button
              onClick={() => setShowModelPicker(!showModelPicker)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                bg-bg-secondary border border-border-light text-[13px] font-medium
                text-text-primary hover:bg-bg-hover transition-colors cursor-pointer"
            >
              {model}
              <ChevronDown size={12} />
            </button>
            {showModelPicker && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 mt-1 w-64 max-h-48 overflow-y-auto
                  bg-bg-elevated border border-border rounded-xl shadow-lg z-20 p-1"
              >
                {models.length > 0 ? (
                  models.map((m) => (
                    <button
                      key={m.name}
                      onClick={() => {
                        setModel(m.name);
                        setShowModelPicker(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-[13px]
                        transition-colors cursor-pointer
                        ${
                          model === m.name
                            ? "bg-accent/10 text-accent font-medium"
                            : "text-text-secondary hover:bg-bg-hover"
                        }`}
                    >
                      {m.name}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-4 text-center text-[13px] text-text-tertiary">
                    {ollamaOnline
                      ? "No models found"
                      : "Ollama is offline"}
                  </div>
                )}
                {/* Always show default model option */}
                {!models.find((m) => m.name === "glm-5:cloud") && (
                  <button
                    onClick={() => {
                      setModel("glm-5:cloud");
                      setShowModelPicker(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-[13px]
                      transition-colors cursor-pointer
                      ${
                        model === "glm-5:cloud"
                          ? "bg-accent/10 text-accent font-medium"
                          : "text-text-secondary hover:bg-bg-hover"
                      }`}
                  >
                    glm-5:cloud (default)
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {messages.length === 0 && !isStreaming ? (
            <div className="h-full flex flex-col items-center justify-center text-text-tertiary">
              <div className="w-16 h-16 rounded-3xl bg-accent/10 flex items-center justify-center mb-4">
                <Bot size={28} className="text-accent" />
              </div>
              <p className="text-[16px] font-medium text-text-secondary">
                How can I help you?
              </p>
              <p className="text-[13px] mt-1 text-center max-w-sm">
                Ask me anything. I can help with writing, analysis,
                coding, brainstorming, and more.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "justify-end" : ""
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot size={14} className="text-accent" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed
                      ${
                        msg.role === "user"
                          ? "bg-text-primary text-text-inverse rounded-br-md"
                          : "bg-bg-secondary text-text-primary rounded-bl-md border border-border-light"
                      }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-full bg-bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                      <User size={14} className="text-text-secondary" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Streaming message */}
              {isStreaming && streamingContent && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={14} className="text-accent" />
                  </div>
                  <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-bl-md bg-bg-secondary text-text-primary text-[14px] leading-relaxed">
                    <div className="whitespace-pre-wrap">
                      {streamingContent}
                      <span className="inline-block w-1.5 h-4 bg-accent/60 animate-pulse ml-0.5 rounded-sm" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Loading indicator */}
              {isStreaming && !streamingContent && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                    <Bot size={14} className="text-accent" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-bg-secondary">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-text-tertiary"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            repeat: Infinity,
                            duration: 1,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="px-5 pb-4 pt-2">
          <div className="max-w-3xl mx-auto relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="w-full resize-none px-4 py-3 pr-12 bg-bg-secondary
                border border-border-light rounded-2xl text-[14px]
                text-text-primary placeholder:text-text-tertiary
                outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10
                transition-all max-h-32"
              style={{
                height: "auto",
                minHeight: "48px",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = Math.min(target.scrollHeight, 128) + "px";
              }}
              spellCheck={false}
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={isStreaming ? stopStreaming : handleSend}
              disabled={!isStreaming && !input.trim()}
              className={`absolute right-2.5 bottom-2.5 w-8 h-8 flex items-center justify-center
                rounded-xl transition-colors cursor-pointer
                disabled:opacity-30 disabled:cursor-not-allowed
                ${
                  isStreaming
                    ? "bg-danger text-white hover:bg-danger/80"
                    : "bg-accent text-white hover:bg-accent-hover"
                }`}
            >
              {isStreaming ? <Square size={14} /> : <Send size={14} />}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
