import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export const PLATFORM_FEE_RATE = 0.18;
export const SERVICE_PIN = "8392";

export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type BookingInsert = Database["public"]["Tables"]["bookings"]["Insert"];
export type Service = Database["public"]["Tables"]["services"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type WalletEntry = Database["public"]["Tables"]["wallet_entries"]["Row"];
export type Withdrawal = Database["public"]["Tables"]["withdrawals"]["Row"];

/* ------------------------------------------------------------------ session */

let currentUser: User | null = null;
let sessionLoaded = false;
const listeners = new Set<(user: User | null) => void>();

async function refreshSession() {
  const { data } = await supabase.auth.getUser();
  currentUser = data.user ?? null;
  sessionLoaded = true;
  listeners.forEach((notify) => notify(currentUser));
}

let watching = false;
function watchSession() {
  if (watching || typeof window === "undefined") return;
  watching = true;
  void refreshSession();
  void supabase.auth.onAuthStateChange((event) => {
    if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
    void refreshSession();
  });
}
watchSession();

/** Current signed-in account. Shared across screens, refreshed on sign-in/out. */
export function useBmSession() {
  const [state, setState] = useState<{ user: User | null; loading: boolean }>({ user: currentUser, loading: !sessionLoaded });
  useEffect(() => {
    watchSession();
    const notify = (user: User | null) => setState({ user, loading: false });
    listeners.add(notify);
    if (!sessionLoaded) void refreshSession();
    return () => { listeners.delete(notify); };
  }, []);
  return state;
}

async function uid(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Entre na sua conta BM para continuar.");
  return data.user.id;
}

const toCents = (value: number) => Math.max(0, Math.round((Number.isFinite(value) ? value : 0) * 100));
export const fromCents = (cents: number) => (Number.isFinite(cents) ? cents : 0) / 100;

/* ---------------------------------------------------------------- bookings */

export async function createBooking(input: Omit<BookingInsert, "client_id">): Promise<Booking> {
  const id = await uid();
  const { data, error } = await supabase.from("bookings").insert({ ...input, client_id: id }).select().single();
  if (error) throw error;
  return data;
}

export async function listBookings(scope: "client" | "professional"): Promise<Booking[]> {
  const id = await uid();
  const column = scope === "client" ? "client_id" : "professional_id";
  const { data, error } = await supabase.from("bookings").select("*").eq(column, id).order("created_at", { ascending: false }).limit(50);
  if (error) throw error;
  return data ?? [];
}

/** Updates a booking only when the signed-in account is the client or the assigned professional. */
export async function updateBooking(id: string, patch: Partial<Booking>): Promise<Booking | null> {
  const owner = await uid();
  const { data, error } = await supabase
    .from("bookings")
    .update(patch)
    .eq("id", id)
    .or(`client_id.eq.${owner},professional_id.eq.${owner}`)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

/* ---------------------------------------------------------------- services */

export async function listServices(): Promise<Service[]> {
  const id = await uid();
  const { data, error } = await supabase.from("services").select("*").eq("owner_id", id).order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createService(name: string, price: number, minutes: number): Promise<Service> {
  const id = await uid();
  const { data, error } = await supabase.from("services").insert({ owner_id: id, name: name.trim().slice(0, 80), price_cents: toCents(price), duration_min: Math.round(minutes) }).select().single();
  if (error) throw error;
  return data;
}

export async function updateService(id: string, patch: { name?: string; price?: number; minutes?: number }): Promise<Service | null> {
  const owner = await uid();
  const row: Database["public"]["Tables"]["services"]["Update"] = {};
  if (patch.name !== undefined) row["name"] = patch.name.trim().slice(0, 80);
  if (patch.price !== undefined) row["price_cents"] = toCents(patch.price);
  if (patch.minutes !== undefined) row["duration_min"] = Math.round(patch.minutes);
  const { data, error } = await supabase.from("services").update(row).eq("id", id).eq("owner_id", owner).select().maybeSingle();
  if (error) throw error;
  return data;
}

export async function deleteService(id: string): Promise<void> {
  const owner = await uid();
  const { error } = await supabase.from("services").delete().eq("id", id).eq("owner_id", owner);
  if (error) throw error;
}

/* ----------------------------------------------------------------- wallet */

export async function listWalletEntries(): Promise<WalletEntry[]> {
  const id = await uid();
  const { data, error } = await supabase.from("wallet_entries").select("*").eq("owner_id", id).order("created_at", { ascending: false }).limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function addWalletEntry(input: { kind: WalletEntry["kind"]; amount: number; label: string; bookingId?: string | null; owner?: string }): Promise<WalletEntry> {
  const id = input.owner ?? await uid();
  const { data, error } = await supabase.from("wallet_entries").insert({ owner_id: id, kind: input.kind, amount_cents: toCents(input.amount), label: input.label.slice(0, 120), booking_id: input.bookingId ?? null }).select().single();
  if (error) throw error;
  return data;
}

export async function createWithdrawal(amount: number, pixKey?: string): Promise<Withdrawal> {
  const id = await uid();
  const { data, error } = await supabase.from("withdrawals").insert({ owner_id: id, amount_cents: toCents(amount), pix_key: pixKey?.slice(0, 120) ?? null }).select().single();
  if (error) throw error;
  return data;
}

/** Escrow (protected) and withdrawable balances derived from the saved wallet entries. */
export function walletTotals(entries: WalletEntry[]) {
  const sum = (kind: WalletEntry["kind"]) => fromCents(entries.filter((e) => e.kind === kind).reduce((t, e) => t + e.amount_cents, 0));
  const escrow = sum("escrow");
  const earnings = sum("earning");
  const payouts = sum("withdrawal");
  return { escrow, available: Math.max(0, earnings - payouts), earnings, fee: sum("fee"), payouts };
}

/* ---------------------------------------------------------------- reviews */

export async function createReview(input: { bookingId: string; professionalName?: string; rating: number; comment?: string; tags?: string[]; photoPath?: string | null }): Promise<Review> {
  const id = await uid();
  const { data: booking } = await supabase.from("bookings").select("professional_id, professional_name").eq("id", input.bookingId).maybeSingle();
  const { data, error } = await supabase.from("reviews").insert({
    booking_id: input.bookingId,
    author_id: id,
    professional_id: booking?.professional_id ?? null,
    professional_name: input.professionalName ?? booking?.professional_name ?? null,
    rating: Math.round(input.rating),
    comment: input.comment?.trim().slice(0, 500) || null,
    tags: input.tags?.length ? input.tags.join(", ") : null,
    photo_path: input.photoPath ?? null,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function listReviews(scope: "mine" | "received"): Promise<Review[]> {
  const id = await uid();
  const column = scope === "mine" ? "author_id" : "professional_id";
  const { data, error } = await supabase.from("reviews").select("*").eq(column, id).order("created_at", { ascending: false }).limit(50);
  if (error) throw error;
  return data ?? [];
}

/* --------------------------------------------------------------- profile */

export async function saveVerificationState(status: string): Promise<void> {
  const id = await uid();
  const { error } = await supabase.from("profiles").update({ verification_status: status.slice(0, 40) }).eq("id", id);
  if (error) throw error;
}

export const bookingAmounts = (total: number) => {
  const fee = Math.round(total * PLATFORM_FEE_RATE * 100) / 100;
  return { total, fee, net: Math.round((total - fee) * 100) / 100 };
};

/** Removes the protected (escrow) entry once the service PIN has released the payment. */
export async function settleEscrow(bookingId: string): Promise<void> {
  const id = await uid();
  const { error } = await supabase.from("wallet_entries").delete().eq("owner_id", id).eq("kind", "escrow").eq("booking_id", bookingId);
  if (error) throw error;
}

export async function getMyProfile(): Promise<{ full_name: string | null; account_type: string; verification_status: string; address: string | null; residence_details: string | null } | null> {
  const id = await uid();
  const { data, error } = await supabase.from("profiles").select("full_name, account_type, verification_status, address, residence_details").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function signOutBm(): Promise<void> {
  await supabase.auth.signOut();
}

/** Starts Google or Lovable sign-in. Returns true when the browser is navigating to the provider. */
export async function connectSocial(provider: "google" | "lovable"): Promise<boolean> {
  const { lovable } = await import("@/integrations/lovable");
  const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
  if (result.error) throw result.error;
  return Boolean(result.redirected);
}
