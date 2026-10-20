import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, CheckCircle2, Copy, Lock, Receipt, ShieldCheck, Timer, Wallet, Zap } from "lucide-react";
import { translateUi, useLanguage } from "../../lib/bm-i18n";
import { money } from "./booking-extras";

export type HybridMethod = "pix" | "solana";
const PIX_SECONDS = 15 * 60;
export const USDC_RATE = 5.4;
const demoAddress = "7xKX…BM92";

function crc16(payload: string) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
}
const field = (id: string, value: string) => `${id}${String(value.length).padStart(2, "0")}${value}`;

/** Simulated BR Code (Pix Copia e Cola) carrying the amount in BRL. */
export function buildPixCode(total: number, txid: string) {
  const account = field("00", "BR.GOV.BCB.PIX") + field("01", "startupbmcomercial@gmail.com");
  const body = field("00", "01") + field("26", account) + field("52", "0000") + field("53", "986") + field("54", total.toFixed(2)) + field("58", "BR") + field("59", "BM BELLE MARIA") + field("60", "FLORIANOPOLIS") + field("62", field("05", txid)) + "6304";
  return body + crc16(body);
}

export function EscrowSeal() {
  const { language } = useLanguage();
  return <div className="mt-4 flex gap-3 rounded-lg border border-success/40 bg-success-soft p-4">
    <ShieldCheck className="shrink-0 text-success" size={24} />
    <p className="text-xs leading-5"><strong className="text-success">{translateUi("Garantia BM:", language)}</strong>{" "}{translateUi("O valor do pagamento fica retido em caução de proteção (escrow) e só é liberado para o profissional após a realização do serviço.", language)}</p>
  </div>;
}

