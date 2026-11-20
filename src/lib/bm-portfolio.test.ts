import { test } from "node:test";
import assert from "node:assert/strict";
import { isValidSlug, parseTags, portfolioUrl, serviceForItem, slugify, whatsappShareUrl } from "./bm-portfolio";

test("builds the public link on the official domain", () => {
  assert.equal(portfolioUrl("https://bellemaria.com.br", slugify("Camila Silva")), "https://bellemaria.com.br/portfolio/camila-silva");
});
test("WhatsApp message carries the ready text and link", () => {
  const decoded = decodeURIComponent(whatsappShareUrl("https://bellemaria.com.br/portfolio/ana").split("text=")[1] ?? "");
  assert.equal(decoded, "Olá! Confira meu portfólio oficial de beleza e agende seu horário a domicílio pelo Belle Maria Beauty: https://bellemaria.com.br/portfolio/ana");
});
test("normalizes accents and rejects short slugs", () => {
  assert.equal(slugify("Júlia Côrtes Make!"), "julia-cortes-make");
  assert.equal(isValidSlug("ab"), false);
});
test("parses hashtags", () => { assert.deepEqual(parseTags("#noiva, #Glow #noiva domicilio"), ["noiva", "glow", "domicilio"]); });
test("uses the linked service price", () => {
  const services = [{ id: "a", name: "A", priceCents: 10000, durationMin: 60 }, { id: "b", name: "B", priceCents: 25000, durationMin: 90 }];
  assert.equal(serviceForItem({ services }, { serviceId: "b" })?.priceCents, 25000);
});
