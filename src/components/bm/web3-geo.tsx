import { translateUi, useLanguage } from "../../lib/bm-i18n";
import { lazy, Suspense, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { distanceKm, formatKm, places, type LatLng } from "../../lib/bm-places";
import { CheckCircle2, Coins, Link2, Compass, List, Lock, Map as MapIcon, MapPin, Search, Wallet } from "lucide-react";

const btn = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-all active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-45";
const primary = `${btn} bg-primary text-primary-foreground shadow-luxe hover:bg-primary/90`;
const outline = `${btn} border border-border bg-card hover:bg-accent`;
const card = "rounded-lg border border-primary/40 bg-card/85 p-4 shadow-card backdrop-blur";

type WalletName = "Phantom" | "Solflare";
const demoAddress = "7xKX…BM92";

/* ---------- Solana checkout (demo, sem transação real) ---------- */
export function SolanaCheckout({ total }: { total: number }) {
  const { language, locale } = useLanguage();
  const [wallet, setWallet] = useState<WalletName | null>(null);
  const usdc = (total / 5.4).toFixed(2);
  return <div className="mt-5 space-y-3">
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs font-bold">{translateUi("Pagar com Solana / USDC · demonstração", language)}</p>
      <p className="mt-1 text-xs text-muted-foreground">{translateUi("≈ ", language)}{translateUi(usdc, language)}{translateUi(" USDC (cotação ilustrativa). Nenhuma transação real é enviada.", language)}</p>
      {translateUi(wallet ? <p className="mt-3 flex items-center gap-2 rounded-md bg-success-soft p-3 text-xs font-bold text-success"><CheckCircle2 size={16} /> {translateUi(wallet, language)}{translateUi(" conectada · ", language)}{translateUi(demoAddress, language)}</p>
        : <div className="mt-3"><p className="mb-2 flex items-center gap-1.5 text-xs font-semibold"><Wallet size={14} className="text-primary" />{translateUi(" Conectar Carteira Solana", language)}</p><div className="grid grid-cols-2 gap-2">{translateUi((["Phantom", "Solflare"] as const).map((w) => <button key={w} type="button" onClick={() => setWallet(w)} className={outline}>{translateUi(w, language)}</button>), language)}</div></div>, language)}
    </div>
    <div className="rounded-lg border border-primary/40 bg-secondary/60 p-4 backdrop-blur">
      <p className="flex items-center gap-2 text-xs font-bold"><Lock size={15} className="text-primary" />{translateUi(" Contrato de custódia ", language)}{translateUi(wallet ? <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] text-primary-foreground">{translateUi("Pronto", language)}</span> : <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{translateUi("Aguardando carteira", language)}</span>, language)}</p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{translateUi("Valor mantido em custódia na rede Solana até a digitação do PIN de 4 dígitos no atendimento.", language)}</p>
    </div>
  </div>;
}

/* ---------- Pontos BM tokenizados (demo) ---------- */
export function SolanaPointsHub() {
  const { language, locale } = useLanguage();
  const [wallet, setWallet] = useState<WalletName | null>(null);
  return <div className="mt-6 rounded-lg border border-primary/40 bg-card/85 p-4 shadow-card backdrop-blur">
    <h2 className="flex items-center gap-2 font-display text-2xl"><Coins size={20} className="text-primary" />{translateUi(" Pontos BM na Solana", language)}</h2>
    <p className="mt-1 text-xs text-muted-foreground">{translateUi("Pontos BM mintados na rede Solana (Tokens SPL) · demonstração", language)}</p>
    {translateUi(wallet ? <div className="mt-4 rounded-lg bg-foreground p-4 text-background"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">{translateUi("Saldo na carteira ", language)}{translateUi(wallet, language)}</p><p className="mt-1 font-display text-3xl">{translateUi("480 BMPTS", language)}</p><p className="text-xs opacity-80">{translateUi(demoAddress, language)}{translateUi(" · token SPL ilustrativo", language)}</p></div>
      : <div className="mt-4 grid grid-cols-2 gap-2">{translateUi((["Phantom", "Solflare"] as const).map((w) => <button key={w} type="button" onClick={() => setWallet(w)} className={outline}><Link2 size={15} /> {translateUi(w, language)}</button>), language)}</div>, language)}
  </div>;
}

/* ---------- Localização: GPS, CEP/bairro/cidade, lista e mapa ---------- */
const PlacesMap = lazy(() => import("./places-map"));

export function LocationPanel() {
  const { language, locale } = useLanguage();
  const [query, setQuery] = useState("");
  const [address, setAddress] = useState<string | null>(null);
  const [pos, setPos] = useState<LatLng | null>(null);
  const [msg, setMsg] = useState("");
  const [view, setView] = useState<"list" | "map">("list");

  const search = async () => {
    const q = query.trim();
    if (q.length < 3) { setMsg("Digite um CEP, bairro ou cidade."); return; }
    setMsg("Buscando…");
    try {
      let text = q;
      const cep = q.replace(/\D/g, "");
      if (/^\d{5}-?\d{3}$/.test(q)) {
        const d = await (await fetch(`https://viacep.com.br/ws/${cep}/json/`)).json();
        if (d.erro) { setMsg("CEP não encontrado."); return; }
        text = `${d.logradouro ? d.logradouro + ", " : ""}${d.bairro ? d.bairro + ", " : ""}${d.localidade} - ${d.uf}`;
      }
      const r = await (await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(text)}`)).json();
      if (!r[0]) { setMsg("Local não encontrado."); return; }
      setPos({ lat: Number(r[0].lat), lng: Number(r[0].lon) });
      setAddress(text);
      setMsg("");
    } catch { setMsg("Não foi possível buscar agora."); }
  };
  const locate = () => {
    if (!navigator.geolocation) { setMsg("Localização indisponível neste aparelho."); return; }
    setMsg("Localizando…");
    navigator.geolocation.getCurrentPosition((p) => { setPos({ lat: p.coords.latitude, lng: p.coords.longitude }); setAddress("Sua localização atual (GPS)"); setMsg(""); }, () => setMsg("Permissão de localização negada."), { enableHighAccuracy: true, timeout: 10000 });
  };
  const items = places.map((p) => ({ ...p, d: pos ? distanceKm(pos, p) : null })).sort((a, b) => (a.d ?? 0) - (b.d ?? 0));

  return <div className={`${card} mt-6`}>
    <h2 className="flex items-center gap-2 font-display text-2xl"><MapPin size={20} className="text-primary" />{translateUi(" Sua localização", language)}</h2>
    <div className="mt-4 flex gap-2"><input value={query} placeholder={translateUi("CEP, bairro ou cidade", language)} onKeyDown={(e) => e.key === "Enter" && search()} onChange={(e) => setQuery(e.target.value.slice(0, 100))} className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary" /><button type="button" onClick={search} className={primary} aria-label={translateUi("Buscar local", language)}><Search size={16} /></button><button type="button" onClick={locate} className={outline} aria-label={translateUi("Usar minha localização", language)}><Compass size={16} /></button></div>
    {msg && <p className="mt-2 text-xs text-muted-foreground">{translateUi(msg, language)}</p>}
    {address && <p className="mt-2 text-xs font-semibold">{translateUi(address, language)}</p>}
    <div role="tablist" className="mt-4 grid grid-cols-2 gap-1 rounded-lg border border-border bg-background p-1">
      {([["list", "Visão em Lista", List], ["map", "Visão no Mapa", MapIcon]] as const).map(([id, label, Icon]) => <button key={id} role="tab" type="button" aria-selected={view === id} onClick={() => setView(id)} className={`flex min-h-10 items-center justify-center gap-2 rounded-md text-xs font-bold ${view === id ? "bg-foreground text-background" : "text-muted-foreground"}`}><Icon size={14} />{translateUi(label, language)}</button>)}
    </div>
    {view === "map" ? <div className="mt-3"><ClientOnly fallback={<div className="h-72 rounded-lg bg-secondary/40" />}><Suspense fallback={<div className="h-72 rounded-lg bg-secondary/40" />}><PlacesMap items={items} user={pos} /></Suspense></ClientOnly></div>
      : <div className="mt-3 space-y-2">{items.map((p) => <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg bg-background px-3 py-2.5 text-xs"><div><p className="font-semibold">{p.name}</p><p className="text-muted-foreground">{translateUi(p.kind, language)} · {p.area}</p></div><span className="shrink-0 font-bold text-primary">{p.d !== null ? translateUi(`a ${formatKm(p.d, locale)} km de você`, language) : "—"}</span></div>)}{!pos && <p className="text-[10px] text-muted-foreground">{translateUi("Use a bússola ou busque um local para ver as distâncias.", language)}</p>}</div>}
    {pos && <p className="mt-2 text-[10px] text-muted-foreground">{translateUi("Distância em linha reta, aproximada.", language)}</p>}
  </div>;
}
