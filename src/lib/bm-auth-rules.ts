import { requiredDocs, type AccountType, type DocKind } from "./bm-account";

/** Clients provide their verification data at checkout, not at signup or login. */
export function signupDocs(type: AccountType): DocKind[] {
  return type === "cliente" ? [] : requiredDocs(type);
}

export function clientBookingReady(profile: { cpf?: string | null; address?: string | null; selfie_path?: string | null } | null) {
  return Boolean(profile?.cpf?.trim() && profile.address?.trim() && profile.selfie_path);
}

export function isRecoveryHash(hash: string) {
  return new URLSearchParams(hash.replace(/^#/, "")).get("type") === "recovery";
}

export function validNewPassword(password: string, confirmation: string) {
  return password.length >= 6 && password.length <= 72 && password === confirmation;
}