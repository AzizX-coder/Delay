export interface AppSettings {
  theme: "light" | "dark" | "system";
  language: string;
  ai_model: string;
  onboarding_completed: boolean;
  sidebar_collapsed: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  language: "en",
  ai_model: "glm-5:cloud",
  onboarding_completed: false,
  sidebar_collapsed: false,
};

export const LANGUAGES = [
  { code: "en", name: "English", native: "English" },
  { code: "es", name: "Spanish", native: "Espanol" },
  { code: "fr", name: "French", native: "Francais" },
  { code: "de", name: "German", native: "Deutsch" },
  { code: "ja", name: "Japanese", native: "日本語" },
  { code: "zh", name: "Chinese", native: "中文" },
  { code: "ko", name: "Korean", native: "한국어" },
  { code: "ar", name: "Arabic", native: "العربية" },
  { code: "ru", name: "Russian", native: "Русский" },
  { code: "pt", name: "Portuguese", native: "Portugues" },
];
