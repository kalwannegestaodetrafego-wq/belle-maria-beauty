import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { askBeautyConsultant } from "../../lib/gemini.functions";

export type ConsultantPro = { id: string; name: string; role: string; service: string; price: number; area: string; atHome: boolean; tags: string[] };

const errors = {
  missing_key: "A Consultora IA BM ainda está sendo configurada.",
  rate_limited: "Muitos pedidos agora. Tente em instantes.",
  unavailable: "A Consultora está indisponível agora. Tente novamente.",
  empty: "Não recebi uma resposta. Tente descrever de outro jeito.",
};

export function BeautyConsultant({ catalog, signedIn, onNeedLogin, onBook }: { catalog: ConsultantPro[]; signedIn: boolean; onNeedLogin: () => void; onBook: (id: string) => void }) {
  const ask = useServerFn(askBeautyConsultant);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState<{ message: string; ids: string[] } | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!signedIn) { onNeedLogin(); return; }
    if (q.trim().length < 3 || busy) return;
    setBusy(true); setMsg(""); setAnswer(null);
    try {
      const r = await ask({ data: { request: q, catalog } });
      if (r.ok) setAnswer({ message: r.message, ids: r.professionalIds }); else setMsg(errors[r.error as keyof typeof errors] ?? errors.unavailable);
    } catch { setMsg(errors.unavailable); } finally { setBusy(false); }
  };
  return <>
    <button type="button" onClick={() => setOpen(true)} className="fixed bottom-36 right-4 z-40 inline-flex min-h-12 items-center gap-2 rounded-full border border-primary/45 bg-primary px-4 text-xs font-bold text-primary-foreground shadow-luxe transition-all hover:-translate-y-0.5 md:bottom-24 md:right-6" aria-label="Abrir Consultora IA BM"><Sparkles size={16} />Consultora IA BM</button>
    {open && <div role="dialog" aria-label="Consultora IA BM" className="fixed inset-x-3 bottom-3 z-50 max-h-[80vh] overflow-y-auto rounded-lg border border-primary/40 bg-card p-4 shadow-modal md:inset-x-auto md:right-6 md:bottom-6 md:w-96">
      <div className="flex items-start justify-between gap-2"><h2 className="flex items-center gap-2 font-display text-2xl"><Sparkles size={20} className="text-primary" />Consultora IA BM</h2><button type="button" onClick={() => setOpen(false)} aria-label="Fechar" className="rounded-full p-2 hover:bg-accent"><X size={16} /></button></div>
      <p className="mt-1 text-xs text-muted-foreground">Conte o evento, o horário ou o estilo que deseja. Eu indico o serviço ideal e as profissionais da BM.</p>
      <textarea value={q} onChange={(e) => setQ(e.target.value.slice(0, 600))} rows={3} placeholder="Ex.: Casamento no sábado à tarde, quero maquiagem iluminada e penteado" className="mt-3 w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary" />
      <button type="button" onClick={submit} disabled={busy} className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-luxe disabled:opacity-45">{busy ? "Analisando…" : signedIn ? "Receber recomendação" : "Entrar para conversar"}</button>
      {msg && <p className="mt-2 text-xs text-muted-foreground">{msg}</p>}
      {answer && <div className="mt-3 space-y-2"><p className="whitespace-pre-line rounded-lg bg-background p-3 text-sm">{answer.message}</p>
        {answer.ids.map((id) => { const p = catalog.find((c) => c.id === id); return p && <button key={id} type="button" onClick={() => { setOpen(false); onBook(id); }} className="flex w-full items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-left text-xs hover:bg-accent"><span><b>{p.name}</b><br /><span className="text-muted-foreground">{p.service} · R$ {p.price}</span></span><span className="font-bold text-primary">Agendar</span></button>; })}</div>}
      <p className="mt-2 text-[10px] text-muted-foreground">Sugestões geradas por IA; a disponibilidade é confirmada no agendamento.</p>
    </div>}
  </>;
}
