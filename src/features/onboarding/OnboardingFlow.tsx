import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useThemeStore } from "@/stores/themeStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { listOllamaModels, checkOllamaStatus } from "@/lib/ollama";
import { LANGUAGES, ALL_MODULES, DEFAULT_MODULES } from "@/types/settings";
import {
  Sun, Moon, Monitor, ChevronRight, ChevronLeft, Bot, Wifi, WifiOff,
  Sparkles, Check, Globe, Zap, StickyNote, CheckSquare, Calendar, Timer,
  Code2, HardDrive, Columns3, PenTool, Mic, Leaf, Coffee, Waves, Flower2, Plus,
} from "lucide-react";
import type { OllamaModel } from "@/types/ai";
import { Logo } from "@/components/ui/Logo";

const ICON_MAP: Record<string, any> = {
  StickyNote, CheckSquare, Calendar, Timer, Sparkles, Code2, HardDrive,
  Columns3, PenTool, Mic, Globe,
};

const STEPS = 4;

export function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const { theme, setTheme } = useThemeStore();
  const { language, ai_model, ai_enabled, ai_provider, setSetting, completeOnboarding } = useSettingsStore();

  const [selectedLang, setSelectedLang] = useState(language);
  const [selectedModel, setSelectedModel] = useState(ai_model);
  const [selectedModules, setSelectedModules] = useState<string[]>([...DEFAULT_MODULES]);
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [ollamaOnline, setOllamaOnline] = useState(false);

  useEffect(() => {
    checkOllamaStatus().then(setOllamaOnline);
    listOllamaModels().then(setModels);
  }, []);

  const toggleModule = (id: string) => {
    setSelectedModules(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const next = () => { if (step < STEPS - 1) { setDirection(1); setStep(step + 1); } };
  const prev = () => { if (step > 0) { setDirection(-1); setStep(step - 1); } };

  const finish = async () => {
    await setSetting("language", selectedLang);
    await setSetting("ai_model", selectedModel);
    await setSetting("enabled_modules", selectedModules);
    await completeOnboarding();
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 100 : -100, filter: "blur(10px)", opacity: 0 }),
    center: { x: 0, opacity: 1, filter: "blur(0px)" },
    exit: (dir: number) => ({ x: dir > 0 ? -100 : 100, filter: "blur(10px)", opacity: 0 }),
  };

  const groups = [
    { key: "core", label: "Core" },
    { key: "create", label: "Create" },
    { key: "workspace", label: "Workspace" },
    { key: "media", label: "Media" },
    { key: "system", label: "System" },
  ];

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-bg-primary overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/15 rounded-full blur-[120px]" />
        <motion.div animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-xl bg-bg-secondary/40 backdrop-blur-3xl
          border border-border/40 rounded-[32px] shadow-2xl overflow-hidden flex flex-col">

        <div className="flex gap-1 p-1 px-10 pt-8">
          {Array.from({ length: STEPS }).map((_, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full bg-border/20 overflow-hidden">
              <motion.div className="h-full bg-accent" initial={false}
                animate={{ x: i <= step ? "0%" : "-100%" }} transition={{ duration: 0.4 }} />
            </div>
          ))}
        </div>

        <div className="px-10 py-10 min-h-[500px] flex flex-col">
          <AnimatePresence mode="wait" custom={direction}>
            {/* Step 0: Theme */}
            {step === 0 && (
              <motion.div key="theme" custom={direction} variants={variants}
                initial="enter" animate="center" exit="exit" className="flex-1 flex flex-col">
                <div className="flex items-center gap-4 mb-8">
                  <motion.div
                    initial={{ rotate: -10, scale: 0.8 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 12 }}
                    className="p-3 rounded-2xl bg-accent shadow-xl shadow-accent/30">
                    <Logo size={40} />
                  </motion.div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent/70">Welcome to Delay</p>
                    <h1 className="text-[26px] font-extrabold text-text-primary tracking-tight leading-tight mt-0.5">Pick a look you'll love</h1>
                    <p className="text-[13px] text-text-tertiary font-medium">Six themes built for long sessions. Change anytime.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 flex-1">
                  {[
                    { value: "light" as const, icon: <Sun size={24} />, label: "Aura Light", desc: "Clean & Bright" },
                    { value: "dark" as const, icon: <Moon size={24} />, label: "Obsidian", desc: "Sleek & Deep" },
                    { value: "forest" as const, icon: <Leaf size={24} />, label: "Forest", desc: "Natural & Calm" },
                    { value: "mocha" as const, icon: <Coffee size={24} />, label: "Mocha", desc: "Warm & Cozy" },
                    { value: "ocean" as const, icon: <Waves size={24} />, label: "Ocean", desc: "Cool & Fluid" },
                    { value: "rose" as const, icon: <Flower2 size={24} />, label: "Rosé", desc: "Soft & Vibrant" },
                    { value: "system" as const, icon: <Monitor size={24} />, label: "Automatic", desc: "Follow OS" },
                  ].map((opt) => (
                    <motion.button key={opt.value} whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setTheme(opt.value)}
                      className={`flex flex-col items-center justify-center p-4 md:p-6 rounded-3xl border-2 transition-all cursor-pointer relative
                        ${theme === opt.value ? "border-accent bg-accent/5 text-accent shadow-xl shadow-accent/5" : "border-border/40 bg-bg-secondary/20 text-text-secondary hover:border-border"}`}>
                      <div className={`mb-3 md:mb-4 p-2.5 md:p-3 rounded-2xl ${theme === opt.value ? "bg-accent text-white shadow-lg" : "bg-bg-hover text-text-tertiary"}`}>{opt.icon}</div>
                      <span className="text-[14px] font-bold mb-1">{opt.label}</span>
                      <span className="text-[11px] opacity-60 font-medium">{opt.desc}</span>
                      {theme === opt.value && (<motion.div layoutId="check" className="absolute top-3 right-3 text-accent"><Check size={18} strokeWidth={3} /></motion.div>)}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 1: Language */}
            {step === 1 && (
              <motion.div key="language" custom={direction} variants={variants}
                initial="enter" animate="center" exit="exit" className="flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-bg-hover text-accent"><Globe size={24} /></div>
                  <div>
                    <h2 className="text-[22px] font-bold text-text-primary tracking-tight">What's your language?</h2>
                    <p className="text-[12px] text-text-tertiary">We'll match the UI and voice prompts.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[320px] pr-2 custom-scrollbar">
                  {LANGUAGES.map((lang) => (
                    <motion.button key={lang.code} whileHover={{ x: 4 }}
                      onClick={() => setSelectedLang(lang.code)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer
                        ${selectedLang === lang.code ? "bg-accent/10 border-accent/30" : "bg-bg-secondary/10 border-transparent hover:border-border/40"}`}>
                      <div className="flex items-center gap-4 text-left">
                        <div className="text-2xl">{lang.code === "en" ? "🇺🇸" : lang.code === "ru" ? "🇷🇺" : lang.code === "es" ? "🇪🇸" : lang.code === "uz" ? "🇺🇿" : "🌐"}</div>
                        <div>
                          <p className={`text-[15px] font-bold ${selectedLang === lang.code ? "text-accent" : "text-text-primary"}`}>{lang.name}</p>
                          <p className="text-[12px] text-text-tertiary font-medium">{lang.native}</p>
                        </div>
                      </div>
                      {selectedLang === lang.code && <Check size={18} className="text-accent" strokeWidth={3} />}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Module selection */}
            {step === 2 && (
              <motion.div key="modules" custom={direction} variants={variants}
                initial="enter" animate="center" exit="exit" className="flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-accent text-white shadow-lg shadow-accent/20"><Columns3 size={24} /></div>
                  <div>
                    <h2 className="text-[22px] font-bold text-text-primary tracking-tight">Build your workspace</h2>
                    <p className="text-[13px] text-text-tertiary">Pick what you'll actually use. Hide the rest — toggle anytime from the <Plus size={11} className="inline mb-0.5" /> menu.</p>
                  </div>
                </div>
                <div className="overflow-y-auto max-h-[360px] pr-2 custom-scrollbar space-y-4">
                  {groups.map(g => {
                    const mods = ALL_MODULES.filter(m => m.group === g.key);
                    if (mods.length === 0) return null;
                    return (
                      <div key={g.key}>
                        <p className="text-[10px] font-extrabold text-text-tertiary uppercase tracking-widest mb-2 px-1">{g.label}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {mods.map(m => {
                            const Icon = ICON_MAP[m.icon] || Sparkles;
                            const enabled = selectedModules.includes(m.id);
                            return (
                              <button key={m.id} onClick={() => toggleModule(m.id)}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer
                                  ${enabled ? "bg-accent/8 border-accent/30" : "bg-bg-secondary/10 border-transparent hover:border-border/30"}`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${enabled ? "bg-accent text-white" : "bg-bg-hover text-text-tertiary"}`}>
                                  <Icon size={15} />
                                </div>
                                <div className="text-left flex-1">
                                  <p className={`text-[12px] font-bold ${enabled ? "text-accent" : "text-text-primary"}`}>{m.label}</p>
                                  <p className="text-[10px] text-text-tertiary">{m.desc}</p>
                                </div>
                                {enabled && <Check size={14} className="text-accent" strokeWidth={3} />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 3: AI */}
            {step === 3 && (
              <motion.div key="ai" custom={direction} variants={variants}
                initial="enter" animate="center" exit="exit" className="flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-accent text-white shadow-lg shadow-accent/20"><Sparkles size={24} /></div>
                  <div>
                    <h2 className="text-[22px] font-bold text-text-primary tracking-tight">Connect AI <span className="text-text-tertiary font-medium text-[13px] align-middle">(optional)</span></h2>
                    <p className="text-[12px] text-text-tertiary">Pick a model now, or skip and configure later in Settings.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 overflow-y-auto max-h-[220px] pr-2 custom-scrollbar">
                  <div className="space-y-4">
                    <p className="text-[14px] font-bold text-text-primary">Do you want to use AI?</p>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setSetting("ai_enabled", true)} className={`flex-1 py-3 rounded-xl border font-bold text-[13px] ${ai_enabled ? "bg-accent text-white border-accent" : "bg-bg-secondary/40 text-text-secondary border-border/40 hover:border-accent/40"}`}>Yes, Enable AI</button>
                      <button onClick={() => { setSetting("ai_enabled", false); setSelectedModel("none"); }} className={`flex-1 py-3 rounded-xl border font-bold text-[13px] ${!ai_enabled ? "bg-danger text-white border-danger" : "bg-bg-secondary/40 text-text-secondary border-border/40 hover:border-danger/40"}`}>No, Disable AI</button>
                    </div>

                    {ai_enabled && (
                      <div className="space-y-3 pt-4 border-t border-border/20">
                        <label className="text-[12px] font-bold text-text-tertiary">Select Provider</label>
                        <select onChange={(e) => {
                          const val = e.target.value as any;
                          setSetting("ai_provider", val);
                          if (val === "openrouter") setSelectedModel("liquid/lfm-40b");
                        }} value={ai_provider} className="w-full bg-bg-secondary px-3 py-2.5 rounded-xl border border-border/40 text-[13px] outline-none">
                          <option value="openrouter">OpenRouter (Cloud)</option>
                          <option value="ollama">Ollama (Local)</option>
                        </select>
                        
                        {ai_provider !== "ollama" && (
                          <div>
                            <label className="text-[12px] font-bold text-text-tertiary">API Key</label>
                            <input 
                              type="password" 
                              placeholder={`Enter ${ai_provider} API Key`}
                              onChange={(e) => setSetting("api_key_openrouter", e.target.value)}
                              className="w-full mt-1 bg-bg-secondary px-3 py-2.5 rounded-xl border border-border/40 text-[13px] outline-none"
                            />
                          </div>
                        )}
                        {ai_provider === "ollama" && (
                          <div>
                            <label className="text-[12px] font-bold text-text-tertiary">Select Local Model</label>
                            <select onChange={(e) => setSelectedModel(e.target.value)} className="w-full mt-1 bg-bg-secondary px-3 py-2.5 rounded-xl border border-border/40 text-[13px] outline-none">
                              {models.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                            </select>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between mt-auto pt-8">
            <button onClick={prev} disabled={step === 0}
              className={`flex items-center gap-2 px-4 py-2 text-[14px] font-bold transition-all cursor-pointer
                ${step === 0 ? "opacity-0 pointer-events-none" : "text-text-tertiary hover:text-text-primary"}`}>
              <ChevronLeft size={18} /> Back
            </button>
            <div className="flex gap-2">
              {Array.from({ length: STEPS }).map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-6 bg-accent" : "bg-border/40"}`} />
              ))}
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={step === STEPS - 1 ? finish : next}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-[14px] font-bold bg-accent text-bg-primary shadow-xl shadow-accent/30 hover:opacity-90 transition-all cursor-pointer">
              {step === STEPS - 1 ? "Start Journey" : "Next Step"}
              {step < STEPS - 1 && <ChevronRight size={18} />}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ModelItem({ name, desc, selected, isCloud, onClick }: any) {
  return (
    <button onClick={onClick}
      className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer
        ${selected ? "bg-accent/10 border-accent/40 shadow-sm" : "bg-bg-secondary/10 border-transparent hover:border-border/40"}`}>
      <div className="flex items-center gap-4 text-left">
        <div className={`p-2 rounded-xl ${selected ? "bg-accent text-white" : "bg-bg-hover text-text-tertiary"}`}>
          {isCloud ? <Zap size={18} /> : <Bot size={18} />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className={`text-[14px] font-bold ${selected ? "text-accent" : "text-text-primary"}`}>{name}</p>
            {isCloud && <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-accent/20 text-accent font-black uppercase">Cloud</span>}
          </div>
          <p className="text-[11px] text-text-tertiary font-medium">{desc}</p>
        </div>
      </div>
      {selected && <Check size={18} className="text-accent" strokeWidth={3} />}
    </button>
  );
}
