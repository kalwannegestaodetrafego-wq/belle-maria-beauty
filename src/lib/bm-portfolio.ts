export type PublicService = { id: string; name: string; priceCents: number; durationMin: number };
export type PublicItem = { id: string; imagePath: string; title: string | null; tags: string[]; serviceId: string | null };
export type PublicPortfolio = {
  id: string; slug: string; name: string; specialty: string | null; bio: string | null; salon: string | null; accountType: string;
  avatar: string | null; neighborhoods: string[]; verified: boolean; founder: boolean; rating: number | null; reviewCount: number;
  reviews: { rating: number; comment: string | null; createdAt: string }[]; services: PublicService[]; items: PublicItem[]; videos?: PublicVideo[];
};

export const FLORIPA_NEIGHBORHOODS = ["Centro", "Agronômica", "Trindade", "Córrego Grande", "Itacorubi", "Santa Mônica", "Lagoa da Conceição", "Campeche", "Jurerê", "Canasvieiras", "Ingleses", "Coqueiros", "Estreito", "Saco Grande", "João Paulo", "Rio Tavares"];
export const LOOK_SUGGESTIONS = ["Maquiagem Social Iluminada", "Noiva Clássica", "Pele Negra", "Unhas em Gel", "Penteado Formatura", "Make Glow"];

export function slugify(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40).replace(/-+$/, "");
}

export const isValidSlug = (slug: string) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) && slug.length >= 3 && slug.length <= 40;

export function parseTags(raw: string): string[] {
  const tags = raw.split(/[\s,]+/).map((t) => t.replace(/^#+/, "").trim().toLowerCase().slice(0, 30)).filter(Boolean);
  return [...new Set(tags)].slice(0, 12);
}

export const portfolioUrl = (origin: string, slug: string) => `${origin.replace(/\/$/, "")}/portfolio/${slug}`;

export const whatsappShareUrl = (link: string) =>
  `https://wa.me/?text=${encodeURIComponent(`Olá! Confira meu portfólio oficial de beleza e agende seu horário a domicílio pelo Belle Maria Beauty: ${link}`)}`;

/** Service linked to a look; falls back to the cheapest active service. */
export function serviceForItem(p: Pick<PublicPortfolio, "services">, item: Pick<PublicItem, "serviceId">): PublicService | null {
  return p.services.find((s) => s.id === item.serviceId) ?? p.services[0] ?? null;
}

export const MAX_PORTFOLIO_PHOTOS = 12;
export const MAX_PORTFOLIO_VIDEOS = 10;
export type PublicVideo = { id: string; reelCode: string; title: string; serviceId: string | null };

/** Extracts the Instagram Reel/post code from a pasted link; null when not an Instagram reel link. */
export function parseReelCode(raw: string): string | null {
  const m = raw.trim().match(/^(?:https?:\/\/)?(?:www\.|m\.)?instagram\.com\/(?:[A-Za-z0-9_.]+\/)?(?:reels?|p|tv)\/([A-Za-z0-9_-]{5,40})/i);
  return m?.[1] ?? null;
}
export const reelEmbedUrl = (code: string) => `https://www.instagram.com/reel/${encodeURIComponent(code)}/embed`;
