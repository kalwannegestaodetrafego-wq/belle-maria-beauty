import { z } from "zod";

export const identityReviewInput = z.object({ id: z.string().uuid(), approve: z.boolean(), reason: z.string().trim().max(500).optional() }).refine((value) => value.approve || Boolean(value.reason), { message: "Informe o motivo da rejeição." });
export const escrowControlInput = z.object({ id: z.string().uuid(), release: z.boolean() });
export const hasVerifiedIdentity = (status: string | null | undefined) => status === "VERIFICADO";