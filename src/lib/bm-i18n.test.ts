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
  test("language changes translate the same service without altering its identifier", () => {
    const service = "Maquiagem Social";
    assert.equal(translateUi(service, "en"), "Social Makeup");
    assert.equal(translateUi(service, "pt"), "Maquiagem Social");
    assert.equal(translateUi(service, "es"), "Maquillaje Social");
    assert.equal(service, "Maquiagem Social");
  });
  test("personal names and user messages remain unchanged", () => {
    assert.equal(translateUi("Kalwanne Albuquerque", "es"), "Kalwanne Albuquerque");
    assert.equal(translateUi("My personal appointment note", "pt"), "My personal appointment note");
  });
  test("dynamic instructions retain the support contact", () => {
    const message = "Há uma tolerância padrão de 15 minutos. Para atrasos acima de 15 minutos, avise o suporte imediatamente por e-mail: startupbmcomercial@gmail.com.";
    assert.ok(translateUi(message, "en").includes("contact support immediately by email: startupbmcomercial@gmail.com."));
  });
});