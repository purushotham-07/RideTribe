import React from 'react';
import { Navigation, AlertTriangle, CheckCircle2, Radio, MapPin, Gauge } from 'lucide-react';

export default function LiveGpsBadgeControl({
  gpsActive,
  coords,
  permissionStatus,
  error,
  onRequestPermission,
  isLiveMode,
  onToggleMode
}) {
  return (
    <div className="p-3 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-2.5 h-2.5 rounded-full ${gpsActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center space-x-1">
            <Navigation className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
            <span>Rider Live Location Access</span>
          </h4>
        </div>

        {/* Mode Toggle Button */}
        {onToggleMode && (
          <button
            type="button"
            onClick={onToggleMode}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all ${
              isLiveMode
                ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-transparent shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            {isLiveMode ? '🛰️ Real Device GPS' : '🎮 Route Simulator'}
          </button>
        )}
      </div>

      {gpsActive && coords ? (
        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2 text-emerald-900 dark:text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">
              Live GPS Locked: [{coords.lat?.toFixed(4)}, {coords.lng?.toFixed(4)}]
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
            <span className="flex items-center space-x-1">
              <Gauge className="w-3 h-3" />
              <span>Speed: <strong>{coords.speed || 0} km/h</strong></span>
            </span>
            <span>Accuracy: <strong>±{coords.accuracy || 5}m</strong></span>
          </div>
        </div>
      ) : permissionStatus === 'denied' ? (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-start space-x-2.5 text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold">Location permission is blocked in your browser</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300/90 leading-relaxed">
                Click the <strong>tune / padlock icon</strong> next to the URL address bar &gt; set <strong>Location</strong> to <em>Allow</em>, or switch to <strong>Route Simulator</strong> mode above.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRequestPermission}
            className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold whitespace-nowrap shadow-xs transition-colors"
          >
            Retry Location
          </button>
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#161f33] border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between gap-2">
          <span className="text-slate-600 dark:text-slate-300 text-[11px]">
            Acquiring device satellite coordinates for convoy tracking...
          </span>
          <button
            type="button"
            onClick={onRequestPermission}
            className="px-3 py-1 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-black text-[11px] font-bold hover:opacity-90 whitespace-nowrap shadow-xs"
          >
            Allow Location Access
          </button>
        </div>
      )}
    </div>
  );
}
