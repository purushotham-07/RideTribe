import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Clock } from 'lucide-react';

const TILE_LAYERS = {
  navigation: {
    name: 'Road Map',
    icon: '🗺️',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    subdomains: ['a', 'b', 'c']
  },
  satellite: {
    name: 'Satellite',
    icon: '🛰️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri World Imagery',
    subdomains: ['a', 'b', 'c']
  }
};

function MapBoundsFitter({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points && points.length >= 2) {
      try {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [35, 35], maxZoom: 13, animate: true });
      } catch (e) {
        console.warn("Bounds fit error:", e);
      }
    }
  }, [points, map]);
  return null;
}

export default function BangaloreMap({
  group,
  locations,
  showRoute = true,
  isLiveRide = false,
  height = "260px"
}) {
  const [mapStyle, setMapStyle] = useState('navigation');

  // Coordinates
  const meetingLat = group?.meetingPointLat || 13.0428;
  const meetingLng = group?.meetingPointLng || 77.5912;
  const destLat = group?.destinationLat || 13.3702;
  const destLng = group?.destinationLng || 77.6835;

  const defaultCenter = useMemo(() => [meetingLat, meetingLng], [meetingLat, meetingLng]);

  // Real Turn-by-Turn Road Geometry State
  const [accurateRoadPoints, setAccurateRoadPoints] = useState([
    [meetingLat, meetingLng],
    [destLat, destLng]
  ]);
  const [drivingDistanceKm, setDrivingDistanceKm] = useState(group?.estimatedDistanceKm || 60);
  const [drivingDurationMin, setDrivingDurationMin] = useState(null);

  // Fetch real Google Maps style road navigation curve from OSRM
  useEffect(() => {
    if (!meetingLat || !meetingLng || !destLat || !destLng) return;

    let isMounted = true;
    const url = `https://router.project-osrm.org/route/v1/driving/${meetingLng},${meetingLat};${destLng},${destLat}?overview=full&geometries=geojson`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const leafletPoints = route.geometry.coordinates.map(c => [c[1], c[0]]);
          setAccurateRoadPoints(leafletPoints);
          if (route.distance) {
            setDrivingDistanceKm(Number((route.distance / 1000).toFixed(1)));
          }
          if (route.duration) {
            setDrivingDurationMin(Math.round(route.duration / 60));
          }
        }
      })
      .catch((err) => {
        console.warn("OSRM Highway Route fetch error:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [meetingLat, meetingLng, destLat, destLng]);

  // Top-Notch Rider Icon Generator
  const createRiderIcon = (loc, isLead, isLagging, hasSos) => {
    let borderColor = '#3b82f6';
    let ringPing = '';

    if (hasSos) {
      borderColor = '#ef4444';
      ringPing = '<div style="position: absolute; inset: -6px; border-radius: 50%; background: rgba(239, 68, 68, 0.45); animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>';
    } else if (isLagging) {
      borderColor = '#f59e0b';
      ringPing = '<div style="position: absolute; inset: -4px; border-radius: 50%; background: rgba(245, 158, 11, 0.35); animation: pulse 1.8s infinite;"></div>';
    } else if (isLead) {
      borderColor = '#38bdf8';
      ringPing = '<div style="position: absolute; inset: -4px; border-radius: 50%; background: rgba(56, 189, 248, 0.3); animation: pulse 2.2s infinite;"></div>';
    }

    const avatarUrl = loc.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";

    const html = `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        ${ringPing}
        <div style="position: relative; width: 34px; height: 34px; border-radius: 50%; border: 2.5px solid ${borderColor}; background: #0f172a; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.5); z-index: 2;">
          <img src="${avatarUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="" />
        </div>
        <div style="margin-top: 2px; padding: 2px 6px; border-radius: 9999px; font-size: 9px; font-weight: 800; background: #090d16; color: #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.5); white-space: nowrap; z-index: 2; border: 1px solid ${borderColor}; display: flex; align-items: center; gap: 2px;">
          ${isLead ? '👑' : ''}
          <span>${loc.userName ? loc.userName.split(' ')[0] : 'Rider'}</span>
          <span style="color: #38bdf8;">${loc.speed ? `${Math.round(loc.speed)}k` : ''}</span>
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-top-rider-icon',
      iconSize: [36, 46],
      iconAnchor: [18, 23],
      popupAnchor: [0, -23]
    });
  };

  // Google Maps Pin Markers
  const createStartTeardropIcon = (label) => {
    const html = `
      <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="padding: 3.5px 8px; border-radius: 8px; background: #059669; color: #ffffff; font-size: 10px; font-weight: 800; box-shadow: 0 3px 10px rgba(0,0,0,0.4); border: 1.5px solid #ffffff; white-space: nowrap;">
          📍 ${label}
        </div>
        <div style="width: 6px; height: 6px; background: #059669; transform: rotate(45deg); margin-top: -3px; border-right: 1.5px solid #ffffff; border-bottom: 1.5px solid #ffffff;"></div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-start-pin',
      iconSize: [120, 28],
      iconAnchor: [60, 22],
      popupAnchor: [0, -22]
    });
  };

  const createDestCheckeredIcon = (label) => {
    const html = `
      <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="padding: 3.5px 8px; border-radius: 8px; background: #e11d48; color: #ffffff; font-size: 10px; font-weight: 800; box-shadow: 0 3px 10px rgba(0,0,0,0.4); border: 1.5px solid #ffffff; white-space: nowrap;">
          🏁 ${label}
        </div>
        <div style="width: 6px; height: 6px; background: #e11d48; transform: rotate(45deg); margin-top: -3px; border-right: 1.5px solid #ffffff; border-bottom: 1.5px solid #ffffff;"></div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-dest-pin',
      iconSize: [120, 28],
      iconAnchor: [60, 22],
      popupAnchor: [0, -22]
    });
  };

  const locationList = useMemo(() => {
    if (!isLiveRide || !locations || !locations.locations) return [];
    return Object.values(locations.locations);
  }, [isLiveRide, locations]);

  const activeTileConfig = TILE_LAYERS[mapStyle] || TILE_LAYERS.navigation;

  return (
    <div className="space-y-2.5 w-full">
      
      {/* 1. OUTSIDE TOP CARD: Route Navigation Info + Layer Switcher */}
      <div className="p-3 rounded-xl bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        
        {/* Left: Route Summary & Distance / ETA */}
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center font-bold shrink-0 shadow-xs">
            {isLiveRide ? (
              <span className="w-2 h-2 rounded-full bg-[#f04f23] animate-ping"></span>
            ) : (
              <Navigation className="w-4 h-4 text-[#f04f23]" strokeWidth={2} />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center space-x-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium truncate">
              <span className="text-zinc-900 dark:text-zinc-100 font-semibold truncate">
                {group?.meetingPointName ? group.meetingPointName.split(',')[0] : 'Meetup'}
              </span>
              <span className="text-zinc-400">➔</span>
              <span className="text-[#f04f23] font-semibold truncate">
                {group?.destination || 'Destination'}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 font-mono">
              <span className="text-[#f04f23] font-bold">
                {drivingDistanceKm} km
              </span>
              {drivingDurationMin && (
                <>
                  <span className="text-zinc-300 dark:text-zinc-700">•</span>
                  <span className="text-zinc-500 dark:text-zinc-400 font-normal flex items-center font-sans">
                    <Clock className="w-3 h-3 mr-1 text-zinc-400" strokeWidth={1.75} />
                    {drivingDurationMin >= 60 ? `${Math.floor(drivingDurationMin / 60)}h ${drivingDurationMin % 60}m` : `${drivingDurationMin} min`}
                  </span>
                </>
              )}
              {isLiveRide && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#f04f23]/15 text-[#f04f23] text-[10px] font-mono font-bold uppercase">
                  {locationList.length} Live
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Map Style Tabs (Road / Satellite / Dark) */}
        <div className="flex items-center space-x-1 bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 self-start sm:self-auto shrink-0">
          {Object.entries(TILE_LAYERS).map(([key, item]) => (
            <button
              key={key}
              type="button"
              onClick={() => setMapStyle(key)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors flex items-center space-x-1 ${
                mapStyle === key
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-xs font-semibold border border-zinc-200/80 dark:border-zinc-700'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

      </div>

      {/* 2. INSIDE THE MAP: Clean Canvas with Zero Button Clutter */}
      <div
        className="relative w-full rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-[#0c0d10] shadow-xs"
        style={{ height }}
      >
        <MapContainer
          center={defaultCenter}
          zoom={11}
          scrollWheelZoom={true}
          zoomControl={false}
          className="w-full h-full"
        >
          <TileLayer
            key={mapStyle}
            attribution={activeTileConfig.attribution}
            url={activeTileConfig.url}
            maxZoom={19}
            subdomains={activeTileConfig.subdomains || ['a', 'b', 'c']}
          />

          <MapBoundsFitter points={accurateRoadPoints} />

          {/* 🛣️ Signal Orange High-Precision Highway Route Line */}
          {showRoute && accurateRoadPoints.length > 1 && (
            <>
              {/* Layer 1: Dark Outer Road Casing */}
              <Polyline
                positions={accurateRoadPoints}
                pathOptions={{
                  color: '#0c0d10',
                  weight: 6.5,
                  opacity: 0.9,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              />

              {/* Layer 2: Confident Signal Road Accent (#f04f23) */}
              <Polyline
                positions={accurateRoadPoints}
                pathOptions={{
                  color: '#f04f23',
                  weight: 3.5,
                  opacity: 1,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              />

              {/* Start Circle */}
              <Circle
                center={[meetingLat, meetingLng]}
                radius={600}
                pathOptions={{
                  color: '#10b981',
                  fillColor: '#10b981',
                  fillOpacity: 0.12,
                  weight: 1.5
                }}
              />

              {/* Destination Circle */}
              <Circle
                center={[destLat, destLng]}
                radius={600}
                pathOptions={{
                  color: '#f04f23',
                  fillColor: '#f04f23',
                  fillOpacity: 0.12,
                  weight: 1.5
                }}
              />
            </>
          )}

          {/* 📍 Meetup Checkpoint Pin */}
          <Marker
            position={[meetingLat, meetingLng]}
            icon={createStartTeardropIcon(group?.meetingPointName ? group.meetingPointName.split(',')[0] : 'Meetup')}
          >
            <Popup>
              <div className="p-1 text-xs">
                <p className="font-bold text-emerald-600 dark:text-emerald-400">📍 Bangalore Meetup Point</p>
                <p className="text-slate-800 dark:text-white font-semibold mt-0.5">{group?.meetingPointName}</p>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Scheduled Time: {group?.scheduledTime}</p>
              </div>
            </Popup>
          </Marker>

          {/* 🏁 Destination Checkpoint Pin */}
          <Marker
            position={[destLat, destLng]}
            icon={createDestCheckeredIcon(group?.destination || 'Destination')}
          >
            <Popup>
              <div className="p-1 text-xs">
                <p className="font-bold text-rose-600 dark:text-rose-400">🏁 Destination Checkpoint</p>
                <p className="text-slate-800 dark:text-white font-semibold mt-0.5">{group?.destination}</p>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Total Highway Run: ~{drivingDistanceKm} km {drivingDurationMin ? `(~${drivingDurationMin} min)` : ''}
                </p>
              </div>
            </Popup>
          </Marker>

          {/* 🏍️ Live Rider Markers (Rendered ONLY when ride is live / in progress) */}
          {isLiveRide && locationList.map((loc) => {
            if (!loc.lat || !loc.lng) return null;
            const isLead = Boolean(loc.isLead);
            const isLagging = Boolean(loc.isLagging);
            const hasSos = Boolean(loc.hasSos);

            return (
              <Marker
                key={loc.userId}
                position={[loc.lat, loc.lng]}
                icon={createRiderIcon(loc, isLead, isLagging, hasSos)}
              >
                <Popup>
                  <div className="p-1 text-xs min-w-[140px]">
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{loc.userName}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px]">{loc.vehicleModel || 'Rider'}</p>
                    <div className="mt-1.5 pt-1 border-t border-slate-200 dark:border-slate-800 text-[10px] space-y-0.5">
                      <p className="flex justify-between">
                        <span className="text-slate-400">Speed:</span>
                        <strong>{loc.speed ? `${Math.round(loc.speed)} km/h` : '0 km/h'}</strong>
                      </p>
                      {loc.distanceFromLeadKm !== undefined && (
                        <p className="flex justify-between">
                          <span className="text-slate-400">From Lead:</span>
                          <strong className={loc.distanceFromLeadKm >= 2.0 ? 'text-rose-500' : ''}>
                            {loc.distanceFromLeadKm} km
                          </strong>
                        </p>
                      )}
                      {isLead && <span className="inline-block mt-0.5 text-[8px] font-bold px-1.5 py-0.2 bg-blue-500/20 text-blue-400 rounded">👑 Group Lead</span>}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        </MapContainer>
      </div>

    </div>
  );
}
