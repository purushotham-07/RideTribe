import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import BangaloreMap from '../components/BangaloreMap';
import { MapPin, Calendar, Clock, Navigation, ArrowRight, User, CheckCircle, Shield } from 'lucide-react';

export default function GroupConfirmationPage({ groupId, onStartRide, onBack }) {
  const { user } = useAuth();
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
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleStartRide = async () => {
    setStartingRide(true);
    try {
      await api.startRide(groupId);
      if (onStartRide) onStartRide(groupId);
    } catch (err) {
      alert("Failed to start ride: " + err.message);
    } finally {
      setStartingRide(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-6 h-6 border-2 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 mt-2">Loading group rendezvous...</p>
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

  const arrivedCount = group.members?.filter(m => m.onMyWay).length || 0;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <button onClick={onBack} className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white mb-1 flex items-center space-x-1">
            <span>← Back to My Rides</span>
          </button>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{group.destination} Meetup</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white border border-slate-300 dark:border-white/20">
              Pre-Ride Checkpoint
            </span>
          </div>
        </div>

        <button
          onClick={handleStartRide}
          disabled={startingRide}
          className="py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 min-h-[44px]"
        >
          {startingRide ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span>Start Convoy & Open Live Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Plan & Members */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Plan Details Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Rendezvous Details</h3>
            
            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#161f33] border border-slate-200 dark:border-slate-700/70">
                <div className="flex items-center space-x-1.5 text-slate-700 dark:text-white mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Bangalore Meetup Checkpoint</span>
                </div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{group.meetingPointName}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#161f33] border border-slate-200 dark:border-slate-700/70">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Ride Date</span>
                  <span className="font-bold text-slate-900 dark:text-white">{group.rideDate}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#161f33] border border-slate-200 dark:border-slate-700/70">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Scheduled Time</span>
                  <span className="font-bold text-slate-900 dark:text-white">{group.scheduledTime}</span>
                </div>
              </div>
            </div>

            {/* On My Way Button */}
            <button
              onClick={handleToggleOnMyWay}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition-colors flex items-center justify-center space-x-2 border min-h-[44px] ${
                onMyWay
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                  : 'bg-slate-100 dark:bg-[#172033] text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-[#1e293b]'
              }`}
            >
              <Navigation className="w-4 h-4" />
              <span>{onMyWay ? '✓ You Are En Route (Sharing Meetup Location)' : 'Toggle "I Am On My Way"'}</span>
            </button>
          </div>

          {/* Members Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Convoy Members ({group.members?.length || 0})
              </h3>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                {arrivedCount}/{group.members?.length || 0} En Route
              </span>
            </div>

            <div className="space-y-2.5">
              {group.members?.map((m) => {
                const isMe = m.user?.id === user?.id;
                return (
                  <div
                    key={m.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161f33] flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="relative w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 ring-1 ring-slate-300 dark:ring-white/30 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-white overflow-hidden shrink-0">
                        {m.user?.avatarUrl ? (
                          <img src={m.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{m.user?.name}</span>
                          {isMe && <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-white dark:text-black font-bold">YOU</span>}
                          {m.isLead && <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-white/20 text-slate-800 dark:text-white font-bold border border-slate-300 dark:border-white/30">LEAD</span>}
                        </div>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          {m.user?.vehiclePhotoUrl && (
                            <img src={m.user.vehiclePhotoUrl} alt="Bike" title="Rider's Motorcycle/Car" className="w-5 h-5 rounded object-cover border border-slate-300 dark:border-slate-700 shrink-0" />
                          )}
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">{m.user?.vehicleModel || 'Rider'}</p>
                        </div>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      m.onMyWay
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-200 dark:bg-[#111726] text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                    }`}>
                      {m.onMyWay ? 'En Route 🚀' : 'Standby'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right: Map */}
        <div className="lg:col-span-7">
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
            height="540px"
          />
        </div>

      </div>

    </div>
  );
}
