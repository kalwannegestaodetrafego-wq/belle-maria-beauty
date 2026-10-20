import { useEffect, useState } from "react";
import { ArrowDown, Download, PlusSquare, Share, X } from "lucide-react";
import { translateUi, useLanguage } from "../../lib/bm-i18n";

type PromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
let deferred: PromptEvent | null = null;
const listeners = new Set<() => void>();

function useInstallState() {
  const [, force] = useState(0);
  const [standalone, setStandalone] = useState(false);
  const [ios, setIos] = useState(false);
  useEffect(() => {
    const rerender = () => force((n) => n + 1);
    listeners.add(rerender);
    const onPrompt = (e: Event) => { e.preventDefault(); deferred = e as PromptEvent; listeners.forEach((l) => l()); };
    const onInstalled = () => { deferred = null; setStandalone(true); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    setStandalone(window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
    return () => { listeners.delete(rerender); window.removeEventListener("beforeinstallprompt", onPrompt); window.removeEventListener("appinstalled", onInstalled); };
  }, []);
  return { standalone, ios };
}

export function InstallAppButton({ className = "" }: { className?: string }) {
  const { language } = useLanguage();
  const { standalone, ios } = useInstallState();
  const [guide, setGuide] = useState(false);
  if (standalone) return null;
  const onClick = async () => {
    if (deferred) { await deferred.prompt(); await deferred.userChoice; deferred = null; return; }
    setGuide(true);
  };
  return (
    <>
      <button type="button" onClick={onClick} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-primary/40 bg-card/80 px-4 text-sm font-bold text-foreground shadow-soft backdrop-blur-xl transition-colors hover:bg-card ${className}`}>
        <Download size={17} className="text-primary" />📲 {translateUi("Instalar Aplicativo", language)}
      </button>
      {guide && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-overlay/60 p-4 sm:items-center" onClick={() => setGuide(false)}>
          <div className="relative w-full max-w-sm rounded-xl bg-card p-5 shadow-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setGuide(false)} className="absolute right-3 top-3 p-2" aria-label={translateUi("Fechar", language)}><X size={18} /></button>
            <div className="flex items-center gap-3"><img src="/icon-192.png" alt="BM" className="h-12 w-12 rounded-xl" /><div><p className="font-display text-lg">{translateUi("Instalar Aplicativo", language)}</p><p className="text-xs text-muted-foreground">{translateUi(ios ? "No Safari do iPhone" : "Pelo menu do navegador", language)}</p></div></div>
            <ol className="mt-5 space-y-3">
              <li className="flex items-center gap-3 rounded-lg border border-border p-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">1</span><Share size={22} className="shrink-0 text-primary" /><p className="text-sm">{translateUi("Toque no ícone de Compartilhar no Safari.", language)}</p></li>
              <li className="flex items-center gap-3 rounded-lg border border-border p-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">2</span><PlusSquare size={22} className="shrink-0 text-primary" /><p className="text-sm">{translateUi("Selecione 'Adicionar à Tela de Início'.", language)}</p></li>
            </ol>
            <div className="mt-4 flex flex-col items-center text-primary"><p className="text-xs font-bold">{translateUi("O botão Compartilhar fica na barra inferior", language)}</p><ArrowDown size={30} className="mt-1 animate-bounce" /></div>
          </div>
        </div>
      )}
    </>
  );
}
