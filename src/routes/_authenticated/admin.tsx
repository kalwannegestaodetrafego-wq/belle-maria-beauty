import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, Check, FileCheck2, LockKeyhole, RefreshCw, ShieldCheck, Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/bm/language-switcher";
import { controlEscrow, getAdminAccess, getAdminPanel, reviewIdentity } from "@/lib/bm-admin.functions";
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

function AdminPage() {
  const { language, locale } = useLanguage();
  const t = (text: string) => translateUi(text, language);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const check = useServerFn(getAdminAccess);
  const fetchPanel = useServerFn(getAdminPanel);
  const review = useServerFn(reviewIdentity);
  const escrow = useServerFn(controlEscrow);
  const access = useQuery({ queryKey: ["bm-admin-access"], queryFn: () => check(), retry: false });
  const panel = useQuery({ queryKey: ["bm-admin-panel"], queryFn: () => fetchPanel(), enabled: access.data === true, retry: false, refetchInterval: 240000 });
  const [tab, setTab] = useState<"documents" | "escrow">("documents");
  const [reason, setReason] = useState("");
  const [decision, setDecision] = useState<{ id: string; action: "approve" | "reject" | "release" | "refund" } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const amount = (cents: number) => new Intl.NumberFormat(locale, { style: "currency", currency: "BRL" }).format(cents / 100);
  const choose = (id: string, action: "approve" | "reject" | "release" | "refund") => { setReason(""); setError(""); setDecision({ id, action }); };
  const submit = async () => {
    if (!decision || busy || (decision.action === "reject" && !reason.trim())) return;
    setBusy(true); setError("");
    try {
      if (decision.action === "approve" || decision.action === "reject") await review({ data: { id: decision.id, approve: decision.action === "approve", reason } });
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
        <div className="mt-7 flex items-center justify-between gap-3 border-b border-border"><div className="flex min-w-0 gap-2" role="tablist" aria-label={t("Painel Admin - BM")}><Button role="tab" aria-selected={tab === "documents"} variant={tab === "documents" ? "secondary" : "ghost"} className="h-auto min-h-12 whitespace-normal px-3 text-xs" onClick={() => setTab("documents")}><FileCheck2 />{t("Verificação de Documentos")}</Button><Button role="tab" aria-selected={tab === "escrow"} variant={tab === "escrow" ? "secondary" : "ghost"} className="h-auto min-h-12 whitespace-normal px-3 text-xs" onClick={() => setTab("escrow")}><Wallet />{t("Custódia de Pagamentos (Escrow)")}</Button></div><Button variant="ghost" size="icon" aria-label={t("Atualizar")} onClick={() => { void panel.refetch(); }}><RefreshCw /></Button></div>
        {message && <p role="status" className="mt-4 text-sm text-success">{message}</p>}
        {panel.isPending ? <p className="py-8">{t("Aguarde…")}</p> : panel.isError ? <p role="alert" className="py-8 text-destructive">{t("Não foi possível carregar o painel.")}</p> : <div role="tabpanel" className="py-6">
          {tab === "documents" ? <div className="space-y-8">{panel.data?.requests.length === 0 && <p className="py-8 text-muted-foreground">{t("Nenhuma solicitação pendente.")}</p>}{panel.data?.requests.map((request) => <article key={request.id} className="border-b border-border pb-8">
            <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-bold">{request.name ?? t("Profissional Beleza")}</h2><span className="text-xs text-muted-foreground">{t("Análise pendente")}</span></div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">{([{ title: "Documento de identidade (RG/CNH)", doc: request.identity }, { title: "Selfie de segurança", doc: request.selfie }]).map(({ title, doc }) => <div key={title}><h3 className="mb-2 text-xs font-semibold">{t(title)}</h3>{doc ? doc.pdf ? <object data={doc.url} type="application/pdf" className="h-72 w-full rounded-lg border border-border"><a href={doc.url} target="_blank" rel="noreferrer">{t("Abrir documento")}</a></object> : <a href={doc.url} target="_blank" rel="noreferrer"><img src={doc.url} alt={t(title)} className="h-72 w-full rounded-lg border border-border bg-card object-contain" /></a> : <p className="flex h-72 items-center justify-center bg-card text-sm text-muted-foreground">{t("Documento não enviado")}</p>}</div>)}</div>
            <div className="mt-4 flex flex-wrap gap-3"><Button disabled={!request.identity || !request.selfie} onClick={() => choose(request.id, "approve")}><ShieldCheck />{t("Aprovar Verificação")}</Button><Button variant="outline" onClick={() => choose(request.id, "reject")}><X />{t("Rejeitar")}</Button></div>
          </article>)}</div> : <><p className="mb-5 text-xs leading-5 text-muted-foreground">{t("Controles de custódia simulados: nenhuma transferência real será realizada.")}</p>{panel.data?.bookings.length === 0 && <p className="py-8 text-muted-foreground">{t("Nenhum pagamento retido em garantia.")}</p>}<div className="divide-y divide-border">{panel.data?.bookings.map((booking) => <article key={booking.id} className="py-5"><div className="flex flex-wrap justify-between gap-3"><div><p className="text-xs text-muted-foreground">#{booking.id.slice(0, 8)}</p><h2 className="mt-1 font-bold">{booking.service_name}</h2><p className="mt-1 text-sm">{booking.client_name ?? "—"} · {booking.professional_name}</p></div><div><p className="font-display text-2xl">{amount(booking.amount_cents)}</p><p className="text-xs text-muted-foreground">{t("Taxa BM")}: {amount(booking.fee_cents)}</p></div></div>{!booking.professional_id && <p className="mt-3 text-xs text-muted-foreground">{t("Vincule um profissional para liberar o pagamento.")}</p>}<div className="mt-4 flex flex-wrap gap-3"><Button disabled={!booking.professional_id} className="h-auto min-h-11 whitespace-normal" onClick={() => choose(booking.id, "release")}><Check />{t("Liberar Pagamento para o Profissional")}</Button><Button variant="outline" onClick={() => choose(booking.id, "refund")}>{t("Reembolsar Cliente")}</Button></div></article>)}</div></>}
        </div>}
      </>}
    </div>
    {decision && <div role="dialog" aria-modal="true" aria-label={t("Confirmar decisão")} className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/55 p-4"><form onSubmit={(e) => { e.preventDefault(); void submit(); }} className="w-full max-w-md rounded-lg bg-background p-6 shadow-modal"><h2 className="text-xl font-bold">{t("Confirmar decisão")}</h2><p className="mt-3 text-sm text-muted-foreground">{t(decision.action === "approve" ? "Aprovar Verificação" : decision.action === "reject" ? "Rejeitar" : decision.action === "release" ? "Liberar Pagamento para o Profissional" : "Reembolsar Cliente")}</p>{decision.action === "reject" && <label className="mt-4 block text-sm font-semibold">{t("Motivo da rejeição")}<textarea required maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} className="mt-2 h-28 w-full rounded-lg border border-border bg-card p-3 text-sm" /></label>}{error && <p role="alert" className="mt-3 text-xs text-destructive">{error}</p>}<div className="mt-5 flex gap-3"><Button type="submit" disabled={busy || (decision.action === "reject" && !reason.trim())}>{t(busy ? "Aguarde…" : "Confirmar")}</Button><Button variant="outline" disabled={busy} type="button" onClick={() => setDecision(null)}>{t("Cancelar")}</Button></div></form></div>}
  </main>;
}