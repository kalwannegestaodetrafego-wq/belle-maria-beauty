import { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Clock3, KeyRound, PartyPopper, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Sheet } from "./extras";
import { SUPPORT_EMAIL, SupportMailButton } from "./trust-support";

const btn = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-all active:scale-[.98]";
const primary = `${btn} bg-primary text-primary-foreground shadow-luxe hover:bg-primary/90`;
const outline = `${btn} border border-border bg-card hover:bg-accent`;

const steps = [
  { icon: KeyRound, title: "Validação por PIN", text: "Ao chegar, peça à cliente o PIN de 4 dígitos exibido no app dela. Digite no seu painel: o pagamento retido na BM é liberado na hora para sua carteira." },
  { icon: ShieldCheck, title: "Postura e Conduta Profissional", text: "Chegue com materiais higienizados, uniforme ou traje profissional e pontualidade. Respeite os espaços da casa e evite comentários invasivos." },
  { icon: Clock3, title: "Política de Faltas e Atrasos", text: "A tolerância padrão é de 15 minutos. Avise o suporte imediatamente se houver imprevisto. Faltar sem aviso (no-show) tem tolerância zero e gera penalidade na conta." },
  { icon: Zap, title: "Modo Disponível Já", text: "Ative o Status Online no painel para receber chamados urgentes em tempo real de clientes próximas. Desative quando não puder atender." },
];

export function WelcomeTraining({ onClose }: { onClose: () => void }) {
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  if (done) return <Sheet title="Treinamento concluído" eyebrow="Time BM" onClose={onClose} z="z-[80]">
    <div className="relative overflow-hidden py-6 text-center">
      {Array.from({ length: 14 }).map((_, k) => <Sparkles key={k} size={14} className="absolute animate-ping text-primary" style={{ left: `${(k * 37) % 100}%`, top: `${(k * 53) % 90}%`, animationDelay: `${k * 90}ms`, animationDuration: "1.4s" }} />)}
      <PartyPopper className="mx-auto animate-scale-in text-primary" size={56} />
      <p className="mt-4 font-display text-3xl">Parabéns! 🌸</p>
      <p className="mt-2 text-sm text-muted-foreground">Você está pronta para seus primeiros atendimentos BM.</p>
      <button onClick={onClose} className={`${primary} relative mt-6 w-full`}>Ir para o painel</button>
    </div>
  </Sheet>;
  const s = steps[i] ?? steps[0]!;
  const Icon = s.icon;
  return <Sheet title="Bem-vinda ao Time BM! 🌸" eyebrow="Seus 4 Passos de Ouro" onClose={onClose} z="z-[80]">
    <div className="flex gap-1.5">{steps.map((_, k) => <button key={k} onClick={() => setI(k)} aria-label={`Passo ${k + 1}`} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${k <= i ? "bg-primary" : "bg-muted"}`} />)}</div>
    <div key={i} className="mt-5 animate-fade-in rounded-xl border border-primary/40 bg-card p-6 text-center shadow-soft">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-primary"><Icon size={28} /></span>
      <p className="mt-4 text-[10px] font-bold uppercase tracking-[.16em] text-primary">Passo {i + 1} de 4</p>
      <h3 className="mt-1 font-display text-2xl">{s.title}</h3>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{s.text}</p>
    </div>
    <div className="mt-5 flex gap-2">
      {i > 0 && <button onClick={() => setI(i - 1)} className={`${outline} px-3`} aria-label="Voltar"><ChevronLeft size={18} /></button>}
      {i < 3 ? <button onClick={() => setI(i + 1)} className={`${primary} flex-1`}>Próximo <ChevronRight size={17} /></button>
        : <button onClick={() => setDone(true)} className={`${primary} flex-1`}><PartyPopper size={17} /> Concluir Treinamento & Acessar Painel</button>}
    </div>
  </Sheet>;
}

const faq = [
  { q: "Como funciona o cancelamento de um agendamento?", a: "Cancelamento gratuito até 12h antes do horário. Cancelamentos com menos de 2h de antecedência têm retenção de 30% do valor, repassada à profissional pelo tempo de preparo." },
  { q: "Quais as regras de conduta para atendimento em domicílio?", a: "Traje profissional, materiais higienizados, respeito aos limites e espaços da casa e zero comentários invasivos." },
  { q: "O que fazer em caso de imprevisto no trânsito/atraso?", a: `Há uma tolerância padrão de 15 minutos. Para atrasos acima de 15 minutos, avise o suporte imediatamente por e-mail: ${SUPPORT_EMAIL}.` },
  { q: "Por que não devo aceitar ou propor pagamentos por fora?", a: "Pagamentos fora do app anulam a Garantia BM, o Seguro de Materiais e os pontos de fidelidade. Toda transação deve passar pela custódia BM." },
];

export function HelpRules({ onClose }: { onClose: () => void }) {
  const [open, setOpen] = useState<number | null>(0);
  return <Sheet title="Ajuda & Regras" eyebrow="Cancelamento e conduta" onClose={onClose}>
    <div className="space-y-2">{faq.map((f, k) => <div key={k} className="overflow-hidden rounded-lg border border-border bg-card">
      <button onClick={() => setOpen(open === k ? null : k)} aria-expanded={open === k} className="flex w-full items-center justify-between gap-3 p-4 text-left text-sm font-bold">{f.q}<ChevronDown size={17} className={`shrink-0 text-primary transition-transform duration-300 ${open === k ? "rotate-180" : ""}`} /></button>
      <div className={`grid transition-all duration-300 ${open === k ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}><p className="overflow-hidden px-4 text-sm leading-6 text-muted-foreground"><span className="block pb-4">{f.a}</span></p></div>
    </div>)}</div>
    <SupportMailButton className="mt-5 w-full" />
    <button onClick={onClose} className={`${outline} mt-3 w-full`}>Entendi</button>
  </Sheet>;
}

export function OnlineToggle() {
  const [online, setOnline] = useState(true);
  return <div className={`mt-6 flex items-center justify-between gap-3 rounded-lg border p-4 shadow-soft transition-colors ${online ? "border-success bg-success-soft" : "border-border bg-card"}`}>
    <div className="flex items-center gap-3">
      <span className="relative flex h-3 w-3">{online && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />}<span className={`relative inline-flex h-3 w-3 rounded-full ${online ? "bg-success" : "bg-muted-foreground"}`} /></span>
      <div><p className="text-xs font-bold tracking-wide">{online ? "STATUS: ONLINE / DISPONÍVEL JÁ" : "STATUS: OFFLINE"}</p><p className="text-[11px] text-muted-foreground">{online ? "Recebendo chamados urgentes em tempo real" : "Você não receberá chamados urgentes"}</p></div>
    </div>
    <button role="switch" aria-checked={online} aria-label="Status online" onClick={() => setOnline(!online)} className={`relative h-6 w-11 shrink-0 rounded-full transition ${online ? "bg-success" : "bg-muted"}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-all ${online ? "left-[22px]" : "left-0.5"}`} /></button>
  </div>;
}