export function HybridCheckout({ total, method, setMethod, txid, onWalletChange }: { total: number; method: HybridMethod; setMethod: (m: HybridMethod) => void; txid: string; onWalletChange: (wallet: string | null) => void }) {
  const { language } = useLanguage();
  const [left, setLeft] = useState(PIX_SECONDS);
  const [copied, setCopied] = useState(false);
  const [wallet, setWallet] = useState<string | null>(null);
  const pix = buildPixCode(total, txid);
  const usdc = (total / USDC_RATE).toFixed(2);
  const solanaUrl = `solana:BMEscrow7xKXdemoBM92?amount=${usdc}&spl-token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&label=BM&message=${encodeURIComponent("Reserva BM " + txid)}`;

  useEffect(() => {
    if (method !== "pix" || left <= 0) return;
    const id = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [method, left]);
  useEffect(() => { onWalletChange(method === "solana" ? wallet : null); }, [method, wallet, onWalletChange]);

  const tabs: { id: HybridMethod; label: string; icon: typeof Zap }[] = [{ id: "pix", label: "Pix Instantâneo (R$)", icon: Zap }, { id: "solana", label: "Solana Pay (USDC)", icon: Wallet }];
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return <div className="mt-2">
    <div role="tablist" aria-label={translateUi("Forma de pagamento", language)} className="grid grid-cols-2 gap-1 rounded-xl border border-primary/30 bg-card/70 p-1 shadow-soft backdrop-blur">
      {tabs.map(({ id, label, icon: Icon }) => <button key={id} role="tab" type="button" aria-selected={method === id} onClick={() => setMethod(id)} className={`flex min-h-12 items-center justify-center gap-2 rounded-lg px-2 text-xs font-bold transition-all ${method === id ? "bg-foreground text-background shadow-card" : "text-muted-foreground hover:bg-secondary"}`}><Icon size={16} className={method === id ? "text-primary" : ""} />{translateUi(label, language)}</button>)}
    </div>

    {method === "pix" ? <div role="tabpanel" className="mt-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between"><p className="text-xs font-bold">{translateUi("Pix Copia e Cola · simulação", language)}</p><span className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold ${left > 0 ? "bg-secondary text-foreground" : "bg-destructive/15 text-destructive"}`}><Timer size={13} />{left > 0 ? `${mm}:${ss}` : translateUi("Expirado", language)}</span></div>
      <div className="mx-auto mt-4 w-fit rounded-lg border border-primary/30 bg-background p-3"><QRCodeSVG value={pix} size={168} bgColor="transparent" fgColor="currentColor" className={`text-foreground ${left === 0 ? "opacity-20" : ""}`} aria-label={translateUi("QR Code Pix", language)} /></div>
      <p className="mt-2 text-center font-display text-2xl">{money(total)}</p>
      <div className="mt-3 rounded-md bg-muted p-3"><code className="block break-all text-[10px] leading-4">{pix}</code></div>
      <button type="button" disabled={left === 0} onClick={() => { navigator.clipboard?.writeText(pix); setCopied(true); }} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-primary bg-secondary text-sm font-bold disabled:opacity-45">{copied ? <Check size={16} /> : <Copy size={16} />}{translateUi(copied ? "Chave copiada!" : "Copiar Chave Pix", language)}</button>
      {left === 0 && <button type="button" onClick={() => { setLeft(PIX_SECONDS); setCopied(false); }} className="mt-2 w-full text-xs font-bold text-primary underline">{translateUi("Gerar nova chave", language)}</button>}
      <EscrowSeal />
    </div> : <div role="tabpanel" className="mt-4 rounded-lg border border-border bg-card p-4">
      <p className="text-xs font-bold">{translateUi("Solana Pay · demonstração", language)}</p>
      <p className="mt-1 text-xs text-muted-foreground">{translateUi("≈ ", language)}{usdc}{translateUi(" USDC (cotação ilustrativa). Nenhuma transação real é enviada.", language)}</p>
      <div className="mx-auto mt-4 w-fit rounded-lg border border-primary/30 bg-background p-3"><QRCodeSVG value={solanaUrl} size={168} bgColor="transparent" fgColor="currentColor" className="text-foreground" aria-label={translateUi("QR Code Solana Pay", language)} /></div>
      <p className="mt-2 text-center font-display text-2xl">{usdc} USDC</p>
      {wallet ? <p className="mt-3 flex items-center gap-2 rounded-md bg-success-soft p-3 text-xs font-bold text-success"><CheckCircle2 size={16} /> {wallet}{translateUi(" conectada · ", language)}{demoAddress}</p>
        : <div className="mt-3"><p className="mb-2 flex items-center gap-1.5 text-xs font-semibold"><Wallet size={14} className="text-primary" />{translateUi(" Conectar Carteira Solana", language)}</p><div className="grid grid-cols-2 gap-2">{(["Phantom", "Solflare"] as const).map((w) => <button key={w} type="button" onClick={() => setWallet(w)} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-card text-sm font-semibold hover:bg-accent">{w}</button>)}</div></div>}
      <p className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground"><Lock size={13} className="text-primary" />{translateUi("Escaneie com a carteira ou conecte-a para pagar.", language)}</p>
      <EscrowSeal />
    </div>}
  </div>;
}

export function PaymentReceipt({ txid, method, wallet, total, professional, service, day, slots, address, onContinue }: { txid: string; method: HybridMethod; wallet: string | null; total: number; professional: string; service: string; day: string; slots: string[]; address?: string | undefined; onContinue: () => void }) {
  const { language, locale } = useLanguage();
  const [paidAt] = useState(() => new Date());
  const dayLabel = day ? new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${day}T12:00:00Z`)) : "—";
  const rows: [string, string][] = [
    ["Profissional", professional], ["Serviço", service], ["Data", dayLabel], ["Horários preferidos", slots.join(" · ") || "—"],
    ...(address ? [["Local", address] as [string, string]] : []),
    ["Forma de pagamento", method === "pix" ? "Pix Instantâneo (R$)" : `Solana Pay (USDC)${wallet ? " · " + wallet : ""}`],
    ["Valor", method === "pix" ? money(total) : `${(total / USDC_RATE).toFixed(2)} USDC (≈ ${money(total)})`],
    ["Status", "Retido em escrow"],
  ];
  return <div className="p-5">
    <div className="text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success text-success-foreground"><CheckCircle2 size={32} /></div><h2 className="mt-4 font-display text-3xl">{translateUi("Pagamento confirmado!", language)}</h2><p className="mt-2 text-sm text-muted-foreground">{translateUi("Sua reserva está garantida. Confira o recibo digital.", language)}</p></div>
    <div className="mt-6 rounded-lg border border-primary/35 bg-card p-5 shadow-card">
      <div className="flex items-center justify-between border-b border-dashed border-border pb-3"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-primary"><Receipt size={15} />{translateUi("Recibo digital", language)}</p><p className="text-[10px] text-muted-foreground">{paidAt.toLocaleString(locale)}</p></div>
      <p className="mt-3 text-[11px] text-muted-foreground">{translateUi("Nº do recibo", language)}: <strong className="text-foreground">{txid}</strong></p>
      <dl className="mt-3 space-y-2 text-xs">{rows.map(([k, v]) => <div key={k} className="flex justify-between gap-4"><dt className="text-muted-foreground">{translateUi(k, language)}</dt><dd className="text-right font-semibold">{translateUi(v, language)}</dd></div>)}</dl>
      <p className="mt-4 border-t border-dashed border-border pt-3 text-[10px] text-muted-foreground">{translateUi("Pagamento simulado para demonstração. Nenhuma cobrança real foi realizada.", language)}</p>
    </div>
    <EscrowSeal />
    <button type="button" onClick={onContinue} className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-luxe">{translateUi("Acompanhar atendimento", language)}</button>
  </div>;
}
