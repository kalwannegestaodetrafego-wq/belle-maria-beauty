import { z } from "zod";

export const identityReviewInput = z.object({ id: z.string().uuid(), approve: z.boolean(), reason: z.string().trim().max(500).optional() }).refine((value) => value.approve || Boolean(value.reason), { message: "Informe o motivo da rejeição." });
export const escrowControlInput = z.object({ id: z.string().uuid(), release: z.boolean() });
export const hasVerifiedIdentity = (status: string | null | undefined) => status === "VERIFICADO";export const ticketResolveInput = z.object({ id: z.string().uuid(), reply: z.string().trim().min(1).max(500) });

/** Ratings of 4–5 stars are public on the professional profile; 1–3 stay private for BM admin review. */
export const reviewVisibility = (rating: number) => (rating >= 4 ? "public" : "private");

/** Admin tab that receives each support category. */
export function ticketTab(category: string, role: string): "professionals" | "complaints" | "lost" {
  if (category === "lost_item" || category === "forgot_item") return "lost";
  return role === "professional" ? "professionals" : "complaints";
}
