import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import type { PublicPortfolio } from "./bm-portfolio";

/** Public, read-only: returns only the safe fields exposed by bm_public_portfolio. */
export const getPublicPortfolio = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]{3,40}$/) }).parse(input))
  .handler(async ({ data }) => {
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_ANON_KEY"] ?? "";
    const client = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => { const h = new Headers(init?.headers); if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization"); h.set("apikey", key); return fetch(input, { ...init, headers: h }); } },
    });
    const { data: row, error } = await client.rpc("bm_public_portfolio", { _slug: data.slug });
    if (error) throw new Error("Portfólio indisponível no momento.");
    return (row ?? null) as unknown as PublicPortfolio | null;
  });
