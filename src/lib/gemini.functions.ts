import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { places } from "./bm-places";

const Input = z.object({
  request: z.string().trim().min(3).max(600),
  language: z.enum(["en", "pt", "es"]).default("pt"),
});

/** BM beauty assistant: GEMINI_API_KEY is read only here, on the server. */
export const askBeautyAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }) => {
    const key = process.env["GEMINI_API_KEY"];
    if (!key) return { ok: false as const, error: "missing_key" };
    const catalog = places.map((p) => `- ${p.name} (${p.kind}, ${p.area})`).join("\n");
    const lang = { en: "English", pt: "Brazilian Portuguese", es: "Spanish" }[data.language];
    const system = `You are the BM beauty assistant in Florianópolis. Recommend makeup/hair/beauty styles and suggest up to 3 professionals or salons ONLY from this list:\n${catalog}\nAnswer in ${lang}, in at most 6 short lines. Never invent professionals, prices, or verification claims; never give medical advice.`;
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: "user", parts: [{ text: data.request }] }] }),
    });
    if (!res.ok) {
      console.error("gemini error", res.status, (await res.text()).slice(0, 300));
      return { ok: false as const, error: res.status === 429 ? "rate_limited" : "unavailable" };
    }
    const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim();
    return text ? { ok: true as const, text } : { ok: false as const, error: "empty" };
  });
