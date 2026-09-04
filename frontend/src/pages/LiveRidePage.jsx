import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useRideWebSocket } from '../hooks/useRideWebSocket';
import { useLiveGeolocation } from '../hooks/useLiveGeolocation';
import BangaloreMap from '../components/BangaloreMap';
import SosAlertModal from '../components/SosAlertModal';
import RegroupAlertBanner from '../components/RegroupAlertBanner';
import LiveSimulatorControl from '../components/LiveSimulatorControl';
import ConvoyRadioChat from '../components/ConvoyRadioChat';
import DestinationWeatherWidget from '../components/DestinationWeatherWidget';
import LiveGpsBadgeControl from '../components/LiveGpsBadgeControl';
import { ShieldAlert, Flag, Gauge, ArrowLeft, User, Radio, Navigation } from 'lucide-react';

export default function LiveRidePage({ groupId, onCompleteRide, onBack }) {
  const { user } = useAuth();
  const toast = useToast();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [useGpsMode, setUseGpsMode] = useState(true);

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

  // Real Device Geolocation Hook
  const {
    coords,
    gpsActive,
    error: gpsError,
    permissionStatus,
    requestPermission
  } = useLiveGeolocation({
    enabled: useGpsMode,
    onLocationUpdate: (locData) => {
      if (useGpsMode && group) {
        sendLocation({
          lat: locData.lat,
          lng: locData.lng,
          speed: locData.speed,
          heading: locData.heading,
          onMyWay: true
        });
      }
    }
  });

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
    try {
      const myLoc = coords || groupLocations?.locations?.[user?.id] || { lat: group.meetingPointLat, lng: group.meetingPointLng };
      await sendSos({
        lat: myLoc.lat,
        lng: myLoc.lng,
        notes: "Emergency SOS triggered from Live Ride Cockpit"
      });
      toast.error("🚨 EMERGENCY SOS BROADCASTED to all convoy members!");
    } catch (err) {
      toast.error("Failed to trigger SOS: " + err.message);
    }
  };

  const handleResolveSos = async (sosEventId) => {
    try {
      if (sosEventId) {
        await api.resolveSos(sosEventId);
      }
      clearSosAlert();
      toast.success("SOS Alert marked resolved.");
    } catch (err) {
      console.error("Error resolving SOS:", err);
    }
  };

  const handleCompleteRide = async () => {
    setCompleting(true);
    try {
      await api.completeRide(groupId);
      toast.success("🏁 Ride completed! Please rate your convoy peers.");
      if (onCompleteRide) onCompleteRide(groupId);
    } catch (err) {
      toast.error("Failed to complete ride: " + err.message);
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
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {group.destination} Convoy
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>LIVE TELEMETRY</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center space-x-1.5 font-mono">
            <Radio className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.75} />
            <span>Link: <strong className={connected ? 'text-emerald-500' : 'text-muted-foreground'}>{connected ? 'Online' : 'Connecting...'}</strong> • {group.members?.length || 0} Riders</span>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* SOS Button */}
          <button
            onClick={handleTriggerSos}
            className="py-2 px-4 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-semibold text-xs shadow-xs transition-all flex items-center space-x-1.5 min-h-[40px]"
            title="Immediate Safety Alarm"
          >
            <ShieldAlert className="w-4 h-4" strokeWidth={2} />
            <span>SOS BEACON</span>
          </button>

          {/* Finish Ride Button */}
          <button
            onClick={handleCompleteRide}
            disabled={completing}
            className="py-2 px-4 rounded-full bg-foreground text-background font-semibold text-xs hover:opacity-90 active:scale-[0.99] shadow-xs transition-all disabled:opacity-50 flex items-center space-x-1.5 min-h-[40px]"
          >
            <Flag className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>Finish Ride</span>
          </button>
        </div>
      </div>

      {/* Live Device GPS Control Bar */}
      <LiveGpsBadgeControl
        gpsActive={gpsActive}
        coords={coords}
        permissionStatus={permissionStatus}
        error={gpsError}
        onRequestPermission={requestPermission}
        isLiveMode={useGpsMode}
        onToggleMode={() => setUseGpsMode(prev => !prev)}
      />

      {/* Telemetry Simulator for Demo / Testing (When in simulator mode) */}
      {!useGpsMode && (
        <LiveSimulatorControl
          groupId={group.id}
          group={group}
          members={group.members}
          onSendLocation={sendLocation}
          onTriggerSos={handleTriggerSos}
        />
      )}

      {/* Main Grid: Map + Rider HUD + Radio Comms */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left: Leaflet Live Map + Weather (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <BangaloreMap
            group={group}
            locations={groupLocations}
            height="380px"
          />

          {/* Live Destination Weather Preview */}
          <DestinationWeatherWidget destination={group.destination} />
        </div>

        {/* Right: Telemetry HUD + Convoy Radio Comms (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Telemetry HUD */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
              <span>Convoy Telemetry</span>
              <span className="text-zinc-900 dark:text-zinc-100 font-mono font-semibold">{group.members?.length || 0} Pilots</span>
            </h3>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {group.members?.map((m) => {
                const loc = groupLocations?.locations?.[m.user.id];
                const isMe = m.user.id === user?.id;
                const isLead = m.isLead || loc?.isLead;
                const isLagging = loc?.isLagging;
                const speed = (isMe && coords && coords.speed !== undefined) ? coords.speed : (loc?.speed ? Math.round(loc.speed) : 0);
                const distFromLead = loc?.distanceFromLeadKm !== undefined ? loc.distanceFromLeadKm : 0;

                return (
                  <div
                    key={m.id}
                    className={`p-3 rounded-xl border text-xs transition-colors ${
                      isLagging
                        ? 'border-rose-500/50 bg-rose-500/10'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="relative w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
                          {m.user?.avatarUrl ? (
                            <img src={m.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-zinc-400" strokeWidth={1.75} />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{m.user?.name}</span>
                            {isMe && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono font-medium">YOU</span>}
                            {isLead && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#f04f23]/15 text-[#f04f23] font-mono font-bold">LEAD</span>}
                          </div>
                          <div className="flex items-center space-x-1 mt-0.5">
                            {m.user?.vehiclePhotoUrl && (
                              <img src={m.user.vehiclePhotoUrl} alt="" className="w-3.5 h-3.5 rounded object-cover border border-zinc-200 dark:border-zinc-700 shrink-0" />
                            )}
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-[120px]">{m.user?.vehicleModel || 'Rider'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center justify-end space-x-1 font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                          <span className="text-base font-bold text-[#f04f23]">{speed}</span>
                          <span className="text-[10px] text-zinc-400 uppercase">KM/H</span>
                        </div>
                        {distFromLead > 0 && (
                          <p className={`text-[10px] font-mono ${isLagging ? 'text-rose-500 font-bold' : 'text-zinc-400'}`}>
                            +{distFromLead.toFixed(1)} km gap
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Convoy Radio Chat */}
          <ConvoyRadioChat groupId={group.id} currentUser={user} />

        </div>

      </div>

    </div>
  );
}
