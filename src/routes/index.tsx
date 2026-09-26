import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Copy,
  CreditCard,
  Heart,
  Home,
  MapPin,
  Menu,
  MessageCircle,
  Navigation,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Wallet,
  X,
} from "lucide-react";
import { useMemo, useState, type ButtonHTMLAttributes, type ReactNode } from "react";

import { B2BFinance, ClientHub } from "../components/bm/modules";
import { AuthModal, B2BView, ChairBooking, ChatModal, OnboardingBanner, ReviewModal, TravelTipModal } from "../components/bm/extras";
import { UserRound, Lightbulb, BookOpen } from "lucide-react";
import { HelpRules, OnlineToggle, WelcomeTraining } from "../components/bm/training";
import { CategoryShowcase, PortfolioNotice, ServiceMenu } from "../components/bm/discovery";
import { CheckoutOptions, FlexibleSchedule, bookingIsUrgent, bookingTotal, brazilDays, initialExtras, money, type BookingExtras } from "../components/bm/booking-extras";
import camilaImage from "../assets/camila.jpg";
import studioImage from "../assets/studio-bella.jpg";
import julianaImage from "../assets/juliana.jpg";
import makeupEditorial from "../assets/category-makeup.jpg";
import nailsEditorial from "../assets/category-nails.jpg";
import clubEditorial from "../assets/category-club.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BM — Beleza onde você estiver" },
      { name: "description", content: "Encontre profissionais de beleza e bem-estar verificados em Florianópolis, em casa ou no salão." },
      { property: "og:title", content: "BM — Em apenas um clique, a beleza até você" },
      { property: "og:description", content: "Beleza premium, profissionais verificados e pagamento protegido." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Professional = {
  id: string;
  name: string;
  role: string;
  rating: string;
  reviews: number;
  distance: string;
  category: string;
  service: string;
  price: number;
  image: string;
  bio: string;
  atHome: boolean;
  tags: string[];
  extras?: { name: string; price: number }[];
};

type OrderStatus = "new" | "accepted" | "enroute" | "arrived" | "completed";

const professionals: Professional[] = [
  { id: "camila", name: "Camila Silva", role: "Maquiadora & Hair", rating: "4,9", reviews: 127, distance: "1,8 km", category: "Maquiagem", service: "Maquiagem Social", price: 150, image: camilaImage, atHome: true, tags: ["Pele Sensível", "Sem Látex", "Vegano"], bio: "Especialista em beleza natural e produções que valorizam sua identidade. Há 8 anos transformando momentos especiais com técnica, leveza e carinho." },
  { id: "bella", name: "Studio Bella", role: "Salão Parceiro", rating: "4,8", reviews: 96, distance: "Agronômica", category: "Unhas", service: "Unha em Gel", price: 90, image: studioImage, atHome: false, tags: ["Sem Látex", "Esterilização UV"], extras: [{ name: "Escova", price: 70 }], bio: "Um espaço autoral no coração de Floripa, criado para transformar o cuidado com as unhas em um ritual de bem-estar." },
  { id: "juliana", name: "Juliana Costa", role: "Massoterapeuta", rating: "5,0", reviews: 84, distance: "3,2 km", category: "Massagem", service: "Massagem Relaxante", price: 180, image: julianaImage, atHome: true, tags: ["Pele Sensível", "Óleos hipoalergênicos"], bio: "Terapeuta corporal com formação em técnicas relaxantes e recuperação muscular. Cada atendimento é pensado para devolver equilíbrio ao seu dia." },
];

const categories = ["Para você", "Maquiagem", "Cabelo & Penteado", "Unhas", "Massagem & Estética", "Design de Sobrancelhas & Cílios", "Combos VIP"];

function AppButton({ variant = "primary", className = "", children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "outline" | "icon"; children: ReactNode }) {
  const styles = { primary: "bg-primary text-primary-foreground shadow-luxe hover:bg-primary/90", ghost: "bg-transparent text-foreground hover:bg-accent", outline: "border border-border bg-card text-foreground hover:bg-accent", icon: "bg-card/85 text-foreground shadow-soft hover:bg-accent" };
  return <button className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-all active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-45 ${styles[variant]} ${className}`} {...props}>{children}</button>;
}

function Index() {
  const [view, setView] = useState<"Cliente" | "Profissional Beleza" | "Empresa & Salão B2B">("Cliente");
  const [authOpen, setAuthOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [category, setCategory] = useState("Para você");
  const [mode, setMode] = useState<"Em Domicílio" | "No Salão">("Em Domicílio");
  const [favorite, setFavorite] = useState<string[]>([]);
  const [selected, setSelected] = useState<Professional | null>(null);
  const [step, setStep] = useState(0);
  const [selectedDay, setSelectedDay] = useState(() => brazilDays()[1]?.id ?? "");
  const [bookingExtras, setBookingExtras] = useState<BookingExtras>(initialExtras);
  const selectedTime = bookingExtras.slots[0] ?? "—";
  const orderTotal = bookingTotal(selected?.price ?? 150, bookingIsUrgent(selectedDay, bookingExtras.slots), bookingExtras, selected?.service === "Massagem Relaxante");
  const [rules, setRules] = useState([false, false, false, false]);
  const [payment, setPayment] = useState<"pix" | "card">("pix");
  const [copied, setCopied] = useState(false);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("new");
  const [securityOpen, setSecurityOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [trainingOpen, setTrainingOpen] = useState(false);

  const filtered = useMemo(() => professionals.filter((p) => (category === "Para você" || category.startsWith(p.category) || category.startsWith("Cabelo") && p.id === "camila" || category === "Casamentos & Noivas" && p.id === "camila" || category === "Eventos" && p.id === "camila" || category === "Combos VIP" || category === "Clube BM" || category === "Vale Presente") && (mode === "Em Domicílio" ? p.atHome : !p.atHome)), [category, mode]);

  const openProfile = (p: Professional) => { setSelected(p); setStep(0); };
  const openAgenda = () => {
    const firstProfessional = professionals.at(0);
    if (!firstProfessional) return;
    setSelected(firstProfessional);
    setStep(1);
  };
  const close = () => { setSelected(null); setStep(0); setRules([false, false, false, false]); };
  const next = () => setStep((current) => Math.min(current + 1, 4));
  const back = () => step === 0 ? close() : setStep((current) => current - 1);

  return (
    <main className="min-h-screen bg-background pb-24 text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/88 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 pb-3 pt-3 md:px-8">
          <div className="flex items-center justify-between">
             <div className="brand-mark" aria-label="BM">BM</div>
             <div className="flex gap-2"><AppButton variant="icon" onClick={() => setAuthOpen(true)} className="h-11 w-11 rounded-full p-0" aria-label="Entrar ou cadastrar"><UserRound size={19} /></AppButton><AppButton variant="icon" onClick={() => setHelpOpen(true)} className="h-11 w-11 rounded-full p-0" aria-label="Ajuda e regras"><BookOpen size={19} /></AppButton><AppButton variant="icon" onClick={() => setSecurityOpen(true)} className="h-11 w-11 rounded-full p-0" aria-label="Abrir Central de Segurança"><Menu size={19} /></AppButton></div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <button className="flex min-w-0 items-center gap-2 text-left text-xs font-semibold"><MapPin size={15} className="shrink-0 text-primary" /><span className="truncate">Florianópolis, SC · Centro</span><ChevronRight size={14} /></button>
             <div className="flex shrink-0 items-center gap-1 text-[10px] font-bold text-success"><ShieldCheck size={14} /> Garantia BM & Verificação de Identidade</div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="mt-5 grid grid-cols-3 rounded-lg bg-card/65 p-1 shadow-soft ring-1 ring-border/60">
          {(["Cliente", "Profissional Beleza", "Empresa & Salão B2B"] as const).map((item) => <button key={item} onClick={() => setView(item)} aria-pressed={view === item} className={`min-h-11 rounded-md px-1 text-[10px] font-bold leading-tight transition-all ${view === item ? "bg-primary text-primary-foreground shadow-soft ring-1 ring-foreground" : "text-muted-foreground"}`}>{item}</button>)}
        </div>

         {view === "Empresa & Salão B2B" ? <><B2BView /><B2BFinance /></> : view === "Profissional Beleza" ? <ProfessionalView selectedDay={selectedDay} selectedTime={selectedTime} orderTotal={orderTotal} status={orderStatus} setStatus={setOrderStatus} /> : <>
          <section className="py-7 md:py-10">
            <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.16em] text-primary"><Sparkles size={14} /> Curadoria em Florianópolis</p>
            <h1 className="max-w-2xl font-display text-4xl leading-[1.05] md:text-6xl">Em apenas um clique, <em className="font-normal text-primary">a beleza até você.</em></h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">Profissionais selecionados, pagamento protegido e experiências feitas para você.</p>
          </section>

          <CategoryShowcase selected={category} onSelect={(filter) => { setCategory(filter); if (filter === "Unhas") setMode("No Salão"); else if (["Cabelo & Penteado", "Maquiagem", "Casamentos & Noivas", "Eventos"].includes(filter)) setMode("Em Domicílio"); }} />

          <section aria-label="Modo de atendimento" className="mb-6 grid grid-cols-2 gap-2">
            {(["Em Domicílio", "No Salão"] as const).map((item) => <button key={item} onClick={() => setMode(item)} className={`flex h-14 items-center justify-center gap-2 rounded-lg border text-sm font-bold transition-all ${mode === item ? "border-primary bg-card text-foreground shadow-soft" : "border-transparent bg-card/45 text-muted-foreground"}`}>{item === "Em Domicílio" ? <Home size={18} /> : <Store size={18} />}{item}</button>)}
          </section>

          <section className="-mx-4 mb-7 overflow-hidden">
            <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1">
              {categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition ${category === item ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card/70 text-foreground"}`}>{item}</button>)}
            </div>
          </section>

          <div className="mb-4 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-primary">Seleção BM</p><h2 className="mt-1 font-display text-3xl">Destaques perto de você</h2></div><span className="text-xs text-muted-foreground">{filtered.length} opções</span></div>
          <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => <article key={p.id} className="group overflow-hidden rounded-lg border border-border/80 bg-card/88 shadow-card backdrop-blur-sm">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={p.image} alt={p.name} loading="lazy" width={912} height={1200} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                <AppButton variant="icon" onClick={() => setFavorite((f) => f.includes(p.id) ? f.filter((id) => id !== p.id) : [...f, p.id])} className="absolute right-3 top-3 h-10 min-h-10 w-10 rounded-full p-0" aria-label={`Favoritar ${p.name}`}><Heart size={18} className={favorite.includes(p.id) ? "fill-primary text-primary" : ""} /></AppButton>
                 <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-[10px] font-bold text-success-foreground"><ShieldCheck size={12} /> Identidade verificada</span>
              </div>
              <div className="p-4">
                <div className="flex justify-between gap-3"><div><h3 className="font-display text-2xl">{p.name}</h3><p className="mt-0.5 text-xs text-muted-foreground">{p.role}</p></div><div className="flex h-fit items-center gap-1 text-xs font-bold"><Star size={14} className="fill-primary text-primary" />{p.rating}</div></div>
                <div className="my-4 flex items-center justify-between border-y border-border/70 py-3 text-xs"><span className="flex items-center gap-1 text-muted-foreground"><MapPin size={13} />{p.distance}</span><span>{p.reviews} avaliações</span></div>
                 <p className="mb-3 inline-flex rounded-md bg-secondary px-2 py-1 text-[10px] font-bold text-foreground">R$ 20 OFF no primeiro agendamento*</p><div className="flex items-end justify-between gap-3"><div><p className="text-xs text-muted-foreground">A partir de</p><p className="mt-0.5 font-display text-lg">{p.service} · R$ {p.price}</p></div><AppButton onClick={() => openProfile(p)} className="shrink-0 px-3">Ver perfil</AppButton></div><p className="mt-2 text-[10px] text-muted-foreground">*Oferta demonstrativa; não aplicada automaticamente ao checkout.</p>
              </div>
            </article>)}
          </section>
          {filtered.length === 0 && <div className="rounded-lg border border-border bg-card p-8 text-center"><Sparkles className="mx-auto text-primary" /><h3 className="mt-3 font-display text-2xl">Novos talentos chegando</h3><p className="mt-2 text-sm text-muted-foreground">Tente outra categoria ou forma de atendimento.</p></div>}
          <ClientHub />
        </>}
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 px-7 py-2 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-sm items-center justify-between"><BottomItem icon={<Sparkles size={20} />} label="Explorar" active /><BottomItem icon={<CalendarDays size={20} />} label="Agenda" onClick={openAgenda} /><BottomItem icon={<Heart size={20} />} label="Favoritos" /><BottomItem icon={<MessageCircle size={20} />} label="Mensagens" onClick={() => setChatOpen(true)} /></div>
      </nav>

       {selected && <BookingModal professional={selected} step={step} selectedDay={selectedDay} setSelectedDay={setSelectedDay} bookingExtras={bookingExtras} setBookingExtras={setBookingExtras} favorites={professionals.filter((p) => favorite.includes(p.id)).map(({ id, name }) => ({ id, name }))} rules={rules} setRules={setRules} payment={payment} setPayment={setPayment} copied={copied} setCopied={setCopied} orderStatus={orderStatus} onNext={next} onBack={back} onClose={close} />}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onProfessionalSignup={() => { setAuthOpen(false); setView("Profissional Beleza"); setTrainingOpen(true); }} />}
      {chatOpen && <ChatModal name="Camila Silva" onClose={() => setChatOpen(false)} />}
      {securityOpen && <SecurityCenter onClose={() => setSecurityOpen(false)} />}
      {helpOpen && <HelpRules onClose={() => setHelpOpen(false)} />}
      {trainingOpen && <WelcomeTraining onClose={() => setTrainingOpen(false)} />}
    </main>
  );
}

