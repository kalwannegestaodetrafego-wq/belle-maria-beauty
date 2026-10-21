import { LanguageSwitcher } from "../components/bm/language-switcher";
import { InstallAppButton } from "../components/bm/install-app";
import { translateUi, useLanguage } from "../lib/bm-i18n";
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
  Mail,
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
import { useCallback, useEffect, useMemo, useState, type ButtonHTMLAttributes, type ReactNode } from "react";

import { B2BFinance, ClientHub } from "../components/bm/modules";
import { AuthModal, B2BView, ChairBooking, ChatModal, OnboardingBanner, ReviewModal, TravelTipModal } from "../components/bm/extras";
import { UserRound, Lightbulb, BookOpen, Linkedin, Twitter } from "lucide-react";
import { HelpRules, OnlineToggle, WelcomeTraining } from "../components/bm/training";
import { CategoryShowcase, PortfolioNotice, ServiceMenu } from "../components/bm/discovery";
import { CheckoutOptions, FlexibleSchedule, bookingIsUrgent, bookingTotal, brazilDays, initialExtras, money, type BookingExtras } from "../components/bm/booking-extras";
import { LocationPanel, SolanaCheckout, SolanaPointsHub } from "../components/bm/web3-geo";
import { AppointmentsSummary, EarningsStatement, MyAppointments, ReleaseSuccess, ServicesManager, type Appointment } from "../components/bm/pro-dashboard";
import { HybridCheckout, PaymentReceipt, type HybridMethod } from "../components/bm/hybrid-checkout";
import { FaceVerification, IdentityTrustCard, SafetyReminder, SUPPORT_EMAIL, VerifiedBadge, SupportMailButton, SupportWidget, WhatsAppSupportButton } from "../components/bm/trust-support";
import { addWalletEntry, bookingAmounts, createBooking, createWithdrawal, fromCents, getMyProfile, listBookings, listWalletEntries, settleEscrow, signOutBm, updateBooking, useBmSession, walletTotals, SERVICE_PIN, type Booking, type WalletEntry } from "../lib/bm-store";
import { useQueryClient } from "@tanstack/react-query";
import camilaImage from "../assets/camila.jpg";
import studioImage from "../assets/studio-bella.jpg";
import julianaImage from "../assets/juliana.jpg";
import makeupEditorial from "../assets/category-makeup.jpg";
import nailsEditorial from "../assets/category-nails.jpg";
import clubEditorial from "../assets/category-club.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BM — Beauty wherever you are" },
      { name: "description", content: "Find verified beauty and wellness professionals in Florianópolis, at home or in a salon." },
      { property: "og:title", content: "BM — The finest salon experience, in the comfort of your home" },
      { property: "og:description", content: "Premium beauty, verified professionals, and protected payments." },
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
const clientStatusLabel: Record<OrderStatus, string> = { new: "Aguardando aceite", accepted: "Confirmado", enroute: "A caminho", arrived: "No local", completed: "Concluído" };

const professionals: Professional[] = [
  { id: "camila", name: "Camila Silva", role: "Maquiadora & Hair", rating: "4,9", reviews: 127, distance: "1,8 km", category: "Maquiagem", service: "Maquiagem Social", price: 150, image: camilaImage, atHome: true, tags: ["Pele Sensível", "Sem Látex", "Vegano"], bio: "Especialista em beleza natural e produções que valorizam sua identidade. Há 8 anos transformando momentos especiais com técnica, leveza e carinho." },
  { id: "bella", name: "Studio Bella", role: "Salão Parceiro", rating: "4,8", reviews: 96, distance: "Agronômica", category: "Unhas", service: "Unha em Gel", price: 90, image: studioImage, atHome: false, tags: ["Sem Látex", "Esterilização UV"], extras: [{ name: "Escova", price: 70 }], bio: "Um espaço autoral no coração de Floripa, criado para transformar o cuidado com as unhas em um ritual de bem-estar." },
  { id: "juliana", name: "Juliana Costa", role: "Massoterapeuta", rating: "5,0", reviews: 84, distance: "3,2 km", category: "Massagem", service: "Massagem Relaxante", price: 180, image: julianaImage, atHome: true, tags: ["Pele Sensível", "Óleos hipoalergênicos"], bio: "Terapeuta corporal com formação em técnicas relaxantes e recuperação muscular. Cada atendimento é pensado para devolver equilíbrio ao seu dia." },
];

const categories = ["Para você", "Maquiagem", "Cabelo & Penteado", "Unhas", "Massagem & Estética", "Design de Sobrancelhas & Cílios", "Combos VIP"];

