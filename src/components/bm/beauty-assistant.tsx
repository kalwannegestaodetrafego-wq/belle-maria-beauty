import { useState } from "react";
import { ImagePlus, Sparkles, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { askBeautyConsultant } from "../../lib/gemini.functions";

export type ConsultantPro = { id: string; name: string; role: string; service: string; price: number; area: string; atHome: boolean; tags: string[] };

async function shrink(file: File): Promise<{ mimeType: "image/jpeg"; data: string; preview: string }> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1024 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas"); c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
  c.getContext("2d")?.drawImage(bmp, 0, 0, c.width, c.height);
  const preview = c.toDataURL("image/jpeg", 0.82);
  return { mimeType: "image/jpeg", data: preview.split(",")[1] ?? "", preview };
}

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
  const [answer, setAnswer] = useState<{ message: string; ids: string[]; portfolios: { slug: string; name: string; specialty: string | null }[] } | null>(null);
  const [photo, setPhoto] = useState<{ mimeType: "image/jpeg"; data: string; preview: string } | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!signedIn) { onNeedLogin(); return; }
    if ((q.trim().length < 3 && !photo) || busy) return;
    setBusy(true); setMsg(""); setAnswer(null);
    try {
      const r = await ask({ data: { request: q.trim(), catalog, ...(photo ? { image: { mimeType: photo.mimeType, data: photo.data } } : {}) } });
      if (r.ok) setAnswer({ message: r.message, ids: r.professionalIds, portfolios: r.portfolios }); else setMsg(errors[r.error as keyof typeof errors] ?? errors.unavailable);
    } catch { setMsg(errors.unavailable); } finally { setBusy(false); }
  };
  return <>
    <button type="button" onClick={() => setOpen(true)} className="fixed bottom-36 right-4 z-40 inline-flex min-h-12 items-center gap-2 rounded-full border border-primary/45 bg-primary px-4 text-xs font-bold text-primary-foreground shadow-luxe transition-all hover:-translate-y-0.5 md:bottom-24 md:right-6" aria-label="Abrir Consultora IA BM"><Sparkles size={16} />Consultora IA BM</button>
    {open && <div role="dialog" aria-label="Consultora IA BM" className="fixed inset-x-3 bottom-3 z-50 max-h-[80vh] overflow-y-auto rounded-lg border border-primary/40 bg-card p-4 shadow-modal md:inset-x-auto md:right-6 md:bottom-6 md:w-96">
      <div className="flex items-start justify-between gap-2"><h2 className="flex items-center gap-2 font-display text-2xl"><Sparkles size={20} className="text-primary" />Consultora IA BM</h2><button type="button" onClick={() => setOpen(false)} aria-label="Fechar" className="rounded-full p-2 hover:bg-accent"><X size={16} /></button></div>
      <p className="mt-1 text-xs text-muted-foreground">Conte o evento, o horário ou o estilo que deseja. Eu indico o serviço ideal e as profissionais da BM.</p>
      <textarea value={q} onChange={(e) => setQ(e.target.value.slice(0, 600))} rows={3} placeholder="Ex.: Casamento no sábado à tarde, quero maquiagem iluminada e penteado" className="mt-3 w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary" />
      <div className="mt-2 flex items-center gap-2"><label className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold hover:bg-accent"><ImagePlus size={14} />{photo ? "Trocar foto" : "Enviar foto de inspiração"}<input type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) void shrink(f).then(setPhoto, () => setMsg("Não consegui ler essa imagem.")); }} /></label>{photo && <><img src={photo.preview} alt="Inspiração" className="h-9 w-9 rounded object-cover" /><button type="button" onClick={() => setPhoto(null)} className="text-[11px] text-muted-foreground underline">remover</button></>}</div>
      <button type="button" onClick={submit} disabled={busy} className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-luxe disabled:opacity-45">{busy ? "Analisando…" : signedIn ? "Receber recomendação" : "Entrar para conversar"}</button>
      {msg && <p className="mt-2 text-xs text-muted-foreground">{msg}</p>}
      {answer && <div className="mt-3 space-y-2"><p className="whitespace-pre-line rounded-lg bg-background p-3 text-sm">{answer.message}</p>
        {answer.ids.map((id) => { const p = catalog.find((c) => c.id === id); return p && <button key={id} type="button" onClick={() => { setOpen(false); onBook(id); }} className="flex w-full items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-left text-xs hover:bg-accent"><span><b>{p.name}</b><br /><span className="text-muted-foreground">{p.service} · R$ {p.price}</span></span><span className="font-bold text-primary">Agendar</span></button>; })}
        {answer.portfolios.map((p) => <Link key={p.slug} to="/portfolio/$slug" params={{ slug: p.slug }} onClick={() => setOpen(false)} className="flex w-full items-center justify-between gap-2 rounded-lg border border-primary/40 px-3 py-2 text-xs hover:bg-accent"><span><b>{p.name}</b><br /><span className="text-muted-foreground">{p.specialty ?? "Portfólio BM"}</span></span><span className="font-bold text-primary">Ver portfólio</span></Link>)}</div>}
      <p className="mt-2 text-[10px] text-muted-foreground">Sugestões geradas por IA; a disponibilidade é confirmada no agendamento.</p>
    </div>}
  </>;
}
