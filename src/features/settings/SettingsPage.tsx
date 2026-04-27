import { useState, useEffect } from "react";
import { useThemeStore } from "@/stores/themeStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useAIStore } from "@/stores/aiStore";
import { useUpdaterStore } from "@/stores/updaterStore";
import { listOllamaModels, checkOllamaStatus } from "@/lib/ollama";
import { motion, AnimatePresence } from "motion/react";
import {
  Sun,
  Moon,
  Monitor,
  Bot,
  Languages,
  Info,
  Wifi,
  WifiOff,
  ChevronRight,
  Check,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { db } from "@/lib/database";
import { LANGUAGES } from "@/types/settings";
import type { OllamaModel } from "@/types/ai";
import { Logo } from "@/components/ui/Logo";
import { useT } from "@/lib/i18n";

export function SettingsPage() {
  const { theme, setTheme, customBgData, setCustomBg } = useThemeStore();
  const { language, ai_model, setSetting } = useSettingsStore();
  const { setModel } = useAIStore();
  const {
    status,
    version: updateVersion,
    percent,
    error: updateError,
    currentVersion,
    init: initUpdater,
    checkForUpdates,
    downloadUpdate,
    quitAndInstall,
  } = useUpdaterStore();

  const [models, setModels] = useState<OllamaModel[]>([]);
  const [ollamaOnline, setOllamaOnline] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [pendingLang, setPendingLang] = useState<string | null>(null);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  const [wiping, setWiping] = useState(false);
  const t = useT();

  const wipeAllData = async () => {
    setWiping(true);
    try {
      await Promise.all([
        db.notes.clear(),
        db.tasks.clear(),
        db.taskLists.clear(),
        db.events.clear(),
        db.aiConversations.clear(),
        db.aiMessages.clear(),
        db.memories.clear(),
        db.settings.clear(),
      ]);
      localStorage.clear();
    } catch (e) {
      console.error(e);
    }
    window.electronAPI?.relaunch?.();
    window.location.reload();
  };

  useEffect(() => {
    checkOllamaStatus().then(setOllamaOnline);
    listOllamaModels().then(setModels);
    initUpdater();
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === language);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-8 py-10">
        <motion.h1
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[28px] font-bold text-text-primary mb-1 tracking-[-0.02em]"
        >
          {t("settings.title")}
        </motion.h1>
        <p className="text-[13px] text-text-tertiary mb-8">
          {t("settings.subtitle")}
        </p>

        <Section title={t("settings.appearance")} icon={<Sun size={18} />}>
          <div className="grid grid-cols-3 gap-2.5">
            {(
              [
                { value: "light" as const, icon: <Sun size={18} />, label: "Light" },
                { value: "dark" as const, icon: <Moon size={18} />, label: "Dark" },
                { value: "system" as const, icon: <Monitor size={18} />, label: "System" },
              ]
            ).map((opt) => (
              <motion.button
                key={opt.value}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setTheme(opt.value)}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                  border transition-all cursor-pointer text-[13px] font-medium
                  ${
                    theme === opt.value
                      ? "border-accent/60 bg-accent/10 text-accent shadow-[0_4px_16px_rgba(0,122,255,0.15)]"
                      : "border-border bg-bg-secondary/50 text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                  }`}
              >
                {opt.icon}
                {opt.label}
              </motion.button>
            ))}
          </div>
          
          <div className="mt-4 p-4 rounded-xl bg-bg-secondary/50 border border-border border-dashed flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-text-primary">Custom Background</p>
              <p className="text-[11px] text-text-tertiary mt-0.5">Upload a local image (Base64) to use as the app wallpaper</p>
            </div>
            <div className="flex items-center gap-2">
              {customBgData && (
                <button 
                  onClick={() => setCustomBg(null)} 
                  className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-danger bg-danger/10 hover:bg-danger/20 transition-colors"
                >
                  Remove
                </button>
              )}
              <label className="px-4 py-1.5 rounded-lg bg-bg-hover border border-border/80 text-[12px] font-medium hover:bg-bg-active cursor-pointer transition-colors block">
                {customBgData ? "Change Image" : "Upload Image"}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      if (event.target?.result) setCustomBg(event.target.result as string);
                    };
                    reader.readAsDataURL(file);
                  }} 
                />
              </label>
            </div>
          </div>
        </Section>

        <Section title={t("settings.language")} icon={<Languages size={18} />}>
          <button
            onClick={() => setShowLangPicker(!showLangPicker)}
            className="w-full flex items-center justify-between px-4 py-3
              bg-bg-secondary rounded-xl border border-border-light
              text-[14px] text-text-primary hover:bg-bg-hover transition-colors cursor-pointer"
          >
            <span>
              {currentLang?.name} · {currentLang?.native}
            </span>
            <ChevronRight
              size={16}
              className={`text-text-tertiary transition-transform ${
                showLangPicker ? "rotate-90" : ""
              }`}
            />
          </button>
          <AnimatePresence>
            {showLangPicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 space-y-0.5 overflow-hidden"
              >
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setSetting("language", lang.code);
                      setShowLangPicker(false);
                      if (lang.code !== language) setPendingLang(lang.code);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5
                      rounded-lg text-[13px] transition-colors cursor-pointer
                      ${
                        language === lang.code
                          ? "bg-accent/10 text-accent font-medium"
                          : "text-text-secondary hover:bg-bg-hover"
                      }`}
                  >
                    <span>
                      {lang.name} — {lang.native}
                    </span>
                    {language === lang.code && <Check size={14} />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          {pendingLang && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center justify-between px-3.5 py-2.5 rounded-xl
                bg-accent/10 border border-accent/20 text-[12.5px] text-accent"
            >
              <span>{t("settings.restart_needed")}</span>
              <button
                onClick={() => window.electronAPI?.relaunch?.()}
                className="px-3 py-1.5 rounded-lg bg-accent text-white text-[12px] font-semibold cursor-pointer"
              >
                {t("settings.restart_now")}
              </button>
            </motion.div>
          )}
        </Section>

        <Section title={t("settings.ai_model")} icon={<Bot size={18} />}>
          <div
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12px] mb-3 w-fit
              ${
                ollamaOnline
                  ? "bg-success/10 text-success"
                  : "bg-warning/10 text-warning"
              }`}
          >
            {ollamaOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
            {ollamaOnline ? "Ollama connected" : "Ollama offline"}
          </div>

          <button
            onClick={() => setShowModelPicker(!showModelPicker)}
            className="w-full flex items-center justify-between px-4 py-3
              bg-bg-secondary rounded-xl border border-border-light
              text-[14px] text-text-primary hover:bg-bg-hover transition-colors cursor-pointer"
          >
            <span>{ai_model}</span>
            <ChevronRight
              size={16}
              className={`text-text-tertiary transition-transform ${
                showModelPicker ? "rotate-90" : ""
              }`}
            />
          </button>
          <AnimatePresence>
            {showModelPicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 space-y-0.5 overflow-hidden"
              >
                <ModelButton
                  name="glm-5:cloud"
                  selected={ai_model === "glm-5:cloud"}
                  isDefault
                  onClick={() => {
                    setSetting("ai_model", "glm-5:cloud");
                    setModel("glm-5:cloud");
                    setShowModelPicker(false);
                  }}
                />
                {models
                  .filter((m) => m.name !== "glm-5:cloud")
                  .map((m) => (
                    <ModelButton
                      key={m.name}
                      name={m.name}
                      selected={ai_model === m.name}
                      onClick={() => {
                        setSetting("ai_model", m.name);
                        setModel(m.name);
                        setShowModelPicker(false);
                      }}
                    />
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </Section>

        <Section title={t("settings.updates")} icon={<Download size={18} />}>
          <UpdatePanel
            status={status}
            currentVersion={currentVersion}
            version={updateVersion}
            percent={percent}
            error={updateError}
            onCheck={checkForUpdates}
            onDownload={downloadUpdate}
            onInstall={quitAndInstall}
          />
        </Section>

        <Section title={t("settings.danger_zone")} icon={<AlertTriangle size={18} />}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-[14px] font-medium text-text-primary">
                {t("settings.wipe_title")}
              </p>
              <p className="text-[12px] text-text-tertiary mt-0.5">
                {t("settings.wipe_sub")}
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowWipeConfirm(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg
                bg-danger/10 hover:bg-danger/15 border border-danger/30
                text-[13px] font-medium text-danger transition-colors cursor-pointer shrink-0"
            >
              <Trash2 size={14} />
              {t("settings.wipe_button")}
            </motion.button>
          </div>

          <AnimatePresence>
            {showWipeConfirm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 p-4 rounded-xl bg-danger/10 border border-danger/30">
                  <div className="flex items-start gap-2 mb-3">
                    <AlertTriangle size={16} className="text-danger mt-0.5 shrink-0" />
                    <p className="text-[13px] text-danger">
                      {t("settings.wipe_confirm")}
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowWipeConfirm(false)}
                      disabled={wiping}
                      className="px-3 py-1.5 rounded-lg bg-bg-secondary
                        text-[12px] font-medium text-text-primary cursor-pointer
                        hover:bg-bg-hover transition-colors"
                    >
                      {t("common.cancel")}
                    </button>
                    <button
                      onClick={wipeAllData}
                      disabled={wiping}
                      className="px-3 py-1.5 rounded-lg bg-danger text-white
                        text-[12px] font-semibold cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      {wiping ? t("settings.wipe_running") : t("settings.wipe_confirm_button")}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Section>

        <Section title={t("settings.about")} icon={<Info size={18} />}>
          <div className="flex items-center gap-4">
            <Logo size={56} />
            <div className="flex-1">
              <h3 className="text-[17px] font-semibold text-text-primary tracking-[-0.01em]">
                Delay
              </h3>
              <p className="text-[12px] text-text-secondary">
                Version {currentVersion}
              </p>
              <p className="text-[12px] text-text-tertiary mt-0.5">
                Notes, tasks, calendar & AI — beautifully organized.
              </p>
            </div>
            <a
              href="https://github.com/AzizX-coder/Delay"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                bg-bg-secondary hover:bg-bg-hover border border-border-light
                text-[12px] text-text-secondary hover:text-text-primary
                transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.38-3.88-1.38-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.35.78 1.05.78 2.12v3.14c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5z"/>
              </svg>
              GitHub
            </a>
          </div>
        </Section>
      </div>
    </div>
  );
}

function UpdatePanel({
  status,
  currentVersion,
  version,
  percent,
  error,
  onCheck,
  onDownload,
  onInstall,
}: {
  status: string;
  currentVersion: string;
  version: string | null;
  percent: number;
  error: string | null;
  onCheck: () => void;
  onDownload: () => void;
  onInstall: () => void;
}) {
  const isChecking = status === "checking";
  const isDownloading = status === "downloading";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[14px] font-medium text-text-primary">
            You're on version {currentVersion}
          </p>
          <p className="text-[12px] text-text-tertiary">
            {statusMessage(status, version)}
          </p>
        </div>

        {status === "available" && (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onDownload}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg
              bg-accent text-white text-[13px] font-medium
              hover:bg-accent-hover transition-colors cursor-pointer"
          >
            <Download size={14} />
            Download
          </motion.button>
        )}

        {status === "downloaded" && (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onInstall}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg
              bg-success text-white text-[13px] font-medium
              hover:opacity-90 transition-opacity cursor-pointer"
          >
            <CheckCircle2 size={14} />
            Install &amp; restart
          </motion.button>
        )}

        {(status === "idle" ||
          status === "not-available" ||
          status === "error") && (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onCheck}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg
              bg-bg-secondary hover:bg-bg-hover border border-border-light
              text-[13px] text-text-primary transition-colors cursor-pointer"
          >
            <RefreshCw size={14} />
            Check for updates
          </motion.button>
        )}

        {isChecking && (
          <div className="flex items-center gap-1.5 px-4 py-2 text-[13px] text-text-secondary">
            <RefreshCw size={14} className="animate-spin" />
            Checking…
          </div>
        )}
      </div>

      {isDownloading && (
        <div className="w-full">
          <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ type: "tween", duration: 0.3 }}
            />
          </div>
          <p className="text-[11px] text-text-tertiary mt-1.5">
            Downloading… {percent}%
          </p>
        </div>
      )}

      {status === "error" && error && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-danger/10 text-danger text-[12px]">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span className="break-all">{error}</span>
        </div>
      )}
    </div>
  );
}

