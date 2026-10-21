import { lazy, Suspense, useEffect, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { Bell, CheckCircle2, MapPin, MessageCircle, Star } from "lucide-react";
import { translateUi, useLanguage } from "../../lib/bm-i18n";
import { createSupportTicket, listNotifications, markNotificationsRead, rateClient, useBmSession, type Notification } from "../../lib/bm-store";
import { WHATSAPP_URL } from "./trust-support";

const AddressMap = lazy(() => import("./address-map"));

type Category = "payment_missing" | "disrespect" | "forgot_item" | "incomplete_service" | "lost_item";
const options: Record<"client" | "professional", [Category, string][]> = {
  professional: [["payment_missing", "Não recebi o valor"], ["disrespect", "Fui desrespeitado"], ["forgot_item", "Esqueci um item"]],
  client: [["incomplete_service", "Serviço incompleto/problema"], ["lost_item", "Perdi um item no local"]],
};
const chip = "inline-flex min-h-10 items-center justify-center gap-1 rounded-full border border-border bg-card px-3 text-xs font-semibold disabled:opacity-50";

/** Quick support shortcuts saved as tickets for the BM admin panel, plus WhatsApp. */
export function QuickSupport({ role, bookingId }: { role: "client" | "professional"; bookingId?: string | undefined }) {
  const { language } = useLanguage();
  const t = (s: string) => translateUi(s, language);
  const { user } = useBmSession();
  const [picked, setPicked] = useState<Category | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const send = async () => {
    if (!picked || busy) return;
    setBusy(true); setStatus("");
    try { await createSupportTicket({ role, category: picked, bookingId, message }); setStatus("Relato enviado à gestão BM."); setPicked(null); setMessage(""); }
    catch { setStatus("Não foi possível enviar o relato."); }
    finally { setBusy(false); }
  };
  return <div className="mt-4 rounded-lg border border-border bg-background p-3 text-left">
    <p className="text-xs font-bold">{t("Precisa de ajuda com este atendimento?")}</p>
    <div className="mt-2 flex flex-wrap gap-2">
      {options[role].map(([key, label]) => <button key={key} type="button" disabled={!user} aria-pressed={picked === key} onClick={() => setPicked(key)} className={`${chip} ${picked === key ? "border-primary bg-primary text-primary-foreground" : ""}`}>{t(label)}</button>)}
      <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className={chip}><MessageCircle size={14} />{t("Falar no WhatsApp")}</a>
    </div>
    {!user && <p className="mt-2 text-[10px] text-muted-foreground">{t("Entre na sua conta para enviar um relato.")}</p>}
    {picked && <div className="mt-3"><textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} placeholder={t("Descreva o ocorrido (opcional)")} className="h-20 w-full rounded-lg border border-border bg-card p-2 text-xs" /><button type="button" disabled={busy} onClick={() => { void send(); }} className="mt-2 min-h-10 w-full rounded-lg bg-primary text-xs font-bold text-primary-foreground">{t(busy ? "Enviando…" : "Enviar à gestão BM")}</button></div>}
    {status && <p role="status" className="mt-2 text-xs font-semibold">{t(status)}</p>}
  </div>;
}

