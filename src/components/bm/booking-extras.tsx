import { Check, Clock3, Gift, MapPin, Sparkles } from "lucide-react";
import { Button } from "../ui/button";

export type BookingExtras = { slots: string[]; hasTable: boolean; forOther: boolean; recipient: string; specialist: string; notes: string; useCredit: boolean };

export const initialExtras: BookingExtras = { slots: [], hasTable: false, forOther: false, recipient: "", specialist: "", notes: "", useCredit: false };

export function brazilDays() {
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const [year = 2026, month = 1, day = 1] = date.split("-").map(Number);
  return Array.from({ length: 7 }, (_, index) => {
    const value = new Date(Date.UTC(year, month - 1, day + index));
    return { id: value.toISOString().slice(0, 10), week: new Intl.DateTimeFormat("pt-BR", { weekday: "short", timeZone: "UTC" }).format(value).replace(".", ""), day: String(value.getUTCDate()), month: new Intl.DateTimeFormat("pt-BR", { month: "long", timeZone: "UTC" }).format(value) };
  });
}

export const bookingTimes = ["09:00", "10:30", "11:30", "14:00", "16:00", "16:30"];
export const bookingIsUrgent = (date: string, slots: string[]) => {
  const primary = slots[0];
  if (!date || !primary) return false;
  const hours = (new Date(`${date}T${primary}:00-03:00`).getTime() - Date.now()) / 3600000;
  return hours > 0 && hours < 12;
};
export const bookingTotal = (price: number, urgent: boolean, extras: BookingExtras, massage: boolean) => Math.max(0, price + (urgent ? 15 : 0) - (massage && extras.hasTable ? 10 : 0) - (extras.useCredit ? 20 : 0));
export const money = (value: number) => `R$ ${value.toFixed(2).replace(".", ",")}`;

export function FlexibleSchedule({ day, setDay, extras, setExtras, price }: { day: string; setDay: (day: string) => void; extras: BookingExtras; setExtras: (extras: BookingExtras) => void; price: number }) {
  const dates = brazilDays();
  const urgent = bookingIsUrgent(day, extras.slots);
  return <div>
    <h3 className="mb-3 mt-7 font-display text-xl">Escolha o dia</h3>
    <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">{dates.map((date) => <Button variant="outline" key={date.id} onClick={() => { setDay(date.id); setExtras({ ...extras, slots: [] }); }} aria-pressed={day === date.id} className={`h-auto min-h-18 min-w-16 shrink-0 flex-col gap-0 rounded-lg p-2 text-center ${day === date.id ? "border-primary bg-secondary" : "bg-card"}`}><span className="text-[10px] uppercase">{date.week}</span><span className="font-display text-xl">{date.day}</span></Button>)}</div>
    <h3 className="mb-3 mt-7 font-display text-xl">Horários preferidos</h3>
    <p className="mb-3 text-xs leading-5 text-muted-foreground">Escolha horários alternados e te avisamos qual encaixou na agenda da especialista. Selecione até 3; o primeiro é sua preferência principal.</p>
    <div className="grid grid-cols-3 gap-2">{bookingTimes.map((time) => {
      const isPast = !day || new Date(`${day}T${time}:00-03:00`).getTime() <= Date.now();
      const selected = extras.slots.includes(time);
      return <Button variant="outline" key={time} disabled={isPast || (!selected && extras.slots.length >= 3)} onClick={() => setExtras({ ...extras, slots: selected ? extras.slots.filter((slot) => slot !== time) : [...extras.slots, time] })} aria-pressed={selected} className={`h-12 gap-1 px-1 text-xs ${selected ? "border-primary bg-secondary" : "bg-card"}`}><Clock3 size={14} />{time}</Button>;
    })}</div>
    {extras.slots.length > 0 && <p className="mt-3 text-xs text-muted-foreground">Preferências: {extras.slots.join(" · ")}</p>}
    {urgent && <p className="mt-4 flex items-start gap-2 rounded-lg border border-primary/40 bg-secondary p-3 text-xs leading-5"><Sparkles size={16} className="shrink-0 text-primary" /> Adicional de Urgência (+R$ 15,00) para atendimento em menos de 12h.</p>}
    <div className="mt-5 flex justify-between border-t border-border pt-4 text-sm"><span>Total protegido</span><strong>{money(bookingTotal(price, urgent, extras, false))}</strong></div>
  </div>;
}

