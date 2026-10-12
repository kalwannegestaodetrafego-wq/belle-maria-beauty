import { translateUi, useLanguage } from "../../lib/bm-i18n";
import { Heart, Mail, MessageCircle, X } from "lucide-react";
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
