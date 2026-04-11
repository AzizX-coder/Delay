import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useThemeStore } from "@/stores/themeStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { listOllamaModels, checkOllamaStatus } from "@/lib/ollama";
import { LANGUAGES } from "@/types/settings";
import {
  Sun,
  Moon,
  Monitor,
  ChevronRight,
  ChevronLeft,
  Bot,
  Wifi,
  WifiOff,
  Sparkles,
  Check,
} from "lucide-react";
import type { OllamaModel } from "@/types/ai";
import { Logo } from "@/components/ui/Logo";

const STEPS = 3;

export function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const { theme, setTheme } = useThemeStore();
  const { language, ai_model, setSetting, completeOnboarding } =
    useSettingsStore();

  const [selectedLang, setSelectedLang] = useState(language);
  const [selectedModel, setSelectedModel] = useState(ai_model);
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [ollamaOnline, setOllamaOnline] = useState(false);

  useEffect(() => {
    checkOllamaStatus().then(setOllamaOnline);
    listOllamaModels().then(setModels);
  }, []);

  const next = () => {
    if (step < STEPS - 1) {
      setDirection(1);
      setStep(step + 1);
    }
  };

  const prev = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const finish = async () => {
    await setSetting("language", selectedLang);
    await setSetting("ai_model", selectedModel);
    await completeOnboarding();
  };

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 200 : -200,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir > 0 ? -200 : 200,
      opacity: 0,
    }),
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-bg-primary">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#AF52DE]/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative w-full max-w-lg bg-bg-glass-heavy backdrop-blur-xl
          border border-border-light rounded-[--radius-2xl]
          shadow-[0_8px_60px_var(--color-shadow-lg)] overflow-hidden"
      >
        {/* Progress bar */}
        <div className="h-1 bg-bg-secondary">
          <motion.div
            className="h-full bg-accent rounded-full"
            animate={{ width: `${((step + 1) / STEPS) * 100}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>

        <div className="px-10 py-8 min-h-[460px] flex flex-col">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 0 && (
              <motion.div
                key="theme"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex-1 flex flex-col"
              >
                {/* Logo */}
                <div className="flex items-center gap-3 mb-6">
                  <Logo size={40} />
                  <div>
                    <h1 className="text-[22px] font-bold text-text-primary">
                      Welcome to Delay
                    </h1>
                    <p className="text-[13px] text-text-secondary">
                      Your personal productivity companion
                    </p>
                  </div>
                </div>

                <p className="text-[14px] text-text-secondary mb-6">
                  Choose your preferred appearance
                </p>

                <div className="grid grid-cols-3 gap-3 flex-1">
                  {([
                    { value: "light" as const, icon: <Sun size={22} />, label: "Light" },
                    { value: "dark" as const, icon: <Moon size={22} />, label: "Dark" },
                    { value: "system" as const, icon: <Monitor size={22} />, label: "System" },
                  ]).map((opt) => (
                    <motion.button
                      key={opt.value}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setTheme(opt.value)}
                      className={`flex flex-col items-center justify-center gap-3 py-6
                        rounded-[--radius-lg] border-2 transition-colors cursor-pointer
                        ${
                          theme === opt.value
                            ? "border-accent bg-accent/8 text-accent"
                            : "border-border bg-bg-secondary/50 text-text-secondary hover:border-border"
                        }`}
                    >
                      {opt.icon}
                      <span className="text-[13px] font-medium">{opt.label}</span>
                      {theme === opt.value && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-5 h-5 rounded-full bg-accent flex items-center justify-center"
                        >
                          <Check size={12} className="text-white" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="language"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex-1 flex flex-col"
              >
                <h2 className="text-[20px] font-bold text-text-primary mb-1">
                  Choose your language
                </h2>
                <p className="text-[14px] text-text-secondary mb-5">
                  Select the language you'd like to use
                </p>

                <div className="flex-1 overflow-y-auto space-y-1 max-h-[300px] pr-1">
                  {LANGUAGES.map((lang) => (
                    <motion.button
                      key={lang.code}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedLang(lang.code)}
                      className={`w-full flex items-center justify-between px-4 py-3
                        rounded-[--radius-md] transition-colors cursor-pointer
                        ${
                          selectedLang === lang.code
                            ? "bg-accent/10 border border-accent/20"
                            : "hover:bg-bg-hover border border-transparent"
                        }`}
                    >
                      <div className="text-left">
                        <p
                          className={`text-[14px] font-medium ${
                            selectedLang === lang.code
                              ? "text-accent"
                              : "text-text-primary"
                          }`}
                        >
                          {lang.name}
                        </p>
                        <p className="text-[12px] text-text-tertiary">
                          {lang.native}
                        </p>
                      </div>
                      {selectedLang === lang.code && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-5 h-5 rounded-full bg-accent flex items-center justify-center"
                        >
                          <Check size={12} className="text-white" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="ai"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex-1 flex flex-col"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={20} className="text-accent" />
                  <h2 className="text-[20px] font-bold text-text-primary">
                    AI Assistant
                  </h2>
                </div>
                <p className="text-[14px] text-text-secondary mb-4">
                  Connect to Ollama and choose your AI model
                </p>

                {/* Status */}
                <div
                  className={`flex items-center gap-2 px-4 py-3 rounded-[--radius-md] mb-4
                    ${
                      ollamaOnline
                        ? "bg-success/10 text-success"
                        : "bg-warning/10 text-warning"
                    }`}
                >
                  {ollamaOnline ? (
                    <Wifi size={16} />
                  ) : (
                    <WifiOff size={16} />
                  )}
                  <div>
                    <p className="text-[13px] font-medium">
                      {ollamaOnline
                        ? "Ollama is running"
                        : "Ollama is not detected"}
                    </p>
                    {!ollamaOnline && (
                      <p className="text-[12px] opacity-80">
                        You can set this up later in Settings
                      </p>
                    )}
                  </div>
                </div>

                {/* Model list */}
                <div className="flex-1 overflow-y-auto space-y-1 max-h-[240px] pr-1">
                  {/* Default model */}
                  <ModelOption
                    name="glm-5:cloud"
                    selected={selectedModel === "glm-5:cloud"}
                    isDefault
                    onClick={() => setSelectedModel("glm-5:cloud")}
                  />
                  {models
                    .filter((m) => m.name !== "glm-5:cloud")
                    .map((m) => (
                      <ModelOption
                        key={m.name}
                        name={m.name}
                        selected={selectedModel === m.name}
                        onClick={() => setSelectedModel(m.name)}
                      />
                    ))}
                  {models.length === 0 && !ollamaOnline && (
                    <div className="flex flex-col items-center py-8 text-text-tertiary">
                      <Bot size={24} />
                      <p className="text-[13px] mt-2">
                        Models will appear when Ollama is running
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border-light">
            <button
              onClick={prev}
              disabled={step === 0}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px]
                font-medium transition-colors cursor-pointer
                ${
                  step === 0
                    ? "opacity-0 pointer-events-none"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
                }`}
            >
              <ChevronLeft size={16} />
              Back
            </button>

            {/* Step indicators */}
            <div className="flex items-center gap-2">
              {Array.from({ length: STEPS }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300
                    ${
                      i === step
                        ? "w-6 bg-accent"
                        : i < step
                        ? "w-1.5 bg-accent/50"
                        : "w-1.5 bg-border"
                    }`}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={step === STEPS - 1 ? finish : next}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[13px]
                font-semibold bg-accent text-white hover:bg-accent-hover
                transition-colors cursor-pointer shadow-sm"
            >
              {step === STEPS - 1 ? "Get Started" : "Continue"}
              {step < STEPS - 1 && <ChevronRight size={16} />}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ModelOption({
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
    <motion.button
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3
        rounded-[--radius-md] transition-colors cursor-pointer
        ${
          selected
            ? "bg-accent/10 border border-accent/20"
            : "hover:bg-bg-hover border border-transparent"
        }`}
    >
      <div className="flex items-center gap-2.5">
        <Bot
          size={16}
          className={selected ? "text-accent" : "text-text-tertiary"}
        />
        <span
          className={`text-[14px] ${
            selected ? "text-accent font-medium" : "text-text-primary"
          }`}
        >
          {name}
        </span>
        {isDefault && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/15 text-accent font-medium">
            Default
          </span>
        )}
      </div>
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-5 h-5 rounded-full bg-accent flex items-center justify-center"
        >
          <Check size={12} className="text-white" />
        </motion.div>
      )}
    </motion.button>
  );
}
