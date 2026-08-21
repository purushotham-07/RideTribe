import React from 'react';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';

export default function RegroupAlertBanner({ alert, onDismiss }) {
  if (!alert) return null;

  return (
    <div className="w-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-amber-200 p-4 rounded-2xl flex items-center justify-between text-xs my-3 shadow-md">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 border border-amber-500/40 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4 animate-pulse" />
        </div>
        <div>
          <p className="font-bold text-sm">{alert.message || `Convoy Checkpoint: Rider is ${alert.distanceFromGroupKm || '2.0'} km behind`}</p>
          <p className="text-amber-700 dark:text-amber-400 text-[11px] mt-0.5 font-medium">
            Lead rider please reduce cruising speed or regroup at next toll plaza / cafe.
          </p>
        </div>
      </div>

      <button
        onClick={onDismiss}
        className="p-1.5 rounded-lg text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
