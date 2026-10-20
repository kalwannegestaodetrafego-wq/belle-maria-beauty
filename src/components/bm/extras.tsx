import { translateUi, useLanguage } from "../../lib/bm-i18n";
import { useState, type ReactNode } from "react";
import {
  AlertTriangle, Armchair, Bus, Camera, Check, CheckCircle2, Clock3, FileCheck2, Fuel, Lightbulb, Megaphone, Send, ShieldCheck, Star, Upload, Users, X,
} from "lucide-react";
import { FaceVerification, IdentityTrustCard } from "./trust-support";
import { supabase } from "@/integrations/supabase/client";
import { requiredDocs, syncProfile, type AccountType, type DocKind } from "@/lib/bm-account";

export function Sheet({ title, eyebrow, onClose, children, z = "z-50" }: { title: string; eyebrow?: string; onClose: () => void; children: ReactNode; z?: string }) {
  const { language, locale } = useLanguage();
  return <div className={`fixed inset-0 ${z} flex items-end justify-center bg-overlay/55 backdrop-blur-sm md:items-center md:p-6`} role="dialog" aria-modal="true" aria-label={translateUi(title, language)}>
    <div className="modal-scroll max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-background text-left text-foreground shadow-modal md:rounded-xl">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-5 py-4 backdrop-blur-xl">
        <div className="min-w-0">{translateUi(eyebrow && <p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">{translateUi(eyebrow, language)}</p>, language)}<h2 className="mt-1 truncate font-display text-2xl">{translateUi(title, language)}</h2></div>
        <button onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg hover:bg-accent" aria-label={translateUi("Fechar", language)}><X size={19} /></button>
      </div>
      <div className="p-5">{translateUi(children, language)}</div>
    </div>
  </div>;
}

const btn = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-all active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-45";
const primary = `${btn} bg-primary text-primary-foreground shadow-luxe hover:bg-primary/90`;
const outline = `${btn} border border-border bg-card hover:bg-accent`;
const input = "h-11 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary";

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const { language, locale } = useLanguage();
  return <label className="block text-xs font-semibold">{translateUi(label, language)}<input {...props} className={`${input} mt-1.5 font-normal`} /></label>;
}

function UploadBox({ label, done, onClick, icon }: { label: string; done: boolean; onClick: () => void; icon?: ReactNode }) {
  const { language, locale } = useLanguage();
  return <button type="button" onClick={onClick} className={`flex w-full items-center gap-3 rounded-lg border border-dashed p-4 text-left text-sm ${done ? "border-success bg-success-soft" : "border-primary/50 bg-card"}`}>
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${done ? "bg-success text-success-foreground" : "bg-secondary text-primary"}`}>{translateUi(done ? <Check size={18} /> : icon ?? <Upload size={18} />, language)}</span>
    <span className="min-w-0"><strong className="block">{translateUi(label, language)}</strong><span className="text-xs text-muted-foreground">{translateUi(done ? "Arquivo enviado · em análise" : "Toque para enviar", language)}</span></span>
  </button>;
}

function FileBox({ label, file, onFile, icon }: { label: string; file?: File | undefined; onFile: (f: File) => void; icon?: ReactNode }) {
  const { language, locale } = useLanguage();
  return <label className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border border-dashed p-4 text-left text-sm ${file ? "border-success bg-success-soft" : "border-primary/50 bg-card"}`}>
    <input type="file" accept="image/*,application/pdf" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${file ? "bg-success text-success-foreground" : "bg-secondary text-primary"}`}>{translateUi(file ? <Check size={18} /> : icon ?? <Upload size={18} />, language)}</span>
    <span className="min-w-0"><strong className="block">{translateUi(label, language)}</strong><span className="block truncate text-xs text-muted-foreground">{translateUi(file ? file.name : "Toque para escolher o arquivo (até 10 MB)", language)}</span></span>
  </label>;
}

const docLabel: Record<DocKind, string> = { selfie: "Selfie de segurança", identity: "Documento de identidade (RG/CNH) ou alvará" };

/* ---------- Auth ---------- */
export function AuthModal({ onClose, onProfessionalSignup }: { onClose: () => void; onProfessionalSignup?: () => void }) {
  const { language, locale } = useLanguage();
  const tabs = ["Cliente", "Profissional Beleza", "Salão Parceiro"] as const;
  const [tab, setTab] = useState<(typeof tabs)[number]>("Cliente");
  const [professionalType, setProfessionalType] = useState<"cpf" | "cnpj">("cpf");
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [files, setFiles] = useState<Partial<Record<DocKind, File>>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<null | "confirm" | "ok" | "docs">(null);
  const [missing, setMissing] = useState<DocKind[]>([]);
  const accountType: AccountType = tab === "Cliente" ? "cliente" : tab === "Profissional Beleza" ? "profissional" : "salao";
  const setFile = (k: DocKind) => (f: File) => setFiles((u) => ({ ...u, [k]: f }));
  const needed = requiredDocs(accountType);
  const requiredUploadsComplete = mode === "login" || needed.every((k) => files[k]);

  const finishSync = async (req: DocKind[]) => {
    const left = await syncProfile(files, req);
    setMissing(left);
    setResult(left.length ? "docs" : "ok");
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); if (!requiredUploadsComplete || busy) return;
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim(); const password = String(fd.get("password") || "");
    setBusy(true); setError("");
    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const t = (data.user?.user_metadata?.["account_type"] as AccountType) || "cliente";
        await finishSync(requiredDocs(t));
      } else {
        const meta: Record<string, string> = { account_type: accountType };
        ["full_name", "cpf", "cnpj", "phone", "address", "residence_details", "salon_name"].forEach((k) => { const v = fd.get(k); if (v) meta[k] = String(v); });
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin, data: meta } });
        if (error) throw error;
        if (data.session) await finishSync(needed); else setResult("confirm");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível concluir. Tente novamente.");
    } finally { setBusy(false); }
  };

  if (result === "docs") return <Sheet title={translateUi("Envie seus documentos", language)} eyebrow={translateUi("Verificação BM", language)} onClose={onClose}>
    <p className="text-sm text-muted-foreground">{translateUi("Para concluir a verificação, envie os arquivos abaixo. Eles ficam em área privada, acessível só por você.", language)}</p>
    <div className="mt-4 space-y-3">{translateUi(missing.map((k) => <FileBox key={k} label={translateUi(docLabel[k], language)} file={files[k]} onFile={setFile(k)} icon={k === "selfie" ? <Camera size={18} /> : <FileCheck2 size={18} />} />), language)}</div>
    {translateUi(error && <p className="mt-3 text-xs font-semibold text-destructive">{translateUi(error, language)}</p>, language)}
    <button disabled={busy || !missing.every((k) => files[k])} onClick={async () => { setBusy(true); setError(""); try { await finishSync(missing); } catch (err) { setError(err instanceof Error ? err.message : "Falha no envio."); } finally { setBusy(false); } }} className={`${primary} mt-5 w-full`}>{translateUi(busy ? "Enviando…" : "Enviar documentos", language)}</button>
  </Sheet>;

  if (result) return <Sheet title={translateUi("Tudo certo!", language)} eyebrow={translateUi("Conta BM", language)} onClose={onClose}><div className="text-center"><CheckCircle2 className="mx-auto text-success" size={48} /><p className="mt-4 font-display text-2xl">{translateUi(result === "confirm" ? "Confirme seu e-mail" : mode === "login" ? "Bem-vinda de volta" : "Cadastro enviado", language)}</p><p className="mt-2 text-sm text-muted-foreground">{translateUi(result === "confirm" ? "Enviamos um link de confirmação. Depois de confirmar, entre na sua conta para enviar a selfie e os documentos." : "Seu perfil e documentos foram salvos. Nossa equipe valida em até 24h.", language)}</p><button onClick={mode === "signup" && tab === "Profissional Beleza" && onProfessionalSignup ? onProfessionalSignup : onClose} className={`${primary} mt-6 w-full`}>{translateUi(mode === "signup" && tab === "Profissional Beleza" ? "Iniciar minicurso de boas-vindas" : "Continuar", language)}</button></div><FaceVerification className="mt-6" /></Sheet>;

  return <Sheet title={translateUi(mode === "signup" ? "Criar conta" : "Entrar", language)} eyebrow={translateUi("Acesso BM", language)} onClose={onClose}>
    <IdentityTrustCard className="mb-5" />
    {translateUi(mode === "signup" && <div className="grid grid-cols-3 rounded-lg bg-card p-1 ring-1 ring-border">{translateUi(tabs.map((t) => <button type="button" key={t} onClick={() => setTab(t)} className={`min-h-11 rounded-md px-1 text-[10px] font-bold leading-tight ${tab === t ? "bg-foreground text-background" : "text-muted-foreground"}`}>{translateUi(t, language)}</button>), language)}</div>, language)}
    <form onSubmit={submit} className="mt-5 space-y-3">
      <Field label={translateUi("E-mail", language)} name="email" type="email" required maxLength={255} placeholder={translateUi("voce@email.com", language)} />
      <Field label={translateUi("Senha", language)} name="password" type="password" required minLength={6} maxLength={72} placeholder={translateUi("••••••••", language)} />
      {translateUi(mode === "login" ? null : tab === "Salão Parceiro" ? <>
        <Field label={translateUi("Nome do salão", language)} name="salon_name" required maxLength={100} placeholder={translateUi("Studio Bella", language)} />
        <Field label={translateUi("CNPJ", language)} name="cnpj" required inputMode="numeric" maxLength={18} placeholder={translateUi("00.000.000/0001-00", language)} />
        <Field label={translateUi("Endereço", language)} name="address" required maxLength={160} placeholder={translateUi("Rua, número · Bairro", language)} />
        <FileBox label={translateUi("Alvará / Licença sanitária", language)} file={files.identity} onFile={setFile("identity")} icon={<FileCheck2 size={18} />} />
      </> : tab === "Profissional Beleza" ? <>
        <div className="grid grid-cols-2 rounded-lg bg-card p-1 ring-1 ring-border" aria-label={translateUi("Forma de atuação", language)}>
          <button type="button" onClick={() => setProfessionalType("cpf")} className={`min-h-11 rounded-md px-2 text-[11px] font-bold leading-tight ${professionalType === "cpf" ? "bg-foreground text-background" : "text-muted-foreground"}`}>{translateUi("Atuar com CPF", language)}<br /><span className="font-normal">{translateUi("Individual", language)}</span></button>
          <button type="button" onClick={() => setProfessionalType("cnpj")} className={`min-h-11 rounded-md px-2 text-[11px] font-bold leading-tight ${professionalType === "cnpj" ? "bg-foreground text-background" : "text-muted-foreground"}`}>{translateUi("Atuar com CNPJ", language)}<br /><span className="font-normal">{translateUi("MEI", language)}</span></button>
        </div>
        <Field label={translateUi("Nome completo", language)} name="full_name" required maxLength={100} placeholder={translateUi("Ana Martins", language)} />
        {translateUi(professionalType === "cpf" ? <div className="grid grid-cols-2 gap-3"><Field label={translateUi("CPF", language)} name="cpf" required inputMode="numeric" maxLength={14} placeholder={translateUi("000.000.000-00", language)} /><Field label={translateUi("Telefone", language)} name="phone" required inputMode="tel" maxLength={20} placeholder={translateUi("(48) 99999-0000", language)} /></div> : <Field label={translateUi("CNPJ MEI", language)} name="cnpj" required inputMode="numeric" maxLength={18} placeholder={translateUi("00.000.000/0001-00", language)} />, language)}
        <FileBox label={translateUi("Documento de identidade (RG/CNH)", language)} file={files.identity} onFile={setFile("identity")} icon={<FileCheck2 size={18} />} />
        <FileBox label={translateUi("Selfie de segurança", language)} file={files.selfie} onFile={setFile("selfie")} icon={<Camera size={18} />} />
      </> : <>
        <Field label={translateUi("Nome completo", language)} name="full_name" required maxLength={100} placeholder={translateUi("Ana Martins", language)} />
        <div className="grid grid-cols-2 gap-3"><Field label={translateUi("CPF", language)} name="cpf" required inputMode="numeric" maxLength={14} placeholder={translateUi("000.000.000-00", language)} /><Field label={translateUi("Telefone", language)} name="phone" required inputMode="tel" maxLength={20} placeholder={translateUi("(48) 99999-0000", language)} /></div>
        <Field label={translateUi("Endereço completo", language)} name="address" required maxLength={160} placeholder={translateUi("Rua, número · Bairro", language)} />
        <Field label={translateUi("Detalhes da residência", language)} name="residence_details" required maxLength={100} placeholder={translateUi("Condomínio, bloco, apartamento", language)} />
        <FileBox label={translateUi("Selfie de segurança obrigatória", language)} file={files.selfie} onFile={setFile("selfie")} icon={<Camera size={18} />} />
      </>, language)}
      {translateUi(error && <p className="text-xs font-semibold text-destructive">{translateUi(error, language)}</p>, language)}
      <button type="submit" disabled={!requiredUploadsComplete || busy} className={`${primary} w-full`}>{translateUi(busy ? "Aguarde…" : mode === "signup" ? "Cadastrar" : "Entrar", language)}</button>
    </form>
    <button onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(""); }} className="mt-4 w-full text-center text-xs font-semibold text-primary">{translateUi(mode === "signup" ? "Já tenho conta · Entrar" : "Não tem conta? Cadastre-se", language)}</button>
  </Sheet>;
}

/* ---------- Chat ---------- */
const quickReplies = ["Estou na portaria", "Onde posso estacionar?", "Ponto de referência enviado", "Maleta pronta"];
export function ChatModal({ name, onClose }: { name: string; onClose: () => void }) {
  const { language, locale } = useLanguage();
  const [messages, setMessages] = useState([
    { me: false, automatic: true, text: `Oi! Aqui é a ${name}. Confirmado para o seu horário ✨` },
    { me: true, automatic: true, text: "Perfeito, estarei te esperando!" },
  ]);
  const [text, setText] = useState("");
  const send = (t: string, automatic = false) => {
    const v = t.trim().slice(0, 500);
    if (!v) return;
    setMessages((m) => [...m, { me: true, automatic, text: v }]);
    setText("");
    setTimeout(() => setMessages((m) => [...m, { me: false, automatic: true, text: "Recebido! Obrigada 💛" }]), 900);
  };
  return <Sheet title={translateUi(name, language)} eyebrow={translateUi("Chat BM", language)} onClose={onClose} z="z-[70]">
    <div className="flex items-start gap-2 rounded-lg border border-primary/40 bg-secondary p-3 text-[11px] leading-5"><AlertTriangle size={16} className="mt-0.5 shrink-0 text-primary" /><p><strong>{translateUi("Aviso de Segurança BM:", language)}</strong>{translateUi(" Nunca compartilhe telefone ou faça pagamentos por fora. Transações fora do app perdem a Garantia BM e Seguro de Materiais.", language)}</p></div>
    <div className="mt-4 flex min-h-56 flex-col gap-2">{translateUi(messages.map((m, i) => <p key={i} className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.me ? "self-end rounded-br-sm bg-primary text-primary-foreground" : "self-start rounded-bl-sm bg-card shadow-soft"}`}>{m.automatic ? translateUi(m.text, language) : m.text}</p>), language)}</div>
    <div className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5">{translateUi(quickReplies.map((q) => <button key={q} onClick={() => send(q, true)} className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold">{translateUi(q, language)}</button>), language)}</div>
    <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="mt-3 flex gap-2"><input value={text} onChange={(e) => setText(e.target.value)} maxLength={500} placeholder={translateUi("Escreva uma mensagem", language)} aria-label={translateUi("Mensagem", language)} className={input} /><button type="submit" className={`${primary} w-11 shrink-0 px-0`} aria-label={translateUi("Enviar", language)}><Send size={17} /></button></form>
  </Sheet>;
}