function AppButton({ variant = "primary", className = "", children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "outline" | "icon"; children: ReactNode }) {
  const { language, locale } = useLanguage();
  const styles = { primary: "bg-primary text-primary-foreground shadow-luxe hover:bg-primary/90", ghost: "bg-transparent text-foreground hover:bg-accent", outline: "border border-border bg-card text-foreground hover:bg-accent", icon: "bg-card/85 text-foreground shadow-soft hover:bg-accent" };
  return <button className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-all active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-45 ${styles[variant]} ${className}`} {...props}>{translateUi(children, language)}</button>;
}

function Index() {
  const { language, locale } = useLanguage();
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
  const [payment, setPayment] = useState<"pix" | "card" | "solana">("pix");
  const [copied, setCopied] = useState(false);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("new");
  const [securityOpen, setSecurityOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [trainingOpen, setTrainingOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [receiptCode] = useState(() => `BM${Date.now().toString(36).toUpperCase().slice(-8)}`);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [liveBooking, setLiveBooking] = useState<Booking | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [profileName, setProfileName] = useState<string | null>(null);
  const { user, loading: sessionLoading } = useBmSession();
  const queryClient = useQueryClient();
  const leaveAccount = useCallback(async () => {
    queryClient.cancelQueries();
    queryClient.clear();
    await signOutBm();
  }, [queryClient]);

  useEffect(() => {
    if (!user) { setMyBookings([]); setLiveBooking(null); setProfileName(null); return; }
    let active = true;
    void listBookings("client").then((rows) => { if (active) { setMyBookings(rows); setLiveBooking((current) => rows.find((row) => row.id === current?.id) ?? rows.find((row) => row.status !== "completed") ?? rows[0] ?? null); } }).catch(() => {});
    void getMyProfile().then((profile) => { if (active) setProfileName(profile?.full_name ?? null); }).catch(() => {});
    return () => { active = false; };
  }, [user]);

  const filtered = useMemo(() => professionals.filter((p) => (category === "Para você" || category.startsWith(p.category) || category.startsWith("Cabelo") && p.id === "camila" || category === "Casamentos & Noivas" && p.id === "camila" || category === "Eventos" && p.id === "camila" || category === "Combos VIP" || category === "Clube BM" || category === "Vale Presente") && (mode === "Em Domicílio" ? p.atHome : !p.atHome)), [category, mode]);

  const latest = myBookings[0] ?? liveBooking ?? null;
  const openProfile = (p: Professional) => { setSelected(p); setStep(0); };
  const openAgenda = () => {
    const firstProfessional = professionals.at(0);
    if (!firstProfessional) return;
    setSelected(firstProfessional);
    setStep(1);
  };
  const close = () => { setSelected(null); setStep(0); setRules([false, false, false, false]); setOrderStatus("new"); setLiveBooking(null); setSaveError(""); };
  const next = () => setStep((current) => Math.min(current + 1, 4));
  const back = () => step === 0 ? close() : setStep((current) => current - 1);

  const payBooking = useCallback(async () => {
    if (!selected || !user || saving) return;
    setSaving(true); setSaveError("");
    const { total, fee } = bookingAmounts(orderTotal);
    const slot = bookingExtras.slots[0] ?? "12:00";
    const scheduled = /^\d{4}-\d{2}-\d{2}$/.test(selectedDay) ? new Date(`${selectedDay}T${slot}:00`) : null;
    try {
      const row = await createBooking({
        professional_name: selected.name,
        salon_name: selected.role === "Salão Parceiro" ? selected.name : null,
        service_name: selected.service,
        category: selected.category,
        client_name: profileName,
        address: bookingExtras.notes || null,
        notes: bookingExtras.notes || null,
        scheduled_for: scheduled && !Number.isNaN(scheduled.getTime()) ? scheduled.toISOString() : null,
        preferred_times: bookingExtras.slots.join(", "),
        payment_method: payment === "solana" ? "solana" : payment === "card" ? "card" : "pix",
        amount_cents: Math.round(total * 100),
        fee_cents: Math.round(fee * 100),
        urgency_fee: bookingIsUrgent(selectedDay, bookingExtras.slots),
        receipt_code: receiptCode,
        service_pin: SERVICE_PIN,
        checklist_infra: !!rules[0], checklist_materials: !!rules[1], checklist_pets: !!rules[2], checklist_terms: !!rules[3],
      });
      setLiveBooking(row);
      setMyBookings((rows) => [row, ...rows]);
      setOrderStatus("new");
      try { await addWalletEntry({ kind: "escrow", amount: total, label: `${selected.service} · ${selected.name}`, bookingId: row.id }); } catch { /* the protected balance keeps the simulated figure */ }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Não foi possível registrar seu agendamento.");
    } finally { setSaving(false); }
  }, [selected, user, saving, orderTotal, bookingExtras, selectedDay, payment, receiptCode, rules, profileName]);

  const changeStatus = useCallback(async (status: OrderStatus) => {
    setOrderStatus(status);
    if (liveBooking) { try { await updateBooking(liveBooking.id, { status }); } catch { /* the local view keeps the new step */ } }
  }, [liveBooking]);

  const completeBooking = useCallback(async () => {
    if (!liveBooking) return !user;
    const { fee, net } = bookingAmounts(fromCents(liveBooking.amount_cents));
    try {
      await updateBooking(liveBooking.id, { status: "completed", payment_status: "released" });
      await settleEscrow(liveBooking.id);
      await addWalletEntry({ kind: "earning", amount: net, label: liveBooking.service_name, bookingId: liveBooking.id });
      await addWalletEntry({ kind: "fee", amount: fee, label: "Taxa BM 18%", bookingId: liveBooking.id });
      setLiveBooking((row) => row ? { ...row, status: "completed", payment_status: "released" } : row);
      setMyBookings((rows) => rows.map((row) => row.id === liveBooking.id ? { ...row, status: "completed", payment_status: "released" } : row));
      return true;
    } catch { return false; }
  }, [liveBooking, user]);

  return (
    <main className="min-h-screen bg-background pb-24 text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/88 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 pb-3 pt-3 md:px-8">
          <div className="flex items-center justify-between">
             <div className="brand-mark" aria-label={translateUi("BM", language)}>{translateUi("BM", language)}</div>
             <div className="flex items-center gap-1 sm:gap-2"><LanguageSwitcher />{translateUi(user ? <div className="relative"><AppButton variant="icon" onClick={() => setAccountOpen((open) => !open)} aria-expanded={accountOpen} className="h-11 w-11 rounded-full p-0 font-display text-sm" aria-label={translateUi("Sua conta", language)}>{(profileName || user.email || "BM").trim().slice(0, 2).toUpperCase()}</AppButton>{translateUi(accountOpen && <div className="absolute right-0 top-12 z-40 w-60 rounded-lg border border-border bg-card p-3 text-left shadow-modal"><p className="truncate text-xs font-bold">{user.email}</p><p className="mt-1 text-[10px] text-muted-foreground">{translateUi("Conta guardada na nuvem da BM", language)}</p><button type="button" onClick={() => { setAccountOpen(false); setAuthOpen(true); }} className="mt-2 w-full text-left text-xs font-semibold text-primary">{translateUi("Completar verificação", language)}</button><button type="button" onClick={() => { setAccountOpen(false); void leaveAccount(); }} className="mt-1 w-full text-left text-xs font-semibold text-destructive">{translateUi("Sair", language)}</button></div>, language)}</div> : <AppButton variant="icon" onClick={() => setAuthOpen(true)} className="h-11 w-11 rounded-full p-0" aria-label={translateUi("Entrar ou cadastrar", language)}><UserRound size={19} /></AppButton>, language)}<AppButton variant="icon" onClick={() => setHelpOpen(true)} className="h-11 w-11 rounded-full p-0" aria-label={translateUi("Ajuda e regras", language)}><BookOpen size={19} /></AppButton><AppButton variant="icon" onClick={() => setSecurityOpen(true)} className="h-11 w-11 rounded-full p-0" aria-label={translateUi("Abrir Central de Segurança", language)}><Menu size={19} /></AppButton></div>
          </div>
           <button type="button" onClick={() => setSecurityOpen(true)} className="mt-3 flex w-full items-center justify-between gap-3 rounded-lg border border-primary/30 bg-card/70 px-3 py-2 text-left shadow-soft backdrop-blur-xl transition-colors hover:bg-card">
             <span className="text-xs font-bold leading-5">{translateUi("A experiência dos melhores salões, no conforto do seu lar.", language)}</span><ShieldCheck size={18} className="shrink-0 text-success" />
           </button>
           <InstallAppButton className="mt-2 w-full" />
          <div className="mt-3 flex items-center justify-between gap-3">
            <button className="flex min-w-0 items-center gap-2 text-left text-xs font-semibold"><MapPin size={15} className="shrink-0 text-primary" /><span className="truncate">{translateUi("Florianópolis, SC · Centro", language)}</span><ChevronRight size={14} /></button>
             <div className="flex shrink-0 items-center gap-1 text-[10px] font-bold text-success"><ShieldCheck size={14} />{translateUi(" Garantia BM & Verificação de Identidade", language)}</div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="mt-5 grid grid-cols-3 rounded-lg bg-card/65 p-1 shadow-soft ring-1 ring-border/60">
          {translateUi((["Cliente", "Profissional Beleza", "Empresa & Salão B2B"] as const).map((item) => <button key={item} onClick={() => setView(item)} aria-pressed={view === item} className={`min-h-11 rounded-md px-1 text-[10px] font-bold leading-tight transition-all ${view === item ? "bg-primary text-primary-foreground shadow-soft ring-1 ring-foreground" : "text-muted-foreground"}`}>{translateUi(item, language)}</button>), language)}
        </div>

         {translateUi(view === "Empresa & Salão B2B" ? <><B2BView /><B2BFinance /></> : view === "Profissional Beleza" ? <ProfessionalView selectedDay={selectedDay} selectedTime={selectedTime} orderTotal={orderTotal} status={orderStatus} setStatus={changeStatus} bookingId={liveBooking?.id} onComplete={completeBooking} clientName={profileName ?? liveBooking?.client_name ?? "Ana Martins"} /> : <>
          <section className="py-7 md:py-10">
            <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.16em] text-primary"><Sparkles size={14} />{translateUi(" Curadoria em Florianópolis", language)}</p>
            <h1 className="max-w-2xl font-display text-4xl leading-[1.05] md:text-6xl">{translateUi("A experiência dos melhores salões, ", language)}<span className="text-primary">{translateUi("no conforto do seu lar.", language)}</span></h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">{translateUi("Especialistas verificadas, pagamento retido na BM até o fim do atendimento e agenda no seu tempo.", language)}</p>
          </section>

          <MyAppointments professional={latest?.professional_name ?? "Camila Silva"} service={latest?.service_name ?? "Maquiagem Social"} when={latest ? `${new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", timeZone: "UTC" }).format(new Date(latest.scheduled_for ?? latest.created_at))} · ${((latest.preferred_times ?? "").split(",")[0] ?? "").trim() || "—"}` : `${selectedDay ? new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", timeZone: "UTC" }).format(new Date(`${selectedDay}T12:00:00Z`)) : "—"} · ${selectedTime}`} value={latest ? fromCents(latest.amount_cents) : orderTotal} completed={(latest?.status ?? orderStatus) === "completed"} statusLabel={clientStatusLabel[(latest?.status ?? orderStatus) as OrderStatus]} bookingId={latest?.id} signedIn={!!user} />
          <div className="h-6" />
          <CategoryShowcase selected={category} onSelect={(filter) => { setCategory(filter); if (filter === "Unhas") setMode("No Salão"); else if (["Cabelo & Penteado", "Maquiagem", "Casamentos & Noivas", "Eventos"].includes(filter)) setMode("Em Domicílio"); }} />

          <section aria-label={translateUi("Modo de atendimento", language)} className="mb-6 grid grid-cols-2 gap-2">
            {translateUi((["Em Domicílio", "No Salão"] as const).map((item) => <button key={item} onClick={() => setMode(item)} className={`flex h-14 items-center justify-center gap-2 rounded-lg border text-sm font-bold transition-all ${mode === item ? "border-primary bg-card text-foreground shadow-soft" : "border-transparent bg-card/45 text-muted-foreground"}`}>{translateUi(item === "Em Domicílio" ? <Home size={18} /> : <Store size={18} />, language)}{translateUi(item, language)}</button>), language)}
          </section>

          <section className="-mx-4 mb-7 overflow-hidden">
            <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1">
              {translateUi(categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition ${category === item ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card/70 text-foreground"}`}>{translateUi(item, language)}</button>), language)}
            </div>
          </section>

          <div className="mb-4 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-primary">{translateUi("Seleção BM", language)}</p><h2 className="mt-1 font-display text-3xl">{translateUi("Destaques perto de você", language)}</h2></div><span className="text-xs text-muted-foreground">{translateUi(filtered.length, language)}{translateUi(" opções", language)}</span></div>
          <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {translateUi(filtered.map((p) => <article key={p.id} className="group overflow-hidden rounded-lg border border-border/80 bg-card/88 shadow-card backdrop-blur-sm">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={p.image} alt={translateUi(p.name, language)} loading="lazy" width={912} height={1200} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                <AppButton variant="icon" onClick={() => setFavorite((f) => f.includes(p.id) ? f.filter((id) => id !== p.id) : [...f, p.id])} className="absolute right-3 top-3 h-10 min-h-10 w-10 rounded-full p-0" aria-label={translateUi(`Favoritar ${p.name}`, language)}><Heart size={18} className={favorite.includes(p.id) ? "fill-primary text-primary" : ""} /></AppButton>
                 <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-[10px] font-bold text-success-foreground"><ShieldCheck size={12} />{translateUi(" Identidade verificada", language)}</span>
              </div>
              <div className="p-4">
                <div className="flex justify-between gap-3"><div><h3 className="font-display text-2xl">{translateUi(p.name, language)}</h3><p className="mt-0.5 text-xs text-muted-foreground">{translateUi(p.role, language)}</p><VerifiedBadge name={p.name} className="mt-2" /></div><div className="flex h-fit items-center gap-1 text-xs font-bold"><Star size={14} className="fill-primary text-primary" />{translateUi(p.rating, language)}</div></div>
                <div className="my-4 flex items-center justify-between border-y border-border/70 py-3 text-xs"><span className="flex items-center gap-1 text-muted-foreground"><MapPin size={13} />{translateUi(p.distance, language)}</span><span>{translateUi(p.reviews, language)}{translateUi(" avaliações", language)}</span></div>
                 <p className="mb-3 inline-flex rounded-md bg-secondary px-2 py-1 text-[10px] font-bold text-foreground">{translateUi("R$ 20 OFF no primeiro agendamento*", language)}</p><div className="flex items-end justify-between gap-3"><div><p className="text-xs text-muted-foreground">{translateUi("A partir de", language)}</p><p className="mt-0.5 font-display text-lg">{translateUi(p.service, language)}{translateUi(" · R$ ", language)}{translateUi(p.price, language)}</p></div><AppButton onClick={() => openProfile(p)} className="shrink-0 px-3">{translateUi("Ver perfil", language)}</AppButton></div><p className="mt-2 text-[10px] text-muted-foreground">{translateUi("*Oferta demonstrativa; não aplicada automaticamente ao checkout.", language)}</p>
              </div>
            </article>), language)}
          </section>
          {translateUi(filtered.length === 0 && <div className="rounded-lg border border-border bg-card p-8 text-center"><Sparkles className="mx-auto text-primary" /><h3 className="mt-3 font-display text-2xl">{translateUi("Novos talentos chegando", language)}</h3><p className="mt-2 text-sm text-muted-foreground">{translateUi("Tente outra categoria ou forma de atendimento.", language)}</p></div>, language)}
          <ClientHub />
          <SolanaPointsHub />
          <LocationPanel />
        </>, language)}
      </div>

      <footer className="mx-auto mt-10 max-w-6xl border-t border-border px-4 py-8 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="font-display text-xl">{translateUi("BM", language)}</p><p className="mt-1 text-xs text-muted-foreground">{translateUi("A experiência dos melhores salões, no conforto do seu lar.", language)}</p></div><div className="flex flex-col items-start gap-3"><button type="button" onClick={() => setSecurityOpen(true)} className="inline-flex min-h-11 items-center gap-2 self-start text-sm font-bold text-foreground transition-colors hover:text-primary"><ShieldCheck size={18} className="text-success" />{translateUi(" Segurança & Privacidade ", language)}<ChevronRight size={16} /></button><WhatsAppSupportButton /></div></div>
        <div className="mt-6 flex flex-col gap-4 border-t border-border/70 pt-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <a href="https://www.linkedin.com/company/belle-maria-beauty" target="_blank" rel="noreferrer" aria-label={translateUi("LinkedIn oficial da BM", language)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:text-primary"><Linkedin size={18} /></a>
            <a href="https://x.com/bellemariabeauty" target="_blank" rel="noreferrer" aria-label={translateUi("X (Twitter) oficial da BM", language)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:text-primary"><Twitter size={18} /></a>
          </div>
          <p className="text-[11px] leading-5 text-muted-foreground">{translateUi("© 2026 Belle Maria Beauty — O dApp pioneiro em agendamentos de beleza com Solana Pay e Pix.", language)}</p>
        </div>
      </footer>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 px-7 py-2 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-sm items-center justify-between"><BottomItem icon={<Sparkles size={20} />} label={translateUi("Explorar", language)} active /><BottomItem icon={<CalendarDays size={20} />} label={translateUi("Agenda", language)} onClick={openAgenda} /><BottomItem icon={<Heart size={20} />} label={translateUi("Favoritos", language)} /><BottomItem icon={<MessageCircle size={20} />} label={translateUi("Mensagens", language)} onClick={() => setChatOpen(true)} /></div>
      </nav>

       {translateUi(selected && <BookingModal professional={selected} step={step} selectedDay={selectedDay} setSelectedDay={setSelectedDay} bookingExtras={bookingExtras} setBookingExtras={setBookingExtras} favorites={professionals.filter((p) => favorite.includes(p.id)).map(({ id, name }) => ({ id, name }))} rules={rules} setRules={setRules} payment={payment} setPayment={setPayment} copied={copied} setCopied={setCopied} orderStatus={orderStatus} onNext={next} onBack={back} onClose={close} receiptCode={receiptCode} onPaid={payBooking} saving={saving} saveError={saveError} signedIn={!!user} onSignIn={() => { close(); setAuthOpen(true); }} bookingId={liveBooking?.id} />, language)}
      {translateUi(authOpen && <AuthModal onClose={() => setAuthOpen(false)} onProfessionalSignup={() => { setAuthOpen(false); setView("Profissional Beleza"); setTrainingOpen(true); }} />, language)}
      {translateUi(chatOpen && <ChatModal name="Camila Silva" onClose={() => setChatOpen(false)} />, language)}
      {translateUi(securityOpen && <SecurityCenter onClose={() => setSecurityOpen(false)} />, language)}
      {translateUi(helpOpen && <HelpRules onClose={() => setHelpOpen(false)} />, language)}
      {translateUi(trainingOpen && <WelcomeTraining onClose={() => setTrainingOpen(false)} />, language)}
      <SupportWidget />
    </main>
  );
}

