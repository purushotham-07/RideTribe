import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

const BANGALORE_PRESETS = [
  { name: 'Esteem Mall, Hebbal Flyover (Airport Rd / North)', lat: 13.0428, lng: 77.5912 },
  { name: 'Parle-G Toll Gate, Nelamangala (NH 48 / West)', lat: 13.0978, lng: 77.3912 },
  { name: 'NICE Road Toll Plaza (Tumkur Rd / South-West)', lat: 13.0315, lng: 77.4912 },
  { name: 'Silk Board Junction (Hosur Rd / South)', lat: 12.9176, lng: 77.6234 },
  { name: 'Attibele Toll Plaza (NH 44 / Border)', lat: 12.7845, lng: 77.7712 },
  { name: 'KIAL Airport Interchange (Devanahalli)', lat: 13.1989, lng: 77.7068 },
];

const TILE_PRESETS = {
  roadmap: {
    name: 'Road',
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

export default function MeetingPinMapPicker({
  selectedLat = 13.0428,
  selectedLng = 77.5912,
  meetingPointName = 'Esteem Mall, Hebbal Flyover (Airport Rd)',
  onChange
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const tileLayerRef = useRef(null);
  const [mapStyle, setMapStyle] = useState('roadmap');

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [selectedLat, selectedLng],
        zoom: 12,
        zoomControl: false,
      });

      const preset = TILE_PRESETS[mapStyle] || TILE_PRESETS.roadmap;
      const initialLayer = L.tileLayer(preset.url, {
        attribution: preset.attribution,
        maxZoom: 19,
        subdomains: preset.subdomains || ['a', 'b', 'c']
      }).addTo(map);
      tileLayerRef.current = initialLayer;

      // Custom Google-Maps style Teardrop Pin
      const pinIcon = L.divIcon({
        className: 'custom-meeting-pin-advanced',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="
              padding: 4px 9px;
              border-radius: 9999px;
              background: #0f172a;
              color: #ffffff;
              border: 2px solid #f04f23;
              font-size: 10px;
              font-weight: 800;
              box-shadow: 0 4px 14px rgba(0,0,0,0.5);
              white-space: nowrap;
              display: flex;
              align-items: center;
              gap: 3px;
            ">
              <span style="width: 5px; height: 5px; border-radius: 50%; background: #f04f23; animation: ping 1.5s infinite;"></span>
              <span>📍 Pinned Location</span>
            </div>
            <div style="width: 7px; height: 7px; background: #0f172a; transform: rotate(45deg); margin-top: -3.5px; border-right: 2px solid #f04f23; border-bottom: 2px solid #f04f23;"></div>
          </div>
        `,
        iconSize: [110, 28],
        iconAnchor: [55, 23],
      });

      const marker = L.marker([selectedLat, selectedLng], {
        icon: pinIcon,
        draggable: true
      }).addTo(map);

      // On map click -> move pin
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        if (onChange) {
          onChange({
            lat: Number(lat.toFixed(5)),
            lng: Number(lng.toFixed(5)),
            name: `Custom Meetup Point (${lat.toFixed(3)}, ${lng.toFixed(3)})`
          });
        }
      });

      // On marker drag end
      marker.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng();
        if (onChange) {
          onChange({
            lat: Number(lat.toFixed(5)),
            lng: Number(lng.toFixed(5)),
            name: `Custom Meetup Point (${lat.toFixed(3)}, ${lng.toFixed(3)})`
          });
        }
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Switch Layer
  const handleSwitchLayer = (styleKey) => {
    setMapStyle(styleKey);
    const preset = TILE_PRESETS[styleKey];
    if (mapInstanceRef.current && tileLayerRef.current && preset) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
      const newLayer = L.tileLayer(preset.url, {
        attribution: preset.attribution,
        maxZoom: 19,
        subdomains: preset.subdomains || ['a', 'b', 'c']
      }).addTo(mapInstanceRef.current);
      tileLayerRef.current = newLayer;
    }
  };

  // Update marker position if external prop changes
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng([selectedLat, selectedLng]);
      mapInstanceRef.current.panTo([selectedLat, selectedLng]);
    }
  }, [selectedLat, selectedLng]);

  const handleSelectPreset = (preset) => {
    if (onChange) {
      onChange({
        lat: preset.lat,
        lng: preset.lng,
        name: preset.name
      });
    }
  };

  return (
    <div className="space-y-2.5 w-full">
      
      {/* 1. OUTSIDE TOP: Header + Map Layer Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Rendezvous Location
          </label>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Click anywhere on the map or pick a preset:</span>
        </div>

        {/* Map Layer Switcher */}
        <div className="flex items-center space-x-1 bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 self-start sm:self-auto shrink-0">
          {Object.entries(TILE_PRESETS).map(([key, item]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleSwitchLayer(key)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors flex items-center space-x-1 ${
                mapStyle === key
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-xs font-semibold border border-zinc-200/80 dark:border-zinc-700'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preset Quick Chips */}
      <div className="flex flex-wrap gap-1.5">
        {BANGALORE_PRESETS.map((p) => {
          const isSelected = Math.abs(p.lat - selectedLat) < 0.005 && Math.abs(p.lng - selectedLng) < 0.005;
          const label = p.name.split('(')[0].trim();
          return (
            <button
              key={p.name}
              type="button"
              onClick={() => handleSelectPreset(p)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition-colors text-left ${
                isSelected
                  ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-transparent shadow-xs font-semibold'
                  : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* 2. INSIDE THE MAP: Clean Canvas with Pin */}
      <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xs bg-[#0c0d10]">
        <div ref={mapContainerRef} style={{ width: '100%', height: '220px' }} />
      </div>

      {/* 3. OUTSIDE BOTTOM: Selected Location Card */}
      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-xs flex items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center space-x-1.5 truncate">
          <MapPin className="w-3.5 h-3.5 text-[#f04f23] shrink-0" strokeWidth={1.75} />
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {meetingPointName}
          </span>
        </div>
        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono shrink-0 ml-1">
          [{selectedLat.toFixed(3)}, {selectedLng.toFixed(3)}]
        </span>
      </div>

    </div>
  );
}
