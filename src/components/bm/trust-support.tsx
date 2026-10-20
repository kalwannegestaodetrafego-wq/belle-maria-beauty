import { translateUi, useLanguage } from "../../lib/bm-i18n";
import { BadgeCheck, Camera, CheckCircle2, Heart, Mail, MessageCircle, ScanFace, ShieldCheck, Users, X } from "lucide-react";
import { useEffect, useState } from "react";

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

export function SupportWidget() {
  const { language, locale } = useLanguage();
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" onClick={() => setOpen(true)} className="fixed bottom-20 right-4 z-40 inline-flex min-h-12 items-center gap-2 rounded-full border border-primary/45 bg-card/90 px-4 text-xs font-bold text-foreground shadow-luxe backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-card md:bottom-6 md:right-6" aria-label={translateUi("Abrir Suporte BM", language)}>
      <MessageCircle size={18} className="text-primary" />{translateUi(" Suporte BM ", language)}</button>
    {translateUi(open && <div className="fixed inset-0 z-[90] flex items-end justify-center bg-overlay/55 backdrop-blur-sm md:items-center md:p-6" role="dialog" aria-modal="true" aria-label={translateUi("Suporte BM", language)}><div className="modal-scroll max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-background p-5 text-foreground shadow-modal md:rounded-xl"><div className="flex items-center justify-between gap-3 border-b border-border pb-4"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">{translateUi("Assistente BM", language)}</p><h2 className="mt-1 font-display text-2xl">{translateUi("Suporte BM", language)}</h2></div><button type="button" onClick={() => setOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-accent" aria-label={translateUi("Fechar suporte", language)}><X size={19} /></button></div>
      <FaqBot />
    </div></div>, language)}
  </>;
}
const faq = [
  { q: "Como funciona o agendamento?", a: ["Escolha a categoria e se prefere em casa ou no salão.", "Abra o perfil, selecione serviço, dia e até 3 horários alternativos.", "Confirme o checklist da casa e pague com segurança.", "Acompanhe a especialista até a chegada e informe seu PIN ao final."] },
  { q: "Pagamentos, PIX e Pontos BM", a: ["Você paga por PIX, cartão ou Solana/USDC (demonstração).", "O valor fica retido pela BM (custódia) e só é liberado quando você informa o PIN de 4 dígitos.", "A profissional recebe via PIX após a validação do PIN.", "Cada atendimento soma Pontos BM, que viram desconto no próximo agendamento."] },
  { q: "Segurança e Verificação", a: ["Clientes e profissionais validam CPF, foto de identidade e selfie de segurança.", "O pedido mostra o selo de Cliente Verificada para a profissional.", "Dados são protegidos conforme a LGPD.", "Incidentes podem ser reportados na tela de acompanhamento."] },
  { q: "Quero cadastrar meu Salão ou Perfil MEI/CPF", a: ["Toque no ícone de perfil no topo.", "Escolha Profissional Beleza (CPF ou CNPJ MEI) ou Salão Parceiro (CNPJ e alvará).", "Envie foto de identidade e selfie de segurança.", "Profissionais fazem um minicurso rápido de boas-vindas."] },
];

function FaqBot() {
  const { language, locale } = useLanguage();
  const [picked, setPicked] = useState<number[]>([]);
  return <div className="mt-4 space-y-3">
    <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-card p-3 text-sm shadow-soft">{translateUi("Olá! Seja bem-vinda ao Suporte BM. Como podemos te ajudar hoje?", language)}</div>
    {translateUi(picked.map((i, k) => { const item = faq[i]; if (!item) return null; return <div key={k} className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
      <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-foreground p-3 text-sm text-background">{translateUi(item.q, language)}</div>
      <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-card p-3 text-xs leading-5 shadow-soft"><ol className="list-decimal space-y-1 pl-4">{translateUi(item.a.map((l) => <li key={l}>{translateUi(l, language)}</li>), language)}</ol></div>
    </div>; }), language)}
    <div className="flex flex-wrap gap-2 pt-1">{translateUi(faq.map((f, i) => <button key={f.q} type="button" onClick={() => setPicked((p) => [...p, i])} className="rounded-full border border-primary/50 bg-secondary/60 px-3 py-2 text-left text-xs font-semibold transition-colors hover:bg-secondary">{translateUi(f.q, language)}</button>), language)}</div>
    <a href={supportHref} className="flex items-start gap-2 rounded-lg border border-success/30 bg-success-soft p-3 text-xs font-semibold text-success"><Mail size={16} className="mt-0.5 shrink-0" /><span className="break-all">{translateUi("Não encontrou sua dúvida? Envie um e-mail para ", language)}{translateUi(SUPPORT_EMAIL, language)}</span></a>
  </div>;
}

