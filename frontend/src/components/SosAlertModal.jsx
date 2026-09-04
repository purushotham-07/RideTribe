import React from 'react';
import { AlertOctagon, PhoneCall, MapPin, X, Navigation, CheckCircle } from 'lucide-react';

export default function SosAlertModal({ alert, onClose, onResolve }) {
  if (!alert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-[#0c0d10] text-zinc-900 dark:text-zinc-100 border-2 border-rose-500 rounded-2xl shadow-2xl p-6 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center space-x-2.5 text-rose-500">
            <AlertOctagon className="w-5 h-5 shrink-0 animate-bounce" />
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Emergency SOS Beacon</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Details */}
        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
            <p className="font-bold text-rose-600 dark:text-rose-400 text-sm">{alert.userName}</p>
            <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">{alert.vehicleModel || 'Convoy Member'}</p>
            {alert.notes && <p className="text-zinc-800 dark:text-zinc-200 italic mt-1.5 font-medium">"{alert.notes}"</p>}
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800">
            <div>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase block font-semibold">Emergency Family Contact</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{alert.emergencyContactName || 'Family Contact'}</span>
            </div>
            {alert.emergencyContactPhone && (
              <a
                href={`tel:${alert.emergencyContactPhone}`}
                className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-sm"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call {alert.emergencyContactPhone}</span>
              </a>
            )}
          </div>

          {alert.lat && alert.lng && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
              <span className="flex items-center font-medium">
                <MapPin className="w-4 h-4 mr-1 text-rose-500" />
                GPS: {alert.lat.toFixed(4)}, {alert.lng.toFixed(4)}
              </span>
              <a
                href={`https://www.google.com/maps?q=${alert.lat},${alert.lng}`}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-[#f04f23] hover:underline"
              >
                Open in Maps ↗
              </a>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex space-x-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-3 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-medium bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Acknowledge
          </button>
          {onResolve && (
            <button
              onClick={() => {
                onResolve(alert.sosEventId);
                onClose();
              }}
              className="flex-1 py-2.5 px-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Mark Resolved</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
