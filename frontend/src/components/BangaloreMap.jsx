import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTheme } from '../context/ThemeContext';

function MapViewController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || 11, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

export default function BangaloreMap({
  group,
  locations,
  showRoute = true,
  height = "520px"
}) {
  const { isDark } = useTheme();

  // Coordinates
  const meetingLat = group?.meetingPointLat || 13.0428;
  const meetingLng = group?.meetingPointLng || 77.5912;
  const destLat = group?.destinationLat || 13.3702;
  const destLng = group?.destinationLng || 77.6835;

  const defaultCenter = useMemo(() => [meetingLat, meetingLng], [meetingLat, meetingLng]);

  const routePoints = useMemo(() => {
    return [
      [meetingLat, meetingLng],
      [destLat, destLng]
    ];
  }, [meetingLat, meetingLng, destLat, destLng]);

  // Clean custom marker generator
  const createRiderIcon = (loc, isLead, isLagging, hasSos) => {
    let strokeColor = isDark ? '#ffffff' : '#0f172a';
    let bgBadge = isDark ? '#ffffff' : '#0f172a';
    let textBadge = isDark ? '#000000' : '#ffffff';
    let pulseRing = '';

    if (hasSos) {
      strokeColor = '#ef4444';
      bgBadge = '#dc2626';
      textBadge = '#ffffff';
      pulseRing = '<div style="position: absolute; inset: -6px; border-radius: 50%; background: rgba(239, 68, 68, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>';
    } else if (isLagging) {
      strokeColor = '#f59e0b';
      bgBadge = '#d97706';
      textBadge = '#ffffff';
      pulseRing = '<div style="position: absolute; inset: -4px; border-radius: 50%; background: rgba(245, 158, 11, 0.3); animation: pulse 2s infinite;"></div>';
    } else if (isLead) {
      strokeColor = isDark ? '#ffffff' : '#0f172a';
      bgBadge = isDark ? '#ffffff' : '#0f172a';
      textBadge = isDark ? '#000000' : '#ffffff';
    }

    const avatarUrl = loc.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";

    const html = `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        ${pulseRing}
        <div style="width: 38px; height: 38px; border-radius: 50%; border: 3px solid ${strokeColor}; background: #0b0f19; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.5); z-index: 2;">
          <img src="${avatarUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="" />
        </div>
        <div style="margin-top: 3px; padding: 2px 7px; border-radius: 6px; font-size: 10px; font-weight: 700; background: ${bgBadge}; color: ${textBadge}; box-shadow: 0 2px 6px rgba(0,0,0,0.4); white-space: nowrap; z-index: 2; border: 1px solid rgba(255,255,255,0.2);">
          ${isLead ? '👑 ' : ''}${loc.userName ? loc.userName.split(' ')[0] : 'Rider'} ${loc.speed ? `(${Math.round(loc.speed)}km/h)` : ''}
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-rider-icon',
      iconSize: [38, 52],
      iconAnchor: [19, 26],
      popupAnchor: [0, -26]
    });
  };

  const createCheckpointIcon = (label, isDest = false) => {
    const bg = isDest ? '#10b981' : (isDark ? '#ffffff' : '#0f172a');
    const text = isDest ? '#ffffff' : (isDark ? '#000000' : '#ffffff');
    const html = `
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div style="padding: 3px 9px; border-radius: 6px; background: ${bg}; color: ${text}; font-size: 11px; font-weight: 800; box-shadow: 0 4px 10px rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.3); white-space: nowrap;">
          ${isDest ? '🏁 ' : '📍 '}${label}
        </div>
        <div style="width: 6px; height: 6px; background: ${bg}; transform: rotate(45deg); margin-top: -3px;"></div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-rider-icon',
      iconSize: [110, 28],
      iconAnchor: [55, 22],
      popupAnchor: [0, -22]
    });
  };

  const locationList = useMemo(() => {
    if (!locations || !locations.locations) return [];
    return Object.values(locations.locations);
  }, [locations]);

  // CartoDB Dark Matter for Dark Mode, CartoDB Voyager for Light Mode
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0b0f19] shadow-lg dark:shadow-2xl" style={{ height }}>
      <MapContainer
        center={defaultCenter}
        zoom={11}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          key={isDark ? 'dark-tiles' : 'light-tiles'}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={tileUrl}
        />

        <MapViewController center={defaultCenter} zoom={11} />

        {/* Route Line */}
        {showRoute && (
          <>
            <Polyline
              positions={routePoints}
              pathOptions={{
                color: isDark ? '#ffffff' : '#0f172a',
                weight: 3.5,
                opacity: 0.9,
                dashArray: '8, 8'
              }}
            />
            <Circle
              center={[meetingLat, meetingLng]}
              radius={800}
              pathOptions={{
                color: isDark ? '#ffffff' : '#0f172a',
                fillColor: isDark ? '#ffffff' : '#0f172a',
                fillOpacity: 0.1,
                weight: 1.5
              }}
            />
          </>
        )}

        {/* Meetup Pin */}
        <Marker
          position={[meetingLat, meetingLng]}
          icon={createCheckpointIcon(group?.meetingPointName ? group.meetingPointName.split(',')[0] : 'Meetup', false)}
        >
          <Popup>
            <div className="p-1 text-xs">
              <p className="font-bold text-slate-900 dark:text-white">📍 Bangalore Meetup Point</p>
              <p className="text-slate-700 dark:text-slate-200 font-semibold mt-0.5">{group?.meetingPointName}</p>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Scheduled Departure: {group?.scheduledTime}</p>
            </div>
          </Popup>
        </Marker>

        {/* Destination Pin */}
        {destLat && destLng && (
          <Marker
            position={[destLat, destLng]}
            icon={createCheckpointIcon(group?.destination || 'Destination', true)}
          >
            <Popup>
              <div className="p-1 text-xs">
                <p className="font-bold text-emerald-600 dark:text-emerald-400">🏁 Destination Checkpoint</p>
                <p className="text-slate-700 dark:text-slate-200 font-semibold mt-0.5">{group?.destination}</p>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Total Distance: ~{group?.estimatedDistanceKm || 60} km</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Live Rider Markers */}
        {locationList.map((loc) => {
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
                <div className="p-1 text-xs min-w-[150px]">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{loc.userName}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">{loc.vehicleModel || 'Rider'}</p>
                  <div className="mt-2 pt-1.5 border-t border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
                    <p className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Speed:</span>
                      <strong className="text-slate-900 dark:text-white">{loc.speed ? `${Math.round(loc.speed)} km/h` : '0 km/h'}</strong>
                    </p>
                    {loc.distanceFromLeadKm !== undefined && (
                      <p className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">From Lead:</span>
                        <strong className={loc.distanceFromLeadKm >= 2.0 ? 'text-rose-500 font-bold' : 'text-slate-900 dark:text-white'}>
                          {loc.distanceFromLeadKm} km
                        </strong>
                      </p>
                    )}
                    {isLead && <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 bg-white/20 text-white rounded border border-white/30">👑 Group Lead</span>}
                    {loc.onMyWay && <span className="inline-block mt-1 ml-1 text-[9px] font-bold px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30">En Route</span>}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map telemetry badge */}
      <div className="absolute top-3 left-3 z-20 pointer-events-none">
        <div className="px-3 py-1.5 rounded-xl bg-white/95 dark:bg-[#111726]/95 backdrop-blur-md border border-slate-200 dark:border-white/20 text-xs font-bold text-slate-800 dark:text-white shadow-md flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>{locationList.length > 0 ? `${locationList.length} Riders in Convoy` : 'Meetup Checkpoint'}</span>
        </div>
      </div>
    </div>
  );
}
