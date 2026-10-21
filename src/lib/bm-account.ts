import { supabase } from "@/integrations/supabase/client";

export type AccountType = "cliente" | "profissional" | "salao";
export type DocKind = "selfie" | "identity";
export type ProfileFields = Record<string, string | undefined>;

export const PENDING_IDENTITY_STATUS = "PENDENTE_ANALISE";

export function identitySubmissionStatus(identity: unknown, selfie: unknown) {
  return identity && selfie ? PENDING_IDENTITY_STATUS : undefined;
}

const clean = (v: unknown, max = 160) => (typeof v === "string" ? v.trim().slice(0, max) : undefined) || undefined;

export function pickProfile(meta: Record<string, unknown>): ProfileFields {
  const t = meta["account_type"];
  return {
    account_type: t === "profissional" || t === "salao" ? t : "cliente",
    full_name: clean(meta["full_name"], 100), cpf: clean(meta["cpf"], 14), cnpj: clean(meta["cnpj"], 18),
    phone: clean(meta["phone"], 20), address: clean(meta["address"]), residence_details: clean(meta["residence_details"], 100),
    salon_name: clean(meta["salon_name"], 100),
  };
}

async function upload(userId: string, kind: DocKind, file: File) {
  if (file.size > 10 * 1024 * 1024) throw new Error("Arquivo maior que 10 MB.");
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5);
  const path = `${userId}/${kind}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("selfies").upload(path, file, { contentType: file.type });
  if (error) throw error;
  return path;
}

/** Ensures the signed-in user's profile exists and stores any provided verification files. Returns missing doc kinds. */
export async function syncProfile(files: Partial<Record<DocKind, File>>, required: DocKind[], identitySubmission = false) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sessão não encontrada.");
  const { data: existing, error: readError } = await supabase.from("profiles").select("selfie_path, identity_doc_path, account_type").eq("id", user.id).maybeSingle();
  if (readError) throw readError;
  const row: Record<string, unknown> = { id: user.id, ...(existing ? {} : pickProfile(user.user_metadata ?? {})) };
  if (files.selfie) row["selfie_path"] = await upload(user.id, "selfie", files.selfie);
  if (files.identity) row["identity_doc_path"] = await upload(user.id, "identity", files.identity);
  const submitted = Boolean(files.identity || files.selfie);
  const professional = (existing?.account_type ?? user.user_metadata?.["account_type"]) === "profissional";
  const pending = identitySubmissionStatus(row["identity_doc_path"] ?? existing?.identity_doc_path, row["selfie_path"] ?? existing?.selfie_path);
  if (submitted && (professional || identitySubmission) && pending) row["verification_status"] = pending;
  const { error } = await supabase.from("profiles").upsert(row as never);
  if (error) throw error;
  const have = { selfie: (row["selfie_path"] ?? existing?.selfie_path) as string | null, identity: (row["identity_doc_path"] ?? existing?.identity_doc_path) as string | null };
  return required.filter((k) => !have[k]);
}

export async function submitIdentityDocuments(files: Partial<Record<DocKind, File>>) {
  if (!files.identity || !files.selfie) throw new Error("Envie o documento de identidade e a selfie de segurança.");
  await syncProfile(files, ["identity", "selfie"], true);
}

export function requiredDocs(type: AccountType): DocKind[] {
  return type === "cliente" ? ["selfie"] : type === "profissional" ? ["identity", "selfie"] : ["identity"];
}
