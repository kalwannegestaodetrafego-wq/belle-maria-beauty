import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AlertTriangle, ArrowLeft, Check, FileCheck2, LockKeyhole, MessageSquareWarning, PackageSearch, RefreshCw, ShieldCheck, Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/bm/language-switcher";
import { controlEscrow, getAdminAccess, getAdminPanel, resolveTicket, reviewIdentity } from "@/lib/bm-admin.functions";
import { ticketTab } from "@/lib/bm-admin-rules";
import { translateUi, useLanguage } from "@/lib/bm-i18n";
import { signOutBm } from "@/lib/bm-store";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [
    { title: "BM — Painel Admin" }, { name: "description", content: "Painel exclusivo da gestora BM para análise de documentos e custódia de pagamentos." },
    { property: "og:title", content: "BM — Painel Admin" }, { property: "og:description", content: "Administração restrita da BM." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: AdminPage,
});

const tabs = [
  ["documents", "Verificação KYC", FileCheck2],
  ["escrow", "Custódia de Pagamentos (Escrow)", Wallet],
  ["professionals", "Ocorrências de Profissionais", AlertTriangle],
  ["complaints", "Reclamações de Clientes", MessageSquareWarning],
  ["lost", "Achados e Perdidos", PackageSearch],
] as const;

const categoryLabel: Record<string, string> = {
  payment_missing: "Não recebi o valor", disrespect: "Fui desrespeitado", forgot_item: "Esqueci um item",
  incomplete_service: "Serviço incompleto/problema", lost_item: "Perdi um item no local",
};

type PanelData = Awaited<ReturnType<typeof getAdminPanel>>;