function ProfessionalView({ selectedDay, selectedTime, orderTotal, status, setStatus, bookingId, onComplete, clientName }: { selectedDay: string; selectedTime: string; orderTotal: number; status: OrderStatus; setStatus: (status: OrderStatus) => void; bookingId?: string | undefined; onComplete: () => Promise<boolean>; clientName: string }) {
  const { language, locale } = useLanguage();
  const [pinOpen, setPinOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [withdrawn, setWithdrawn] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);
  const [released, setReleased] = useState(false);
  const { user } = useBmSession();
  const [entries, setEntries] = useState<WalletEntry[]>([]);
  useEffect(() => {
    if (!user) { setEntries([]); return; }
    let active = true;
    void listWalletEntries().then((rows) => { if (active) setEntries(rows); }).catch(() => {});
    return () => { active = false; };
  }, [user, status]);
  const totals = walletTotals(entries);
  const hasLedger = entries.length > 0;
  const net = orderTotal * .82;
  const dayLabel = selectedDay ? new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", timeZone: "UTC" }).format(new Date(`${selectedDay}T12:00:00Z`)) : "—";
  const appointments: Appointment[] = [
    { id: bookingId ?? "BM-0925", client: clientName, service: "Maquiagem Social", when: `${dayLabel} · ${selectedTime}`, value: orderTotal, group: status === "completed" ? "done" : "today" },
    { id: "BM-0931", client: "Beatriz R.", service: "Penteado", when: "Sáb · 10:30", value: 120, group: "upcoming" },
    { id: "BM-0934", client: "Lívia M.", service: "Maquiagem Noiva", when: "Dom · 08:00", value: 380, group: "upcoming" },
  ];
  const statusLabel = { new: "Novo chamado", accepted: "Chamado aceito", enroute: "A caminho", arrived: "No local", completed: "Concluído" }[status];
  const action = status === "new" ? { label: "Aceitar Chamado", next: "accepted" as const } : status === "accepted" ? { label: "A Caminho", next: "enroute" as const } : status === "enroute" ? { label: "Cheguei ao Local", next: "arrived" as const } : null;
  const validatePin = async () => {
    if (pin !== SERVICE_PIN) { setPinError("PIN incorreto. Confira com a cliente."); return; }
    const saved = await onComplete();
    if (!saved) { setPinError("Não foi possível registrar a conclusão. Tente novamente."); return; }
    setStatus("completed"); setPinOpen(false); setPinError(""); setPin(""); setReleased(true);
  };
  const withdraw = async () => {
    const amount = hasLedger ? totals.available : (status === "completed" ? net : 0);
    setWithdrawn(true);
    if (amount <= 0) return;
    try { await createWithdrawal(amount); await addWalletEntry({ kind: "withdrawal", amount, label: "Saque via PIX" }); } catch { /* the simulated saque stays on screen */ }
  };

  return <section className="py-7 md:py-10">
    <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">{translateUi("Painel do Profissional", language)}</p><h1 className="mt-1 font-display text-4xl">{translateUi("Olá, Camila", language)}</h1><p className="mt-2 text-sm text-muted-foreground">{translateUi("Acompanhe seus atendimentos e ganhos.", language)}</p></div><div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-card shadow-soft"><Bell size={19} /><span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-background" /></div></div>

    <OnlineToggle />
    <FaceVerification className="mt-4" />
    <AppointmentsSummary items={appointments} />
    <OnboardingBanner />
    <button onClick={() => setTipOpen(true)} className="mt-3 flex w-full items-center gap-3 rounded-lg bg-secondary p-3 text-left text-xs font-semibold"><Lightbulb size={17} className="shrink-0 text-primary" />{translateUi(" Dica: como calcular deslocamento sem encarecer o serviço ", language)}<ChevronRight size={15} className="ml-auto shrink-0" /></button>
    <div className="mt-7 overflow-hidden rounded-lg border border-primary bg-card shadow-card">
      <div className="flex items-center justify-between bg-secondary px-4 py-3"><span className="flex items-center gap-2 text-xs font-bold"><span className="h-2 w-2 rounded-full bg-success" />{translateUi(statusLabel, language)}</span><span className="text-[10px] font-semibold text-muted-foreground">{translateUi(bookingId ? `#${bookingId.slice(0, 8).toUpperCase()}` : "#BM-0925", language)}</span></div>
       <div className="p-4"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-background font-display text-lg">{translateUi(clientName.slice(0, 2).toUpperCase(), language)}</div><div><h2 className="font-bold">{translateUi(clientName, language)}</h2><p className="text-xs font-semibold text-success">{translateUi("Cliente Verificada (CPF e Foto Validados)", language)}</p><p className="text-[10px] text-muted-foreground">{translateUi("12 atendimentos", language)}</p></div></div>
       <div className="my-5 grid grid-cols-2 gap-3 border-y border-border py-4 text-xs"><div><p className="text-muted-foreground">{translateUi("Serviço", language)}</p><p className="mt-1 font-bold">{translateUi("Maquiagem Social", language)}</p></div><div><p className="text-muted-foreground">{translateUi("Data e horário", language)}</p><p className="mt-1 font-bold">{translateUi(selectedDay ? new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", timeZone: "UTC" }).format(new Date(`${selectedDay}T12:00:00Z`)) : "A definir", language)}{translateUi(" · ", language)}{translateUi(selectedTime, language)}</p></div><div className="col-span-2"><p className="text-muted-foreground">{translateUi("Endereço", language)}</p><p className="mt-1 flex items-center gap-1 font-bold"><MapPin size={13} className="text-primary" />{translateUi(" Rua Bocaiúva, 2125 · Centro", language)}</p></div></div>
       <div className="flex items-end justify-between gap-3"><div><p className="text-xs text-muted-foreground">{translateUi("Valor protegido", language)}</p><p className="font-display text-2xl">{translateUi(money(orderTotal), language)}</p></div>{translateUi(action && <AppButton onClick={() => setStatus(action.next)}>{translateUi(action.label, language)}{translateUi(action.next === "enroute" && <Navigation size={16} />, language)}</AppButton>, language)}{translateUi(status === "arrived" && <AppButton onClick={() => setPinOpen(true)}><KeyRound size={16} />{translateUi(" Validar e Finalizar Atendimento", language)}</AppButton>, language)}{translateUi(status === "completed" && <span className="flex items-center gap-1 text-sm font-bold text-success"><CheckCircle2 size={18} />{translateUi(" Finalizado", language)}</span>, language)}</div></div>
    </div>

    {translateUi(status !== "completed" && <AppButton onClick={() => setPinOpen(true)} disabled={status !== "arrived"} className="mt-4 w-full"><KeyRound size={16} />{translateUi(" Validar e Finalizar Atendimento", language)}</AppButton>, language)}
    {translateUi(status !== "completed" && status !== "arrived" && <p className="mt-2 text-center text-[11px] text-muted-foreground">{translateUi("Disponível após confirmar \"Cheguei ao Local\".", language)}</p>, language)}
    <EarningsStatement escrow={hasLedger ? totals.escrow : (status === "completed" ? 0 : net)} available={hasLedger ? totals.available : (status === "completed" ? net : 0)} withdrawn={withdrawn} saved={hasLedger} onWithdraw={() => { void withdraw(); }} />
    <ServicesManager />

    <ChairBooking />
    {released && <ReleaseSuccess amount={hasLedger ? totals.earnings : net} onClose={() => setReleased(false)} />}
    {translateUi(tipOpen && <TravelTipModal onClose={() => setTipOpen(false)} />, language)}
    {translateUi(pinOpen && <div className="fixed inset-0 z-50 flex items-end justify-center bg-overlay/55 p-0 backdrop-blur-sm md:items-center md:p-6" role="dialog" aria-modal="true" aria-label={translateUi("Validar PIN", language)}><div className="w-full max-w-md rounded-t-2xl bg-background p-5 shadow-modal md:rounded-xl"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">{translateUi("Liberação segura", language)}</p><h2 className="mt-1 font-display text-2xl">{translateUi("Validar PIN da cliente", language)}</h2></div><AppButton variant="ghost" onClick={() => setPinOpen(false)} className="h-10 min-h-10 w-10 p-0" aria-label={translateUi("Fechar", language)}><X size={19} /></AppButton></div><p className="mt-3 text-sm leading-6 text-muted-foreground">{translateUi("Digite o código de 4 dígitos exibido no celular da cliente para concluir e liberar R$ ", language)}{translateUi(net.toFixed(2).replace(".", ","), language)}{translateUi(".", language)}</p><input value={pin} onChange={(event) => { const value = event.target.value.replace(/\D/g, "").slice(0, 4); setPin(value); setPinError(""); }} inputMode="numeric" autoComplete="one-time-code" maxLength={4} aria-label={translateUi("PIN de 4 dígitos", language)} className="pin-input mt-6 w-full rounded-lg border border-border bg-card px-4 py-4 text-center font-display text-3xl" placeholder={translateUi("••••", language)} />{translateUi(pinError && <p className="mt-2 text-xs font-semibold text-destructive">{translateUi(pinError, language)}</p>, language)}<AppButton onClick={validatePin} disabled={pin.length !== 4} className="mt-5 w-full">{translateUi("Concluir serviço e liberar pagamento", language)}</AppButton></div></div>, language)}
  </section>;
}

const securityTopics = [
  { title: "Dicas de Segurança para Atendimento em Domicílio", content: "Clientes: confirme a identidade exibida no app, mantenha o ambiente iluminado, informe quem estará no local e só compartilhe o PIN após aprovar o serviço. Profissionais: valide os dados do chamado, mantenha materiais higienizados, compartilhe seu status pelo app e registre qualquer situação insegura antes de iniciar." },
  { title: "Proteção BM", content: "A BM verifica identidades e mantém o pagamento protegido durante o atendimento. O valor só é liberado para a profissional após a cliente informar o PIN de segurança e confirmar a conclusão do serviço." },
  { title: "Governança de Dados & LGPD", content: "Dados pessoais, documentos, CPF, fotos e selfies são tratados para validação de identidade, segurança, agendamentos e suporte. Essas informações permanecem protegidas, com acesso controlado, e você pode solicitar acesso, correção ou exclusão conforme a LGPD." },
  { title: "Termos de Serviço & Protocolo de Incidentes", content: "Clientes e profissionais devem fornecer dados verdadeiros, manter conduta respeitosa e usar os canais da BM. Para avaria, dano ou incompatibilidade, abra uma disputa no acompanhamento; o pagamento permanece retido durante a mediação. Contato oficial: startupbmcomercial@gmail.com." },
  { title: "Garantia BM (Custódia/Escrow)", content: "O valor do pagamento fica retido em caução de proteção (escrow) e só é pago à profissional após a cliente digitar o PIN de segurança no fim do atendimento. Se algo der errado, abra uma disputa e a BM medeia com o valor ainda protegido." },
  { title: "Política de Cancelamento", content: "Cancelamento gratuito até 2 horas antes do horário marcado. Cancelamentos com menos de 2 horas de antecedência podem reter parte do valor conforme a política da profissional." },
  { title: "Regra de No-Show", content: "Se a cliente não comparecer ao atendimento, 50% da taxa de reserva é repassada à profissional." },
];

function SecurityCenter({ onClose }: { onClose: () => void }) {
  const { language, locale } = useLanguage();
  const [expanded, setExpanded] = useState<string | null>("Dicas de Segurança para Atendimento em Domicílio");
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-overlay/55 backdrop-blur-sm md:items-center md:p-6" role="dialog" aria-modal="true" aria-label={translateUi("Segurança e Privacidade", language)}>
    <div className="modal-scroll max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-background shadow-modal md:rounded-xl">
       <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-5 py-4 backdrop-blur-xl"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">{translateUi("Garantia BM", language)}</p><h2 className="mt-1 font-display text-2xl">{translateUi("Segurança & Privacidade", language)}</h2></div><AppButton variant="ghost" onClick={onClose} className="h-10 min-h-10 w-10 p-0" aria-label={translateUi("Fechar", language)}><X size={19} /></AppButton></div>
       <div className="p-5"><div className="mb-5 flex items-start gap-3 rounded-lg border border-success/30 bg-success-soft p-4"><ShieldCheck className="mt-0.5 shrink-0 text-success" size={24} /><div><p className="text-sm font-bold text-success">{translateUi("Proteção em cada atendimento", language)}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{translateUi("Consulte as práticas que protegem pessoas, dados e pagamentos.", language)}</p></div></div><div className="space-y-2">{translateUi(securityTopics.map((topic) => { const isOpen = expanded === topic.title; return <div key={topic.title} className="overflow-hidden rounded-lg border border-border bg-card"><button type="button" onClick={() => setExpanded(isOpen ? null : topic.title)} className="flex min-h-14 w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm font-bold" aria-expanded={isOpen}><span>{translateUi(topic.title, language)}</span><ChevronDown size={18} className={`shrink-0 text-primary transition-transform ${isOpen ? "rotate-180" : ""}`} /></button><div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}><div className="overflow-hidden"><p className="border-t border-border px-4 py-4 text-sm leading-6 text-muted-foreground">{translateUi(topic.content, language)}</p></div></div></div>; }), language)}</div><div className="mt-5 rounded-lg bg-card p-4 text-center shadow-soft"><Mail className="mx-auto text-primary" size={20} /><p className="mt-2 text-xs font-bold">{translateUi("Contato oficial", language)}</p><p className="mt-1 break-all text-xs text-muted-foreground">{translateUi(SUPPORT_EMAIL, language)}</p></div><SupportMailButton className="mt-4 w-full" /><InstallAppButton className="mt-3 w-full" /><AppButton variant="outline" onClick={onClose} className="mt-3 w-full">{translateUi("Entendi", language)}</AppButton></div>
    </div>
  </div>;
}

function BottomItem({ icon, label, active = false, onClick }: { icon: ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  const { language, locale } = useLanguage(); return <button onClick={onClick} className={`flex min-w-14 flex-col items-center gap-1 py-1 text-[9px] font-semibold ${active ? "text-primary" : "text-muted-foreground"}`}>{translateUi(icon, language)}{translateUi(label, language)}</button>; }

type BookingProps = { professional: Professional; step: number; selectedDay: string; setSelectedDay: (v: string) => void; bookingExtras: BookingExtras; setBookingExtras: (v: BookingExtras) => void; favorites: { id: string; name: string }[]; rules: boolean[]; setRules: (v: boolean[]) => void; payment: "pix" | "card" | "solana"; setPayment: (v: "pix" | "card" | "solana") => void; copied: boolean; setCopied: (v: boolean) => void; orderStatus: OrderStatus; onNext: () => void; onBack: () => void; onClose: () => void; receiptCode: string; onPaid: () => Promise<void>; saving: boolean; saveError: string; signedIn: boolean; onSignIn: () => void; bookingId?: string | undefined };

function BookingModal(props: BookingProps) {
  const { language, locale } = useLanguage();
  const { professional: p, step } = props;
  const titles = ["Perfil", "Escolha seu horário", "Tudo pronto para receber?", "Pagamento protegido", "Seu ritual está confirmado"];
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-overlay/55 backdrop-blur-sm md:items-center md:p-6" role="dialog" aria-modal="true" aria-label={translateUi(titles[step], language)}>
    <div className="modal-scroll max-h-[94dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-background shadow-modal md:max-h-[88vh] md:rounded-xl">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur-xl">
        <AppButton variant="ghost" onClick={props.onBack} className="h-10 min-h-10 w-10 p-0" aria-label={translateUi("Voltar", language)}><ArrowLeft size={20} /></AppButton><div className="text-center"><p className="text-[9px] font-bold uppercase tracking-[.15em] text-primary">{translateUi(step === 0 ? "Conheça" : `Etapa ${step} de 4`, language)}</p><p className="font-display text-lg">{translateUi(titles[step], language)}</p></div><AppButton variant="ghost" onClick={props.onClose} className="h-10 min-h-10 w-10 p-0" aria-label={translateUi("Fechar", language)}><X size={20} /></AppButton>
      </div>
      {translateUi(step === 0 && <ProfileStep p={p} onNext={props.onNext} />, language)}
      {translateUi(step === 1 && <ScheduleStep {...props} />, language)}
      {translateUi(step === 2 && <RulesStep {...props} />, language)}
      {translateUi(step === 3 && <PaymentStep {...props} />, language)}
      {translateUi(step === 4 && <TrackingStep p={p} status={props.orderStatus} bookingId={props.bookingId} onClose={props.onClose} />, language)}
    </div>
  </div>;
}

function ProfileStep({ p, onNext }: { p: Professional; onNext: () => void }) {
  const { language, locale } = useLanguage();
  const gallery = [p.image, ...(p.id === "camila" ? [makeupEditorial, makeupEditorial] : p.id === "bella" ? [nailsEditorial, nailsEditorial] : [clubEditorial, clubEditorial])];
   return <div className="pb-5"><div className="relative aspect-[16/11] overflow-hidden"><img src={p.image} alt={translateUi(p.name, language)} width={912} height={1200} className="h-full w-full object-cover" /><VerifiedBadge name={p.name} className="absolute bottom-4 left-4" /></div><div className="px-5 pt-5"><IdentityTrustCard className="mb-5" /><div className="flex justify-between"><div><h2 className="font-display text-3xl">{translateUi(p.name, language)}</h2><p className="text-sm text-muted-foreground">{translateUi(p.role, language)}{translateUi(" · ", language)}{translateUi(p.distance, language)}</p></div><span className="flex h-fit items-center gap-1 text-sm font-bold"><Star size={15} className="fill-primary text-primary" /> {translateUi(p.rating, language)}</span></div><p className="mt-5 text-sm leading-6 text-muted-foreground">{translateUi(p.bio, language)}</p><div className="mt-4 flex flex-wrap gap-2">{translateUi(p.tags.map((t) => <span key={t} className="rounded-full border border-success/30 bg-success-soft px-3 py-1 text-[11px] font-semibold text-success">{translateUi(t, language)}</span>), language)}</div><h3 className="mb-3 mt-6 font-display text-xl">{translateUi("Portfólio", language)}</h3><div className="grid grid-cols-3 gap-2">{translateUi(gallery.map((image, i) => <img key={`${image}-${i}`} src={image} alt={translateUi(`Imagem ilustrativa ${i + 1} de ${p.name}`, language)} loading="lazy" width={912} height={1200} className="aspect-square w-full rounded-md object-cover" />), language)}</div><PortfolioNotice /><h3 className="mb-3 mt-6 font-display text-xl">{translateUi("Menu de serviços", language)}</h3><ServiceMenu services={[{ name: p.service, price: p.price }, ...(p.extras ?? [])]} /><h3 className="mb-3 mt-6 font-display text-xl">{translateUi("Avaliações", language)}</h3><div className="space-y-2">{translateUi([{ n: "Marina L.", t: "Pontual, super cuidadosa e o resultado ficou impecável." }, { n: "Rafaela S.", t: "Material todo higienizado. Já agendei de novo!" }].map((r) => <div key={r.n} className="rounded-lg bg-card p-3 shadow-soft"><p className="flex items-center gap-1 text-xs font-bold">{translateUi(r.n, language)} <span className="ml-auto flex">{translateUi([1,2,3,4,5].map((i) => <Star key={i} size={11} className="fill-primary text-primary" />), language)}</span></p><p className="mt-1 text-xs text-muted-foreground">{translateUi(r.t, language)}</p></div>), language)}</div><AppButton onClick={onNext} className="mt-5 w-full">{translateUi("Escolher data e horário ", language)}<ChevronRight size={17} /></AppButton></div></div>;
}

function ScheduleStep(props: BookingProps) {
  const { language, locale } = useLanguage(); return <div className="p-5"><div className="flex items-center gap-3 rounded-lg bg-card p-3 shadow-soft"><img src={props.professional.image} alt={translateUi("", language)} width={72} height={72} className="h-14 w-14 rounded-md object-cover" /><div><p className="font-bold">{translateUi(props.professional.service, language)}</p><p className="text-xs text-muted-foreground">{translateUi("com ", language)}{translateUi(props.professional.name, language)}</p><p className="mt-1 text-sm font-bold text-primary">{translateUi(money(props.professional.price), language)}</p></div></div><FlexibleSchedule day={props.selectedDay} setDay={props.setSelectedDay} extras={props.bookingExtras} setExtras={props.setBookingExtras} price={props.professional.price} /><AppButton onClick={props.onNext} disabled={!props.bookingExtras.slots.length} className="mt-6 w-full">{translateUi("Continuar ", language)}<ChevronRight size={17} /></AppButton></div>; }

const houseRules = [
  { title: "Infraestrutura", text: "Declaro possuir local limpo, iluminado, com tomada e espaço adequado para o serviço." },
  { title: "Cuidado com Materiais", text: "Garanto que crianças e terceiros não manusearão os insumos ou maleta do profissional." },
  { title: "Animais de Estimação", text: "Manterei pets em local reservado durante o atendimento para evitar acidentes." },
  { title: "Termos LGPD & Disputas", text: "Aceito os Termos de Uso, Política de Privacidade (LGPD) e concordo com o protocolo de mediação da BM em caso de avarias ou cancelamentos." },
];

function RulesStep(props: BookingProps) {
  const { language, locale } = useLanguage(); return <div className="p-5"><div className="rounded-lg border border-border bg-card p-4"><ShieldCheck className="text-success" size={26} /><h3 className="mt-3 font-display text-2xl">{translateUi("Acordo de cuidado BM", language)}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{translateUi("Para uma experiência segura e impecável, confirme todas as condições antes do pagamento.", language)}</p></div><div className="mt-5 space-y-3">{translateUi(houseRules.map((rule, i) => <button type="button" key={rule.title} onClick={() => props.setRules(props.rules.map((checked, index) => index === i ? !checked : checked))} className="flex w-full items-start gap-3 rounded-lg border border-border bg-card p-4 text-left" role="checkbox" aria-checked={props.rules[i]}><span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${props.rules[i] ? "border-success bg-success text-success-foreground" : "border-input"}`}>{translateUi(props.rules[i] && <Check size={14} />, language)}</span><span className="text-sm leading-5"><strong className="block text-foreground">{translateUi(rule.title, language)}</strong><span className="mt-1 block text-muted-foreground">{translateUi(rule.text, language)}</span></span></button>), language)}</div><div className="mt-6 flex items-start gap-2 text-xs leading-5 text-muted-foreground"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-success" />{translateUi("Este checklist protege você e a profissional em caso de imprevistos.", language)}</div><AppButton onClick={props.onNext} disabled={!props.rules.every(Boolean)} className="mt-8 w-full">{translateUi("Confirmar e ir ao pagamento", language)}</AppButton></div>; }

function PaymentStep(props: BookingProps) {
  const { language, locale } = useLanguage();
  const { bookingExtras: extras, professional: p } = props;
  const urgent = bookingIsUrgent(props.selectedDay, extras.slots);
  const massage = p.service === "Massagem Relaxante";
  const total = bookingTotal(p.price, urgent, extras, massage);
  const [paid, setPaid] = useState(false);
  const [wallet, setWallet] = useState<string | null>(null);
  const confirmPayment = useCallback(async () => {
    if (!props.signedIn) { props.onSignIn(); return; }
    await props.onPaid();
    setPaid(true);
  }, [props.signedIn, props.onSignIn, props.onPaid]);
  const markPaid = useCallback(() => { void confirmPayment(); }, [confirmPayment]);
  const txid = props.receiptCode;
  const method: HybridMethod = props.payment === "solana" ? "solana" : "pix";
  if (paid) return <PaymentReceipt txid={txid} method={method} wallet={wallet} total={total} professional={p.name} service={p.service} day={props.selectedDay} slots={extras.slots} address={extras.notes || undefined} onContinue={props.onNext} />;
  return <div className="p-5"><div className="rounded-lg border border-success/30 bg-success-soft p-4"><div className="flex gap-3"><ShieldCheck className="shrink-0 text-success" size={24} /><div><h3 className="font-bold text-success">{translateUi("Seu dinheiro fica seguro", language)}</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">{translateUi("A BM retém o valor. Ele só é liberado à profissional quando você informar o PIN após o atendimento.", language)}</p></div></div></div>
    <CheckoutOptions extras={extras} setExtras={props.setBookingExtras} isMassage={massage} favorites={props.favorites} selectedProfessional={p.id} />
    <h3 className="mb-3 mt-6 font-display text-xl">{translateUi("Forma de pagamento", language)}</h3>
    <HybridCheckout total={total} method={method} setMethod={props.setPayment} txid={txid} onWalletChange={setWallet} onAutoPaid={markPaid} />
    <div className="mt-6 space-y-1 border-t border-border pt-4 text-xs"><div className="flex justify-between"><span>{translateUi("Serviço", language)}</span><span>{translateUi(money(p.price), language)}</span></div>{translateUi(urgent && <div className="flex justify-between"><span>{translateUi("Adicional de Urgência (&lt;12h)", language)}</span><span>{translateUi("+ R$ 15,00", language)}</span></div>, language)}{translateUi(massage && extras.hasTable && <div className="flex justify-between text-success"><span>{translateUi("Maca no local", language)}</span><span>{translateUi("− R$ 10,00", language)}</span></div>, language)}{translateUi(extras.useCredit && <div className="flex justify-between text-success"><span>{translateUi("Vale Presente / crédito BM", language)}</span><span>{translateUi("− R$ 20,00", language)}</span></div>, language)}</div>
    {translateUi(!props.signedIn && <p className="mt-4 text-center text-[11px] leading-5 text-muted-foreground">{translateUi("Entre na sua conta BM para guardar este agendamento.", language)}</p>, language)}
    {translateUi(props.saveError && <p className="mt-3 text-xs font-semibold text-destructive">{translateUi(props.saveError, language)}</p>, language)}
    <div className="mt-5 flex items-end justify-between gap-3"><div><p className="text-xs text-muted-foreground">{translateUi("Total protegido", language)}</p><p className="font-display text-3xl">{translateUi(money(total), language)}</p></div><AppButton onClick={() => { void confirmPayment(); }} disabled={props.saving || (extras.forOther && !extras.recipient.trim()) || (method === "solana" && !wallet)}>{translateUi(!props.signedIn ? "Entrar para reservar" : props.saving ? "Registrando…" : method === "solana" && !wallet ? "Conecte a carteira" : "Pagar com segurança", language)}</AppButton></div>
  </div>;
}

function TrackingStep({ p, status, bookingId, onClose }: { p: Professional; status: OrderStatus; bookingId?: string | undefined; onClose: () => void }) {
  const { language, locale } = useLanguage();
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

  return <div className="p-5 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success text-success-foreground"><CheckCircle2 size={32} /></div><h2 className="mt-5 font-display text-3xl">{translateUi(done ? "Atendimento concluído!" : "Agendamento confirmado!", language)}</h2><p className="mt-2 text-sm text-muted-foreground">{translateUi("Horário preferido sujeito à confirmação da especialista.", language)}</p><SafetyReminder className="mt-4" /><div className="mt-7 rounded-lg border border-primary/35 bg-card p-5"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">{translateUi("PIN de liberação", language)}</p><p className="pin mt-3">{translateUi("8392", language)}</p><p className="mx-auto mt-3 max-w-xs text-xs leading-5 text-muted-foreground">{translateUi(done ? "PIN validado e pagamento liberado com segurança." : "Informe este código somente após concluir e aprovar o atendimento.", language)}</p></div><div className="mt-7 text-left"><div className="flex justify-between text-[10px] font-bold uppercase tracking-[.1em]"><span className="text-success">{translateUi("Confirmado", language)}</span><span className={moving ? "text-success" : "text-muted-foreground"}>{translateUi("A caminho", language)}</span><span className={done ? "text-success" : "text-muted-foreground"}>{translateUi("Concluído", language)}</span></div><div className="mt-3 flex items-center"><span className="h-3 w-3 rounded-full bg-success" /><span className="h-1 flex-1 bg-success" /><span className={`h-3 w-3 rounded-full ${moving ? "bg-success" : "bg-muted"}`} /><span className={`h-1 flex-1 ${done ? "bg-success" : "bg-muted"}`} /><span className={`h-3 w-3 rounded-full ${done ? "bg-success" : "bg-muted"}`} /></div></div><div className="mt-7 flex items-center gap-3 rounded-lg bg-card p-3 text-left shadow-soft"><img src={p.image} alt={translateUi(p.name, language)} width={72} height={72} className="h-14 w-14 rounded-md object-cover" /><div className="min-w-0 flex-1"><p className="font-bold">{translateUi(p.name, language)}</p><p className="text-xs text-muted-foreground">{translateUi(p.service, language)}</p></div><AppButton variant="outline" onClick={() => setChatOpen(true)} className="h-10 min-h-10 w-10 p-0" aria-label={translateUi("Conversar", language)}><MessageCircle size={17} /></AppButton></div>{translateUi(reportedDispute && <div className="mt-4 flex items-start gap-3 rounded-lg border border-primary/35 bg-secondary p-4 text-left"><ShieldCheck size={19} className="mt-0.5 shrink-0 text-success" /><div><p className="text-sm font-bold">{translateUi("Disputa registrada", language)}</p><p className="mt-1 text-xs text-muted-foreground">{translateUi(reportedDispute, language)}{translateUi(" · A equipe BM fará a mediação pelo suporte.", language)}</p></div></div>, language)}<AppButton variant="outline" onClick={() => setDisputeOpen(true)} className="mt-5 w-full"><AlertTriangle size={17} />{translateUi(" Reportar Incidente / Abrir Disputa", language)}</AppButton>{translateUi(done && <AppButton variant="outline" onClick={() => setReviewOpen(true)} className="mt-3 w-full"><Star size={17} />{translateUi(" Avaliar atendimento", language)}</AppButton>, language)}<AppButton onClick={onClose} className="mt-3 w-full">{translateUi("Acompanhar pedido", language)}</AppButton>
    {translateUi(chatOpen && <ChatModal name={p.name} onClose={() => setChatOpen(false)} />, language)}
    {translateUi(reviewOpen && <ReviewModal name={p.name} bookingId={bookingId} onClose={() => setReviewOpen(false)} />, language)}
    {translateUi(disputeOpen && <div className="fixed inset-0 z-[60] flex items-end justify-center bg-overlay/55 backdrop-blur-sm md:items-center md:p-6" role="dialog" aria-modal="true" aria-label={translateUi("Reportar incidente ou abrir disputa", language)}><div className="w-full max-w-md rounded-t-2xl bg-background p-5 text-left shadow-modal md:rounded-xl"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">{translateUi("Suporte BM", language)}</p><h3 className="mt-1 font-display text-2xl">{translateUi("O que aconteceu?", language)}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{translateUi("Selecione o motivo para iniciar a mediação do atendimento.", language)}</p></div><AppButton variant="ghost" onClick={() => setDisputeOpen(false)} className="h-10 min-h-10 w-10 shrink-0 p-0" aria-label={translateUi("Fechar disputa", language)}><X size={19} /></AppButton></div><div className="mt-5 space-y-3">{translateUi((["Dano a Material", "Incompatibilidade no Atendimento"] as const).map((option) => <button type="button" key={option} onClick={() => setDisputeType(option)} className={`flex min-h-14 w-full items-center gap-3 rounded-lg border p-4 text-left text-sm font-bold ${disputeType === option ? "border-primary bg-secondary" : "border-border bg-card"}`} aria-pressed={disputeType === option}><span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${disputeType === option ? "border-success bg-success text-success-foreground" : "border-input"}`}>{translateUi(disputeType === option && <Check size={13} />, language)}</span>{translateUi(option, language)}</button>), language)}</div><div className="mt-4 rounded-lg bg-card p-3 text-center shadow-soft"><p className="text-xs font-bold">{translateUi("Contato oficial", language)}</p><p className="mt-1 break-all text-xs text-muted-foreground">{translateUi(SUPPORT_EMAIL, language)}</p></div><AppButton onClick={submitDispute} disabled={!disputeType} className="mt-4 w-full">{translateUi("Registrar disputa", language)}</AppButton><SupportMailButton className="mt-3 w-full" /></div></div>, language)}
  </div>;
}