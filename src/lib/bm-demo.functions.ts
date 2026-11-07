import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

const DEMO = {
  cliente: { email: "demo.cliente@bm-hackathon.app", meta: { account_type: "cliente", full_name: "Cliente Demo BM" } },
  profissional: { email: "demo.profissional@bm-hackathon.app", meta: { account_type: "profissional", full_name: "Profissional Demo BM" } },
} as const;

/** Signs the jury into one of two fixed demo accounts (never admin). Password stays server-side. */
export const demoSignIn = createServerFn({ method: "POST" })
  .inputValidator((d: { kind: "cliente" | "profissional" }) => {
    if (d?.kind !== "cliente" && d?.kind !== "profissional") throw new Error("Conta demo inválida");
    return d;
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const demo = DEMO[data.kind];
    const password = `BM-demo-${data.kind}-2026!hackathon`;
    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    if (!list?.users.some((u) => u.email === demo.email)) {
      const { error } = await supabaseAdmin.auth.admin.createUser({ email: demo.email, password, email_confirm: true, user_metadata: demo.meta });
      if (error) throw new Error(error.message);
    }
    const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const client = createClient(process.env.SUPABASE_URL!, key, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      global: { fetch: (i, init) => { const h = new Headers(init?.headers); if (h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization"); h.set("apikey", key); return fetch(i, { ...init, headers: h }); } },
    });
    const { data: s, error } = await client.auth.signInWithPassword({ email: demo.email, password });
    if (error || !s.session) throw new Error(error?.message ?? "Falha no login demo");
    return { access_token: s.session.access_token, refresh_token: s.session.refresh_token };
  });
