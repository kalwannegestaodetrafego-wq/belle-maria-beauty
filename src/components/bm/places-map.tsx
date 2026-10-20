import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { FLORIPA, formatKm, type LatLng, type Place } from "../../lib/bm-places";

const pin = L.divIcon({ className: "", html: '<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#D4AF37;border:2px solid #1C1C1C"></div>', iconSize: [22, 22], iconAnchor: [11, 22] });

export default function PlacesMap({ items, user }: { items: (Place & { d: number | null })[]; user: LatLng | null }) {
  const center = user ?? FLORIPA;
  return <MapContainer center={[center.lat, center.lng]} zoom={11} scrollWheelZoom={false} className="h-72 w-full rounded-lg">
    <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    {user && <CircleMarker center={[user.lat, user.lng]} radius={8} pathOptions={{ color: "#2E7D32", fillOpacity: 0.8 }}><Popup>Você</Popup></CircleMarker>}
    {items.map((p) => <Marker key={p.id} position={[p.lat, p.lng]} icon={pin}><Popup><strong>{p.name}</strong><br />{p.area}{p.d !== null ? ` · ${formatKm(p.d)} km` : ""}</Popup></Marker>)}
  </MapContainer>;
}
