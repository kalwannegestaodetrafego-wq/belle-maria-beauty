import { useEffect, useState } from "react";
import { Camera, FileCheck2, ShieldCheck, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { PENDING_IDENTITY_STATUS, submitIdentityDocuments, type DocKind } from "@/lib/bm-account";
import { translateUi, useLanguage } from "@/lib/bm-i18n";
import { VerifiedBadge } from "./trust-support";

export const IDENTITY_CONFIRMATION = "Documentos Enviados com Sucesso! ⏳ Nossa equipe de segurança (BM) está analisando seus documentos. Em até 24h seu selo de Identidade Verificada BM será ativado no seu perfil.";

export function IdentitySubmissionConfirmation() {
  const { language } = useLanguage();
  return <div role="status" className="py-5 text-center">
    <FileCheck2 size={48} className="mx-auto text-success" />
    <p className="mt-4 text-base font-semibold leading-7">{translateUi(IDENTITY_CONFIRMATION, language)}</p>
    <p className="mt-4 text-xs font-bold text-muted-foreground">{translateUi("Análise pendente", language)}</p>
  </div>;
}

export function IdentityVerification() {
  const { language } = useLanguage();
  const [files, setFiles] = useState<Partial<Record<DocKind, File>>>({});
  const [pending, setPending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [rejection, setRejection] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("verification_status,verification_rejection_reason").eq("id", user.id).maybeSingle();
      if (active) { setPending(data?.verification_status === PENDING_IDENTITY_STATUS); setVerified(data?.verification_status === "VERIFICADO"); setRejection(data?.verification_status === "REJEITADO" ? data.verification_rejection_reason : null); }
    })();
    return () => { active = false; };
  }, []);
  const submit = async () => {
    if (busy || !files.identity || !files.selfie) return;
    setBusy(true); setError("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Entre na sua conta para enviar os documentos.");
      await submitIdentityDocuments(files);
      setPending(true); setFiles({});
    } catch (err) { setError(err instanceof Error ? err.message : "Falha no envio."); }
    finally { setBusy(false); }
  };
  return <section className="mt-6 border-t border-border pt-5" aria-label={translateUi("Segurança e Verificação de Identidade", language)}>
    <h2 className="flex items-center gap-2 font-display text-2xl"><ShieldCheck size={20} className="shrink-0 text-success" />{translateUi("Segurança e Verificação de Identidade", language)}</h2>
    {verified ? <div className="py-5"><VerifiedBadge demo={false} /></div> : pending ? <IdentitySubmissionConfirmation /> : <form className="mt-4 space-y-3" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
      {rejection && <p role="alert" className="text-sm text-destructive">{translateUi("Motivo da rejeição", language)}: {rejection}</p>}
      {(["identity", "selfie"] as const).map((kind) => <label key={kind} className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-primary/50 bg-card p-4 text-sm">
        {kind === "identity" ? <FileCheck2 className="shrink-0 text-primary" /> : <Camera className="shrink-0 text-primary" />}
        <span className="min-w-0 flex-1"><strong className="block">{translateUi(kind === "identity" ? "Documento de identidade (RG/CNH)" : "Selfie de segurança", language)}</strong><span className="block truncate text-xs text-muted-foreground">{files[kind]?.name ?? translateUi("Toque para escolher o arquivo (até 10 MB)", language)}</span></span>
        <input type="file" required disabled={busy} aria-label={translateUi(kind === "identity" ? "Documento de identidade (RG/CNH)" : "Selfie de segurança", language)} accept={kind === "identity" ? "image/*,application/pdf" : "image/*"} className="sr-only" onChange={(e) => { const file = e.target.files?.[0]; if (file) setFiles((current) => ({ ...current, [kind]: file })); }} />
      </label>)}
      {error && <p role="alert" className="text-xs font-semibold text-destructive">{translateUi(error, language)}</p>}
      <Button type="submit" disabled={busy || !files.identity || !files.selfie} className="min-h-11 w-full"><Upload />{translateUi(busy ? "Enviando…" : "Enviar documentos", language)}</Button>
    </form>}
  </section>;
}