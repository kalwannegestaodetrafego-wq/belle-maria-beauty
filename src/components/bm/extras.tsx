import { useState, type ReactNode } from "react";
import {
  AlertTriangle, Armchair, Bus, Camera, Check, CheckCircle2, Clock3, FileCheck2, Fuel, Lightbulb, Megaphone, Send, ShieldCheck, Star, Upload, Users, X,
} from "lucide-react";

export function Sheet({ title, eyebrow, onClose, children, z = "z-50" }: { title: string; eyebrow?: string; onClose: () => void; children: ReactNode; z?: string }) {
  return <div className={`fixed inset-0 ${z} flex items-end justify-center bg-overlay/55 backdrop-blur-sm md:items-center md:p-6`} role="dialog" aria-modal="true" aria-label={title}>
    <div className="modal-scroll max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-background text-left text-foreground shadow-modal md:rounded-xl">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-5 py-4 backdrop-blur-xl">
        <div className="min-w-0">{eyebrow && <p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">{eyebrow}</p>}<h2 className="mt-1 truncate font-display text-2xl">{title}</h2></div>
        <button onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg hover:bg-accent" aria-label="Fechar"><X size={19} /></button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>;
}

const btn = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-all active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-45";
const primary = `${btn} bg-primary text-primary-foreground shadow-luxe hover:bg-primary/90`;
const outline = `${btn} border border-border bg-card hover:bg-accent`;
const input = "h-11 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary";

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <label className="block text-xs font-semibold">{label}<input {...props} className={`${input} mt-1.5 font-normal`} /></label>;
}

