import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useRideWebSocket } from '../hooks/useRideWebSocket';
import BangaloreMap from '../components/BangaloreMap';
import SosAlertModal from '../components/SosAlertModal';
import RegroupAlertBanner from '../components/RegroupAlertBanner';
import LiveSimulatorControl from '../components/LiveSimulatorControl';
import { ShieldAlert, Flag, Gauge, ArrowLeft, User, Radio } from 'lucide-react';

export default function LiveRidePage({ groupId, onCompleteRide, onBack }) {
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  // WebSocket Hook for Live Telemetry, Regroup & SOS
  const {
    connected,
    groupLocations,
    regroupAlert,
    sosAlert,
    sendLocation,
    sendSos,
    clearRegroupAlert,
    clearSosAlert
  } = useRideWebSocket(groupId, user);

  const fetchGroup = useCallback(async () => {
    try {
      const data = await api.getGroup(groupId);
      setGroup(data);
    } catch (err) {
      console.error("Error fetching group:", err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  // Handle SOS Click
  const handleTriggerSos = async () => {
    if (!group) return;
    const confirmTrigger = confirm("Emergency SOS: Broadcast your live coordinates to the entire group and trigger emergency alarm?");
    if (!confirmTrigger) return;

    try {
      const myLoc = groupLocations?.locations?.[user?.id] || { lat: group.meetingPointLat, lng: group.meetingPointLng };
      await sendSos({
        lat: myLoc.lat,
        lng: myLoc.lng,
        notes: "Emergency SOS triggered from Live Ride Cockpit"
      });
    } catch (err) {
      alert("Failed to trigger SOS: " + err.message);
    }
  };

  const handleResolveSos = async (sosEventId) => {
    try {
      if (sosEventId) {
        await api.resolveSos(sosEventId);
      }
      clearSosAlert();
    } catch (err) {
      console.error("Error resolving SOS:", err);
    }
  };

  const handleCompleteRide = async () => {
    if (!confirm("Complete this ride and submit peer ratings?")) return;
    setCompleting(true);
    try {
      await api.completeRide(groupId);
      if (onCompleteRide) onCompleteRide(groupId);
    } catch (err) {
      alert("Failed to complete ride: " + err.message);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-6 h-6 border-2 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 mt-2">Connecting to Live Convoy Cockpit...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <p className="text-sm text-slate-500">Group not found.</p>
        <button onClick={onBack} className="mt-3 px-3 py-1.5 rounded-lg border text-xs font-semibold">Back</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 space-y-4">
      
      {/* SOS Alert Modal */}
      <SosAlertModal
        alert={sosAlert}
        onClose={clearSosAlert}
        onResolve={handleResolveSos}
      />

      {/* Regroup Alert Banner */}
      <RegroupAlertBanner
        alert={regroupAlert}
        onDismiss={clearRegroupAlert}
      />

      {/* Top Cockpit Header */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {group.destination} Live Convoy
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>LIVE</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-1.5">
            <Radio className="w-3.5 h-3.5 text-slate-400 dark:text-white" />
            <span>STOMP Telemetry: <strong className={connected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>{connected ? 'Online' : 'Connecting...'}</strong> • {group.members?.length || 0} Riders</span>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* SOS Button */}
          <button
            onClick={handleTriggerSos}
            className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-colors flex items-center space-x-1.5 min-h-[44px]"
            title="Immediate Safety Alarm"
          >
            <ShieldAlert className="w-4 h-4 animate-bounce" />
            <span>SOS BEACON</span>
          </button>

          {/* Finish Ride Button */}
          <button
            onClick={handleCompleteRide}
            disabled={completing}
            className="py-2.5 px-4 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-black font-bold text-xs hover:opacity-90 shadow-sm transition-opacity disabled:opacity-50 flex items-center space-x-1.5 min-h-[44px]"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Finish Ride</span>
          </button>
        </div>
      </div>

      {/* Telemetry Simulator for Demo Testing */}
      <LiveSimulatorControl
        groupId={group.id}
        group={group}
        members={group.members}
        onSendLocation={sendLocation}
        onTriggerSos={handleTriggerSos}
      />

      {/* Main Grid: Map + Rider HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left: Leaflet Live Map (8 cols) */}
        <div className="lg:col-span-8">
          <BangaloreMap
            group={group}
            locations={groupLocations}
            height="580px"
          />
        </div>

        {/* Right: Telemetry HUD (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Convoy Telemetry HUD</span>
              <span className="text-slate-800 dark:text-white font-bold">{group.members?.length || 0} Riders</span>
            </h3>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {group.members?.map((m) => {
                const loc = groupLocations?.locations?.[m.user.id];
                const isMe = m.user.id === user?.id;
                const isLead = m.isLead || loc?.isLead;
                const isLagging = loc?.isLagging;
                const speed = loc?.speed ? Math.round(loc.speed) : 0;
                const distFromLead = loc?.distanceFromLeadKm !== undefined ? loc.distanceFromLeadKm : 0;

                return (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-xl border text-xs transition-colors ${
                      isLagging
                        ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 dark:border-rose-500/50'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161f33]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="relative w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 ring-1 ring-slate-300 dark:ring-white/30 flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
                          {m.user?.avatarUrl ? (
                            <img src={m.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1">
                            <span className="font-bold text-slate-900 dark:text-white">{m.user?.name}</span>
                            {isMe && <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-white dark:text-black font-bold">YOU</span>}
                            {isLead && <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-white/20 text-slate-800 dark:text-white font-bold border border-slate-300 dark:border-white/30">LEAD</span>}
                          </div>
                          <div className="flex items-center space-x-1 mt-0.5">
                            {m.user?.vehiclePhotoUrl && (
                              <img src={m.user.vehiclePhotoUrl} alt="" className="w-4 h-4 rounded object-cover border border-slate-300 dark:border-slate-700 shrink-0" />
                            )}
                            <p className="text-[10px] text-slate-500 truncate max-w-[120px]">{m.user?.vehicleModel || 'Rider'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">{speed} <span className="text-[10px] font-normal text-slate-500">km/h</span></span>
                        <p className={`text-[10px] font-medium ${isLagging ? 'text-rose-500 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                          {distFromLead > 0 ? `${distFromLead} km back` : 'Lead pos'}
                        </p>
                      </div>
                    </div>

                    {isLagging && (
                      <p className="mt-2 pt-1.5 border-t border-rose-200 dark:border-rose-500/30 text-[10px] text-rose-800 dark:text-rose-300 font-semibold flex items-center space-x-1">
                        <span>⚠️ Lagging &gt; 2.0 km behind convoy lead</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
