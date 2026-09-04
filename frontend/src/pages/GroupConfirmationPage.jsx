import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BangaloreMap from '../components/BangaloreMap';
import DestinationWeatherWidget from '../components/DestinationWeatherWidget';
import PreRideSafetyChecklist from '../components/PreRideSafetyChecklist';
import { MapPin, Calendar, Clock, Navigation, ArrowRight, User, CheckCircle, Shield } from 'lucide-react';

export default function GroupConfirmationPage({ groupId, onStartRide, onBack }) {
  const { user } = useAuth();
  const toast = useToast();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onMyWay, setOnMyWay] = useState(false);
  const [startingRide, setStartingRide] = useState(false);

  const fetchGroup = async () => {
    try {
      const data = await api.getGroup(groupId);
      setGroup(data);
      const myMember = data.members?.find(m => m.user?.id === user?.id);
      if (myMember) {
        setOnMyWay(Boolean(myMember.onMyWay));
      }
    } catch (err) {
      console.error("Error fetching group:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
    const interval = setInterval(fetchGroup, 5000);
    return () => clearInterval(interval);
  }, [groupId, user]);

  const handleToggleOnMyWay = async () => {
    const nextState = !onMyWay;
    setOnMyWay(nextState);
    try {
      await api.updateMemberStatus(groupId, {
        onMyWay: nextState,
        currentLat: group?.meetingPointLat,
        currentLng: group?.meetingPointLng
      });
      fetchGroup();
      toast.success(nextState ? "🚀 Status updated: You are en route to the meetup point!" : "Status updated: Standby.");
    } catch (err) {
      toast.error("Failed to update status: " + err.message);
    }
  };

  const handleStartRide = async () => {
    setStartingRide(true);
    try {
      await api.startRide(groupId);
      toast.success("🏁 Convoy launched! Opening live telemetry map...");
      if (onStartRide) onStartRide(groupId);
    } catch (err) {
      toast.error("Failed to start ride: " + err.message);
    } finally {
      setStartingRide(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center font-sans">
        <div className="w-5 h-5 border-2 border-zinc-900 dark:border-zinc-100 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-zinc-500 mt-2">Loading group rendezvous...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="max-w-md mx-auto py-12 text-center font-sans">
        <p className="text-sm text-zinc-500">Group not found.</p>
        <button onClick={onBack} className="mt-3 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800">Back</button>
      </div>
    );
  }

  const arrivedCount = group.members?.filter(m => m.onMyWay).length || 0;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6 font-sans">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div>
          <button onClick={onBack} className="text-xs font-medium text-muted-foreground hover:text-foreground mb-1.5 flex items-center space-x-1 transition-colors">
            <span>← Back to My Rides</span>
          </button>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{group.destination} Meetup</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-secondary text-foreground border border-border">
              Pre-Ride Rendezvous
            </span>
          </div>
        </div>

        <button
          onClick={handleStartRide}
          disabled={startingRide}
          className="py-2 px-5 rounded-full bg-white text-black hover:bg-zinc-200 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50 min-h-[40px] active:scale-[0.98]"
        >
          {startingRide ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span>Start Convoy & Open Live Map</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
            </>
          )}
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Plan, Safety & Members (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Plan Details Card */}
          <div className="p-5 rounded-2xl bg-card border border-border shadow-subtle space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rendezvous Details</h3>
            
            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 rounded-xl bg-secondary/60 border border-border">
                <div className="flex items-center space-x-1.5 text-muted-foreground mb-1">
                  <MapPin className="w-3.5 h-3.5 text-signal" />
                  <span className="text-[10px] uppercase font-semibold tracking-wider font-mono">Bangalore Checkpoint</span>
                </div>
                <p className="font-semibold text-foreground text-sm tracking-tight">{group.meetingPointName}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-secondary/60 border border-border">
                  <span className="text-[10px] text-muted-foreground uppercase block font-medium font-mono">Ride Date</span>
                  <span className="font-medium text-foreground font-mono">{group.rideDate}</span>
                </div>
                <div className="p-3 rounded-xl bg-secondary/60 border border-border">
                  <span className="text-[10px] text-muted-foreground uppercase block font-medium font-mono">Scheduled Time</span>
                  <span className="font-medium text-foreground font-mono">{group.scheduledTime}</span>
                </div>
              </div>
            </div>

            {/* On My Way Button */}
            <button
              onClick={handleToggleOnMyWay}
              className={`w-full py-2.5 px-4 rounded-full font-medium text-xs transition-all flex items-center justify-center space-x-2 border min-h-[40px] shadow-sm ${
                onMyWay
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-secondary text-foreground border-border hover:bg-secondary/80'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{onMyWay ? '✓ You Are En Route to Meetup Hub' : 'Toggle "I Am On My Way"'}</span>
            </button>
          </div>

          {/* Pre-Ride Safety Checklist */}
          <PreRideSafetyChecklist />

          {/* Members Card */}
          <div className="p-5 rounded-2xl bg-card border border-border shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Convoy Members ({group.members?.length || 0})
              </h3>
              <span className="text-[11px] font-medium font-mono text-emerald-500">
                {arrivedCount}/{group.members?.length || 0} En Route
              </span>
            </div>

            <div className="space-y-2.5">
              {group.members?.map((m) => {
                const isMe = m.user?.id === user?.id;
                return (
                  <div
                    key={m.id}
                    className="p-3 rounded-xl border border-border bg-secondary/40 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="relative w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center font-medium text-xs text-foreground overflow-hidden shrink-0">
                        {m.user?.avatarUrl ? (
                          <img src={m.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-medium text-foreground">{m.user?.name}</span>
                          {isMe && <span className="text-[9px] px-1.5 py-0.2 rounded bg-secondary text-foreground font-mono font-bold">YOU</span>}
                          {m.isLead && <span className="text-[9px] px-1.5 py-0.2 rounded bg-signal/15 text-signal font-mono font-bold">LEAD</span>}
                        </div>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          {m.user?.vehiclePhotoUrl && (
                            <img src={m.user.vehiclePhotoUrl} alt="Bike" title="Vehicle" className="w-5 h-5 rounded object-cover border border-border shrink-0" />
                          )}
                          <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">{m.user?.vehicleModel || 'Rider'}</p>
                        </div>
                      </div>
                    </div>

                    <span className={`text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full border ${
                      m.onMyWay
                        ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20'
                        : 'bg-secondary text-muted-foreground border-border'
                    }`}>
                      {m.onMyWay ? 'En Route 🚀' : 'Standby'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right: Map & Weather (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <BangaloreMap
            group={group}
            locations={{
              rideGroupId: group.id,
              locations: (group.members || []).reduce((acc, m) => {
                acc[m.user.id] = {
                  userId: m.user.id,
                  userName: m.user.name,
                  avatarUrl: m.user.avatarUrl,
                  vehicleModel: m.user.vehicleModel,
                  lat: m.currentLat || group.meetingPointLat,
                  lng: m.currentLng || group.meetingPointLng,
                  speed: m.currentSpeed || 0,
                  onMyWay: m.onMyWay,
                  isLead: m.isLead
                };
                return acc;
              }, {})
            }}
            height="480px"
          />

          <DestinationWeatherWidget destination={group.destination} />
        </div>

      </div>

    </div>
  );
}
