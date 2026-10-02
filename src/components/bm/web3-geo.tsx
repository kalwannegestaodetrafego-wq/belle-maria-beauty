import { useState } from "react";
import { CheckCircle2, Coins, Link2, Lock, MapPin, Navigation, Search, Wallet } from "lucide-react";

const btn = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-all active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-45";
const primary = `${btn} bg-primary text-primary-foreground shadow-luxe hover:bg-primary/90`;
const outline = `${btn} border border-border bg-card hover:bg-accent`;
const card = "rounded-lg border border-primary/40 bg-card/85 p-4 shadow-card backdrop-blur";

type WalletName = "Phantom" | "Solflare";
const demoAddress = "7xKX…BM92";

/* ---------- Solana checkout (demo, sem transação real) ---------- */
export function SolanaCheckout({ total }: { total: number }) {
  const [wallet, setWallet] = useState<WalletName | null>(null);
  const usdc = (total / 5.4).toFixed(2);
  return <div className="mt-5 space-y-3">
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs font-bold">Pagar com Solana / USDC · demonstração</p>
      <p className="mt-1 text-xs text-muted-foreground">≈ {usdc} USDC (cotação ilustrativa). Nenhuma transação real é enviada.</p>
      {wallet ? <p className="mt-3 flex items-center gap-2 rounded-md bg-success-soft p-3 text-xs font-bold text-success"><CheckCircle2 size={16} /> {wallet} conectada · {demoAddress}</p>
        : <div className="mt-3"><p className="mb-2 flex items-center gap-1.5 text-xs font-semibold"><Wallet size={14} className="text-primary" /> Conectar Carteira Solana</p><div className="grid grid-cols-2 gap-2">{(["Phantom", "Solflare"] as const).map((w) => <button key={w} type="button" onClick={() => setWallet(w)} className={outline}>{w}</button>)}</div></div>}
    </div>
    <div className="rounded-lg border border-primary/40 bg-secondary/60 p-4 backdrop-blur">
      <p className="flex items-center gap-2 text-xs font-bold"><Lock size={15} className="text-primary" /> Contrato de custódia {wallet ? <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] text-primary-foreground">Pronto</span> : <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">Aguardando carteira</span>}</p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">Valor mantido em custódia na rede Solana até a digitação do PIN de 4 dígitos no atendimento.</p>
    </div>
  </div>;
}

/* ---------- Pontos BM tokenizados (demo) ---------- */
export function SolanaPointsHub() {
  const [wallet, setWallet] = useState<WalletName | null>(null);
  return <div className="mt-6 rounded-lg border border-primary/40 bg-card/85 p-4 shadow-card backdrop-blur">
    <h2 className="flex items-center gap-2 font-display text-2xl"><Coins size={20} className="text-primary" /> Pontos BM na Solana</h2>
    <p className="mt-1 text-xs text-muted-foreground">Pontos BM mintados na rede Solana (Tokens SPL) · demonstração</p>
    {wallet ? <div className="mt-4 rounded-lg bg-foreground p-4 text-background"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">Saldo na carteira {wallet}</p><p className="mt-1 font-display text-3xl">480 BMPTS</p><p className="text-xs opacity-80">{demoAddress} · token SPL ilustrativo</p></div>
      : <div className="mt-4 grid grid-cols-2 gap-2">{(["Phantom", "Solflare"] as const).map((w) => <button key={w} type="button" onClick={() => setWallet(w)} className={outline}><Link2 size={15} /> {w}</button>)}</div>}
  </div>;
}

/* ---------- Localização: CEP + distância (pronto para Google Maps) ---------- */
const providers = [{ name: "Camila Silva", lat: -27.5935, lng: -48.5402 }, { name: "Studio Bella · Agronômica", lat: -27.5779, lng: -48.5321 }, { name: "Juliana Costa", lat: -27.6011, lng: -48.5195 }];
function km(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const r = (d: number) => (d * Math.PI) / 180;
  const h = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

export function LocationPanel() {
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState<string | null>(null);
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [msg, setMsg] = useState("");

  const searchCep = async () => {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) { setMsg("Digite um CEP com 8 números."); return; }
    setMsg("Buscando…");
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const d = await res.json();
      if (d.erro) { setMsg("CEP não encontrado."); return; }
      setAddress(`${d.logradouro || "Endereço"} · ${d.bairro || ""} · ${d.localidade}/${d.uf}`);
      setPos((p) => p ?? { lat: -27.5949, lng: -48.5482 });
      setMsg("");
    } catch { setMsg("Não foi possível buscar o CEP agora."); }
  };
  const locate = () => {
    if (!navigator.geolocation) { setMsg("Localização indisponível neste aparelho."); return; }
    setMsg("Localizando…");
    navigator.geolocation.getCurrentPosition((p) => { setPos({ lat: p.coords.latitude, lng: p.coords.longitude }); setMsg(""); }, () => setMsg("Permissão de localização negada."));
  };

  return <div className={`${card} mt-6`}>
    <h2 className="flex items-center gap-2 font-display text-2xl"><MapPin size={20} className="text-primary" /> Sua localização</h2>
    <div className="mt-4 flex gap-2"><input value={cep} inputMode="numeric" placeholder="CEP (ex. 88015-000)" onChange={(e) => setCep(e.target.value.replace(/[^\d-]/g, "").slice(0, 9))} className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary" /><button type="button" onClick={searchCep} className={primary} aria-label="Buscar CEP"><Search size={16} /></button><button type="button" onClick={locate} className={outline} aria-label="Usar minha localização"><Navigation size={16} /></button></div>
    {msg && <p className="mt-2 text-xs text-muted-foreground">{msg}</p>}
    {address && <p className="mt-2 text-xs font-semibold">{address}</p>}
    <div className="mt-3 flex h-28 items-center justify-center rounded-lg border border-dashed border-primary/50 bg-secondary/40 text-center text-xs text-muted-foreground">Mapa do Google será exibido aqui<br />quando a chave do Google Maps for conectada.</div>
    {pos && <div className="mt-3 space-y-1.5">{providers.map((p) => ({ ...p, d: km(pos, p) })).sort((a, b) => a.d - b.d).map((p) => <div key={p.name} className="flex justify-between rounded-lg bg-background px-3 py-2 text-xs"><span className="font-semibold">{p.name}</span><span className="font-bold text-primary">{p.d.toFixed(1)} km</span></div>)}<p className="text-[10px] text-muted-foreground">Distância em linha reta, aproximada.</p></div>}
  </div>;
}