export function VerifiedBadge({ name, className = "" }: { name?: string; className?: string }) {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" onClick={(e) => { e.stopPropagation(); setOpen(true); }} className={`inline-flex items-center gap-1.5 rounded-full bg-success px-3 py-1.5 text-[11px] font-bold text-success-foreground shadow-soft ${className}`} aria-label={translateUi("Identidade Verificada BM", language)}><ShieldCheck size={14} /><BadgeCheck size={14} />{translateUi("Identidade Verificada BM", language)}</button>
    {open && <div className="fixed inset-0 z-[95] flex items-end justify-center bg-overlay/55 backdrop-blur-sm md:items-center md:p-6" role="dialog" aria-modal="true" aria-label={translateUi("Identidade Verificada BM", language)} onClick={() => setOpen(false)}><div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-2xl bg-background p-6 text-center text-foreground shadow-modal md:rounded-xl">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-soft text-success"><ShieldCheck size={32} /></span>
      <h3 className="mt-4 font-display text-2xl">{translateUi("Identidade Verificada BM", language)}</h3>
      {name && <p className="mt-1 text-sm font-semibold">{name}</p>}
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{translateUi("Este profissional passou pela verificação biométrica e facial de segurança da plataforma.", language)}</p>
      <ul className="mt-4 space-y-2 text-left text-xs">{["Documento de identidade conferido", "Selfie comparada à foto do documento", "Dados protegidos conforme a LGPD"].map((t) => <li key={t} className="flex items-center gap-2"><CheckCircle2 size={15} className="shrink-0 text-success" />{translateUi(t, language)}</li>)}</ul>
      <p className="mt-4 text-[10px] text-muted-foreground">{translateUi("Perfil demonstrativo: selo ilustrativo nesta versão.", language)}</p>
      <button type="button" onClick={() => setOpen(false)} className={`${actionClass} mt-5 w-full`}>{translateUi("Entendi", language)}</button>
    </div></div>}
  </>;
}

type FaceStage = "idle" | "center" | "validating" | "done";
export function FaceVerification({ className = "" }: { className?: string }) {
  const { language } = useLanguage();
  const [stage, setStage] = useState<FaceStage>("idle");
  useEffect(() => {
    if (stage === "center") { const t = setTimeout(() => setStage("validating"), 2200); return () => clearTimeout(t); }
    if (stage === "validating") { const t = setTimeout(() => setStage("done"), 2800); return () => clearTimeout(t); }
    return undefined;
  }, [stage]);
  const label = { idle: "Toque em iniciar para a captura facial.", center: "Centralize seu rosto no círculo", validating: "Aguarde a validação biométrica...", done: "Conta Verificada com Sucesso" }[stage];
  return <section className={`rounded-lg border border-primary/40 bg-card/85 p-5 shadow-card backdrop-blur ${className}`} aria-label={translateUi("Segurança e Verificação de Identidade", language)}>
    <h2 className="flex items-center gap-2 font-display text-2xl"><ShieldCheck size={20} className="text-success" />{translateUi("Segurança e Verificação de Identidade", language)}</h2>
    <p className="mt-1 text-xs text-muted-foreground">{translateUi("Selfie Match / Biometria · simulação", language)}</p>
    <div className={`relative mx-auto mt-5 flex h-48 w-48 items-center justify-center overflow-hidden rounded-full border-4 ${stage === "done" ? "border-success" : "border-primary"} bg-foreground/90`}>
      {stage === "done" ? <CheckCircle2 size={72} className="text-success" /> : <ScanFace size={84} className={`text-background/70 ${stage !== "idle" ? "animate-pulse" : ""}`} />}
      {stage === "validating" && <span className="absolute inset-x-6 top-1/2 h-0.5 animate-bounce bg-primary shadow-luxe" />}
      {(stage === "center" || stage === "validating") && <span className="absolute inset-3 rounded-full border-2 border-dashed border-primary/70 animate-spin [animation-duration:6s]" />}
    </div>
    <p role="status" className={`mt-4 text-center text-sm font-bold ${stage === "done" ? "text-success" : ""}`}>{translateUi(label, language)}</p>
    {stage === "done" ? <div className="mt-4 flex justify-center"><span className="inline-flex items-center gap-1.5 rounded-full bg-success px-3 py-1.5 text-[11px] font-bold text-success-foreground"><BadgeCheck size={14} />{translateUi("Conta Verificada com Sucesso", language)}</span></div>
      : <button type="button" disabled={stage !== "idle"} onClick={() => setStage("center")} className={`${actionClass} mt-4 w-full disabled:opacity-50`}><Camera size={17} />{translateUi(stage === "idle" ? "Iniciar captura facial" : "Capturando…", language)}</button>}
    <p className="mt-3 text-center text-[10px] text-muted-foreground">{translateUi("Captura simulada: nenhuma imagem é gravada nesta etapa.", language)}</p>
  </section>;
}

export function SafetyReminder({ className = "" }: { className?: string }) {
  const { language } = useLanguage();
  return <div className={`flex gap-3 rounded-lg border border-success/40 bg-success-soft p-4 text-left ${className}`}><Users size={22} className="shrink-0 text-success" /><p className="text-xs leading-5"><strong className="text-success">{translateUi("Atendimento seguro:", language)}</strong>{" "}{translateUi("Ambos os lados possuem verificação de identidade ativa na plataforma.", language)}</p></div>;
}