/* ---------- Review ---------- */
export function ReviewModal({ name, onClose }: { name: string; onClose: () => void }) {
  const { language, locale } = useLanguage();
  const [stars, setStars] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [photo, setPhoto] = useState(false);
  const [sent, setSent] = useState(false);
  const all = ["Pontual", "Higienizado", "Simpática", "Resultado incrível"];
  if (sent) return <Sheet title={translateUi("Obrigada!", language)} eyebrow={translateUi("Avaliação", language)} onClose={onClose} z="z-[70]"><div className="text-center"><CheckCircle2 className="mx-auto text-success" size={48} /><p className="mt-3 text-sm text-muted-foreground">{translateUi("Sua avaliação ajuda a comunidade BM.", language)}</p><button onClick={onClose} className={`${primary} mt-6 w-full`}>{translateUi("Fechar", language)}</button></div></Sheet>;
  return <Sheet title={translateUi(`Avaliar ${name}`, language)} eyebrow={translateUi("Pós-atendimento", language)} onClose={onClose} z="z-[70]">
    <div className="flex justify-center gap-2">{translateUi([1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setStars(n)} aria-label={translateUi(`${n} estrelas`, language)}><Star size={34} className={n <= stars ? "fill-primary text-primary" : "text-border"} /></button>), language)}</div>
    <div className="mt-5 flex flex-wrap gap-2">{translateUi(all.map((t) => <button key={t} onClick={() => setTags((c) => c.includes(t) ? c.filter((x) => x !== t) : [...c, t])} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${tags.includes(t) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>{translateUi(t, language)}</button>), language)}</div>
    <textarea maxLength={500} placeholder={translateUi("Conte como foi sua experiência", language)} className="mt-4 h-24 w-full rounded-lg border border-border bg-card p-3 text-sm outline-none focus:border-primary" />
    <div className="mt-3"><UploadBox label={translateUi("Foto do resultado", language)} done={photo} onClick={() => setPhoto(true)} icon={<Camera size={18} />} /></div>
    <button disabled={!stars} onClick={() => setSent(true)} className={`${primary} mt-5 w-full`}>{translateUi("Enviar avaliação", language)}</button>
  </Sheet>;
}

