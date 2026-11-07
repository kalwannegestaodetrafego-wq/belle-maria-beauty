import { describe, expect, test } from "bun:test";
import { landingFor, requiresAccount } from "./bm-access";

describe("post-login landing", () => {
  test("client lands on the catalog", () => expect(landingFor("cliente", false)).toEqual({ view: "Cliente", admin: false }));
  test("professional lands on the partner dashboard", () => expect(landingFor("profissional", false).view).toBe("Profissional Beleza"));
  test("salon lands on the B2B dashboard", () => expect(landingFor("salao", false).view).toBe("Empresa & Salão B2B"));
  test("admin role goes to /admin", () => expect(landingFor("cliente", true).admin).toBe(true));
  test("unknown type falls back to client", () => expect(landingFor(null, false).view).toBe("Cliente"));
});

describe("visitor showcase", () => {
  test("browsing is open", () => expect(requiresAccount("browse")).toBe(false));
  test("booking, agenda and full profile need login", () => {
    expect(requiresAccount("book")).toBe(true);
    expect(requiresAccount("agenda")).toBe(true);
    expect(requiresAccount("profile")).toBe(true);
  });
});
