import { translateUi, useLanguage } from "../../lib/bm-i18n";
import { useState, type ReactNode } from "react";
import { Armchair, Banknote, BookOpen, CheckCircle2, ChevronDown, Clock3, Crown, Gift, Lock, PawPrint, Pencil, Sparkles, Sun, Timer, Wallet, Zap } from "lucide-react";

const btn = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-all active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-45";
const primary = `${btn} bg-primary text-primary-foreground shadow-luxe hover:bg-primary/90`;
const outline = `${btn} border border-border bg-card hover:bg-accent`;
const input = "h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary";
const card = "mt-6 rounded-lg border border-primary/40 bg-card/85 p-4 shadow-card backdrop-blur";
const brl = (n: number) => `R$ ${n.toFixed(2).replace(".", ",")}`;

function Accordion({ items, icon }: { items: { title: string; body: ReactNode; icon?: ReactNode }[]; icon?: ReactNode }) {
  const { language, locale } = useLanguage();
  const [open, setOpen] = useState<number | null>(0);
  return <div className="mt-4 space-y-2">{translateUi(items.map((it, i) => <div key={it.title} className="overflow-hidden rounded-lg border border-border bg-background">
    <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)} className="flex min-h-12 w-full items-center gap-3 px-3 text-left text-sm font-bold">
      <span className="text-primary">{translateUi(it.icon ?? icon, language)}</span><span className="flex-1">{translateUi(it.title, language)}</span><ChevronDown size={17} className={`transition-transform duration-300 ${open === i ? "rotate-180" : ""}`} />
    </button>
    <div className={`grid transition-all duration-300 ${open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}><div className="overflow-hidden"><div className="px-3 pb-3 text-xs leading-5 text-muted-foreground">{translateUi(it.body, language)}</div></div></div>
  </div>), language)}</div>;
}

function Switch({ on, onClick, label, disabled }: { on: boolean; onClick: () => void; label: string; disabled?: boolean }) {
  const { language, locale } = useLanguage();
  return <button role="switch" aria-checked={on} aria-label={translateUi(label, language)} disabled={disabled} onClick={onClick} className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-40 ${on ? "bg-success" : "bg-muted"}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} /></button>;
}

/* ---------- B2B Financial ---------- */
export function B2BFinance() {
  const { language, locale } = useLanguage();
  const [balance, setBalance] = useState(1284.6);
  const [pending] = useState([{ who: "Camila Silva", what: "Cadeira de maquiagem · 4h", v: 140 }, { who: "Bianca Rocha", what: "Bancada de unhas · 1 dia", v: 140 }]);
  const [withdrawn, setWithdrawn] = useState<number | null>(null);
  const [stations, setStations] = useState([{ id: 1, name: "Cadeira de maquiagem", hour: 35, day: 180 }, { id: 2, name: "Bancada de unhas", hour: 25, day: 140 }, { id: 3, name: "Lavatório + cadeira hair", hour: 45, day: 220 }]);
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState({ hour: "", day: "" });
  const [membership, setMembership] = useState<"ACTIVE" | "INACTIVE">("INACTIVE");
  const [instant, setInstant] = useState(false);
  const pendingTotal = pending.reduce((s, p) => s + p.v, 0);

  const save = (id: number) => {
    const hour = Math.max(1, Math.min(999, Number(draft.hour) || 0));
    const day = Math.max(1, Math.min(9999, Number(draft.day) || 0));
    setStations((l) => l.map((s) => s.id === id ? { ...s, hour, day } : s));
    setEditing(null);
  };

  return <>
    <div className={card}>
      <h2 className="flex items-center gap-2 font-display text-2xl"><Wallet size={20} className="text-primary" />{translateUi(" Carteira & Gestão Financeira", language)}</h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-background p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{translateUi("Saldo total", language)}</p><p className="mt-1 font-display text-2xl">{translateUi(brl(balance), language)}</p></div>
        <div className="rounded-lg bg-background p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{translateUi("Locações pendentes", language)}</p><p className="mt-1 font-display text-2xl">{translateUi(brl(pendingTotal), language)}</p><p className="text-[10px] text-muted-foreground">{translateUi(pending.length, language)}{translateUi(" reservas", language)}</p></div>
      </div>
      <div className="mt-3 space-y-1.5">{translateUi(pending.map((p) => <div key={p.who} className="flex items-center justify-between rounded-lg bg-background/70 px-3 py-2 text-xs"><span><strong className="block">{translateUi(p.who, language)}</strong><span className="text-muted-foreground">{translateUi(p.what, language)}</span></span><span className="flex items-center gap-1 font-bold text-primary"><Clock3 size={13} />{translateUi(brl(p.v), language)}</span></div>), language)}</div>
      {translateUi(withdrawn !== null ? <div className="mt-3 flex items-center gap-2 rounded-lg bg-success-soft p-3 text-xs"><CheckCircle2 size={17} className="text-success" /><span><strong className="block text-success">{translateUi("Saque de ", language)}{translateUi(brl(withdrawn), language)}{translateUi(" enviado", language)}</strong>{translateUi("PIX instantâneo para a chave CNPJ cadastrada.", language)}</span></div>
        : <button disabled={balance <= 0} onClick={() => { setWithdrawn(balance); setBalance(0); }} className={`${primary} mt-3 w-full`}><Banknote size={17} />{translateUi(" Sacar via PIX", language)}</button>, language)}
    </div>

    <div className={card}>
      <h2 className="flex items-center gap-2 font-display text-2xl"><Armchair size={20} className="text-primary" />{translateUi(" Preços das Estações", language)}</h2>
      <div className="mt-4 space-y-2">{translateUi(stations.map((s) => <div key={s.id} className="rounded-lg bg-background p-3">
        <div className="flex items-center justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-bold">{translateUi(s.name, language)}</p><p className="text-xs font-bold text-primary">{translateUi("R$ ", language)}{translateUi(s.hour, language)}{translateUi("/h · R$ ", language)}{translateUi(s.day, language)}{translateUi("/dia", language)}</p></div>
          {translateUi(editing !== s.id && <button onClick={() => { setEditing(s.id); setDraft({ hour: String(s.hour), day: String(s.day) }); }} className={`${outline} min-h-9 px-3 text-xs`}><Pencil size={13} />{translateUi(" Editar", language)}</button>, language)}</div>
        {translateUi(editing === s.id && <div className="mt-3 grid grid-cols-[1fr_1fr_auto] items-end gap-2">
          <label className="text-[10px] font-bold">{translateUi("R$/hora", language)}<input value={draft.hour} inputMode="numeric" onChange={(e) => setDraft({ ...draft, hour: e.target.value.replace(/\D/g, "").slice(0, 3) })} className={`${input} mt-1`} /></label>
          <label className="text-[10px] font-bold">{translateUi("R$/dia", language)}<input value={draft.day} inputMode="numeric" onChange={(e) => setDraft({ ...draft, day: e.target.value.replace(/\D/g, "").slice(0, 4) })} className={`${input} mt-1`} /></label>
          <button onClick={() => save(s.id)} className={`${primary} min-h-10 px-3 text-xs`}>{translateUi("Salvar", language)}</button>
        </div>, language)}
      </div>), language)}</div>
    </div>

    <div className={card}>
      <h2 className="flex items-center gap-2 font-display text-2xl"><Crown size={20} className="text-primary" />{translateUi(" Assinatura B2B", language)}</h2>
      <div className="mt-4 flex items-center justify-between rounded-lg bg-background p-3"><span className="text-sm">{translateUi("Status: ", language)}<strong className={membership === "ACTIVE" ? "text-success" : "text-destructive"}>{translateUi(membership, language)}</strong></span>
        <button onClick={() => { const next = membership === "ACTIVE" ? "INACTIVE" : "ACTIVE"; setMembership(next); if (next === "INACTIVE") setInstant(false); }} className={`${outline} min-h-9 px-3 text-xs`}>{translateUi(membership === "ACTIVE" ? "Pausar plano" : "Ativar plano · R$ 89/mês", language)}</button></div>
      <div className="mt-2 flex items-center justify-between gap-3 rounded-lg bg-background p-3"><span className="flex items-center gap-2 text-sm font-bold"><Zap size={16} className="text-primary" />{translateUi(" Aberto para Atendimento Imediato no Salão", language)}</span><Switch on={instant} disabled={membership !== "ACTIVE"} onClick={() => setInstant(!instant)} label={translateUi("Atendimento imediato", language)} /></div>
      {translateUi(membership !== "ACTIVE" && <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><Lock size={13} />{translateUi(" Disponível apenas com assinatura B2B ativa.", language)}</p>, language)}
      {translateUi(instant && <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-success"><CheckCircle2 size={13} />{translateUi(" Seu salão aparece agora para clientes próximas.", language)}</p>, language)}
    </div>

    <div className={card}>
      <h2 className="flex items-center gap-2 font-display text-2xl"><BookOpen size={20} className="text-primary" />{translateUi(" Taxas B2B · Perguntas frequentes", language)}</h2>
      <Accordion icon={<Sparkles size={16} />} items={[
        { title: "Quanto a BM retém nas locações?", body: "A BM retém 12% sobre cada locação de cadeira ou bancada. Os 88% restantes vão para a carteira do salão." },
        { title: "Quando recebo o valor da locação?", body: "O valor fica pendente até o fim do período reservado e é liberado na carteira em até 24h. Saques via PIX são instantâneos." },
        { title: "Existe taxa para sacar?", body: "Não. Saques via PIX para a chave CNPJ do salão não têm custo." },
        { title: "E se a profissional cancelar?", body: "Cancelamentos com menos de 12h de antecedência geram 50% do valor para o salão, sem custo adicional." },
      ]} />
    </div>
  </>;
}

/* ---------- Client Guide + Loyalty ---------- */
export function ClientHub() {
  const { language, locale } = useLanguage();
  const [points, setPoints] = useState(480);
  const [redeemed, setRedeemed] = useState(false);
  const [joined, setJoined] = useState<string[]>([]);
  const nailsDone = 2, nailsGoal = 3;
  const campaigns = [
    { id: "w", tag: "Semanal", title: "Semana da Pele Radiante", text: "Maquiagem Social com 2x pontos até domingo.", terms: "Válido de 22 a 28/09 para atendimentos pagos pelo app. Não cumulativo." },
    { id: "m", tag: "Mensal", title: "Setembro das Unhas", text: "3 atendimentos de unha = Cupom VIP de R$ 30.", terms: "Válido até 30/09. Cupom expira em 60 dias. Uso em um único atendimento." },
  ];
  return <section className="mt-10 space-y-2">
    <div className={card}>
      <h2 className="flex items-center gap-2 font-display text-2xl"><Gift size={20} className="text-primary" />{translateUi(" Pontos & Vantagens BM", language)}</h2>
      <div className="mt-4 rounded-lg bg-foreground p-4 text-background"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">{translateUi("Seu saldo", language)}</p><p className="mt-1 font-display text-3xl">{translateUi(points, language)}{translateUi(" Pontos Acumulados", language)}</p><p className="text-sm opacity-80">{translateUi("= ", language)}{translateUi(brl(points / 10), language)}{translateUi(" em descontos", language)}</p></div>
      {translateUi(redeemed ? <p className="mt-3 flex items-center gap-2 text-xs font-bold text-success"><CheckCircle2 size={15} />{translateUi(" Desconto aplicado no seu próximo agendamento.", language)}</p>
        : <button disabled={points === 0} onClick={() => { setRedeemed(true); setPoints(0); }} className={`${outline} mt-3 w-full`}>{translateUi("Usar pontos no próximo agendamento", language)}</button>, language)}
      <div className="mt-4"><div className="flex justify-between text-xs font-bold"><span>{translateUi("Campanha do mês · Unhas", language)}</span><span className="text-primary">{translateUi(nailsDone, language)}{translateUi("/", language)}{translateUi(nailsGoal, language)}</span></div>
        <div className="mt-2 h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${(nailsDone / nailsGoal) * 100}%` }} /></div>
        <p className="mt-2 text-xs text-muted-foreground">{translateUi("Falta 1 atendimento de Unha para desbloquear seu Cupom VIP.", language)}</p></div>
      <div className="mt-4 space-y-3">{translateUi(campaigns.map((c) => <div key={c.id} className="rounded-lg border border-primary/40 bg-secondary/60 p-3">
        <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">{translateUi(c.tag, language)}</span>
        <p className="mt-2 font-display text-lg">{translateUi(c.title, language)}</p><p className="text-xs">{translateUi(c.text, language)}</p><p className="mt-1 text-[10px] text-muted-foreground">{translateUi("Termos: ", language)}{translateUi(c.terms, language)}</p>
        {translateUi(joined.includes(c.id) ? <p className="mt-2 flex items-center gap-1 text-xs font-bold text-success"><CheckCircle2 size={14} />{translateUi(" Participando", language)}</p> : <button onClick={() => setJoined((j) => [...j, c.id])} className={`${primary} mt-2 min-h-9 px-3 text-xs`}>{translateUi("Participar", language)}</button>, language)}
      </div>), language)}</div>
    </div>

    <div className={card}>
      <h2 className="flex items-center gap-2 font-display text-2xl"><Sparkles size={20} className="text-primary" />{translateUi(" Guia da Experiência BM em Casa", language)}</h2>
      <Accordion items={[
        { icon: <Sun size={16} />, title: "Preparo do Ambiente", body: "Escolha um local bem iluminado (luz natural ou branca), com uma mesa livre de ~60 cm para os materiais e uma tomada a até 2 m da cadeira." },
        { icon: <Armchair size={16} />, title: "Espaço para Macas", body: "Massagens exigem área livre de pelo menos 2,5 m × 1,8 m, piso plano e espaço para a profissional circular pelos dois lados da maca." },
        { icon: <PawPrint size={16} />, title: "Pets e Crianças", body: "Secadores, chapinhas e lâminas ficam quentes ou afiados. Mantenha pets em outro cômodo e crianças longe da área durante todo o atendimento." },
        { icon: <Lock size={16} />, title: "Respeito ao Material", body: "Não toque nem manuseie a maleta, pincéis ou produtos da profissional. Danos são tratados pelo protocolo de mediação da BM." },
        { icon: <Timer size={16} />, title: "Pontualidade & Preparo", body: "Esteja pronta no horário: rosto limpo e sem maquiagem, cabelo lavado e seco (salvo orientação) e unhas sem esmalte para serviços de unha." },
      ]} />
    </div>
  </section>;
}
