import React from 'react';
import { AlertOctagon, PhoneCall, MapPin, X, Navigation, CheckCircle } from 'lucide-react';

export default function SosAlertModal({ alert, onClose, onResolve }) {
  if (!alert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white dark:bg-[#111726] border-2 border-rose-600 rounded-2xl shadow-2xl p-6 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2.5 text-rose-600 dark:text-rose-500">
            <AlertOctagon className="w-6 h-6 shrink-0 animate-bounce" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Emergency SOS Beacon</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Details */}
        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
            <p className="font-bold text-rose-900 dark:text-rose-300 text-sm">{alert.userName}</p>
            <p className="text-slate-600 dark:text-slate-400 mt-0.5">{alert.vehicleModel || 'Convoy Member'}</p>
            {alert.notes && <p className="text-slate-700 dark:text-slate-300 italic mt-1.5 font-medium">"{alert.notes}"</p>}
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#161f33] border border-slate-200 dark:border-slate-700/60">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Emergency Family Contact</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{alert.emergencyContactName || 'Family Contact'}</span>
            </div>
            {alert.emergencyContactPhone && (
              <a
                href={`tel:${alert.emergencyContactPhone}`}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call {alert.emergencyContactPhone}</span>
              </a>
            )}
          </div>

          {alert.lat && alert.lng && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#161f33] border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400">
              <span className="flex items-center font-medium">
                <MapPin className="w-4 h-4 mr-1 text-rose-500" />
                GPS: {alert.lat.toFixed(4)}, {alert.lng.toFixed(4)}
              </span>
              <a
                href={`https://www.google.com/maps?q=${alert.lat},${alert.lng}`}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-sky-600 dark:text-sky-400 hover:underline"
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
            className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-[#172033]"
          >
            Acknowledge
          </button>
          {onResolve && (
            <button
              onClick={() => {
                onResolve(alert.sosEventId);
                onClose();
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm"
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
