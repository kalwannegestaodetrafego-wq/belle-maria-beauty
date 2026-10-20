import { useState } from "react";
import { CalendarCheck2, CheckCircle2, Clock3, Lock, Pencil, Plus, Save, Star, Wallet } from "lucide-react";
import { translateUi, useLanguage } from "../../lib/bm-i18n";
import { money } from "./booking-extras";
import { ReviewModal } from "./extras";

export type Appointment = { id: string; client: string; service: string; when: string; value: number; group: "today" | "upcoming" | "done" };

const tabs = [["today", "Hoje"], ["upcoming", "Próximos"], ["done", "Concluídos"]] as const;
const card = "mt-6 rounded-lg border border-primary/40 bg-card/85 p-4 shadow-card backdrop-blur";

export function AppointmentsSummary({ items }: { items: Appointment[] }) {
  const { language } = useLanguage();
  const [tab, setTab] = useState<Appointment["group"]>("today");
  const list = items.filter((a) => a.group === tab);
  return <section className={card} aria-label={translateUi("Resumo de Agendamentos", language)}>
    <h2 className="flex items-center gap-2 font-display text-2xl"><CalendarCheck2 size={20} className="text-primary" />{translateUi("Resumo de Agendamentos", language)}</h2>
    <div role="tablist" className="mt-4 grid grid-cols-3 gap-1 rounded-lg bg-background p-1">
      {tabs.map(([id, label]) => <button key={id} role="tab" type="button" aria-selected={tab === id} onClick={() => setTab(id)} className={`min-h-10 rounded-md text-xs font-bold ${tab === id ? "bg-foreground text-background" : "text-muted-foreground"}`}>{translateUi(label, language)} · {items.filter((a) => a.group === id).length}</button>)}
    </div>
    <div className="mt-3 space-y-2">{list.length ? list.map((a) => <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg bg-background px-3 py-2.5 text-xs"><div><p className="font-semibold">{a.client} · {translateUi(a.service, language)}</p><p className="text-muted-foreground">{a.when}</p></div><span className={`shrink-0 font-bold ${a.group === "done" ? "text-success" : "text-primary"}`}>{money(a.value)}</span></div>) : <p className="py-3 text-center text-xs text-muted-foreground">{translateUi("Nenhum agendamento aqui.", language)}</p>}</div>
  </section>;
}

type Service = { id: number; name: string; price: number; minutes: number };
export function ServicesManager() {
  const { language } = useLanguage();
  const [services, setServices] = useState<Service[]>(() => [{ id: 1, name: "Maquiagem Social", price: 150, minutes: 60 }, { id: 2, name: "Penteado", price: 120, minutes: 50 }, { id: 3, name: "Maquiagem Noiva", price: 380, minutes: 120 }]);
  const [editing, setEditing] = useState<number | null>(null);
  const update = (id: number, patch: Partial<Service>) => setServices((s) => s.map((x) => x.id === id ? { ...x, ...patch } : x));
  const add = () => { const id = Date.now(); setServices((s) => [...s, { id, name: "Novo serviço", price: 100, minutes: 60 }]); setEditing(id); };
  const input = "h-10 w-full rounded-md border border-border bg-card px-2 text-sm outline-none focus:border-primary";
  return <section className={card} aria-label={translateUi("Gestão de Serviços", language)}>
    <div className="flex items-center justify-between"><h2 className="font-display text-2xl">{translateUi("Gestão de Serviços", language)}</h2><button type="button" onClick={add} className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-primary px-3 text-xs font-bold"><Plus size={15} />{translateUi("Adicionar", language)}</button></div>
    <div className="mt-3 space-y-2">{services.map((s) => editing === s.id ? <div key={s.id} className="rounded-lg border border-primary bg-background p-3">
      <label className="block text-[11px] font-semibold">{translateUi("Nome do serviço", language)}<input value={s.name} maxLength={60} onChange={(e) => update(s.id, { name: e.target.value })} className={`${input} mt-1`} /></label>
      <div className="mt-2 grid grid-cols-2 gap-2"><label className="text-[11px] font-semibold">{translateUi("Preço (R$)", language)}<input type="number" min={1} max={10000} value={s.price} onChange={(e) => update(s.id, { price: Math.max(0, Number(e.target.value)) })} className={`${input} mt-1`} /></label><label className="text-[11px] font-semibold">{translateUi("Duração (min)", language)}<input type="number" min={10} max={600} step={5} value={s.minutes} onChange={(e) => update(s.id, { minutes: Math.max(0, Number(e.target.value)) })} className={`${input} mt-1`} /></label></div>
      <button type="button" disabled={!s.name.trim() || s.price <= 0 || s.minutes <= 0} onClick={() => setEditing(null)} className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-1 rounded-lg bg-primary text-xs font-bold text-primary-foreground disabled:opacity-45"><Save size={14} />{translateUi("Salvar", language)}</button>
    </div> : <div key={s.id} className="flex items-center justify-between gap-3 rounded-lg bg-background px-3 py-2.5 text-xs"><div><p className="font-semibold">{translateUi(s.name, language)}</p><p className="flex items-center gap-1 text-muted-foreground"><Clock3 size={12} />{s.minutes} min</p></div><span className="ml-auto font-bold">{money(s.price)}</span><button type="button" onClick={() => setEditing(s.id)} aria-label={translateUi("Editar", language)} className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-secondary"><Pencil size={14} /></button></div>)}</div>
  </section>;
}

export function EarningsStatement({ escrow, available, withdrawn, onWithdraw }: { escrow: number; available: number; withdrawn: boolean; onWithdraw: () => void }) {
  const { language } = useLanguage();
  return <section className="mt-6 rounded-lg bg-foreground p-5 text-background shadow-card" aria-label={translateUi("Extrato de Ganhos", language)}>
    <p className="flex items-center gap-2 text-xs font-semibold text-background/70"><Wallet size={16} />{translateUi("Extrato de Ganhos", language)}</p>
    <div className="mt-4 grid grid-cols-2 gap-3">
      <div className="rounded-lg bg-background/10 p-3"><p className="flex items-center gap-1 text-[10px] text-background/70"><Lock size={12} />{translateUi("A liberar em Escrow", language)}</p><p className="mt-1 font-display text-2xl">{money(escrow)}</p></div>
      <div className="rounded-lg bg-success/25 p-3"><p className="flex items-center gap-1 text-[10px] text-background/80"><CheckCircle2 size={12} />{translateUi("Disponível para Resgate", language)}</p><p className="mt-1 font-display text-2xl">{money(withdrawn ? 0 : available)}</p></div>
    </div>
    <button type="button" onClick={onWithdraw} disabled={withdrawn || available <= 0} className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-background text-sm font-bold text-foreground disabled:opacity-45">{translateUi(withdrawn ? "Saque solicitado" : "Sacar via PIX", language)}</button>
    <p className="mt-2 text-[10px] text-background/60">{translateUi("Valores líquidos após taxa BM de 18% · simulação.", language)}</p>
  </section>;
}

export function ReleaseSuccess({ amount, onClose }: { amount: number; onClose: () => void }) {
  const { language } = useLanguage();
  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay/60 p-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={translateUi("Atendimento concluído!", language)}>
    <div className="w-full max-w-sm animate-in zoom-in-90 fade-in rounded-2xl bg-background p-6 text-center shadow-modal duration-300">
      <span className="relative mx-auto flex h-20 w-20 items-center justify-center"><span className="absolute inset-0 animate-ping rounded-full bg-success/40" /><span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-success text-success-foreground"><CheckCircle2 size={40} /></span></span>
      <h2 className="mt-5 font-display text-3xl">{translateUi("Atendimento concluído!", language)}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{translateUi("Valor liberado da Garantia BM para o extrato do profissional.", language)}</p>
      <p className="mt-3 font-display text-2xl text-success">+ {money(amount)}</p>
      <button type="button" onClick={onClose} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">{translateUi("Ver extrato", language)}</button>
    </div>
  </div>;
}

export function MyAppointments({ professional, service, when, value, completed, statusLabel }: { professional: string; service: string; when: string; value: number; completed: boolean; statusLabel: string }) {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [rated, setRated] = useState(false);
  return <section className={card} aria-label={translateUi("Meus Agendamentos", language)}>
    <h2 className="flex items-center gap-2 font-display text-2xl"><CalendarCheck2 size={20} className="text-primary" />{translateUi("Meus Agendamentos", language)}</h2>
    <div className="mt-3 rounded-lg bg-background p-3 text-xs">
      <div className="flex justify-between gap-3"><div><p className="font-semibold">{professional} · {translateUi(service, language)}</p><p className="text-muted-foreground">{when}</p></div><span className={`h-fit shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${completed ? "bg-success text-success-foreground" : "bg-secondary"}`}>{translateUi(statusLabel, language)}</span></div>
      <p className="mt-2 font-bold">{money(value)}</p>
      {completed ? <button type="button" disabled={rated} onClick={() => setOpen(true)} className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-1 rounded-lg border border-primary text-xs font-bold disabled:opacity-60"><Star size={14} className="fill-primary text-primary" />{translateUi(rated ? "Avaliação enviada" : "Avaliar Profissional", language)}</button>
        : <p className="mt-2 text-[10px] text-muted-foreground">{translateUi("A avaliação é liberada após a conclusão do atendimento.", language)}</p>}
    </div>
    {open && <ReviewModal name={professional} onClose={() => { setOpen(false); setRated(true); }} />}
  </section>;
}