/* ---------- Professional extras ---------- */
export function OnboardingBanner() {
  const { language, locale } = useLanguage();
  const [docs, setDocs] = useState<Record<string, boolean>>({});
  const items = ["Documento de identidade (RG/CNH)", "Selfie de segurança"];
  const count = items.filter((i) => docs[i]).length;
  return <div className="mt-6 rounded-lg border border-primary/40 bg-card/85 p-4 shadow-soft backdrop-blur">
    <div className="flex items-center justify-between"><p className="flex items-center gap-2 text-sm font-bold"><ShieldCheck size={17} className="text-success" />{translateUi(" Verificação de perfil", language)}</p><span className="text-xs font-bold text-primary">{translateUi(count, language)}{translateUi("/", language)}{translateUi(items.length, language)}</span></div>
    <div className="mt-3 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-success transition-all" style={{ width: `${(count / items.length) * 100}%` }} /></div>
    <div className="mt-3 space-y-2">{translateUi(items.map((i) => <UploadBox key={i} label={translateUi(i, language)} done={!!docs[i]} onClick={() => setDocs((d) => ({ ...d, [i]: true }))} />), language)}</div>
  </div>;
}

export function TravelTipModal({ onClose }: { onClose: () => void }) {
  const { language, locale } = useLanguage();
  const [km, setKm] = useState(8);
  const fuel = (km * 2 / 10) * 6.2;
  const bus = 2 * 6.25;
  return <Sheet title={translateUi("Como cobrar o deslocamento", language)} eyebrow={translateUi("Dica BM", language)} onClose={onClose}>
    <p className="text-sm leading-6 text-muted-foreground">{translateUi("Some apenas o custo real de ida e volta. Evite embutir valores extras no serviço — preço justo gera mais avaliações 5★.", language)}</p>
    <label className="mt-5 block text-xs font-semibold">{translateUi("Distância até a cliente: ", language)}{translateUi(km, language)}{translateUi(" km", language)}<input type="range" min={1} max={30} value={km} onChange={(e) => setKm(Number(e.target.value))} className="mt-2 w-full accent-primary" /></label>
    <div className="mt-4 grid grid-cols-2 gap-3">
      <div className="rounded-lg bg-card p-4 shadow-soft"><Fuel size={18} className="text-primary" /><p className="mt-2 text-xs text-muted-foreground">{translateUi("Carro (10 km/L · R$ 6,20)", language)}</p><p className="font-display text-xl">{translateUi("R$ ", language)}{translateUi(fuel.toFixed(2).replace(".", ","), language)}</p></div>
      <div className="rounded-lg bg-card p-4 shadow-soft"><Bus size={18} className="text-primary" /><p className="mt-2 text-xs text-muted-foreground">{translateUi("Ônibus ida e volta", language)}</p><p className="font-display text-xl">{translateUi("R$ ", language)}{translateUi(bus.toFixed(2).replace(".", ","), language)}</p></div>
    </div>
    <p className="mt-4 flex gap-2 text-xs text-muted-foreground"><Lightbulb size={15} className="shrink-0 text-primary" />{translateUi(" Fórmula: (km × 2 ÷ consumo) × preço do litro.", language)}</p>
    <button onClick={onClose} className={`${primary} mt-5 w-full`}>{translateUi("Entendi", language)}</button>
  </Sheet>;
}