function UploadBox({ label, done, onClick, icon }: { label: string; done: boolean; onClick: () => void; icon?: ReactNode }) {
  return <button type="button" onClick={onClick} className={`flex w-full items-center gap-3 rounded-lg border border-dashed p-4 text-left text-sm ${done ? "border-success bg-success-soft" : "border-primary/50 bg-card"}`}>
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${done ? "bg-success text-success-foreground" : "bg-secondary text-primary"}`}>{done ? <Check size={18} /> : icon ?? <Upload size={18} />}</span>
    <span className="min-w-0"><strong className="block">{label}</strong><span className="text-xs text-muted-foreground">{done ? "Arquivo enviado · em análise" : "Toque para enviar"}</span></span>
  </button>;
}

/* ---------- Auth ---------- */
export function AuthModal({ onClose }: { onClose: () => void }) {
  const tabs = ["Cliente", "Profissional MEI", "Salão Parceiro"] as const;
  const [tab, setTab] = useState<(typeof tabs)[number]>("Cliente");
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [uploads, setUploads] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState(false);
  const up = (k: string) => setUploads((u) => ({ ...u, [k]: true }));

  if (done) return <Sheet title="Tudo certo!" eyebrow="Conta BM" onClose={onClose}><div className="text-center"><CheckCircle2 className="mx-auto text-success" size={48} /><p className="mt-4 font-display text-2xl">{mode === "login" ? "Bem-vinda de volta" : "Cadastro enviado"}</p><p className="mt-2 text-sm text-muted-foreground">{mode === "login" ? "Você entrou na sua conta." : "Nossa equipe valida seus documentos em até 24h."}</p><button onClick={onClose} className={`${primary} mt-6 w-full`}>Continuar</button></div></Sheet>;

  return <Sheet title={mode === "signup" ? "Criar conta" : "Entrar"} eyebrow="Acesso BM" onClose={onClose}>
    <div className="grid grid-cols-3 rounded-lg bg-card p-1 ring-1 ring-border">{tabs.map((t) => <button key={t} onClick={() => setTab(t)} className={`h-10 rounded-md text-[11px] font-bold ${tab === t ? "bg-foreground text-background" : "text-muted-foreground"}`}>{t}</button>)}</div>
    <form onSubmit={(e) => { e.preventDefault(); setDone(true); }} className="mt-5 space-y-3">
      {mode === "login" ? <>
        <Field label="E-mail" type="email" required placeholder="voce@email.com" />
        <Field label="Senha" type="password" required placeholder="••••••••" />
      </> : tab === "Salão Parceiro" ? <>
        <Field label="Nome do salão" required placeholder="Studio Bella" />
        <Field label="CNPJ" required inputMode="numeric" placeholder="00.000.000/0001-00" />
        <Field label="Endereço" required placeholder="Rua, número · Bairro" />
        <UploadBox label="Alvará / Licença sanitária" done={!!uploads.license} onClick={() => up("license")} icon={<FileCheck2 size={18} />} />
      </> : <>
        <Field label="Nome completo" required placeholder="Ana Martins" />
        <div className="grid grid-cols-2 gap-3"><Field label="CPF" required inputMode="numeric" placeholder="000.000.000-00" /><Field label="Telefone" required inputMode="tel" placeholder="(48) 99999-0000" /></div>
        {tab === "Profissional MEI" ? <Field label="CNPJ MEI" required inputMode="numeric" placeholder="00.000.000/0001-00" /> : <Field label="Endereço" required placeholder="Rua, número · Bairro" />}
        <UploadBox label="Selfie de verificação" done={!!uploads.selfie} onClick={() => up("selfie")} icon={<Camera size={18} />} />
        {uploads.selfie && <div className="flex items-center gap-3 rounded-lg bg-success-soft p-3 text-xs"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary font-display text-lg">AM</div><span><strong className="block text-success">Rosto identificado</strong>Prévia protegida para segurança das profissionais.</span></div>}
      </>}
      <button type="submit" className={`${primary} w-full`}>{mode === "signup" ? "Cadastrar" : "Entrar"}</button>
    </form>
    <button onClick={() => setMode(mode === "signup" ? "login" : "signup")} className="mt-4 w-full text-center text-xs font-semibold text-primary">{mode === "signup" ? "Já tenho conta · Entrar" : "Não tem conta? Cadastre-se"}</button>
  </Sheet>;
}

/* ---------- Chat ---------- */
const quickReplies = ["Estou na portaria", "Onde posso estacionar?", "Ponto de referência enviado", "Maleta pronta"];
export function ChatModal({ name, onClose }: { name: string; onClose: () => void }) {
  const [messages, setMessages] = useState([
    { me: false, text: `Oi! Aqui é a ${name}. Confirmado para o seu horário ✨` },
    { me: true, text: "Perfeito, estarei te esperando!" },
  ]);
  const [text, setText] = useState("");
  const send = (t: string) => {
    const v = t.trim().slice(0, 500);
    if (!v) return;
    setMessages((m) => [...m, { me: true, text: v }]);
    setText("");
    setTimeout(() => setMessages((m) => [...m, { me: false, text: "Recebido! Obrigada 💛" }]), 900);
  };
  return <Sheet title={name} eyebrow="Chat BM" onClose={onClose} z="z-[70]">
    <div className="flex items-start gap-2 rounded-lg border border-primary/40 bg-secondary p-3 text-[11px] leading-5"><AlertTriangle size={16} className="mt-0.5 shrink-0 text-primary" /><p><strong>Aviso de Segurança BM:</strong> Nunca compartilhe telefone ou faça pagamentos por fora. Transações fora do app perdem a Garantia BM e Seguro de Materiais.</p></div>
    <div className="mt-4 flex min-h-56 flex-col gap-2">{messages.map((m, i) => <p key={i} className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.me ? "self-end rounded-br-sm bg-primary text-primary-foreground" : "self-start rounded-bl-sm bg-card shadow-soft"}`}>{m.text}</p>)}</div>
    <div className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5">{quickReplies.map((q) => <button key={q} onClick={() => send(q)} className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold">{q}</button>)}</div>
    <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="mt-3 flex gap-2"><input value={text} onChange={(e) => setText(e.target.value)} maxLength={500} placeholder="Escreva uma mensagem" aria-label="Mensagem" className={input} /><button type="submit" className={`${primary} w-11 shrink-0 px-0`} aria-label="Enviar"><Send size={17} /></button></form>
  </Sheet>;
}

/* ---------- Review ---------- */
export function ReviewModal({ name, onClose }: { name: string; onClose: () => void }) {
  const [stars, setStars] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [photo, setPhoto] = useState(false);
  const [sent, setSent] = useState(false);
  const all = ["Pontual", "Higienizado", "Simpática", "Resultado incrível"];
  if (sent) return <Sheet title="Obrigada!" eyebrow="Avaliação" onClose={onClose} z="z-[70]"><div className="text-center"><CheckCircle2 className="mx-auto text-success" size={48} /><p className="mt-3 text-sm text-muted-foreground">Sua avaliação ajuda a comunidade BM.</p><button onClick={onClose} className={`${primary} mt-6 w-full`}>Fechar</button></div></Sheet>;
  return <Sheet title={`Avaliar ${name}`} eyebrow="Pós-atendimento" onClose={onClose} z="z-[70]">
    <div className="flex justify-center gap-2">{[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setStars(n)} aria-label={`${n} estrelas`}><Star size={34} className={n <= stars ? "fill-primary text-primary" : "text-border"} /></button>)}</div>
    <div className="mt-5 flex flex-wrap gap-2">{all.map((t) => <button key={t} onClick={() => setTags((c) => c.includes(t) ? c.filter((x) => x !== t) : [...c, t])} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${tags.includes(t) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>{t}</button>)}</div>
    <textarea maxLength={500} placeholder="Conte como foi sua experiência" className="mt-4 h-24 w-full rounded-lg border border-border bg-card p-3 text-sm outline-none focus:border-primary" />
    <div className="mt-3"><UploadBox label="Foto do resultado" done={photo} onClick={() => setPhoto(true)} icon={<Camera size={18} />} /></div>
    <button disabled={!stars} onClick={() => setSent(true)} className={`${primary} mt-5 w-full`}>Enviar avaliação</button>
  </Sheet>;
}

