import { createServerFn } from "@tanstack/react-start";
import { escrowControlInput, identityReviewInput, ticketResolveInput } from "./bm-admin-rules";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getAdminAccess = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (error) throw new Error("Não foi possível verificar o acesso.");
  return data === true;
});

export const getAdminPanel = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: allowed, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (roleError || !allowed) throw new Error("Acesso restrito à gestora BM.");
  const [profiles, bookings, tickets, privateReviews] = await Promise.all([
    context.supabase.from("profiles").select("id,full_name,account_type,identity_doc_path,identity_back_doc_path,selfie_path,created_at").eq("verification_status", "PENDENTE_ANALISE").eq("account_type", "profissional").order("created_at"),
    context.supabase.from("bookings").select("id,client_name,professional_name,professional_id,service_name,amount_cents,fee_cents,scheduled_for,created_at").eq("payment_status", "escrow").order("created_at", { ascending: false }),
    context.supabase.from("support_tickets").select("id,author_role,category,message,status,admin_reply,booking_id,created_at").order("created_at", { ascending: false }).limit(200),
    context.supabase.from("reviews").select("id,booking_id,professional_name,rating,comment,created_at").eq("visibility", "private").order("created_at", { ascending: false }).limit(200),
  ]);
  if (profiles.error || bookings.error || tickets.error || privateReviews.error) throw new Error("Não foi possível carregar o painel.");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const requests = await Promise.all((profiles.data ?? []).map(async (profile) => {
    const sign = async (path: string | null) => {
      if (!path || !path.startsWith(`${profile.id}/`)) return null;
      const { data, error } = await supabaseAdmin.storage.from("selfies").createSignedUrl(path, 300);
      if (error) throw new Error("Não foi possível abrir os documentos.");
      const signed = new URL(data.signedUrl);
      const browserBase = import.meta.env["VITE_SUPABASE_URL"];
      if (!browserBase) throw new Error("Não foi possível abrir os documentos.");
      return { url: `${browserBase.replace(/\/$/, "")}${signed.pathname}${signed.search}`, pdf: path.toLowerCase().endsWith(".pdf") };
    };
    const [identity, identityBack, selfie] = await Promise.all([sign(profile.identity_doc_path), sign(profile.identity_back_doc_path), sign(profile.selfie_path)]);
    return { id: profile.id, name: profile.full_name, createdAt: profile.created_at, identity, identityBack, selfie };
  }));
  return { requests, bookings: bookings.data ?? [], tickets: tickets.data ?? [], privateReviews: privateReviews.data ?? [] };
});

export const reviewIdentity = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(identityReviewInput)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("bm_review_identity", { _profile_id: data.id, _approve: data.approve, _reason: data.reason ?? "" });
    if (error) throw new Error("Não foi possível salvar a decisão. Atualize o painel e tente novamente.");
    return { success: true };
  });

export const controlEscrow = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(escrowControlInput)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("bm_admin_escrow", { _booking_id: data.id, _release: data.release });
    if (error) throw new Error("Não foi possível alterar a custódia. Confira o profissional vinculado e atualize o painel.");
    return { success: true };
  });
export const resolveTicket = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(ticketResolveInput)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("bm_resolve_ticket", { _ticket_id: data.id, _reply: data.reply });
    if (error) throw new Error("Não foi possível responder a ocorrência.");
    return { success: true };
  });