const chairs = [
  { id: "c1", salon: "Studio Bella", place: "Agronômica", station: "Cadeira de maquiagem", hour: 35, day: 180 },
  { id: "c2", salon: "Maison Lagoa", place: "Lagoa da Conceição", station: "Bancada de unhas", hour: 25, day: 140 },
  { id: "c3", salon: "Atelier Centro", place: "Centro", station: "Lavatório + cadeira hair", hour: 45, day: 220 },
];

export function ChairBooking() {
  const { language, locale } = useLanguage();
  const [booked, setBooked] = useState<string[]>([]);
  return <div className="mt-6"><h2 className="font-display text-2xl">{translateUi("Reservar Cadeira em Salão", language)}</h2><p className="mt-1 text-xs text-muted-foreground">{translateUi("Espaços parceiros em Florianópolis", language)}</p>
    <div className="mt-4 space-y-3">{translateUi(chairs.map((c) => <div key={c.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 shadow-soft"><div className="min-w-0"><p className="font-bold">{translateUi(c.salon, language)}</p><p className="truncate text-xs text-muted-foreground">{translateUi(c.station, language)}{translateUi(" · ", language)}{translateUi(c.place, language)}</p><p className="mt-1 text-xs font-bold text-primary">{translateUi("R$ ", language)}{translateUi(c.hour, language)}{translateUi("/h · R$ ", language)}{translateUi(c.day, language)}{translateUi("/dia", language)}</p></div>{translateUi(booked.includes(c.id) ? <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-success"><CheckCircle2 size={16} />{translateUi(" Reservada", language)}</span> : <button onClick={() => setBooked((b) => [...b, c.id])} className={`${primary} shrink-0 px-3`}>{translateUi("Reservar", language)}</button>, language)}</div>), language)}</div>
  </div>;
}

