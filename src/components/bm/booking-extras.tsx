import { translateUi, useLanguage } from "../../lib/bm-i18n";
import { AddressPicker } from "./post-service";
import { Check, Clock3, Gift, MapPin, Sparkles } from "lucide-react";
import { Button } from "../ui/button";

export type BookingExtras = { slots: string[]; hasTable: boolean; forOther: boolean; recipient: string; specialist: string; notes: string; address: string; useCredit: boolean };

export const initialExtras: BookingExtras = { slots: [], hasTable: false, forOther: false, recipient: "", specialist: "", notes: "", address: "", useCredit: false };

export function brazilDays(locale = "en-US") {
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const [year = 2026, month = 1, day = 1] = date.split("-").map(Number);
  return Array.from({ length: 7 }, (_, index) => {
    const value = new Date(Date.UTC(year, month - 1, day + index));
    return { id: value.toISOString().slice(0, 10), week: new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }).format(value).replace(".", ""), day: String(value.getUTCDate()), month: new Intl.DateTimeFormat(locale, { month: "long", timeZone: "UTC" }).format(value) };
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
  const { language, locale } = useLanguage();
  const dates = brazilDays(locale);
  const urgent = bookingIsUrgent(day, extras.slots);
  return <div>
    <h3 className="mb-3 mt-7 font-display text-xl">{translateUi("Escolha o dia", language)}</h3>
    <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">{translateUi(dates.map((date) => <Button variant="outline" key={date.id} onClick={() => { setDay(date.id); setExtras({ ...extras, slots: [] }); }} aria-pressed={day === date.id} className={`h-auto min-h-18 min-w-16 shrink-0 flex-col gap-0 rounded-lg p-2 text-center ${day === date.id ? "border-primary bg-secondary" : "bg-card"}`}><span className="text-[10px] uppercase">{translateUi(date.week, language)}</span><span className="font-display text-xl">{translateUi(date.day, language)}</span></Button>), language)}</div>
    <h3 className="mb-3 mt-7 font-display text-xl">{translateUi("Horários preferidos", language)}</h3>
    <p className="mb-3 text-xs leading-5 text-muted-foreground">{translateUi("Escolha horários alternados e te avisamos qual encaixou na agenda da especialista. Selecione até 3; o primeiro é sua preferência principal.", language)}</p>
    <div className="grid grid-cols-3 gap-2">{translateUi(bookingTimes.map((time) => {
      const isPast = !day || new Date(`${day}T${time}:00-03:00`).getTime() <= Date.now();
      const selected = extras.slots.includes(time);
      return <Button variant="outline" key={time} disabled={isPast || (!selected && extras.slots.length >= 3)} onClick={() => setExtras({ ...extras, slots: selected ? extras.slots.filter((slot) => slot !== time) : [...extras.slots, time] })} aria-pressed={selected} className={`h-12 gap-1 px-1 text-xs ${selected ? "border-primary bg-secondary" : "bg-card"}`}><Clock3 size={14} />{translateUi(time, language)}</Button>;
    }), language)}</div>
    {translateUi(extras.slots.length > 0 && <p className="mt-3 text-xs text-muted-foreground">{translateUi("Preferências: ", language)}{translateUi(extras.slots.join(" · "), language)}</p>, language)}
    {translateUi(urgent && <p className="mt-4 flex items-start gap-2 rounded-lg border border-primary/40 bg-secondary p-3 text-xs leading-5"><Sparkles size={16} className="shrink-0 text-primary" />{translateUi(" Adicional de Urgência (+R$ 15,00) para atendimento em menos de 12h.", language)}</p>, language)}
    <div className="mt-5 flex justify-between border-t border-border pt-4 text-sm"><span>{translateUi("Total protegido", language)}</span><strong>{translateUi(money(bookingTotal(price, urgent, extras, false)), language)}</strong></div>
  </div>;
}

