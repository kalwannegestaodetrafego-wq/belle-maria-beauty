import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { syncProfile } from "@/lib/bm-account";
import { clientBookingReady } from "@/lib/bm-auth-rules";
import { translateUi, useLanguage } from "@/lib/bm-i18n";

/** Persists personal data before exposing payment or confirming a booking. */
export function ClientBookingProfile({ onReady }: { onReady: () => void }) {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ cpf?: string | null; address?: string | null; selfie_path?: string | null }>({});
  const [selfie, setSelfie] = useState<File>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Entre na sua conta BM para continuar.");
        const { data, error } = await supabase.from("profiles").select("cpf,address,selfie_path").eq("id", user.id).maybeSingle();
        if (error) throw error;
        if (!active) return;
        if (clientBookingReady(data)) onReady();
        else setProfile(data ?? {});
      } catch (err) { if (active) setError(err instanceof Error ? err.message : "Falha no envio."); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [onReady]);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); if (busy || (!profile.selfie_path && !selfie)) return;
    const fd = new FormData(e.currentTarget);
    setBusy(true); setError("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Entre na sua conta BM para continuar.");
      const cpf = String(fd.get("cpf") ?? "").trim();
      const address = String(fd.get("address") ?? "").trim();
      const { error } = await supabase.from("profiles").upsert({ id: user.id, cpf, address });
      if (error) throw error;
      const missing = await syncProfile(selfie ? { selfie } : {}, ["selfie"]);
      if (missing.length) throw new Error("Envie a selfie de segurança para continuar.");
      onReady();
    } catch (err) { setError(err instanceof Error ? err.message : "Falha no envio."); }
    finally { setBusy(false); }
  };
  if (loading) return <p role="status" className="p-5 text-sm">{translateUi("Aguarde…", language)}</p>;
  return <form onSubmit={submit} className="space-y-4 p-5">
    <h3 className="font-display text-xl">{translateUi("Dados para finalizar o agendamento", language)}</h3>
    <label className="block text-xs font-semibold">CPF<input name="cpf" required inputMode="numeric" maxLength={14} defaultValue={profile.cpf ?? ""} className="mt-2 h-11 w-full rounded-lg border border-input bg-card px-3 text-sm" /></label>
    <label className="block text-xs font-semibold">{translateUi("Endereço completo", language)}<input name="address" required maxLength={160} defaultValue={profile.address ?? ""} className="mt-2 h-11 w-full rounded-lg border border-input bg-card px-3 text-sm" /></label>
    {!profile.selfie_path && <label className="block text-xs font-semibold">{translateUi("Selfie de segurança obrigatória", language)}<input type="file" required accept="image/*" disabled={busy} className="mt-2 block w-full text-xs" onChange={(e) => setSelfie(e.target.files?.[0])} /></label>}
    {error && <p role="alert" className="text-sm text-destructive">{translateUi(error, language)}</p>}
    <Button type="submit" disabled={busy || (!profile.selfie_path && !selfie)} className="min-h-11 w-full">{translateUi(busy ? "Enviando…" : "Salvar e continuar", language)}</Button>
  </form>;
}