/* ---------- B2B ---------- */
export function B2BView() {
  const { language, locale } = useLanguage();
  const [stations, setStations] = useState([
    { id: 1, name: "Cadeira de maquiagem", hour: 35, day: 180, active: true },
    { id: 2, name: "Bancada de unhas", hour: 25, day: 140, active: false },
  ]);
  const [newName, setNewName] = useState("");
  const [newHour, setNewHour] = useState("30");
  const [jobs, setJobs] = useState<{ title: string; date: string; slots: number }[]>([]);
  const [job, setJob] = useState({ title: "", date: "", slots: "2" });
  const [invited, setInvited] = useState<string[]>([]);
  const top = [{ n: "Camila Silva", r: "4,9", s: "Maquiagem" }, { n: "Juliana Costa", r: "5,0", s: "Massagem" }, { n: "Bianca Rocha", r: "4,8", s: "Penteado" }];

  return <section className="py-7">
    <p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">{translateUi("Empresa & Salão B2B", language)}</p>
    <h1 className="mt-1 font-display text-4xl">{translateUi("Studio Bella", language)}</h1>
    <p className="mt-2 text-sm text-muted-foreground">{translateUi("Gerencie espaços ociosos e contrate reforços.", language)}</p>

    <div className="mt-6 rounded-lg border border-primary/40 bg-card/85 p-4 shadow-card backdrop-blur">
      <h2 className="flex items-center gap-2 font-display text-2xl"><Armchair size={20} className="text-primary" />{translateUi(" Modo Cadeira Vazia", language)}</h2>
      <p className="mt-1 text-xs text-muted-foreground">{translateUi("Rent-a-Chair para profissionais independentes", language)}</p>
      <div className="mt-4 space-y-2">{translateUi(stations.map((s) => <div key={s.id} className="flex items-center justify-between gap-3 rounded-lg bg-background p-3"><div className="min-w-0"><p className="truncate text-sm font-bold">{translateUi(s.name, language)}</p><p className="text-xs text-muted-foreground">{translateUi("R$ ", language)}{translateUi(s.hour, language)}{translateUi("/h · R$ ", language)}{translateUi(s.day, language)}{translateUi("/dia", language)}</p></div><button role="switch" aria-checked={s.active} aria-label={translateUi(`Disponibilizar ${s.name}`, language)} onClick={() => setStations((l) => l.map((x) => x.id === s.id ? { ...x, active: !x.active } : x))} className={`relative h-6 w-11 shrink-0 rounded-full transition ${s.active ? "bg-success" : "bg-muted"}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-all ${s.active ? "left-[22px]" : "left-0.5"}`} /></button></div>), language)}</div>
      <form onSubmit={(e) => { e.preventDefault(); const name = newName.trim().slice(0, 60); const hour = Math.max(1, Math.min(999, Number(newHour) || 0)); if (!name) return; setStations((l) => [...l, { id: Date.now(), name, hour, day: hour * 5, active: true }]); setNewName(""); }} className="mt-3 grid grid-cols-[1fr_80px_auto] gap-2"><input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={translateUi("Nova estação", language)} aria-label={translateUi("Nome da estação", language)} className={input} /><input value={newHour} onChange={(e) => setNewHour(e.target.value.replace(/\D/g, "").slice(0, 3))} inputMode="numeric" aria-label={translateUi("Preço por hora", language)} className={input} /><button className={`${outline} px-3`}>{translateUi("Adicionar", language)}</button></form>
    </div>

    <div className="mt-6 rounded-lg border border-border bg-card/85 p-4 shadow-card backdrop-blur">
      <h2 className="flex items-center gap-2 font-display text-2xl"><Megaphone size={20} className="text-primary" />{translateUi(" Solicitar Reforço / Freelance", language)}</h2>
      <form onSubmit={(e) => { e.preventDefault(); const title = job.title.trim().slice(0, 80); if (!title || !job.date) return; setJobs((j) => [{ title, date: job.date, slots: Number(job.slots) || 1 }, ...j]); setJob({ title: "", date: "", slots: "2" }); }} className="mt-4 space-y-3">
        <input value={job.title} onChange={(e) => setJob({ ...job, title: e.target.value })} placeholder={translateUi("Ex: Casamento · 6 noivas e madrinhas", language)} aria-label={translateUi("Título do evento", language)} className={input} />
        <div className="grid grid-cols-2 gap-2"><input type="date" value={job.date} onChange={(e) => setJob({ ...job, date: e.target.value })} aria-label={translateUi("Data", language)} className={input} /><input value={job.slots} onChange={(e) => setJob({ ...job, slots: e.target.value.replace(/\D/g, "").slice(0, 2) })} inputMode="numeric" aria-label={translateUi("Vagas", language)} className={input} /></div>
        <button className={`${primary} w-full`}>{translateUi("Publicar chamado", language)}</button>
      </form>
      {translateUi(jobs.map((j, i) => <div key={i} className="mt-3 flex items-center gap-3 rounded-lg bg-success-soft p-3 text-xs"><CheckCircle2 size={17} className="shrink-0 text-success" /><span><strong className="block">{translateUi(j.title, language)}</strong>{translateUi(j.date, language)}{translateUi(" · ", language)}{translateUi(j.slots, language)}{translateUi(" vagas · enviado às profissionais top", language)}</span></div>), language)}
      <p className="mb-2 mt-5 flex items-center gap-2 text-xs font-bold"><Users size={15} />{translateUi(" Profissionais MEI mais bem avaliadas", language)}</p>
      <div className="space-y-2">{translateUi(top.map((t) => <div key={t.n} className="flex items-center justify-between rounded-lg bg-background p-3"><div><p className="text-sm font-bold">{translateUi(t.n, language)}</p><p className="flex items-center gap-1 text-xs text-muted-foreground"><Star size={12} className="fill-primary text-primary" />{translateUi(t.r, language)}{translateUi(" · ", language)}{translateUi(t.s, language)}</p></div>{translateUi(invited.includes(t.n) ? <span className="flex items-center gap-1 text-xs font-bold text-success"><Clock3 size={14} />{translateUi(" Convidada", language)}</span> : <button onClick={() => setInvited((v) => [...v, t.n])} className={`${outline} min-h-9 px-3 text-xs`}>{translateUi("Convidar", language)}</button>, language)}</div>), language)}</div>
    </div>
  </section>;
}
