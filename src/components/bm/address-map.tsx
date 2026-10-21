import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { FLORIPA, places } from "../../lib/bm-places";

const pin = L.divIcon({ className: "", html: '<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#D4AF37;border:2px solid #1C1C1C"></div>', iconSize: [22, 22], iconAnchor: [11, 22] });

function Picker({ onPick }: { onPick: (pos: [number, number]) => void }) {
  useMapEvents({ click: (e) => onPick([e.latlng.lat, e.latlng.lng]) });
  return null;
}

/** OpenStreetMap + free Nominatim reverse lookup; no paid API keys. */
export default function AddressMap({ onPick }: { onPick: (address: string) => void }) {
  const [pos, setPos] = useState<[number, number] | null>(null);
  const choose = async (p: [number, number], label?: string) => {
    setPos(p);
    if (label) { onPick(label); return; }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${p[0]}&lon=${p[1]}&zoom=17&accept-language=pt-BR`);
      const json = (await res.json()) as { address?: Record<string, string>; display_name?: string };
      const a = json.address ?? {};
      const parts = [a["road"], a["house_number"], a["suburb"] ?? a["neighbourhood"] ?? a["city_district"], a["city"] ?? a["town"]].filter(Boolean);
      onPick(parts.join(", ") || json.display_name || `${p[0].toFixed(5)}, ${p[1].toFixed(5)}`);
    } catch { onPick(`${p[0].toFixed(5)}, ${p[1].toFixed(5)}`); }
  };
  return <MapContainer center={[FLORIPA.lat, FLORIPA.lng]} zoom={12} scrollWheelZoom={false} className="h-64 w-full rounded-lg">
    <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <Picker onPick={(p) => { void choose(p); }} />
    {places.filter((p) => p.kind === "Salão").map((p) => <Marker key={p.id} position={[p.lat, p.lng]} icon={pin} eventHandlers={{ click: () => { void choose([p.lat, p.lng], `${p.name} (salão parceiro)`); } }} />)}
    {pos && <Marker position={pos} icon={pin} />}
  </MapContainer>;
}
