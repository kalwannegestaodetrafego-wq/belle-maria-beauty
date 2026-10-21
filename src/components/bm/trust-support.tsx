import { translateUi, useLanguage } from "../../lib/bm-i18n";
import { BadgeCheck, CheckCircle2, Heart, Mail, MessageCircle, ShieldCheck, Users, X } from "lucide-react";
import { useState } from "react";

export const SUPPORT_EMAIL = "startupbmcomercial@gmail.com";

const supportHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Suporte BM")}`;
const actionClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-luxe transition-all hover:bg-primary/90 active:scale-[.98]";

export function SupportMailButton({ className = "" }: { className?: string }) {
  const { language, locale } = useLanguage();
  return <a href={supportHref} className={`${actionClass} ${className}`}><Mail size={17} />{translateUi(" Falar com o Suporte BM", language)}</a>;
}

export function IdentityTrustCard({ className = "" }: { className?: string }) {
  const { language, locale } = useLanguage();
  return <div className={`flex items-start gap-3 rounded-lg border border-primary/45 bg-card/75 p-4 shadow-soft backdrop-blur-xl ${className}`}>
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary"><Heart size={18} fill="currentColor" /></span>
    <div><p className="text-sm font-bold">{translateUi("Verificação Segura e Confiável", language)}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{translateUi("Dados protegidos e em conformidade com a LGPD.", language)}</p></div>
  </div>;
}

export const WHATSAPP_NUMBER = "5548991364387";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Olá! Preciso de ajuda com um agendamento no Belle Maria Beauty.")}`;

export function WhatsAppSupportButton({ className = "" }: { className?: string }) {
  const { language } = useLanguage();
  return <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className={`${actionClass} ${className}`}><MessageCircle size={17} />{translateUi("Falar com o Suporte no WhatsApp", language)}</a>;
}

export function SupportWidget() {
  const { language } = useLanguage();
  return <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="fixed bottom-20 right-4 z-40 inline-flex min-h-12 items-center gap-2 rounded-full border border-primary/45 bg-card/90 px-4 text-xs font-bold text-foreground shadow-luxe backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-card md:bottom-6 md:right-6" aria-label={translateUi("Abrir Suporte BM", language)}>
    <MessageCircle size={18} className="text-primary" />{translateUi(" Suporte BM ", language)}</a>;
}

export function VerifiedBadge({ name, className = "", demo = true }: { name?: string; className?: string; demo?: boolean }) {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" onClick={(e) => { e.stopPropagation(); setOpen(true); }} className={`inline-flex items-center gap-1.5 rounded-full bg-success px-3 py-1.5 text-[11px] font-bold text-success-foreground shadow-soft ${className}`} aria-label={translateUi("Identidade Verificada BM", language)}><ShieldCheck size={14} /><BadgeCheck size={14} />{translateUi("Identidade Verificada BM", language)}</button>
    {open && <div className="fixed inset-0 z-[95] flex items-end justify-center bg-overlay/55 backdrop-blur-sm md:items-center md:p-6" role="dialog" aria-modal="true" aria-label={translateUi("Identidade Verificada BM", language)} onClick={() => setOpen(false)}><div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-2xl bg-background p-6 text-center text-foreground shadow-modal md:rounded-xl">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-soft text-success"><ShieldCheck size={32} /></span>
      <h3 className="mt-4 font-display text-2xl">{translateUi("Identidade Verificada BM", language)}</h3>
      {name && <p className="mt-1 text-sm font-semibold">{name}</p>}
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{translateUi(demo ? "Este profissional passou pela verificação biométrica e facial de segurança da plataforma." : "Documentos e selfie aprovados pela equipe de segurança BM.", language)}</p>
      <ul className="mt-4 space-y-2 text-left text-xs">{["Documento de identidade conferido", "Selfie comparada à foto do documento", "Dados protegidos conforme a LGPD"].map((t) => <li key={t} className="flex items-center gap-2"><CheckCircle2 size={15} className="shrink-0 text-success" />{translateUi(t, language)}</li>)}</ul>
      {demo && <p className="mt-4 text-[10px] text-muted-foreground">{translateUi("Perfil demonstrativo: selo ilustrativo nesta versão.", language)}</p>}
      <button type="button" onClick={() => setOpen(false)} className={`${actionClass} mt-5 w-full`}>{translateUi("Entendi", language)}</button>
    </div></div>}
  </>;
}

export function SafetyReminder({ className = "" }: { className?: string }) {
  const { language } = useLanguage();
  return <div className={`flex gap-3 rounded-lg border border-success/40 bg-success-soft p-4 text-left ${className}`}><Users size={22} className="shrink-0 text-success" /><p className="text-xs leading-5"><strong className="text-success">{translateUi("Atendimento seguro:", language)}</strong>{" "}{translateUi("Ambos os lados possuem verificação de identidade ativa na plataforma.", language)}</p></div>;
}
