import { Heart, Mail, MessageCircle, ShieldCheck, X } from "lucide-react";
import { useState } from "react";

export const SUPPORT_EMAIL = "startupbmcomercial@gmail.com";

const supportHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Suporte BM")}`;
const actionClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-luxe transition-all hover:bg-primary/90 active:scale-[.98]";

export function SupportMailButton({ className = "" }: { className?: string }) {
  return <a href={supportHref} className={`${actionClass} ${className}`}><Mail size={17} /> Falar com o Suporte BM</a>;
}

export function IdentityTrustCard({ className = "" }: { className?: string }) {
  return <div className={`flex items-start gap-3 rounded-lg border border-primary/45 bg-card/75 p-4 shadow-soft backdrop-blur-xl ${className}`}>
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary"><Heart size={18} fill="currentColor" /></span>
    <div><p className="text-sm font-bold">Verificação Segura e Confiável</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Dados protegidos e em conformidade com a LGPD.</p></div>
  </div>;
}

export function SupportWidget() {
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" onClick={() => setOpen(true)} className="fixed bottom-20 right-4 z-40 inline-flex min-h-12 items-center gap-2 rounded-full border border-primary/45 bg-card/90 px-4 text-xs font-bold text-foreground shadow-luxe backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-card md:bottom-6 md:right-6" aria-label="Abrir Suporte BM">
      <MessageCircle size={18} className="text-primary" /> Suporte BM
    </button>
    {open && <div className="fixed inset-0 z-[90] flex items-end justify-center bg-overlay/55 backdrop-blur-sm md:items-center md:p-6" role="dialog" aria-modal="true" aria-label="Suporte BM"><div className="modal-scroll max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-background p-5 text-foreground shadow-modal md:rounded-xl"><div className="flex items-center justify-between gap-3 border-b border-border pb-4"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">Assistente BM</p><h2 className="mt-1 font-display text-2xl">Suporte BM</h2></div><button type="button" onClick={() => setOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-accent" aria-label="Fechar suporte"><X size={19} /></button></div>
      <FaqBot />
    </div></div>}
  </>;
}