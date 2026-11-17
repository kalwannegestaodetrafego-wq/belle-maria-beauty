import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { askBeautyAssistant } from "../../lib/gemini.functions";
import { translateUi, useLanguage } from "../../lib/bm-i18n";

const errors: Record<string, string> = {
  missing_key: "Assistente ainda não configurado.",
  rate_limited: "Muitos pedidos agora. Tente em instantes.",
  unavailable: "Assistente indisponível agora. Tente novamente.",
  empty: "Não recebi uma resposta. Tente descrever de outro jeito.",
};

export function BeautyAssistant({ signedIn, onNeedLogin }: { signedIn: boolean; onNeedLogin: () => void }) {
  const { language } = useLanguage();
  const ask = useServerFn(askBeautyAssistant);
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!signedIn) { onNeedLogin(); return; }
    if (q.trim().length < 3 || busy) return;
    setBusy(true); setMsg(""); setAnswer("");
    try {
      const r = await ask({ data: { request: q, language: language as "en" | "pt" | "es" } });
      if (r.ok) setAnswer(r.text); else setMsg(errors[r.error] ?? errors.unavailable);
    } catch { setMsg(errors.unavailable); } finally { setBusy(false); }
  };
  return <div className="mt-6 rounded-lg border border-primary/40 bg-card/85 p-4 shadow-card backdrop-blur">
    <h2 className="flex items-center gap-2 font-display text-2xl"><Sparkles size={20} className="text-primary" />{translateUi("Assistente de Beleza BM", language)}</h2>
    <p className="mt-1 text-xs text-muted-foreground">{translateUi("Conte a ocasião e seu estilo; sugerimos looks e profissionais.", language)}</p>
    <textarea value={q} onChange={(e) => setQ(e.target.value.slice(0, 600))} rows={3} placeholder={translateUi("Ex.: casamento à tarde, pele oleosa, gosto de algo natural", language)} className="mt-3 w-full rounded-lg border border-border bg-card p-3 text-sm outline-none focus:border-primary" />
    <button type="button" onClick={submit} disabled={busy} className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-luxe disabled:opacity-45">{busy ? translateUi("Pensando…", language) : translateUi("Pedir sugestão", language)}</button>
    {msg && <p className="mt-2 text-xs text-muted-foreground">{translateUi(msg, language)}</p>}
    {answer && <p className="mt-3 whitespace-pre-line rounded-lg bg-background p-3 text-sm">{answer}</p>}
    <p className="mt-2 text-[10px] text-muted-foreground">{translateUi("Sugestões geradas por IA; confirme detalhes com a profissional.", language)}</p>
  </div>;
}
