export interface AppSettings {
  theme: "light" | "dark" | "system";
  language: string;
  ai_model: string;
  onboarding_completed: boolean;
  sidebar_collapsed: boolean;
  enabled_modules: string[];
}

export const ALL_MODULES = [
  { id: "notes",       label: "Notes",         icon: "StickyNote",     group: "core",      desc: "Quick capture & rich text" },
  { id: "tasks",       label: "Tasks",         icon: "CheckSquare",    group: "core",      desc: "Todo lists & projects" },
  { id: "calendar",    label: "Calendar",      icon: "Calendar",       group: "core",      desc: "Events & schedule" },
  { id: "timer",       label: "Timer",         icon: "Timer",          group: "core",      desc: "Pomodoro focus sessions" },
  { id: "kanban",      label: "Kanban",        icon: "Columns3",       group: "workspace", desc: "Drag & drop boards" },
  { id: "docs",        label: "Docs",          icon: "FileText",       group: "create",    desc: "Long-form documents" },
  { id: "sheets",      label: "Sheets",        icon: "Table2",         group: "create",    desc: "Spreadsheets & data" },
  { id: "slides",      label: "Slides",        icon: "Presentation",   group: "create",    desc: "Presentations & decks" },
  { id: "whiteboard",  label: "Whiteboard",    icon: "PenTool",        group: "workspace", desc: "Infinite canvas" },
  { id: "code-studio", label: "Code",          icon: "Code2",          group: "workspace", desc: "Local IDE workspace" },
  { id: "disk-flows",  label: "Disk",          icon: "HardDrive",      group: "media",     desc: "Video downloader" },
  { id: "voice-studio",label: "Voice",         icon: "Mic",            group: "media",     desc: "Smart voice recording" },
  { id: "photo-editor",label: "Photo",         icon: "Image",          group: "media",     desc: "Image editing tools" },
  { id: "video-editor",label: "Video",         icon: "Film",           group: "media",     desc: "Video editing studio" },
  { id: "ai",          label: "AI Agent",      icon: "Sparkles",       group: "system",    desc: "Autonomous assistant" },
] as const;

export const DEFAULT_MODULES = [
  "notes", "tasks", "calendar", "timer", "ai", "code-studio", "disk-flows"
];

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  language: "en",
  ai_model: "glm-5:cloud",
  onboarding_completed: false,
  sidebar_collapsed: false,
  enabled_modules: DEFAULT_MODULES,
};

export const LANGUAGES = [
  { code: "en", name: "English", native: "English" },
  { code: "es", name: "Spanish", native: "Español" },
  { code: "fr", name: "French", native: "Français" },
  { code: "de", name: "German", native: "Deutsch" },
  { code: "ja", name: "Japanese", native: "日本語" },
  { code: "zh", name: "Chinese", native: "中文" },
  { code: "ko", name: "Korean", native: "한국어" },
  { code: "ar", name: "Arabic", native: "العربية" },
  { code: "ru", name: "Russian", native: "Русский" },
  { code: "pt", name: "Portuguese", native: "Português" },
  { code: "uz", name: "Uzbek", native: "O'zbekcha" },
];
