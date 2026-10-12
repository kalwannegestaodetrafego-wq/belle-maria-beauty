import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { translations } from "./bm-translations";

export type Language = "en" | "pt" | "es";
export const DEFAULT_LANGUAGE: Language = "en";
export const locales = { en: "en-US", pt: "pt-BR", es: "es-ES" } as const;
export function resolveLanguage(value: unknown): Language {
  return value === "pt" || value === "es" || value === "en" ? value : DEFAULT_LANGUAGE;
}

const templates = Object.entries(translations).filter(([key]) => key.includes("{0}")).map(([key, values]) => ({
  expression: new RegExp("^" + key.split(/(\{\d+\})/).map(part => /^\{\d+\}$/.test(part) ? "(.+?)" : part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("") + "$"), values,
}));

// Translate presentation strings only. Identifiers, form values, names and user content stay unchanged.
export function translateUi<T>(value: T, language: Language): T {
  if (typeof value !== "string") return value;
  const source = value.trim();
  const pair = translations[source];
  if (pair) return value.replace(source, language === "pt" ? source : pair[language === "en" ? 0 : 1]) as T;
  for (const template of templates) {
    const match = source.match(template.expression);
    if (match) {
      if (language === "pt") return value;
      const translated = template.values[language === "en" ? 0 : 1].replace(/\{(\d+)\}/g, (_, index: string) => match[Number(index) + 1] ?? "");
      return value.replace(source, translated) as T;
    }
  }
  return value;
}

const LanguageContext = createContext<{ language: Language; setLanguage: (language: Language) => void }>({ language: DEFAULT_LANGUAGE, setLanguage: () => {} });
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  useEffect(() => {
    try { setLanguage(resolveLanguage(localStorage.getItem("bm-language"))); } catch { /* Storage may be unavailable. */ }
  }, []);
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  const selectLanguage = (next: Language) => {
    setLanguage(next);
    try { localStorage.setItem("bm-language", next); } catch { /* Selection still works in memory. */ }
  };
  return <LanguageContext.Provider value={{ language, setLanguage: selectLanguage }}>{children}</LanguageContext.Provider>;
}
export function useLanguage() {
  const context = useContext(LanguageContext);
  return { ...context, locale: locales[context.language] };
}
