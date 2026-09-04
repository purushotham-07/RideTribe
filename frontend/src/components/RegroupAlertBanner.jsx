import React from 'react';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';

export default function RegroupAlertBanner({ alert, onDismiss }) {
  if (!alert) return null;

  return (
    <div className="w-full bg-amber-500/10 border border-amber-500/20 text-foreground p-4 rounded-2xl flex items-center justify-between text-xs my-3 shadow-sm animate-in fade-in duration-200">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4 animate-pulse" />
        </div>
        <div>
          <p className="font-semibold text-sm text-foreground">{alert.message || `Convoy Checkpoint: Rider is ${alert.distanceFromGroupKm || '2.0'} km behind`}</p>
          <p className="text-muted-foreground text-xs mt-0.5">
            Lead rider please reduce cruising speed or regroup at next toll plaza / cafe.
          </p>
        </div>
      </div>

      <button
        onClick={onDismiss}
        className="w-7 h-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center justify-center transition-colors border border-border"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
