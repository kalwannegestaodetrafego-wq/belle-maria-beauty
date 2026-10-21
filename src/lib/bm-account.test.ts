import { test } from "node:test";
import assert from "node:assert/strict";
import { identitySubmissionStatus, requiredDocs } from "./bm-account";

test("professional identity requires both RG/CNH and selfie", () => {
  assert.deepEqual(requiredDocs("profissional"), ["identity", "selfie"]);
});
test("both uploaded documents set PENDENTE_ANALISE, not verified", () => {
  assert.equal(identitySubmissionStatus("user/identity.jpg", "user/selfie.jpg"), "PENDENTE_ANALISE");
});
test("a single uploaded document cannot enter pending review", () => {
  assert.equal(identitySubmissionStatus("user/identity.jpg", null), undefined);
  assert.equal(identitySubmissionStatus(null, "user/selfie.jpg"), undefined);
});