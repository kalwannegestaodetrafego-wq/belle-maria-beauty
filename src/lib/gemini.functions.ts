import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Pro = z.object({ id: z.string().max(40), name: z.string().max(80), role: z.string().max(80), service: z.string().max(80), price: z.number(), area: z.string().max(60), atHome: z.boolean(), tags: z.array(z.string().max(40)).max(8) });
const Input = z.object({ request: z.string().trim().max(600), catalog: z.array(Pro).min(1).max(30), image: z.object({ mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]), data: z.string().max(2_000_000).regex(/^[A-Za-z0-9+/=]+$/) }).optional() }).refine((v) => v.request.length >= 3 || !!v.image);
type PortfolioEntry = { slug: string; name: string; specialty: string | null; neighborhoods: string[]; looks: { title: string | null; tags: string[] }[]; services: { name: string; priceCents: number }[] };

/** Consultora IA BM. GEMINI_API_KEY is read only inside this server handler. */
export const askBeautyConsultant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data, context }) => {
    const key = process.env["GEMINI_API_KEY"];
    if (!key) return { ok: false as const, error: "missing_key" };
    const list = data.catalog.map((p) => `- id=${p.id} | ${p.name} (${p.role}) | serviço: ${p.service} a partir de R$ ${p.price} | ${p.area} | ${p.atHome ? "atende em domicílio" : "atende no salão"} | ${p.tags.join(", ")}`).join("\n");
    const { data: raw } = await context.supabase.rpc("bm_portfolio_catalog");
    const portfolios = ((raw ?? []) as unknown as PortfolioEntry[]).filter((p) => p.slug);
    const pfList = portfolios.map((p) => `- slug=${p.slug} | ${p.name} (${p.specialty ?? "beleza"}) | bairros: ${p.neighborhoods.join(", ") || "Florianópolis"} | trabalhos: ${p.looks.map((l) => `${l.title ?? ""} ${l.tags.map((t) => "#" + t).join(" ")}`).join("; ")} | serviços: ${p.services.map((s) => `${s.name} R$ ${s.priceCents / 100}`).join(", ")}`).join("\n");
    const system = `Você é a Consultora IA BM, consultora de beleza e agendamento da Belle Maria Beauty em Florianópolis. Tom acolhedor, sofisticado e objetivo, em português do Brasil. A cliente descreve evento, horário ou estilo. Recomende o serviço ideal e até 3 profissionais APENAS desta lista (use os ids exatos):\n${list}\n\nPortfólios publicados (recomende até 3 em portfolioSlugs quando os títulos/tags dos trabalhos combinarem com o pedido ou com a foto de inspiração; use os slugs exatos):\n${pfList || "(nenhum)"}\nSe a cliente enviar uma foto de inspiração, descreva brevemente o estilo (pele, cores, acabamento) e compare com os títulos/tags dos portfólios. Não invente profissionais, preços, horários disponíveis nem selos de verificação; diga que a disponibilidade é confirmada no agendamento. Sem conselhos médicos. Resposta em no máximo 6 linhas curtas.`;
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent", {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [...(data.image ? [{ inline_data: { mime_type: data.image.mimeType, data: data.image.data } }] : []), { text: data.request || "Encontre profissionais com trabalhos parecidos com esta foto de inspiração." }] }],
        generationConfig: { responseMimeType: "application/json", responseSchema: { type: "OBJECT", properties: { message: { type: "STRING" }, professionalIds: { type: "ARRAY", items: { type: "STRING" } }, portfolioSlugs: { type: "ARRAY", items: { type: "STRING" } } }, required: ["message", "professionalIds", "portfolioSlugs"] } },
      }),
    });
    if (!res.ok) {
      console.error("gemini error", res.status, (await res.text()).slice(0, 300));
      return { ok: false as const, error: res.status === 429 ? "rate_limited" : "unavailable" };
    }
    const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[] };
    try {
      const out = JSON.parse(json.candidates?.[0]?.content?.parts?.filter((p) => !p.thought).map((p) => p.text ?? "").join("") ?? "") as { message?: string; professionalIds?: string[]; portfolioSlugs?: string[] };
      const ids = new Set(data.catalog.map((p) => p.id));
      if (!out.message?.trim()) return { ok: false as const, error: "empty" };
      return { ok: true as const, message: out.message.trim(), professionalIds: (out.professionalIds ?? []).filter((id) => ids.has(id)).slice(0, 3), portfolios: (out.portfolioSlugs ?? []).map((s) => portfolios.find((p) => p.slug === s)).filter((p): p is PortfolioEntry => !!p).slice(0, 3).map((p) => ({ slug: p.slug, name: p.name, specialty: p.specialty })) };
    } catch { return { ok: false as const, error: "empty" }; }
  });