function ProfessionalView({ selectedDay, selectedTime, orderTotal, status, setStatus }: { selectedDay: string; selectedTime: string; orderTotal: number; status: OrderStatus; setStatus: (status: OrderStatus) => void }) {
  const [pinOpen, setPinOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [withdrawn, setWithdrawn] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);
  const net = orderTotal * .82;
  const statusLabel = { new: "Novo chamado", accepted: "Chamado aceito", enroute: "A caminho", arrived: "No local", completed: "Concluído" }[status];
  const action = status === "new" ? { label: "Aceitar Chamado", next: "accepted" as const } : status === "accepted" ? { label: "A Caminho", next: "enroute" as const } : status === "enroute" ? { label: "Cheguei ao Local", next: "arrived" as const } : null;
  const validatePin = () => { if (pin === "8392") { setStatus("completed"); setPinOpen(false); setPinError(""); } else { setPinError("PIN incorreto. Confira com a cliente."); } };

  return <section className="py-7 md:py-10">
    <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">Painel profissional</p><h1 className="mt-1 font-display text-4xl">Olá, Camila</h1><p className="mt-2 text-sm text-muted-foreground">Acompanhe seus atendimentos e ganhos.</p></div><div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-card shadow-soft"><Bell size={19} /><span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-background" /></div></div>

    <OnlineToggle />
    <OnboardingBanner />
    <button onClick={() => setTipOpen(true)} className="mt-3 flex w-full items-center gap-3 rounded-lg bg-secondary p-3 text-left text-xs font-semibold"><Lightbulb size={17} className="shrink-0 text-primary" /> Dica: como calcular deslocamento sem encarecer o serviço <ChevronRight size={15} className="ml-auto shrink-0" /></button>
    <div className="mt-7 overflow-hidden rounded-lg border border-primary bg-card shadow-card">
      <div className="flex items-center justify-between bg-secondary px-4 py-3"><span className="flex items-center gap-2 text-xs font-bold"><span className="h-2 w-2 rounded-full bg-success" />{statusLabel}</span><span className="text-[10px] font-semibold text-muted-foreground">#BM-0925</span></div>
       <div className="p-4"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-background font-display text-lg">AM</div><div><h2 className="font-bold">Ana Martins</h2><p className="text-xs font-semibold text-success">Cliente Verificada (CPF e Foto Validados)</p><p className="text-[10px] text-muted-foreground">12 atendimentos</p></div></div>
       <div className="my-5 grid grid-cols-2 gap-3 border-y border-border py-4 text-xs"><div><p className="text-muted-foreground">Serviço</p><p className="mt-1 font-bold">Maquiagem Social</p></div><div><p className="text-muted-foreground">Data e horário</p><p className="mt-1 font-bold">{selectedDay ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" }).format(new Date(`${selectedDay}T12:00:00Z`)) : "A definir"} · {selectedTime}</p></div><div className="col-span-2"><p className="text-muted-foreground">Endereço</p><p className="mt-1 flex items-center gap-1 font-bold"><MapPin size={13} className="text-primary" /> Rua Bocaiúva, 2125 · Centro</p></div></div>
       <div className="flex items-end justify-between gap-3"><div><p className="text-xs text-muted-foreground">Valor protegido</p><p className="font-display text-2xl">{money(orderTotal)}</p></div>{action && <AppButton onClick={() => setStatus(action.next)}>{action.label}{action.next === "enroute" && <Navigation size={16} />}</AppButton>}{status === "arrived" && <AppButton onClick={() => setPinOpen(true)}><KeyRound size={16} /> Validar PIN</AppButton>}{status === "completed" && <span className="flex items-center gap-1 text-sm font-bold text-success"><CheckCircle2 size={18} /> Finalizado</span>}</div></div>
    </div>

      <div className="mt-6 rounded-lg bg-foreground p-5 text-background shadow-card"><div className="flex items-center justify-between"><div><p className="flex items-center gap-2 text-xs font-semibold text-background/70"><Wallet size={16} /> Carteira BM</p><p className="mt-2 font-display text-4xl">{money(status === "completed" && !withdrawn ? net : 0)}</p><p className="mt-1 text-[10px] text-background/60">Saldo disponível</p></div><AppButton onClick={() => setWithdrawn(true)} disabled={status !== "completed" || withdrawn} className="bg-background text-foreground shadow-none hover:bg-background/90">{withdrawn ? "Saque solicitado" : "Sacar via PIX"}</AppButton></div><div className="mt-5 grid grid-cols-2 gap-3 border-t border-background/20 pt-4 text-xs"><div><p className="text-background/60">Valor bruto</p><p className="mt-1 font-bold">{money(orderTotal)}</p></div><div><p className="text-background/60">Taxa BM · 18%</p><p className="mt-1 font-bold">− {money(orderTotal * .18)}</p></div></div>{withdrawn && <p className="mt-4 flex items-center gap-2 rounded-md bg-success/20 p-3 text-xs font-semibold"><CheckCircle2 size={16} /> Saque PIX solicitado com sucesso.</p>}</div>

    <ChairBooking />
    {tipOpen && <TravelTipModal onClose={() => setTipOpen(false)} />}
    {pinOpen && <div className="fixed inset-0 z-50 flex items-end justify-center bg-overlay/55 p-0 backdrop-blur-sm md:items-center md:p-6" role="dialog" aria-modal="true" aria-label="Validar PIN"><div className="w-full max-w-md rounded-t-2xl bg-background p-5 shadow-modal md:rounded-xl"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">Liberação segura</p><h2 className="mt-1 font-display text-2xl">Validar PIN da cliente</h2></div><AppButton variant="ghost" onClick={() => setPinOpen(false)} className="h-10 min-h-10 w-10 p-0" aria-label="Fechar"><X size={19} /></AppButton></div><p className="mt-3 text-sm leading-6 text-muted-foreground">Digite o código de 4 dígitos exibido no celular da cliente para concluir e liberar R$ {net.toFixed(2).replace(".", ",")}.</p><input value={pin} onChange={(event) => { const value = event.target.value.replace(/\D/g, "").slice(0, 4); setPin(value); setPinError(""); }} inputMode="numeric" autoComplete="one-time-code" maxLength={4} aria-label="PIN de 4 dígitos" className="pin-input mt-6 w-full rounded-lg border border-border bg-card px-4 py-4 text-center font-display text-3xl" placeholder="••••" />{pinError && <p className="mt-2 text-xs font-semibold text-destructive">{pinError}</p>}<AppButton onClick={validatePin} disabled={pin.length !== 4} className="mt-5 w-full">Concluir serviço e liberar pagamento</AppButton></div></div>}
  </section>;
}

const securityTopics = [
  { title: "Termos de Uso", content: "Ao usar a BM, clientes e profissionais concordam em fornecer informações verdadeiras, respeitar os horários confirmados e manter uma conduta segura durante todo o atendimento." },
  { title: "Política de Custódia", content: "O pagamento fica retido na BM durante o atendimento. O valor só é liberado para a profissional após a cliente informar o PIN de segurança e confirmar a conclusão do serviço." },
  { title: "Segurança", content: "A BM verifica a identidade das profissionais e clientes. Nunca compartilhe o PIN antes do serviço terminar e utilize os canais da plataforma para registrar qualquer imprevisto." },
  { title: "Reportar Avaria/Dano", content: "Na tela de acompanhamento do pedido, toque em \"Reportar Incidente / Abrir Disputa\". O pagamento permanece retido enquanto a equipe BM media o caso com as duas partes, com resposta em até 48h." },
  { title: "Suporte por e-mail", content: "Fale com a nossa equipe em suporte@bmbeauty.com.br — atendimento de segunda a sábado, das 8h às 20h." },
  { title: "Privacidade e LGPD", content: "Seus dados são utilizados apenas para viabilizar agendamentos, pagamentos e suporte. Você pode solicitar acesso, correção ou exclusão dos seus dados pessoais conforme a LGPD." },
];

function SecurityCenter({ onClose }: { onClose: () => void }) {
  const [expanded, setExpanded] = useState<string | null>("Política de Custódia");
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-overlay/55 backdrop-blur-sm md:items-center md:p-6" role="dialog" aria-modal="true" aria-label="Central de Segurança e FAQ">
    <div className="modal-scroll max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-background shadow-modal md:rounded-xl">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-5 py-4 backdrop-blur-xl"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">Garantia BM</p><h2 className="mt-1 font-display text-2xl">Central de Segurança e FAQ</h2></div><AppButton variant="ghost" onClick={onClose} className="h-10 min-h-10 w-10 p-0" aria-label="Fechar"><X size={19} /></AppButton></div>
      <div className="p-5"><div className="mb-5 flex items-start gap-3 rounded-lg border border-success/30 bg-success-soft p-4"><ShieldCheck className="mt-0.5 shrink-0 text-success" size={24} /><div><p className="text-sm font-bold text-success">Proteção em cada atendimento</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Consulte as regras que protegem clientes, profissionais e pagamentos.</p></div></div><div className="space-y-2">{securityTopics.map((topic) => { const isOpen = expanded === topic.title; return <div key={topic.title} className="overflow-hidden rounded-lg border border-border bg-card"><button type="button" onClick={() => setExpanded(isOpen ? null : topic.title)} className="flex min-h-14 w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm font-bold" aria-expanded={isOpen}><span>{topic.title}</span><ChevronDown size={18} className={`shrink-0 text-primary transition-transform ${isOpen ? "rotate-180" : ""}`} /></button>{isOpen && <div className="border-t border-border px-4 py-4 text-sm leading-6 text-muted-foreground">{topic.content}</div>}</div>; })}</div><AppButton onClick={onClose} className="mt-6 w-full">Entendi</AppButton></div>
    </div>
  </div>;
}

function BottomItem({ icon, label, active = false, onClick }: { icon: ReactNode; label: string; active?: boolean; onClick?: () => void }) { return <button onClick={onClick} className={`flex min-w-14 flex-col items-center gap-1 py-1 text-[9px] font-semibold ${active ? "text-primary" : "text-muted-foreground"}`}>{icon}{label}</button>; }

type BookingProps = { professional: Professional; step: number; selectedDay: string; setSelectedDay: (v: string) => void; bookingExtras: BookingExtras; setBookingExtras: (v: BookingExtras) => void; favorites: { id: string; name: string }[]; rules: boolean[]; setRules: (v: boolean[]) => void; payment: "pix" | "card"; setPayment: (v: "pix" | "card") => void; copied: boolean; setCopied: (v: boolean) => void; orderStatus: OrderStatus; onNext: () => void; onBack: () => void; onClose: () => void };

function BookingModal(props: BookingProps) {
  const { professional: p, step } = props;
  const titles = ["Perfil", "Escolha seu horário", "Tudo pronto para receber?", "Pagamento protegido", "Seu ritual está confirmado"];
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-overlay/55 backdrop-blur-sm md:items-center md:p-6" role="dialog" aria-modal="true" aria-label={titles[step]}>
    <div className="modal-scroll max-h-[94dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-background shadow-modal md:max-h-[88vh] md:rounded-xl">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur-xl">
        <AppButton variant="ghost" onClick={props.onBack} className="h-10 min-h-10 w-10 p-0" aria-label="Voltar"><ArrowLeft size={20} /></AppButton><div className="text-center"><p className="text-[9px] font-bold uppercase tracking-[.15em] text-primary">{step === 0 ? "Conheça" : `Etapa ${step} de 4`}</p><p className="font-display text-lg">{titles[step]}</p></div><AppButton variant="ghost" onClick={props.onClose} className="h-10 min-h-10 w-10 p-0" aria-label="Fechar"><X size={20} /></AppButton>
      </div>
      {step === 0 && <ProfileStep p={p} onNext={props.onNext} />}
      {step === 1 && <ScheduleStep {...props} />}
      {step === 2 && <RulesStep {...props} />}
      {step === 3 && <PaymentStep {...props} />}
      {step === 4 && <TrackingStep p={p} status={props.orderStatus} onClose={props.onClose} />}
    </div>
  </div>;
}

function ProfileStep({ p, onNext }: { p: Professional; onNext: () => void }) {
  const gallery = [p.image, ...(p.id === "camila" ? [makeupEditorial, makeupEditorial] : p.id === "bella" ? [nailsEditorial, nailsEditorial] : [clubEditorial, clubEditorial])];
   return <div className="pb-5"><div className="relative aspect-[16/11] overflow-hidden"><img src={p.image} alt={p.name} width={912} height={1200} className="h-full w-full object-cover" /><span className="absolute bottom-4 left-4 flex items-center gap-1 rounded-full bg-success px-3 py-1.5 text-[10px] font-bold text-success-foreground"><ShieldCheck size={13} /> Identidade verificada</span></div><div className="px-5 pt-5"><div className="flex justify-between"><div><h2 className="font-display text-3xl">{p.name}</h2><p className="text-sm text-muted-foreground">{p.role} · {p.distance}</p></div><span className="flex h-fit items-center gap-1 text-sm font-bold"><Star size={15} className="fill-primary text-primary" /> {p.rating}</span></div><p className="mt-5 text-sm leading-6 text-muted-foreground">{p.bio}</p><div className="mt-4 flex flex-wrap gap-2">{p.tags.map((t) => <span key={t} className="rounded-full border border-success/30 bg-success-soft px-3 py-1 text-[11px] font-semibold text-success">{t}</span>)}</div><h3 className="mb-3 mt-6 font-display text-xl">Portfólio</h3><div className="grid grid-cols-3 gap-2">{gallery.map((image, i) => <img key={`${image}-${i}`} src={image} alt={`Imagem ilustrativa ${i + 1} de ${p.name}`} loading="lazy" width={912} height={1200} className="aspect-square w-full rounded-md object-cover" />)}</div><PortfolioNotice /><h3 className="mb-3 mt-6 font-display text-xl">Menu de serviços</h3><ServiceMenu services={[{ name: p.service, price: p.price }, ...(p.extras ?? [])]} /><h3 className="mb-3 mt-6 font-display text-xl">Avaliações</h3><div className="space-y-2">{[{ n: "Marina L.", t: "Pontual, super cuidadosa e o resultado ficou impecável." }, { n: "Rafaela S.", t: "Material todo higienizado. Já agendei de novo!" }].map((r) => <div key={r.n} className="rounded-lg bg-card p-3 shadow-soft"><p className="flex items-center gap-1 text-xs font-bold">{r.n} <span className="ml-auto flex">{[1,2,3,4,5].map((i) => <Star key={i} size={11} className="fill-primary text-primary" />)}</span></p><p className="mt-1 text-xs text-muted-foreground">{r.t}</p></div>)}</div><AppButton onClick={onNext} className="mt-5 w-full">Escolher data e horário <ChevronRight size={17} /></AppButton></div></div>;
}

function ScheduleStep(props: BookingProps) { return <div className="p-5"><div className="flex items-center gap-3 rounded-lg bg-card p-3 shadow-soft"><img src={props.professional.image} alt="" width={72} height={72} className="h-14 w-14 rounded-md object-cover" /><div><p className="font-bold">{props.professional.service}</p><p className="text-xs text-muted-foreground">com {props.professional.name}</p><p className="mt-1 text-sm font-bold text-primary">{money(props.professional.price)}</p></div></div><FlexibleSchedule day={props.selectedDay} setDay={props.setSelectedDay} extras={props.bookingExtras} setExtras={props.setBookingExtras} price={props.professional.price} /><AppButton onClick={props.onNext} disabled={!props.bookingExtras.slots.length} className="mt-6 w-full">Continuar <ChevronRight size={17} /></AppButton></div>; }

const houseRules = [
  { title: "Infraestrutura", text: "Declaro possuir local limpo, iluminado, com tomada e espaço adequado para o serviço." },
  { title: "Cuidado com Materiais", text: "Garanto que crianças e terceiros não manusearão os insumos ou maleta do profissional." },
  { title: "Animais de Estimação", text: "Manterei pets em local reservado durante o atendimento para evitar acidentes." },
  { title: "Termos LGPD & Disputas", text: "Aceito os Termos de Uso, Política de Privacidade (LGPD) e concordo com o protocolo de mediação da BM em caso de avarias ou cancelamentos." },
];

function RulesStep(props: BookingProps) { return <div className="p-5"><div className="rounded-lg border border-border bg-card p-4"><ShieldCheck className="text-success" size={26} /><h3 className="mt-3 font-display text-2xl">Acordo de cuidado BM</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Para uma experiência segura e impecável, confirme todas as condições antes do pagamento.</p></div><div className="mt-5 space-y-3">{houseRules.map((rule, i) => <button type="button" key={rule.title} onClick={() => props.setRules(props.rules.map((checked, index) => index === i ? !checked : checked))} className="flex w-full items-start gap-3 rounded-lg border border-border bg-card p-4 text-left" role="checkbox" aria-checked={props.rules[i]}><span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${props.rules[i] ? "border-success bg-success text-success-foreground" : "border-input"}`}>{props.rules[i] && <Check size={14} />}</span><span className="text-sm leading-5"><strong className="block text-foreground">{rule.title}</strong><span className="mt-1 block text-muted-foreground">{rule.text}</span></span></button>)}</div><div className="mt-6 flex items-start gap-2 text-xs leading-5 text-muted-foreground"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-success" />Este checklist protege você e a profissional em caso de imprevistos.</div><AppButton onClick={props.onNext} disabled={!props.rules.every(Boolean)} className="mt-8 w-full">Confirmar e ir ao pagamento</AppButton></div>; }

function PaymentStep(props: BookingProps) {
  const { bookingExtras: extras, professional: p } = props;
  const urgent = bookingIsUrgent(props.selectedDay, extras.slots);
  const massage = p.service === "Massagem Relaxante";
  const total = bookingTotal(p.price, urgent, extras, massage);
  return <div className="p-5"><div className="rounded-lg border border-success/30 bg-success-soft p-4"><div className="flex gap-3"><ShieldCheck className="shrink-0 text-success" size={24} /><div><h3 className="font-bold text-success">Seu dinheiro fica seguro</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">A BM retém o valor. Ele só é liberado à profissional quando você informar o PIN após o atendimento.</p></div></div></div>
    <CheckoutOptions extras={extras} setExtras={props.setBookingExtras} isMassage={massage} favorites={props.favorites} selectedProfessional={p.id} />
    <h3 className="mb-3 mt-6 font-display text-xl">Forma de pagamento</h3><div className="grid grid-cols-2 gap-2"><AppButton variant="outline" onClick={() => props.setPayment("pix")} className={`h-auto min-h-20 flex-col items-start p-4 text-left ${props.payment === "pix" ? "border-primary bg-secondary" : ""}`}><Sparkles size={19} /><span className="text-sm font-bold">PIX</span></AppButton><AppButton variant="outline" onClick={() => props.setPayment("card")} className={`h-auto min-h-20 flex-col items-start p-4 text-left ${props.payment === "card" ? "border-primary bg-secondary" : ""}`}><CreditCard size={19} /><span className="text-sm font-bold">Cartão</span></AppButton></div>
    {props.payment === "pix" ? <div className="mt-5 rounded-lg border border-border bg-card p-4"><p className="text-xs font-bold">PIX Copia e Cola · simulação</p><div className="mt-3 flex items-center gap-2 rounded-md bg-muted p-3"><code className="min-w-0 flex-1 truncate text-[10px]">00020126580014BR.GOV.BCB.PIX0136BM8392FLORIPA</code><AppButton variant="ghost" onClick={() => { props.setCopied(true); navigator.clipboard?.writeText("00020126580014BR.GOV.BCB.PIX0136BM8392FLORIPA"); }} className="h-9 min-h-9 w-9 p-0 text-primary" aria-label="Copiar código PIX">{props.copied ? <Check size={18} /> : <Copy size={18} />}</AppButton></div>{props.copied && <p className="mt-2 text-xs font-semibold text-success">Código copiado!</p>}</div> : <div className="mt-5 rounded-lg border border-border bg-card p-4"><p className="text-xs font-bold">Cartão final 4242 · simulação</p><p className="mt-1 text-xs text-muted-foreground">Pagamento protegido pela Garantia BM</p></div>}
    <div className="mt-6 space-y-1 border-t border-border pt-4 text-xs"><div className="flex justify-between"><span>Serviço</span><span>{money(p.price)}</span></div>{urgent && <div className="flex justify-between"><span>Adicional de Urgência (&lt;12h)</span><span>+ R$ 15,00</span></div>}{massage && extras.hasTable && <div className="flex justify-between text-success"><span>Maca no local</span><span>− R$ 10,00</span></div>}{extras.useCredit && <div className="flex justify-between text-success"><span>Vale Presente / crédito BM</span><span>− R$ 20,00</span></div>}</div>
    <div className="mt-5 flex items-end justify-between gap-3"><div><p className="text-xs text-muted-foreground">Total protegido</p><p className="font-display text-3xl">{money(total)}</p></div><AppButton onClick={props.onNext} disabled={extras.forOther && !extras.recipient.trim()}>Pagar com segurança</AppButton></div>
  </div>;
}

function TrackingStep({ p, status, onClose }: { p: Professional; status: OrderStatus; onClose: () => void }) {
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeType, setDisputeType] = useState<"Dano a Material" | "Incompatibilidade no Atendimento" | null>(null);
  const [reportedDispute, setReportedDispute] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const moving = ["enroute", "arrived", "completed"].includes(status);
  const done = status === "completed";
  const submitDispute = () => {
    if (!disputeType) return;
    setReportedDispute(disputeType);
    setDisputeOpen(false);
  };

  return <div className="p-5 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success text-success-foreground"><CheckCircle2 size={32} /></div><h2 className="mt-5 font-display text-3xl">{done ? "Atendimento concluído!" : "Agendamento confirmado!"}</h2><p className="mt-2 text-sm text-muted-foreground">Horário preferido sujeito à confirmação da especialista.</p><div className="mt-7 rounded-lg border border-primary/35 bg-card p-5"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">PIN de liberação</p><p className="pin mt-3">8392</p><p className="mx-auto mt-3 max-w-xs text-xs leading-5 text-muted-foreground">{done ? "PIN validado e pagamento liberado com segurança." : "Informe este código somente após concluir e aprovar o atendimento."}</p></div><div className="mt-7 text-left"><div className="flex justify-between text-[10px] font-bold uppercase tracking-[.1em]"><span className="text-success">Confirmado</span><span className={moving ? "text-success" : "text-muted-foreground"}>A caminho</span><span className={done ? "text-success" : "text-muted-foreground"}>Concluído</span></div><div className="mt-3 flex items-center"><span className="h-3 w-3 rounded-full bg-success" /><span className="h-1 flex-1 bg-success" /><span className={`h-3 w-3 rounded-full ${moving ? "bg-success" : "bg-muted"}`} /><span className={`h-1 flex-1 ${done ? "bg-success" : "bg-muted"}`} /><span className={`h-3 w-3 rounded-full ${done ? "bg-success" : "bg-muted"}`} /></div></div><div className="mt-7 flex items-center gap-3 rounded-lg bg-card p-3 text-left shadow-soft"><img src={p.image} alt={p.name} width={72} height={72} className="h-14 w-14 rounded-md object-cover" /><div className="min-w-0 flex-1"><p className="font-bold">{p.name}</p><p className="text-xs text-muted-foreground">{p.service}</p></div><AppButton variant="outline" onClick={() => setChatOpen(true)} className="h-10 min-h-10 w-10 p-0" aria-label="Conversar"><MessageCircle size={17} /></AppButton></div>{reportedDispute && <div className="mt-4 flex items-start gap-3 rounded-lg border border-primary/35 bg-secondary p-4 text-left"><ShieldCheck size={19} className="mt-0.5 shrink-0 text-success" /><div><p className="text-sm font-bold">Disputa registrada</p><p className="mt-1 text-xs text-muted-foreground">{reportedDispute} · A equipe BM fará a mediação pelo suporte.</p></div></div>}<AppButton variant="outline" onClick={() => setDisputeOpen(true)} className="mt-5 w-full"><AlertTriangle size={17} /> Reportar Incidente / Abrir Disputa</AppButton>{done && <AppButton variant="outline" onClick={() => setReviewOpen(true)} className="mt-3 w-full"><Star size={17} /> Avaliar atendimento</AppButton>}<AppButton onClick={onClose} className="mt-3 w-full">Acompanhar pedido</AppButton>
    {chatOpen && <ChatModal name={p.name} onClose={() => setChatOpen(false)} />}
    {reviewOpen && <ReviewModal name={p.name} onClose={() => setReviewOpen(false)} />}
    {disputeOpen && <div className="fixed inset-0 z-[60] flex items-end justify-center bg-overlay/55 backdrop-blur-sm md:items-center md:p-6" role="dialog" aria-modal="true" aria-label="Reportar incidente ou abrir disputa"><div className="w-full max-w-md rounded-t-2xl bg-background p-5 text-left shadow-modal md:rounded-xl"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">Suporte BM</p><h3 className="mt-1 font-display text-2xl">O que aconteceu?</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Selecione o motivo para iniciar a mediação do atendimento.</p></div><AppButton variant="ghost" onClick={() => setDisputeOpen(false)} className="h-10 min-h-10 w-10 shrink-0 p-0" aria-label="Fechar disputa"><X size={19} /></AppButton></div><div className="mt-5 space-y-3">{(["Dano a Material", "Incompatibilidade no Atendimento"] as const).map((option) => <button type="button" key={option} onClick={() => setDisputeType(option)} className={`flex min-h-14 w-full items-center gap-3 rounded-lg border p-4 text-left text-sm font-bold ${disputeType === option ? "border-primary bg-secondary" : "border-border bg-card"}`} aria-pressed={disputeType === option}><span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${disputeType === option ? "border-success bg-success text-success-foreground" : "border-input"}`}>{disputeType === option && <Check size={13} />}</span>{option}</button>)}</div><AppButton onClick={submitDispute} disabled={!disputeType} className="mt-6 w-full">Registrar disputa</AppButton></div></div>}
  </div>;
}