import { test } from "node:test";
import assert from "node:assert/strict";
import { signupDocs, clientBookingReady, isRecoveryHash, validNewPassword } from "./bm-auth-rules";

test("client signup requires no verification upload", () => assert.deepEqual(signupDocs("cliente"), []));
test("professional signup retains three KYC uploads", () => assert.deepEqual(signupDocs("profissional"), ["identity", "identity_back", "selfie"]));
test("salon signup retains its license upload", () => assert.deepEqual(signupDocs("salao"), ["identity"]));
test("checkout requires CPF, address and saved selfie", () => {
  const complete = { cpf: "12345678901", address: "Rua Teste, 10", selfie_path: "owner/selfie.jpg" };
  assert.equal(clientBookingReady(complete), true);
  for (const key of ["cpf", "address", "selfie_path"] as const) assert.equal(clientBookingReady({ ...complete, [key]: "" }), false);
  assert.equal(clientBookingReady(null), false);
});
test("ordinary auth hashes cannot unlock password recovery", () => {
  assert.equal(isRecoveryHash("#type=recovery&access_token=test"), true);
  assert.equal(isRecoveryHash("#type=signup"), false);
  assert.equal(isRecoveryHash(""), false);
});
test("new password needs six characters and matching confirmation", () => {
  assert.equal(validNewPassword("123456", "123456"), true);
  assert.equal(validNewPassword("12345", "12345"), false);
  assert.equal(validNewPassword("123456", "654321"), false);
});