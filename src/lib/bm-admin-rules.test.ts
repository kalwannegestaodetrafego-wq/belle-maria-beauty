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
});import { reviewVisibility, ticketTab } from "./bm-admin-rules";
test("4-5 star reviews are public, 1-3 are private", () => {
  assert.equal(reviewVisibility(5), "public"); assert.equal(reviewVisibility(4), "public");
  assert.equal(reviewVisibility(3), "private"); assert.equal(reviewVisibility(1), "private");
});
test("support tickets route to the right admin tab", () => {
  assert.equal(ticketTab("payment_missing", "professional"), "professionals");
  assert.equal(ticketTab("disrespect", "professional"), "professionals");
  assert.equal(ticketTab("incomplete_service", "client"), "complaints");
  assert.equal(ticketTab("lost_item", "client"), "lost");
  assert.equal(ticketTab("forgot_item", "professional"), "lost");
});