function Reports({ tab, data, onReply }: { tab: "professionals" | "complaints" | "lost"; data: PanelData | undefined; onReply: (id: string) => void }) {
  const { language, locale } = useLanguage();
  const t = (text: string) => translateUi(text, language);
  const tickets = (data?.tickets ?? []).filter((ticket) => ticketTab(ticket.category, ticket.author_role) === tab);
  const reviews = tab === "complaints" ? data?.privateReviews ?? [] : [];
  const date = (value: string) => new Date(value).toLocaleString(locale);
  return <div className="divide-y divide-border">
    {tickets.length === 0 && reviews.length === 0 && <p className="py-8 text-muted-foreground">{t("Nenhum registro nesta categoria.")}</p>}
    {reviews.map((review) => <article key={review.id} className="py-5"><div className="flex flex-wrap justify-between gap-2"><h2 className="font-bold">{t("Avaliação privada")} · {review.rating}★</h2><span className="text-xs text-muted-foreground">{date(review.created_at)}</span></div><p className="mt-1 text-sm">{review.professional_name ?? "—"} · #{review.booking_id.slice(0, 8)}</p>{review.comment && <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>}</article>)}
    {tickets.map((ticket) => <article key={ticket.id} className="py-5"><div className="flex flex-wrap justify-between gap-2"><h2 className="font-bold">{t(categoryLabel[ticket.category] ?? ticket.category)}</h2><span className="text-xs text-muted-foreground">{t(ticket.author_role === "professional" ? "Profissional" : "Cliente")} · {date(ticket.created_at)}</span></div>{ticket.booking_id && <p className="mt-1 text-xs text-muted-foreground">#{ticket.booking_id.slice(0, 8)}</p>}{ticket.message && <p className="mt-2 text-sm">{ticket.message}</p>}{ticket.status === "resolved" ? <p className="mt-2 text-xs text-success">{t("Respondido")}: {ticket.admin_reply}</p> : <Button className="mt-3" variant="outline" onClick={() => onReply(ticket.id)}>{t("Responder e encerrar")}</Button>}</article>)}
  </div>;
}

function AdminPage() {
  const { language, locale } = useLanguage();
  const t = (text: string) => translateUi(text, language);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const check = useServerFn(getAdminAccess);
  const fetchPanel = useServerFn(getAdminPanel);
  const review = useServerFn(reviewIdentity);
  const escrow = useServerFn(controlEscrow);
  const resolve = useServerFn(resolveTicket);
  const access = useQuery({ queryKey: ["bm-admin-access"], queryFn: () => check(), retry: false });
  const panel = useQuery({ queryKey: ["bm-admin-panel"], queryFn: () => fetchPanel(), enabled: access.data === true, retry: false, refetchInterval: 240000 });
  const [tab, setTab] = useState<"documents" | "escrow" | "professionals" | "complaints" | "lost">("documents");
  const [reason, setReason] = useState("");
  const [decision, setDecision] = useState<{ id: string; action: "approve" | "reject" | "release" | "refund" | "reply" } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const amount = (cents: number) => new Intl.NumberFormat(locale, { style: "currency", currency: "BRL" }).format(cents / 100);
  const choose = (id: string, action: "approve" | "reject" | "release" | "refund" | "reply") => { setReason(""); setError(""); setDecision({ id, action }); };
  const submit = async () => {
    if (!decision || busy || ((decision.action === "reject" || decision.action === "reply") && !reason.trim())) return;
    setBusy(true); setError("");
    try {
      if (decision.action === "approve" || decision.action === "reject") await review({ data: { id: decision.id, approve: decision.action === "approve", reason } });
      else if (decision.action === "reply") await resolve({ data: { id: decision.id, reply: reason } });
      else await escrow({ data: { id: decision.id, release: decision.action === "release" } });
      setDecision(null); setMessage(t("Alteração salva com sucesso."));
      await queryClient.invalidateQueries({ queryKey: ["bm-admin-panel"] });
    } catch (err) { setError(err instanceof Error ? t(err.message) : t("Não foi possível salvar.")); }
    finally { setBusy(false); }
  };
  const leave = async () => { await queryClient.cancelQueries(); queryClient.clear(); await signOutBm(); await navigate({ to: "/auth", replace: true }); };
  return <main className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border bg-card"><div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 md:px-8"><span className="brand-mark">BM</span><div className="flex items-center gap-2"><LanguageSwitcher /><Button variant="ghost" onClick={() => { void leave(); }}>{t("Sair")}</Button></div></div></header>
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
      <Link to="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground"><ArrowLeft size={15} />{t("Voltar à BM")}</Link>
      <h1 className="mt-5 font-display text-3xl">{t("Painel Admin - BM")}</h1>
      {access.isPending ? <p role="status" className="mt-8">{t("Aguarde…")}</p> : !access.data ? <div className="py-12 text-center"><LockKeyhole className="mx-auto text-primary" size={40} /><h2 className="mt-4 text-xl font-bold">{t("Acesso restrito à gestora BM.")}</h2></div> : <>
        <div className="mt-7 flex items-center justify-between gap-3 border-b border-border"><div className="flex min-w-0 gap-1 overflow-x-auto" role="tablist" aria-label={t("Painel Admin - BM")}>{tabs.map(([key, label, Icon]) => <Button key={key} role="tab" aria-selected={tab === key} variant={tab === key ? "secondary" : "ghost"} className="h-auto min-h-12 shrink-0 whitespace-normal px-3 text-xs" onClick={() => setTab(key)}><Icon />{t(label)}</Button>)}</div><Button variant="ghost" size="icon" aria-label={t("Atualizar")} onClick={() => { void panel.refetch(); }}><RefreshCw /></Button></div>
        {message && <p role="status" className="mt-4 text-sm text-success">{message}</p>}
        {panel.isPending ? <p className="py-8">{t("Aguarde…")}</p> : panel.isError ? <p role="alert" className="py-8 text-destructive">{t("Não foi possível carregar o painel.")}</p> : <div role="tabpanel" className="py-6">
          {tab === "professionals" || tab === "complaints" || tab === "lost" ? <Reports tab={tab} data={panel.data} onReply={(id) => choose(id, "reply")} /> : tab === "documents" ? <div className="space-y-8">{panel.data?.requests.length === 0 && <p className="py-8 text-muted-foreground">{t("Nenhuma solicitação pendente.")}</p>}{panel.data?.requests.map((request) => <article key={request.id} className="border-b border-border pb-8">
            <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-bold">{request.name ?? t("Profissional Beleza")}</h2><span className="text-xs text-muted-foreground">{t("Análise pendente")}</span></div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">{([{ title: "Frente do Documento (RG ou CNH)", doc: request.identity }, { title: "Verso do Documento (RG ou CNH)", doc: request.identityBack }, { title: "Selfie de Segurança segurando o documento ou em ambiente iluminado", doc: request.selfie }]).map(({ title, doc }) => <div key={title}><h3 className="mb-2 text-xs font-semibold">{t(title)}</h3>{doc ? doc.pdf ? <object data={doc.url} type="application/pdf" className="h-72 w-full rounded-lg border border-border"><a href={doc.url} target="_blank" rel="noreferrer">{t("Abrir documento")}</a></object> : <a href={doc.url} target="_blank" rel="noreferrer"><img src={doc.url} alt={t(title)} className="h-72 w-full rounded-lg border border-border bg-card object-contain" /></a> : <p className="flex h-72 items-center justify-center bg-card text-sm text-muted-foreground">{t("Documento não enviado")}</p>}</div>)}</div>
            <div className="mt-4 flex flex-wrap gap-3"><Button disabled={!request.identity || !request.identityBack || !request.selfie} onClick={() => choose(request.id, "approve")}><ShieldCheck />{t("Aprovar Verificação")}</Button><Button variant="outline" onClick={() => choose(request.id, "reject")}><X />{t("Rejeitar")}</Button></div>
          </article>)}</div> : <><p className="mb-5 text-xs leading-5 text-muted-foreground">{t("Controles de custódia simulados: nenhuma transferência real será realizada.")}</p>{panel.data?.bookings.length === 0 && <p className="py-8 text-muted-foreground">{t("Nenhum pagamento retido em garantia.")}</p>}<div className="divide-y divide-border">{panel.data?.bookings.map((booking) => <article key={booking.id} className="py-5"><div className="flex flex-wrap justify-between gap-3"><div><p className="text-xs text-muted-foreground">#{booking.id.slice(0, 8)}</p><h2 className="mt-1 font-bold">{booking.service_name}</h2><p className="mt-1 text-sm">{booking.client_name ?? "—"} · {booking.professional_name}</p></div><div><p className="font-display text-2xl">{amount(booking.amount_cents)}</p><p className="text-xs text-muted-foreground">{t("Taxa BM")}: {amount(booking.fee_cents)}</p></div></div>{!booking.professional_id && <p className="mt-3 text-xs text-muted-foreground">{t("Vincule um profissional para liberar o pagamento.")}</p>}<div className="mt-4 flex flex-wrap gap-3"><Button disabled={!booking.professional_id} className="h-auto min-h-11 whitespace-normal" onClick={() => choose(booking.id, "release")}><Check />{t("Liberar Pagamento para o Profissional")}</Button><Button variant="outline" onClick={() => choose(booking.id, "refund")}>{t("Reembolsar Cliente")}</Button></div></article>)}</div></>}
        </div>}
      </>}
    </div>
    {decision && <div role="dialog" aria-modal="true" aria-label={t("Confirmar decisão")} className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/55 p-4"><form onSubmit={(e) => { e.preventDefault(); void submit(); }} className="w-full max-w-md rounded-lg bg-background p-6 shadow-modal"><h2 className="text-xl font-bold">{t("Confirmar decisão")}</h2><p className="mt-3 text-sm text-muted-foreground">{t(decision.action === "approve" ? "Aprovar Verificação" : decision.action === "reject" ? "Rejeitar" : decision.action === "release" ? "Liberar Pagamento para o Profissional" : decision.action === "reply" ? "Responder e encerrar" : "Reembolsar Cliente")}</p>{(decision.action === "reject" || decision.action === "reply") && <label className="mt-4 block text-sm font-semibold">{t(decision.action === "reply" ? "Mensagem ao usuário" : "Motivo da rejeição")}<textarea required maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} className="mt-2 h-28 w-full rounded-lg border border-border bg-card p-3 text-sm" /></label>}{error && <p role="alert" className="mt-3 text-xs text-destructive">{error}</p>}<div className="mt-5 flex gap-3"><Button type="submit" disabled={busy || ((decision.action === "reject" || decision.action === "reply") && !reason.trim())}>{t(busy ? "Aguarde…" : "Confirmar")}</Button><Button variant="outline" disabled={busy} type="button" onClick={() => setDecision(null)}>{t("Cancelar")}</Button></div></form></div>}
  </main>;
}