/** Professional side after the PIN: confirm receipt and privately rate the client. */
export function ProPostService({ bookingId }: { bookingId?: string | undefined }) {
  const { language } = useLanguage();
  const t = (s: string) => translateUi(s, language);
  const [stars, setStars] = useState(0);
  const [received, setReceived] = useState(false);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const save = async () => {
    if (!bookingId || !stars || busy) return;
    setBusy(true); setError("");
    try { await rateClient({ bookingId, rating: stars, comment, paymentReceived: received }); setDone(true); }
    catch (err) { const m = err instanceof Error ? err.message : ""; setError(/duplicate|23505/i.test(m) ? "Você já avaliou este cliente." : "Não foi possível salvar a avaliação."); }
    finally { setBusy(false); }
  };
  return <div className="mt-4 text-left">
    {done ? <p className="flex items-center gap-2 text-xs font-semibold text-success"><CheckCircle2 size={15} />{t("Avaliação interna do cliente salva.")}</p> : bookingId ? <div className="rounded-lg border border-border bg-background p-3">
      <p className="text-xs font-bold">{t("Avaliação interna do cliente")}</p>
      <label className="mt-2 flex items-center gap-2 text-xs"><input type="checkbox" checked={received} onChange={(e) => setReceived(e.target.checked)} />{t("Confirmo o recebimento do valor")}</label>
      <div className="mt-2 flex gap-1">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" onClick={() => setStars(n)} aria-label={t(`${n} estrelas`)}><Star size={24} className={n <= stars ? "fill-primary text-primary" : "text-border"} /></button>)}</div>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} placeholder={t("Comentário interno (visível só para a BM)")} className="mt-2 h-16 w-full rounded-lg border border-border bg-card p-2 text-xs" />
      {error && <p className="text-xs text-destructive">{t(error)}</p>}
      <button type="button" disabled={!stars || busy} onClick={() => { void save(); }} className="mt-2 min-h-10 w-full rounded-lg bg-primary text-xs font-bold text-primary-foreground disabled:opacity-45">{t(busy ? "Salvando…" : "Salvar avaliação")}</button>
    </div> : <p className="text-[10px] text-muted-foreground">{t("Entre na sua conta para avaliar o cliente.")}</p>}
    <QuickSupport role="professional" bookingId={bookingId} />
  </div>;
}

/** Bell with the signed-in account's alerts: confirmations, escrow releases and support replies. */
export function NotificationCenter() {
  const { language, locale } = useLanguage();
  const t = (s: string) => translateUi(s, language);
  const { user } = useBmSession();
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!user) { setItems([]); return; }
    let active = true;
    const load = () => { void listNotifications().then((rows) => { if (active) setItems(rows); }).catch(() => {}); };
    load();
    const timer = window.setInterval(load, 60000);
    return () => { active = false; window.clearInterval(timer); };
  }, [user]);
  if (!user) return null;
  const unread = items.filter((n) => !n.read).length;
  const toggle = () => {
    setOpen((o) => !o);
    if (!open && unread) { void markNotificationsRead().then(() => setItems((rows) => rows.map((r) => ({ ...r, read: true })))).catch(() => {}); }
  };
  return <div>
    <button type="button" onClick={toggle} aria-expanded={open} aria-label={t("Notificações")} className="relative flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card"><Bell size={18} />{unread > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">{unread}</span>}</button>
    {open && <div className="absolute right-4 top-16 z-40 w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-card p-3 shadow-modal">
      <p className="text-xs font-bold">{t("Central de Notificações")}</p>
      {items.length === 0 ? <p className="mt-3 text-xs text-muted-foreground">{t("Nenhuma notificação por enquanto.")}</p> : <ul className="mt-2 max-h-80 space-y-2 overflow-auto">{items.map((n) => <li key={n.id} className="rounded-md bg-background p-2 text-xs"><p className="font-semibold">{t(n.title)}</p>{n.body && <p className="text-muted-foreground">{n.body}</p>}<p className="mt-1 text-[10px] text-muted-foreground">{new Date(n.created_at).toLocaleString(locale)}</p></li>)}</ul>}
    </div>}
  </div>;
}

/** Free OpenStreetMap picker for the home-service or partner-salon address in Florianópolis. */
export function AddressPicker({ value, onChange }: { value: string; onChange: (address: string) => void }) {
  const { language } = useLanguage();
  return <div className="mt-3">
    <p className="flex items-center gap-1 text-xs font-semibold"><MapPin size={14} className="text-primary" />{translateUi("Toque no mapa para escolher o bairro/endereço", language)}</p>
    <div className="mt-2"><ClientOnly fallback={<div className="h-64 rounded-lg bg-secondary/40" />}><Suspense fallback={<div className="h-64 rounded-lg bg-secondary/40" />}><AddressMap onPick={onChange} /></Suspense></ClientOnly></div>
    {value && <p className="mt-2 text-xs"><span className="font-semibold">{translateUi("Local selecionado", language)}:</span> {value}</p>}
  </div>;
}