function ToggleRow({ checked, onChange, label, hint }: { checked: boolean; onChange: () => void; label: string; hint?: string }) {
  return <Button variant="ghost" role="checkbox" aria-checked={checked} onClick={onChange} className="flex h-auto min-h-12 w-full items-start gap-3 rounded-md px-0 py-2 text-left whitespace-normal hover:bg-transparent"><span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${checked ? "border-success bg-success text-success-foreground" : "border-input"}`}>{checked && <Check size={13} />}</span><span><span className="block text-sm font-semibold leading-5">{label}</span>{hint && <span className="mt-1 block text-xs leading-5 text-muted-foreground">{hint}</span>}</span></Button>;
}

export function CheckoutOptions({ extras, setExtras, isMassage, favorites, selectedProfessional }: { extras: BookingExtras; setExtras: (extras: BookingExtras) => void; isMassage: boolean; favorites: { id: string; name: string }[]; selectedProfessional: string }) {
  return <section className="mt-6 border-t border-border pt-5" aria-label="Preferências do atendimento"><h3 className="font-display text-xl">Detalhes do atendimento</h3>
    {isMassage && <ToggleRow checked={extras.hasTable} onChange={() => setExtras({ ...extras, hasTable: !extras.hasTable })} label="Possuo maca de massagem no local" hint="Desconto de R$ 10,00 pelo transporte dispensado da maca." />}
    <ToggleRow checked={extras.forOther} onChange={() => setExtras({ ...extras, forOther: !extras.forOther })} label="Atendimento para outra pessoa (não sou o titular)" />
    {extras.forOther && <label className="mt-2 block text-xs font-semibold">Nome da pessoa atendida<input required value={extras.recipient} onChange={(e) => setExtras({ ...extras, recipient: e.target.value.slice(0, 80) })} className="mt-1.5 h-11 w-full rounded-md border border-border bg-card px-3 text-sm font-normal outline-none focus:border-primary" placeholder="Nome completo" /></label>}
    <label className="mt-4 block text-xs font-semibold">Especialista Preferida<select value={extras.specialist} onChange={(e) => setExtras({ ...extras, specialist: e.target.value })} className="mt-1.5 h-11 w-full rounded-md border border-border bg-card px-3 text-sm font-normal outline-none focus:border-primary"><option value="">Sem preferência</option>{favorites.map((favorite) => <option key={favorite.id} value={favorite.id}>{favorite.name}{favorite.id === selectedProfessional ? " · selecionada" : ""}</option>)}</select>{favorites.length === 0 && <span className="mt-1 block font-normal text-muted-foreground">Favorite uma profissional no catálogo para escolhê-la aqui.</span>}{extras.specialist && extras.specialist !== selectedProfessional && <span className="mt-1 block font-normal text-muted-foreground">Esta preferência será enviada no pedido; a especialista do serviço atual não muda automaticamente.</span>}</label>
    <label className="mt-4 block text-xs font-semibold"><span className="flex items-center gap-1"><MapPin size={14} /> Observações do Local & Ponto de Referência</span><textarea value={extras.notes} onChange={(e) => setExtras({ ...extras, notes: e.target.value.slice(0, 400) })} maxLength={400} className="mt-1.5 min-h-20 w-full rounded-md border border-border bg-card p-3 text-sm font-normal outline-none focus:border-primary" placeholder="Portaria, bloco, acesso ou instruções importantes" /></label>
    <div className="mt-4 border-t border-border pt-3"><ToggleRow checked={extras.useCredit} onChange={() => setExtras({ ...extras, useCredit: !extras.useCredit })} label="Usar Vale Presente / crédito BM" hint="Crédito demonstrativo de R$ 20,00 aplicado ao total desta reserva." /></div>
    {extras.useCredit && <p className="flex items-center gap-2 text-xs font-semibold text-success"><Gift size={15} /> − R$ 20,00 em crédito aplicado</p>}
  </section>;
}