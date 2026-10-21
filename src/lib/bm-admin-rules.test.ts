import { test } from "node:test";
import assert from "node:assert/strict";
import { hasVerifiedIdentity, identityReviewInput } from "./bm-admin-rules";
const id = "00000000-0000-4000-8000-000000000001";
test("rejection requires a nonempty reason", () => {
  assert.equal(identityReviewInput.safeParse({ id, approve: false, reason: "  " }).success, false);
  assert.equal(identityReviewInput.safeParse({ id, approve: false, reason: "Documento ilegível" }).success, true);
});
test("approval does not require a rejection reason", () => {
  assert.equal(identityReviewInput.safeParse({ id, approve: true }).success, true);
});
test("only VERIFICADO enables the real identity badge", () => {
  assert.equal(hasVerifiedIdentity("VERIFICADO"), true);
  assert.equal(hasVerifiedIdentity("PENDENTE_ANALISE"), false);
  assert.equal(hasVerifiedIdentity("REJEITADO"), false);
});