import { test } from "node:test";
import assert from "node:assert/strict";
import { identitySubmissionStatus, requiredDocs } from "./bm-account";

test("professional identity requires RG/CNH front, back and selfie", () => {
  assert.deepEqual(requiredDocs("profissional"), ["identity", "identity_back", "selfie"]);
});
test("all three uploaded documents set PENDENTE_ANALISE, not verified", () => {
  assert.equal(identitySubmissionStatus("user/identity.jpg", "user/back.jpg", "user/selfie.jpg"), "PENDENTE_ANALISE");
});
test("a missing document cannot enter pending review", () => {
  assert.equal(identitySubmissionStatus("user/identity.jpg", null, "user/selfie.jpg"), undefined);
  assert.equal(identitySubmissionStatus("user/identity.jpg", "user/back.jpg", null), undefined);
});