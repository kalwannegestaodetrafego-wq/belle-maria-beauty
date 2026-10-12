import { describe, expect, test } from "bun:test";
import { DEFAULT_LANGUAGE, resolveLanguage, translateUi } from "./bm-i18n";

describe("BM language requirements", () => {
  test("the platform defaults to English", () => {
    expect(DEFAULT_LANGUAGE).toBe("en");
    expect(resolveLanguage(null)).toBe("en");
    expect(resolveLanguage("unsupported")).toBe("en");
  });
  test("all three requested selections are supported", () => {
    expect(["en", "pt", "es"].map(resolveLanguage)).toEqual(["en", "pt", "es"]);
  });
  test("language changes translate the same service without altering its identifier", () => {
    const service = "Maquiagem Social";
    expect(translateUi(service, "en")).toBe("Social Makeup");
    expect(translateUi(service, "pt")).toBe("Maquiagem Social");
    expect(translateUi(service, "es")).toBe("Maquillaje Social");
    expect(service).toBe("Maquiagem Social");
  });
  test("personal names and user messages remain unchanged", () => {
    expect(translateUi("Kalwanne Albuquerque", "es")).toBe("Kalwanne Albuquerque");
    expect(translateUi("My personal appointment note", "pt")).toBe("My personal appointment note");
  });
  test("dynamic instructions retain the support contact", () => {
    const message = "Há uma tolerância padrão de 15 minutos. Para atrasos acima de 15 minutos, avise o suporte imediatamente por e-mail: startupbmcomercial@gmail.com.";
    expect(translateUi(message, "en")).toContain("contact support immediately by email: startupbmcomercial@gmail.com.");
  });
});