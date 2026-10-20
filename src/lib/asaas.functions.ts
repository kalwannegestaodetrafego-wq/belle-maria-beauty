import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Asaas Pix integration. Without ASAAS_API_KEY the checkout falls back to the static test Pix.
// Optional: ASAAS_ENV=production (default sandbox), ASAAS_CUSTOMER_ID (customer charged in demo bookings).
function config() {
  const key = process.env.ASAAS_API_KEY;
  const base = process.env.ASAAS_ENV === "production" ? "https://api.asaas.com/v3" : "https://api-sandbox.asaas.com/v3";
  return { key, base, customer: process.env.ASAAS_CUSTOMER_ID };
}
async function asaas(path: string, key: string, base: string, init?: RequestInit) {
  const res = await fetch(`${base}${path}`, { ...init, headers: { "Content-Type": "application/json", access_token: key, "User-Agent": "BM", ...(init?.headers ?? {}) } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.errors?.[0]?.description ?? `Asaas ${res.status}`);
  return body;
}

export const createPixCharge = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ value: z.number().positive().max(10000), description: z.string().max(200), reference: z.string().max(40) }).parse(input))
  .handler(async ({ data }) => {
    const { key, base, customer } = config();
    if (!key || !customer) return { mode: "static" as const };
    try {
      const due = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
      const pay = await asaas("/payments", key, base, { method: "POST", body: JSON.stringify({ customer, billingType: "PIX", value: Number(data.value.toFixed(2)), dueDate: due, description: data.description, externalReference: data.reference }) });
      const qr = await asaas(`/payments/${pay.id}/pixQrCode`, key, base);
      return { mode: "asaas" as const, id: String(pay.id), payload: String(qr.payload), image: String(qr.encodedImage) };
    } catch (error) {
      console.error("Asaas Pix error", error);
      return { mode: "static" as const };
    }
  });

export const getPixStatus = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ id: z.string().regex(/^pay_[\w]+$/) }).parse(input))
  .handler(async ({ data }) => {
    const { key, base } = config();
    if (!key) return { paid: false };
    const r = await asaas(`/payments/${data.id}/status`, key, base);
    return { paid: ["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"].includes(r.status) };
  });
