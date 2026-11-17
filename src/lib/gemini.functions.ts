import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Pro = z.object({ id: z.string().max(40), name: z.string().max(80), role: z.string().max(80), service: z.string().max(80), price: z.number(), area: z.string().max(60), atHome: z.boolean(), tags: z.array(z.string().max(40)).max(8) });
const Input = z.object({ request: z.string().trim().min(3).max(600), catalog: z.array(Pro).min(1).max(30) });

/** Consultora IA BM. GEMINI_API_KEY is read only inside this server handler. */
export const askBeautyConsultant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }) => {
    const key = process.env["GEMINI_API_KEY"];
    if (!key) return { ok: false as const, error: "missing_key" };
    const list = data.catalog.map((p) => `- id=${p.id} | ${p.name} (${p.role}) | serviço: ${p.service} a partir de R$ ${p.price} | ${p.area} | ${p.atHome ? "atende em domicílio" : "atende no salão"} | ${p.tags.join(", ")}`).join("\n");
    const system = `Você é a Consultora IA BM, consultora de beleza e agendamento da Belle Maria Beauty em Florianópolis. Tom acolhedor, sofisticado e objetivo, em português do Brasil. A cliente descreve evento, horário ou estilo. Recomende o serviço ideal e até 3 profissionais APENAS desta lista (use os ids exatos):\n${list}\nNão invente profissionais, preços, horários disponíveis nem selos de verificação; diga que a disponibilidade é confirmada no agendamento. Sem conselhos médicos. Resposta em no máximo 6 linhas curtas.`;
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: data.request }] }],
        generationConfig: { responseMimeType: "application/json", responseSchema: { type: "OBJECT", properties: { message: { type: "STRING" }, professionalIds: { type: "ARRAY", items: { type: "STRING" } } }, required: ["message", "professionalIds"] } },
      }),
    });
    if (!res.ok) {
      console.error("gemini error", res.status, (await res.text()).slice(0, 300));
      return { ok: false as const, error: res.status === 429 ? "rate_limited" : "unavailable" };
    }
    const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    try {
      const out = JSON.parse(json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "") as { message?: string; professionalIds?: string[] };
      const ids = new Set(data.catalog.map((p) => p.id));
      if (!out.message?.trim()) return { ok: false as const, error: "empty" };
      return { ok: true as const, message: out.message.trim(), professionalIds: (out.professionalIds ?? []).filter((id) => ids.has(id)).slice(0, 3) };
    } catch { return { ok: false as const, error: "empty" }; }
  });