function ToggleRow({ checked, onChange, label, hint }: { checked: boolean; onChange: () => void; label: string; hint?: string }) {
  const { language, locale } = useLanguage();
  return <Button variant="ghost" role="checkbox" aria-checked={checked} onClick={onChange} className="flex h-auto min-h-12 w-full items-start gap-3 rounded-md px-0 py-2 text-left whitespace-normal hover:bg-transparent"><span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${checked ? "border-success bg-success text-success-foreground" : "border-input"}`}>{translateUi(checked && <Check size={13} />, language)}</span><span><span className="block text-sm font-semibold leading-5">{translateUi(label, language)}</span>{translateUi(hint && <span className="mt-1 block text-xs leading-5 text-muted-foreground">{translateUi(hint, language)}</span>, language)}</span></Button>;
}

export function CheckoutOptions({ extras, setExtras, isMassage, favorites, selectedProfessional }: { extras: BookingExtras; setExtras: (extras: BookingExtras) => void; isMassage: boolean; favorites: { id: string; name: string }[]; selectedProfessional: string }) {
  const { language, locale } = useLanguage();
  return <section className="mt-6 border-t border-border pt-5" aria-label={translateUi("Preferências do atendimento", language)}><h3 className="font-display text-xl">{translateUi("Detalhes do atendimento", language)}</h3>
    {translateUi(isMassage && <ToggleRow checked={extras.hasTable} onChange={() => setExtras({ ...extras, hasTable: !extras.hasTable })} label={translateUi("Possuo maca de massagem no local", language)} hint="Desconto de R$ 10,00 pelo transporte dispensado da maca." />, language)}
    <ToggleRow checked={extras.forOther} onChange={() => setExtras({ ...extras, forOther: !extras.forOther })} label={translateUi("Atendimento para outra pessoa (não sou o titular)", language)} />
    {translateUi(extras.forOther && <label className="mt-2 block text-xs font-semibold">{translateUi("Nome da pessoa atendida", language)}<input required value={extras.recipient} onChange={(e) => setExtras({ ...extras, recipient: e.target.value.slice(0, 80) })} className="mt-1.5 h-11 w-full rounded-md border border-border bg-card px-3 text-sm font-normal outline-none focus:border-primary" placeholder={translateUi("Nome completo", language)} /></label>, language)}
    <label className="mt-4 block text-xs font-semibold">{translateUi("Especialista Preferida", language)}<select value={extras.specialist} onChange={(e) => setExtras({ ...extras, specialist: e.target.value })} className="mt-1.5 h-11 w-full rounded-md border border-border bg-card px-3 text-sm font-normal outline-none focus:border-primary"><option value="">{translateUi("Sem preferência", language)}</option>{translateUi(favorites.map((favorite) => <option key={favorite.id} value={favorite.id}>{translateUi(favorite.name, language)}{translateUi(favorite.id === selectedProfessional ? " · selecionada" : "", language)}</option>), language)}</select>{translateUi(favorites.length === 0 && <span className="mt-1 block font-normal text-muted-foreground">{translateUi("Favorite uma profissional no catálogo para escolhê-la aqui.", language)}</span>, language)}{translateUi(extras.specialist && extras.specialist !== selectedProfessional && <span className="mt-1 block font-normal text-muted-foreground">{translateUi("Esta preferência será enviada no pedido; a especialista do serviço atual não muda automaticamente.", language)}</span>, language)}</label>
    <AddressPicker value={extras.address} onChange={(address) => setExtras({ ...extras, address: address.slice(0, 160) })} />
    <label className="mt-4 block text-xs font-semibold"><span className="flex items-center gap-1"><MapPin size={14} />{translateUi(" Observações do Local & Ponto de Referência", language)}</span><textarea value={extras.notes} onChange={(e) => setExtras({ ...extras, notes: e.target.value.slice(0, 400) })} maxLength={400} className="mt-1.5 min-h-20 w-full rounded-md border border-border bg-card p-3 text-sm font-normal outline-none focus:border-primary" placeholder={translateUi("Portaria, bloco, acesso ou instruções importantes", language)} /></label>
    <div className="mt-4 border-t border-border pt-3"><ToggleRow checked={extras.useCredit} onChange={() => setExtras({ ...extras, useCredit: !extras.useCredit })} label={translateUi("Usar Vale Presente / crédito BM", language)} hint="Crédito demonstrativo de R$ 20,00 aplicado ao total desta reserva." /></div>
    {translateUi(extras.useCredit && <p className="flex items-center gap-2 text-xs font-semibold text-success"><Gift size={15} />{translateUi(" − R$ 20,00 em crédito aplicado", language)}</p>, language)}
  </section>;
}