function statusMessage(status: string, version: string | null) {
  switch (status) {
    case "checking":
      return "Checking for updates…";
    case "available":
      return `Version ${version ?? "?"} is available`;
    case "not-available":
      return "You're up to date.";
    case "downloading":
      return "Downloading the latest version…";
    case "downloaded":
      return `Version ${version ?? "?"} is ready to install`;
    case "error":
      return "Something went wrong.";
    default:
      return "Automatic updates enabled.";
  }
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="text-text-tertiary">{icon}</span>
        <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider">
          {title}
        </h2>
      </div>
      <div
        className="bg-bg-glass-heavy backdrop-blur-xl rounded-2xl border border-border-light
          p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_28px_rgba(0,0,0,0.06)]"
      >
        {children}
      </div>
    </div>
  );
}

function ModelButton({
  name,
  selected,
  isDefault,
  onClick,
}: {
  name: string;
  selected: boolean;
  isDefault?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-2.5
        rounded-lg text-[13px] transition-colors cursor-pointer
        ${
          selected
            ? "bg-accent/10 text-accent font-medium"
            : "text-text-secondary hover:bg-bg-hover"
        }`}
    >
      <span className="flex items-center gap-2">
        {name}
        {isDefault && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/15 text-accent">
            Default
          </span>
        )}
      </span>
      {selected && <Check size={14} />}
    </button>
  );
}
