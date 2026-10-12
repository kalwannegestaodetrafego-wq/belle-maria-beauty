import { Button } from "../ui/button";
import { useLanguage, type Language } from "../../lib/bm-i18n";

const labels = { en: "English", pt: "Português", es: "Español" } as const;
export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  return <div role="group" aria-label={language === "en" ? "Language" : language === "pt" ? "Idioma" : "Idioma"} className="flex shrink-0 items-center rounded-md border border-border bg-card/70 p-0.5">
    {(["en", "pt", "es"] as Language[]).map((option) => <Button key={option} type="button" variant="ghost" title={labels[option]} aria-label={labels[option]} aria-pressed={language === option} onClick={() => setLanguage(option)} className={`h-8 min-w-8 rounded-sm px-1.5 text-[10px] font-bold ${language === option ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : "text-muted-foreground"}`}>{option.toUpperCase()}</Button>)}
  </div>;
}
