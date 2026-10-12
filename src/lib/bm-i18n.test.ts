import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_LANGUAGE, resolveLanguage, translateUi } from "./bm-i18n";

describe("BM language requirements", () => {
  test("the platform defaults to English", () => {
    assert.equal(DEFAULT_LANGUAGE, "en");
    assert.equal(resolveLanguage(null), "en");
    assert.equal(resolveLanguage("unsupported"), "en");
  });
  test("all three requested selections are supported", () => {
    assert.deepEqual(["en", "pt", "es"].map(resolveLanguage), ["en", "pt", "es"]);
  });
  test("language changes do not alter business data", () => {
    const order = { status: "arrived", pin: "8392", total: 150 };
    for (const language of ["en", "pt", "es"] as const) {
      assert.equal(translateUi(order, language), order);
      assert.equal(translateUi(150, language), 150);
    }
  });
  test("personal names and user messages remain unchanged", () => {
    assert.equal(translateUi("Kalwanne Albuquerque", "es"), "Kalwanne Albuquerque");
    assert.equal(translateUi("My personal appointment note", "pt"), "My personal appointment note");
  });
});