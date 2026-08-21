import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, AlertTriangle, RotateCcw } from 'lucide-react';

export default function LiveSimulatorControl({
  groupId,
  group,
  members,
  onSendLocation,
  onTriggerSos,
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [simulatedLag, setSimulatedLag] = useState(false);
  const timerRef = useRef(null);

  const startLat = group?.meetingPointLat || 13.0428;
  const startLng = group?.meetingPointLng || 77.5912;
  const endLat = group?.destinationLat || 13.3702;
  const endLng = group?.destinationLng || 77.6835;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const toggleSimulation = () => {
    if (isRunning) {
      clearInterval(timerRef.current);
      setIsRunning(false);
    } else {
      setIsRunning(true);
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          const next = prev >= 100 ? 0 : prev + 1.5;
          broadcastSimulatedStep(next, simulatedLag);
          return next;
        });
      }, 2000);
    }
  };

  const broadcastSimulatedStep = (tPercent, lagRider) => {
    if (!members || members.length === 0) return;
    const t = tPercent / 100;

    members.forEach((m, idx) => {
      const isLead = idx === 0;
      const offset = (idx * 0.003) * (1 - t);

      let riderT = t;
      if (lagRider && idx === 1) {
        riderT = Math.max(0, t - 0.08); // rider #2 falls >2.5 km behind
      } else {
        riderT = Math.max(0, t - (idx * 0.008));
      }

      const curLat = startLat + (endLat - startLat) * riderT + (idx % 2 === 0 ? offset : -offset);
      const curLng = startLng + (endLng - startLng) * riderT;
      const speed = isRunning ? 75 : 0;
      const heading = 18.5;

      onSendLocation({
        userId: m.user.id,
        userName: m.user.name,
        avatarUrl: m.user.avatarUrl,
        vehicleModel: m.user.vehicleModel,
        lat: curLat,
        lng: curLng,
        speed,
        heading,
        isLead,
        onMyWay: true
      });
    });
  };

  const handleLagToggle = () => {
    const nextState = !simulatedLag;
    setSimulatedLag(nextState);
    broadcastSimulatedStep(progress, nextState);
  };

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setProgress(0);
    setSimulatedLag(false);
    broadcastSimulatedStep(0, false);
  };

  return (
    <div className="p-3.5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-center space-x-2">
        <span className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`}></span>
        <span className="font-bold text-slate-900 dark:text-white">Convoy Telemetry Simulator</span>
        <span className="text-slate-500 dark:text-slate-400 text-[11px] hidden md:inline">
          (Simulate highway GPS coordinates, lag regroup alert, and SOS triggers)
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={toggleSimulation}
          className={`py-2 px-3.5 rounded-xl font-bold text-xs border flex items-center space-x-1.5 transition-colors ${
            isRunning
              ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
              : 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 border-transparent hover:opacity-90'
          }`}
        >
          {isRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isRunning ? 'Pause Simulator' : 'Simulate Convoy'}</span>
        </button>

        <button
          onClick={handleLagToggle}
          className={`py-2 px-3.5 rounded-xl font-bold text-xs border flex items-center space-x-1.5 transition-colors ${
            simulatedLag
              ? 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900'
              : 'bg-slate-50 dark:bg-[#172033] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-[#1e293b]'
          }`}
          title="Simulate 1 rider falling >2km behind"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{simulatedLag ? 'Lagging Active (2.5km)' : 'Test Lag Alert'}</span>
        </button>

        <button
          onClick={handleReset}
          className="p-2 rounded-xl border border-slate-300 dark:border-slate-700/80 text-slate-500 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-[#172033]"
          title="Reset positions"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
