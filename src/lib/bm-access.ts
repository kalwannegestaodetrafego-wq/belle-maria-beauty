export type BmView = "Cliente" | "Profissional Beleza" | "Empresa & Salão B2B";
export type BmLanding = { view: BmView; admin: boolean };

/** Decides where a signed-in account lands. Admin comes only from the protected role list, never the profile. */
export function landingFor(accountType: string | null | undefined, isAdmin: boolean): BmLanding {
  const view: BmView = accountType === "profissional" ? "Profissional Beleza" : accountType === "salao" ? "Empresa & Salão B2B" : "Cliente";
  return { view, admin: isAdmin };
}

/** Visitors may browse the showcase; booking, the agenda, full profiles and partner panels need an account. */
export const requiresAccount = (action: "browse" | "book" | "agenda" | "profile" | "partner") => action !== "browse";
