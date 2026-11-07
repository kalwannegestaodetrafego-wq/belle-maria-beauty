import { test } from "node:test";
import assert from "node:assert/strict";
import { landingFor, requiresAccount } from "./bm-access";

test("client lands on the catalog", () => assert.deepEqual(landingFor("cliente", false), { view: "Cliente", admin: false }));
test("professional lands on the partner dashboard", () => assert.equal(landingFor("profissional", false).view, "Profissional Beleza"));
test("salon lands on the B2B dashboard", () => assert.equal(landingFor("salao", false).view, "Empresa & Salão B2B"));
test("admin role goes to /admin", () => assert.equal(landingFor("cliente", true).admin, true));
test("unknown type falls back to client", () => assert.equal(landingFor(null, false).view, "Cliente"));
test("browsing is open to visitors", () => assert.equal(requiresAccount("browse"), false));
test("booking, agenda and full profile need login", () => {
  assert.equal(requiresAccount("book"), true);
  assert.equal(requiresAccount("agenda"), true);
  assert.equal(requiresAccount("profile"), true);
});
