export type LatLng = { lat: number; lng: number };
export type Place = { id: string; name: string; kind: "Salão" | "Profissional"; area: string; lat: number; lng: number };

// Demo partners in Florianópolis (approximate coordinates).
export const places: Place[] = [
  { id: "camila", name: "Camila Silva", kind: "Profissional", area: "Centro", lat: -27.5935, lng: -48.5402 },
  { id: "studio-bella", name: "Studio Bella · Agronômica", kind: "Salão", area: "Agronômica", lat: -27.5779, lng: -48.5321 },
  { id: "juliana", name: "Juliana Costa", kind: "Profissional", area: "Trindade", lat: -27.6011, lng: -48.5195 },
  { id: "rio-vermelho", name: "Espaço Rio Vermelho", kind: "Salão", area: "Rio Vermelho", lat: -27.4996, lng: -48.4153 },
  { id: "lagoa", name: "Ateliê Lagoa", kind: "Salão", area: "Lagoa da Conceição", lat: -27.6033, lng: -48.4686 },
];

export const FLORIPA: LatLng = { lat: -27.5949, lng: -48.5482 };

export function distanceKm(a: LatLng, b: LatLng) {
  const r = (d: number) => (d * Math.PI) / 180;
  const h = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

export const formatKm = (km: number, locale = "pt-BR") => km.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
