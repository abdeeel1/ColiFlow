import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  Package, MapPin, Phone, BadgeCheck,
  WifiOff, Clock, ChevronDown, Truck,
} from 'lucide-react';
import axiosClient from '../services/axios';

const POLL_MS = 8000;

// ── custom map markers ───────────────────────────────────────────────────────
const dotIcon = (color) => L.divIcon({
  className: '',
  html: `<span style="display:block;width:16px;height:16px;border-radius:9999px;background:${color};border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></span>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const travelerIcon = L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:40px;height:40px;">
      <span style="position:absolute;inset:0;border-radius:9999px;background:rgba(9,132,227,.35);animation:cf-ping 1.4s cubic-bezier(0,0,.2,1) infinite;"></span>
      <span style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:32px;height:32px;border-radius:9999px;background:#0984E3;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;">🚚</span>
    </div>
    <style>@keyframes cf-ping{75%,100%{transform:scale(2);opacity:0}}</style>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// keeps the map framed on the relevant points; follows the traveler on updates
function MapController({ origin, destination, current, selectionKey }) {
  const map = useMap();
  const lastKey = useRef(null);

  useEffect(() => {
    const pts = [origin, destination, current].filter(Boolean).map((p) => [p.lat, p.lng]);
    if (pts.length === 0) return;

    if (lastKey.current !== selectionKey) {
      lastKey.current = selectionKey;
      if (pts.length === 1) map.setView(pts[0], 13);
      else map.fitBounds(pts, { padding: [60, 60] });
    } else if (current) {
      map.panTo([current.lat, current.lng], { animate: true });
    }
  }, [origin, destination, current, selectionKey, map]);

  return null;
}

function timeAgo(iso) {
  if (!iso) return null;
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `il y a ${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  return `il y a ${h} h`;
}

export default function LiveTracking({ packages = [] }) {
  // sender's colis currently in transit (have an in_transit travel request)
  const inTransit = useMemo(
    () => packages
      .filter((p) => p.travel_requests?.[0]?.status === 'in_transit')
      .map((p) => ({ trId: p.travel_requests[0].id, pkg: p })),
    [packages],
  );

  const [chosenTrId, setChosenTrId] = useState(null);
  const [loc, setLoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [, setTick] = useState(0); // forces "timeAgo" refresh on interval

  // effective selection: user choice, falling back to the first in-transit colis
  const selectedTrId = (chosenTrId != null && inTransit.some((x) => x.trId === chosenTrId))
    ? chosenTrId
    : (inTransit[0]?.trId ?? null);

  // poll the selected colis location
  useEffect(() => {
    if (selectedTrId == null) return undefined;
    let alive = true;
    const fetchLoc = (first) => {
      if (first) setLoading(true);
      axiosClient.get(`/api/travel-requests/${selectedTrId}/location`)
        .then((r) => { if (alive) setLoc(r.data); })
        .catch(() => {})
        .finally(() => { if (alive) setLoading(false); });
    };
    fetchLoc(true);
    const id = setInterval(() => fetchLoc(false), POLL_MS);
    return () => { alive = false; clearInterval(id); setLoc(null); };
  }, [selectedTrId]);

  // refresh the "updated X ago" label every 5s
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(id);
  }, []);

  const selected = inTransit.find((x) => x.trId === selectedTrId);
  const current = loc?.position ? { lat: loc.position.lat, lng: loc.position.lng } : null;
  const origin = loc?.origin?.lat != null ? loc.origin : null;
  const destination = loc?.destination?.lat != null ? loc.destination : null;
  const isOffline = loc && (!loc.online || !current);

  const polyPts = [origin, current, destination]
    .filter(Boolean)
    .map((p) => [p.lat, p.lng]);

  if (inTransit.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60">
        <Truck size={42} className="mb-3 opacity-30" />
        <p className="font-semibold text-gray-600 dark:text-gray-300">Aucune livraison en cours</p>
        <p className="text-xs mt-1">Le suivi en direct s'affiche dès qu'un voyageur récupère votre colis.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-0 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 overflow-hidden shadow-xs">

      {/* ── LEFT PANEL ── */}
      <div className="w-full lg:w-80 shrink-0 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-700/60 flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <MapPin size={18} className="text-[#0984E3]" /> Localisation des colis
          </h3>
        </div>

        {/* colis selector */}
        <div className="px-5 py-4">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Sélectionner un colis</label>
          <div className="relative mt-2">
            <select
              value={selectedTrId ?? ''}
              onChange={(e) => setChosenTrId(Number(e.target.value))}
              className="appearance-none w-full pl-3 pr-9 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-[#0984E3] cursor-pointer"
            >
              {inTransit.map(({ trId, pkg }) => (
                <option key={trId} value={trId}>
                  #CF-{String(pkg.id).padStart(3, '0')} ({pkg.from_city?.name} → {pkg.to_city?.name})
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* traveler card */}
        {loc?.traveler && (
          <div className="px-5 pb-4">
            <div className="bg-gray-50 dark:bg-gray-700/40 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={loc.traveler.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(loc.traveler.name)}&background=0984E3&color=fff`}
                  alt={loc.traveler.name}
                  className="w-12 h-12 rounded-full object-cover bg-blue-100 dark:bg-blue-950/40"
                />
                <div className="min-w-0">
                  <p className="font-bold text-gray-800 dark:text-gray-100 truncate flex items-center gap-1">
                    {loc.traveler.name}
                    {loc.traveler.verified && <BadgeCheck size={15} className="text-[#0984E3]" fill="#0984E3" color="#fff" />}
                  </p>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold ${isOffline ? 'text-red-500' : 'text-green-600'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isOffline ? 'bg-red-500' : 'bg-green-500'}`} />
                    {isOffline ? 'Hors ligne' : 'En ligne'}
                  </span>
                </div>
              </div>

              {loc.traveler.phone && (
                <a href={`tel:${loc.traveler.phone}`} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-[#0984E3]">
                  <Phone size={14} className="text-green-500" /> {loc.traveler.phone}
                </a>
              )}

              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Clock size={13} />
                {current && loc.position?.updated_at
                  ? `Position ${timeAgo(loc.position.updated_at)}`
                  : 'En attente de position…'}
              </div>
            </div>
          </div>
        )}

        {/* route summary */}
        {selected && (
          <div className="px-5 pb-5 mt-auto">
            <div className="flex items-center gap-3 text-sm">
              <div className="flex flex-col items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="w-px h-6 bg-gray-200 dark:bg-gray-600" />
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-gray-700 dark:text-gray-200 capitalize">{loc?.origin?.name ?? selected.pkg.from_city?.name}</span>
                <span className="text-gray-700 dark:text-gray-200 capitalize">{loc?.destination?.name ?? selected.pkg.to_city?.name}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── MAP ── */}
      <div className="relative flex-1 min-h-[60vh] lg:min-h-[70vh]">
        {/* offline banner */}
        {isOffline && !loading && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-1000 flex items-center gap-2 bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-lg max-w-[90%]">
            <WifiOff size={16} className="shrink-0" />
            Signal perdu : le voyageur est actuellement hors ligne. Nous affichons sa dernière position connue.
          </div>
        )}

        <MapContainer center={[31.7917, -7.0926]} zoom={6} zoomControl className="w-full h-full">
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {origin && (
            <Marker position={[origin.lat, origin.lng]} icon={dotIcon('#00B894')}>
              <Popup>Départ : {origin.name}</Popup>
            </Marker>
          )}
          {destination && (
            <Marker position={[destination.lat, destination.lng]} icon={dotIcon('#E74C3C')}>
              <Popup>Arrivée : {destination.name}</Popup>
            </Marker>
          )}
          {current && (
            <Marker position={[current.lat, current.lng]} icon={travelerIcon}>
              <Popup>
                {loc?.traveler?.name} — {loc?.package?.name}
                <br />Position {timeAgo(loc?.position?.updated_at)}
              </Popup>
            </Marker>
          )}

          {polyPts.length >= 2 && (
            <Polyline positions={polyPts} pathOptions={{ color: '#0984E3', weight: 3, dashArray: '6 8', opacity: 0.7 }} />
          )}

          <MapController origin={origin} destination={destination} current={current} selectionKey={selectedTrId} />
        </MapContainer>

        {/* waiting overlay */}
        {!current && !isOffline && (
          <div className="absolute inset-0 z-1000 flex flex-col items-center justify-center bg-white/60 dark:bg-gray-900/50 backdrop-blur-sm">
            <Package size={40} className="text-[#0984E3] mb-3 animate-pulse" />
            <p className="font-semibold text-gray-700 dark:text-gray-200">En attente de la position du voyageur…</p>
            <p className="text-xs text-gray-500 mt-1">Le voyageur doit activer le partage de sa position.</p>
          </div>
        )}
      </div>
    </div>
  );
}
