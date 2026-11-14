import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { EVALUATION_USER_ID } from "./bm-demo-rules";

/** Public access to the pre-existing isolated evaluation account only, never real accounts. */
export const demoSignIn = createServerFn({ method: "POST" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: account, error: accountError } = await supabaseAdmin.auth.admin.getUserById(EVALUATION_USER_ID);
    if (accountError || account.user?.email !== "demo.cliente@bm-hackathon.app") throw new Error("Conta de avaliação indisponível.");
    const { data: roles, error: roleError } = await supabaseAdmin.from("user_roles").select("user_id").eq("user_id", EVALUATION_USER_ID).limit(1);
    if (roleError || roles?.length) throw new Error("Conta de avaliação indisponível.");
    const password = crypto.randomUUID() + crypto.randomUUID();
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(EVALUATION_USER_ID, { password });
    if (updateError) throw new Error("Conta de avaliação indisponível.");
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const client = createClient(process.env["SUPABASE_URL"]!, key, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      global: { fetch: (i, init) => { const h = new Headers(init?.headers); if (h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization"); h.set("apikey", key); return fetch(i, { ...init, headers: h }); } },
    });
    const { data: s, error } = await client.auth.signInWithPassword({ email: account.user.email, password });
    if (error || !s.session) throw new Error(error?.message ?? "Falha no login demo");
    return { access_token: s.session.access_token, refresh_token: s.session.refresh_token };
  });