/* ---------- Professional extras ---------- */
export function OnboardingBanner() {
  const [docs, setDocs] = useState<Record<string, boolean>>({});
  const items = ["CNPJ MEI", "Documento de identidade", "Antecedentes criminais"];
  const count = items.filter((i) => docs[i]).length;
  return <div className="mt-6 rounded-lg border border-primary/40 bg-card/85 p-4 shadow-soft backdrop-blur">
    <div className="flex items-center justify-between"><p className="flex items-center gap-2 text-sm font-bold"><ShieldCheck size={17} className="text-success" /> Verificação de perfil</p><span className="text-xs font-bold text-primary">{count}/3</span></div>
    <div className="mt-3 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-success transition-all" style={{ width: `${(count / 3) * 100}%` }} /></div>
    <div className="mt-3 space-y-2">{items.map((i) => <UploadBox key={i} label={i} done={!!docs[i]} onClick={() => setDocs((d) => ({ ...d, [i]: true }))} />)}</div>
  </div>;
}

export function TravelTipModal({ onClose }: { onClose: () => void }) {
  const [km, setKm] = useState(8);
  const fuel = (km * 2 / 10) * 6.2;
  const bus = 2 * 6.25;
  return <Sheet title="Como cobrar o deslocamento" eyebrow="Dica BM" onClose={onClose}>
    <p className="text-sm leading-6 text-muted-foreground">Some apenas o custo real de ida e volta. Evite embutir valores extras no serviço — preço justo gera mais avaliações 5★.</p>
    <label className="mt-5 block text-xs font-semibold">Distância até a cliente: {km} km<input type="range" min={1} max={30} value={km} onChange={(e) => setKm(Number(e.target.value))} className="mt-2 w-full accent-primary" /></label>
    <div className="mt-4 grid grid-cols-2 gap-3">
      <div className="rounded-lg bg-card p-4 shadow-soft"><Fuel size={18} className="text-primary" /><p className="mt-2 text-xs text-muted-foreground">Carro (10 km/L · R$ 6,20)</p><p className="font-display text-xl">R$ {fuel.toFixed(2).replace(".", ",")}</p></div>
      <div className="rounded-lg bg-card p-4 shadow-soft"><Bus size={18} className="text-primary" /><p className="mt-2 text-xs text-muted-foreground">Ônibus ida e volta</p><p className="font-display text-xl">R$ {bus.toFixed(2).replace(".", ",")}</p></div>
    </div>
    <p className="mt-4 flex gap-2 text-xs text-muted-foreground"><Lightbulb size={15} className="shrink-0 text-primary" /> Fórmula: (km × 2 ÷ consumo) × preço do litro.</p>
    <button onClick={onClose} className={`${primary} mt-5 w-full`}>Entendi</button>
  </Sheet>;
}

const chairs = [
  { id: "c1", salon: "Studio Bella", place: "Agronômica", station: "Cadeira de maquiagem", hour: 35, day: 180 },
  { id: "c2", salon: "Maison Lagoa", place: "Lagoa da Conceição", station: "Bancada de unhas", hour: 25, day: 140 },
  { id: "c3", salon: "Atelier Centro", place: "Centro", station: "Lavatório + cadeira hair", hour: 45, day: 220 },
];

export function ChairBooking() {
  const [booked, setBooked] = useState<string[]>([]);
  return <div className="mt-6"><h2 className="font-display text-2xl">Reservar Cadeira em Salão</h2><p className="mt-1 text-xs text-muted-foreground">Espaços parceiros em Florianópolis</p>
    <div className="mt-4 space-y-3">{chairs.map((c) => <div key={c.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 shadow-soft"><div className="min-w-0"><p className="font-bold">{c.salon}</p><p className="truncate text-xs text-muted-foreground">{c.station} · {c.place}</p><p className="mt-1 text-xs font-bold text-primary">R$ {c.hour}/h · R$ {c.day}/dia</p></div>{booked.includes(c.id) ? <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-success"><CheckCircle2 size={16} /> Reservada</span> : <button onClick={() => setBooked((b) => [...b, c.id])} className={`${primary} shrink-0 px-3`}>Reservar</button>}</div>)}</div>
  </div>;
}

