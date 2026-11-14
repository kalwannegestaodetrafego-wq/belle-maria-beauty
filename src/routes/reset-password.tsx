import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { isRecoveryHash, validNewPassword } from "@/lib/bm-auth-rules";
import { translateUi, useLanguage } from "@/lib/bm-i18n";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [
    { title: "BM — Redefinir senha" },
    { name: "description", content: "Redefina sua senha BM com segurança pelo link de recuperação enviado por e-mail." },
    { property: "og:title", content: "BM — Redefinir senha" },
    { property: "og:description", content: "Recuperação segura de acesso à sua conta BM." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { language } = useLanguage();
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const recovery = isRecoveryHash(window.location.hash);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session && active) { setReady(true); setChecking(false); }
    });
    void supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return;
      if (recovery && data.user && !error) setReady(true);
      setChecking(false);
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); if (!ready || busy) return;
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    if (!validNewPassword(password, String(fd.get("confirmation") ?? ""))) { setError("As senhas devem ser iguais e ter pelo menos 6 caracteres."); return; }
    setBusy(true); setError("");
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true); setReady(false);
      window.history.replaceState(null, "", "/reset-password");
    } catch (err) { setError(err instanceof Error ? err.message : "Não foi possível concluir. Tente novamente."); }
    finally { setBusy(false); }
  };
  return <main className="flex min-h-screen items-center justify-center bg-background p-5 text-foreground">
    <section className="w-full max-w-sm space-y-5">
      <p className="font-display text-3xl">BM</p>
      <h1 className="font-display text-2xl">{translateUi("Redefinir senha", language)}</h1>
      {checking ? <p role="status">{translateUi("Aguarde…", language)}</p> : done ? <>
        <p role="status" className="text-success">{translateUi("Senha atualizada com sucesso.", language)}</p>
        <Button asChild className="min-h-11 w-full"><Link to="/">{translateUi("Continuar", language)}</Link></Button>
      </> : ready ? <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-semibold">{translateUi("Nova senha", language)}<input name="password" type="password" autoComplete="new-password" required minLength={6} maxLength={72} className="mt-2 h-11 w-full rounded-lg border border-input bg-card px-3" /></label>
        <label className="block text-sm font-semibold">{translateUi("Confirmar senha", language)}<input name="confirmation" type="password" autoComplete="new-password" required minLength={6} maxLength={72} className="mt-2 h-11 w-full rounded-lg border border-input bg-card px-3" /></label>
        {error && <p role="alert" className="text-sm text-destructive">{translateUi(error, language)}</p>}
        <Button disabled={busy} type="submit" className="min-h-11 w-full">{translateUi(busy ? "Aguarde…" : "Salvar nova senha", language)}</Button>
      </form> : <>
        <p role="alert" className="text-sm text-muted-foreground">{translateUi("Link de recuperação inválido ou expirado. Solicite um novo link na tela de acesso.", language)}</p>
        <Button asChild variant="outline" className="min-h-11 w-full"><Link to="/auth">{translateUi("Voltar ao acesso", language)}</Link></Button>
      </>}
    </section>
  </main>;
}