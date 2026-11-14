import { test } from "node:test";
import assert from "node:assert/strict";
import { EVALUATION_USER_ID, isEvaluationAccount } from "./bm-demo-rules";

test("the universal evaluation account can switch views", () => {
  assert.equal(isEvaluationAccount(EVALUATION_USER_ID), true);
});

test("real accounts and visitors cannot switch evaluation views", () => {
  assert.equal(isEvaluationAccount("b7070adc-591b-4b87-b948-8a55bfeaa3aa"), false);
  assert.equal(isEvaluationAccount("ordinary-user"), false);
  assert.equal(isEvaluationAccount(null), false);
  assert.equal(isEvaluationAccount(undefined), false);
});