/* ---------- B2B ---------- */
export function B2BView() {
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
    <p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">Empresa & Salão B2B</p>
    <h1 className="mt-1 font-display text-4xl">Studio Bella</h1>
    <p className="mt-2 text-sm text-muted-foreground">Gerencie espaços ociosos e contrate reforços.</p>

    <div className="mt-6 rounded-lg border border-primary/40 bg-card/85 p-4 shadow-card backdrop-blur">
      <h2 className="flex items-center gap-2 font-display text-2xl"><Armchair size={20} className="text-primary" /> Modo Cadeira Vazia</h2>
      <p className="mt-1 text-xs text-muted-foreground">Rent-a-Chair para profissionais independentes</p>
      <div className="mt-4 space-y-2">{stations.map((s) => <div key={s.id} className="flex items-center justify-between gap-3 rounded-lg bg-background p-3"><div className="min-w-0"><p className="truncate text-sm font-bold">{s.name}</p><p className="text-xs text-muted-foreground">R$ {s.hour}/h · R$ {s.day}/dia</p></div><button role="switch" aria-checked={s.active} aria-label={`Disponibilizar ${s.name}`} onClick={() => setStations((l) => l.map((x) => x.id === s.id ? { ...x, active: !x.active } : x))} className={`relative h-6 w-11 shrink-0 rounded-full transition ${s.active ? "bg-success" : "bg-muted"}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-all ${s.active ? "left-[22px]" : "left-0.5"}`} /></button></div>)}</div>
      <form onSubmit={(e) => { e.preventDefault(); const name = newName.trim().slice(0, 60); const hour = Math.max(1, Math.min(999, Number(newHour) || 0)); if (!name) return; setStations((l) => [...l, { id: Date.now(), name, hour, day: hour * 5, active: true }]); setNewName(""); }} className="mt-3 grid grid-cols-[1fr_80px_auto] gap-2"><input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nova estação" aria-label="Nome da estação" className={input} /><input value={newHour} onChange={(e) => setNewHour(e.target.value.replace(/\D/g, "").slice(0, 3))} inputMode="numeric" aria-label="Preço por hora" className={input} /><button className={`${outline} px-3`}>Adicionar</button></form>
    </div>

    <div className="mt-6 rounded-lg border border-border bg-card/85 p-4 shadow-card backdrop-blur">
      <h2 className="flex items-center gap-2 font-display text-2xl"><Megaphone size={20} className="text-primary" /> Solicitar Reforço / Freelance</h2>
      <form onSubmit={(e) => { e.preventDefault(); const title = job.title.trim().slice(0, 80); if (!title || !job.date) return; setJobs((j) => [{ title, date: job.date, slots: Number(job.slots) || 1 }, ...j]); setJob({ title: "", date: "", slots: "2" }); }} className="mt-4 space-y-3">
        <input value={job.title} onChange={(e) => setJob({ ...job, title: e.target.value })} placeholder="Ex: Casamento · 6 noivas e madrinhas" aria-label="Título do evento" className={input} />
        <div className="grid grid-cols-2 gap-2"><input type="date" value={job.date} onChange={(e) => setJob({ ...job, date: e.target.value })} aria-label="Data" className={input} /><input value={job.slots} onChange={(e) => setJob({ ...job, slots: e.target.value.replace(/\D/g, "").slice(0, 2) })} inputMode="numeric" aria-label="Vagas" className={input} /></div>
        <button className={`${primary} w-full`}>Publicar chamado</button>
      </form>
      {jobs.map((j, i) => <div key={i} className="mt-3 flex items-center gap-3 rounded-lg bg-success-soft p-3 text-xs"><CheckCircle2 size={17} className="shrink-0 text-success" /><span><strong className="block">{j.title}</strong>{j.date} · {j.slots} vagas · enviado às profissionais top</span></div>)}
      <p className="mb-2 mt-5 flex items-center gap-2 text-xs font-bold"><Users size={15} /> Profissionais MEI mais bem avaliadas</p>
      <div className="space-y-2">{top.map((t) => <div key={t.n} className="flex items-center justify-between rounded-lg bg-background p-3"><div><p className="text-sm font-bold">{t.n}</p><p className="flex items-center gap-1 text-xs text-muted-foreground"><Star size={12} className="fill-primary text-primary" />{t.r} · {t.s}</p></div>{invited.includes(t.n) ? <span className="flex items-center gap-1 text-xs font-bold text-success"><Clock3 size={14} /> Convidada</span> : <button onClick={() => setInvited((v) => [...v, t.n])} className={`${outline} min-h-9 px-3 text-xs`}>Convidar</button>}</div>)}</div>
    </div>
  </section>;
}
