import { useSettingsStore } from "@/stores/settingsStore";

type Dict = Record<string, string>;

const en: Dict = {
  "app.notes": "Notes",
  "app.tasks": "Tasks",
  "app.calendar": "Calendar",
  "app.ai": "Intelligence",
  "app.settings": "Settings",
  "notes.start_writing": "Start writing...",
  "notes.untitled": "Untitled",
  "notes.peak": "Peak Productivity",
  "notes.peak_sub": "You've finished everything here. Relax or add something new above.",
  "chat.placeholder": "Ask your",
  "chat.speak_now": "Speak now…",
  "chat.thinking": "Thinking",
  "chat.agent_title": "I am your Delay",
  "chat.agent_sub_agent":
    "I can manage your life autonomously. Try asking me to 'Create a note about my day' or 'Schedule a meeting tomorrow'.",
  "chat.agent_sub_chat":
    "How can I help you today? I am ready for pure, smart conversation.",
  "settings.title": "Settings",
  "settings.subtitle": "Make Delay feel like yours.",
  "settings.appearance": "Appearance",
  "settings.language": "Language",
  "settings.ai_model": "AI Model",
  "settings.updates": "Updates",
  "settings.about": "About",
  "settings.restart_needed": "Restart Delay to apply the new language.",
  "settings.restart_now": "Restart now",
};

const dictionaries: Record<string, Dict> = {
  en,
  es: {
    ...en,
    "app.notes": "Notas",
    "app.tasks": "Tareas",
    "app.calendar": "Calendario",
    "app.ai": "Inteligencia",
    "app.settings": "Ajustes",
    "notes.start_writing": "Empieza a escribir...",
    "notes.untitled": "Sin título",
    "notes.peak": "Productividad máxima",
    "notes.peak_sub": "Has terminado todo aquí. Relájate o agrega algo nuevo.",
    "chat.placeholder": "Pregunta a tu",
    "chat.speak_now": "Habla ahora…",
    "chat.thinking": "Pensando",
    "chat.agent_title": "Soy tu Delay",
    "chat.agent_sub_agent":
      "Puedo gestionar tu vida de forma autónoma. Pídeme 'Crea una nota sobre mi día'.",
    "chat.agent_sub_chat": "¿En qué puedo ayudarte hoy?",
    "settings.title": "Ajustes",
    "settings.subtitle": "Haz que Delay se sienta tuyo.",
    "settings.appearance": "Apariencia",
    "settings.language": "Idioma",
    "settings.ai_model": "Modelo IA",
    "settings.updates": "Actualizaciones",
    "settings.about": "Acerca de",
    "settings.restart_needed": "Reinicia Delay para aplicar el idioma.",
    "settings.restart_now": "Reiniciar ahora",
  },
  fr: {
    ...en,
    "app.notes": "Notes",
    "app.tasks": "Tâches",
    "app.calendar": "Calendrier",
    "app.ai": "Intelligence",
    "app.settings": "Paramètres",
    "notes.start_writing": "Commencez à écrire...",
    "notes.untitled": "Sans titre",
    "notes.peak": "Productivité maximale",
    "notes.peak_sub": "Vous avez tout terminé. Détendez-vous ou ajoutez quelque chose.",
    "chat.placeholder": "Demandez à votre",
    "chat.speak_now": "Parlez maintenant…",
    "chat.thinking": "Réflexion",
    "chat.agent_title": "Je suis votre Delay",
    "chat.agent_sub_agent": "Je peux gérer votre vie de façon autonome.",
    "chat.agent_sub_chat": "Comment puis-je vous aider aujourd'hui ?",
    "settings.title": "Paramètres",
    "settings.subtitle": "Personnalisez Delay.",
    "settings.appearance": "Apparence",
    "settings.language": "Langue",
    "settings.ai_model": "Modèle IA",
    "settings.updates": "Mises à jour",
    "settings.about": "À propos",
    "settings.restart_needed": "Redémarrez Delay pour appliquer la langue.",
    "settings.restart_now": "Redémarrer",
  },
  de: {
    ...en,
    "app.notes": "Notizen",
    "app.tasks": "Aufgaben",
    "app.calendar": "Kalender",
    "app.settings": "Einstellungen",
    "notes.start_writing": "Beginne zu schreiben...",
    "notes.untitled": "Ohne Titel",
    "notes.peak": "Höchste Produktivität",
    "notes.peak_sub": "Du bist fertig. Entspanne dich oder füge etwas hinzu.",
    "chat.thinking": "Denkt nach",
    "settings.title": "Einstellungen",
    "settings.subtitle": "Mach Delay zu deinem.",
    "settings.language": "Sprache",
    "settings.restart_needed": "Starte Delay neu, um die Sprache anzuwenden.",
    "settings.restart_now": "Jetzt neu starten",
  },
  ru: {
    ...en,
    "app.notes": "Заметки",
    "app.tasks": "Задачи",
    "app.calendar": "Календарь",
    "app.settings": "Настройки",
    "notes.start_writing": "Начните писать...",
    "notes.untitled": "Без названия",
    "notes.peak": "Пик продуктивности",
    "notes.peak_sub": "Вы всё завершили. Отдохните или добавьте новое.",
    "chat.thinking": "Думаю",
    "settings.title": "Настройки",
    "settings.subtitle": "Сделайте Delay своим.",
    "settings.language": "Язык",
    "settings.restart_needed": "Перезапустите Delay, чтобы применить язык.",
    "settings.restart_now": "Перезапустить",
  },
  ar: {
    ...en,
    "app.notes": "ملاحظات",
    "app.tasks": "مهام",
    "app.calendar": "تقويم",
    "app.settings": "الإعدادات",
    "notes.start_writing": "ابدأ الكتابة...",
    "notes.untitled": "بدون عنوان",
    "notes.peak": "ذروة الإنتاجية",
    "notes.peak_sub": "لقد أنهيت كل شيء. استرخِ أو أضِف المزيد.",
    "chat.thinking": "يفكر",
    "settings.title": "الإعدادات",
    "settings.language": "اللغة",
    "settings.restart_needed": "أعد تشغيل Delay لتطبيق اللغة.",
    "settings.restart_now": "إعادة التشغيل الآن",
  },
};

export function t(key: string, lang?: string): string {
  const code = lang ?? useSettingsStore.getState().language;
  const dict = dictionaries[code] ?? dictionaries.en;
  return dict[key] ?? dictionaries.en[key] ?? key;
}

export function useT() {
  const lang = useSettingsStore((s) => s.language);
  return (key: string) => t(key, lang);
}

export function isRTL(lang?: string): boolean {
  const code = lang ?? useSettingsStore.getState().language;
  return code === "ar";
}
