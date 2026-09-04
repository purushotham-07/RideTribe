import React from 'react';
import { Compass, Bike, ArrowLeft, Home, MapPin } from 'lucide-react';

export default function NotFoundPage({ onNavigateHome }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
        
        {/* Highway 404 Badge */}
        <div className="relative mx-auto w-20 h-20 rounded-3xl bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center shadow-lg">
          <Bike className="w-10 h-10 animate-bounce" />
          <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs">
            404
          </span>
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-sky-500 dark:text-sky-400">
            [ GPS ROUTE NOT FOUND ]
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
            Off the Highway Grid
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            The convoy route or page you are looking for has been moved, completed, or does not exist on this waypoint.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onNavigateHome}
            className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 shadow-md min-h-[44px]"
          >
            <Home className="w-4 h-4" />
            <span>Return to Explore Trips</span>
          </button>
        </div>

        {/* Waypoint metadata */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
          <span>RideTribe BLR Convoy Platform • Lat 12.9716, Lng 77.5946</span>
        </div>

      </div>
    </div>
  );
}
