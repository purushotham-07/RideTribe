import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Users, Clock, MapPin, Calendar, Trash2, ArrowRight, Bike, Car, Sparkles, AlertCircle } from 'lucide-react';

export default function MyRidesPage({
  onOpenGroup,
  onOpenLive,
  onOpenRating,
  onOpenMatcherModal,
  onPostNewIntent
}) {
  const [activeSubTab, setActiveSubTab] = useState('matched');
  const [groups, setGroups] = useState([]);
  const [intents, setIntents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userGroups, userIntents] = await Promise.all([
        api.getMyGroups(),
        api.getMyIntents()
      ]);
      setGroups(userGroups || []);
      setIntents(userIntents || []);
    } catch (err) {
      console.error("Error fetching my rides:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancelIntent = async (id) => {
    if (!confirm("Cancel this pending ride intent?")) return;
    try {
      await api.cancelIntent(id);
      fetchData();
    } catch (err) {
      alert("Failed to cancel: " + err.message);
    }
  };

  const matchedGroups = groups.filter(g => g.status === 'CONFIRMED' || g.status === 'IN_PROGRESS');
  const completedGroups = groups.filter(g => g.status === 'COMPLETED');
  const pendingIntents = intents.filter(i => i.status === 'PENDING');

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">My Rides & Convoys</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Active matched groups, pending candidate pool, and completed rides.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenMatcherModal}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white text-xs font-semibold hover:bg-slate-200 dark:hover:bg-white/20 transition-colors flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
            <span>Run Matcher</span>
          </button>

          <button
            onClick={onPostNewIntent}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 transition-opacity shadow-sm"
          >
            + Post Intent
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
        <button
          onClick={() => setActiveSubTab('matched')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center space-x-2 ${
            activeSubTab === 'matched'
              ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <span>Matched Groups</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeSubTab === 'matched'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-black'
              : 'bg-slate-100 dark:bg-[#172033] text-slate-600 dark:text-slate-400'
          }`}>
            {matchedGroups.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('pending')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center space-x-2 ${
            activeSubTab === 'pending'
              ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <span>Pending Pool</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeSubTab === 'pending'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-black'
              : 'bg-slate-100 dark:bg-[#172033] text-slate-600 dark:text-slate-400'
          }`}>
            {pendingIntents.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('completed')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center space-x-2 ${
            activeSubTab === 'completed'
              ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <span>Completed</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeSubTab === 'completed'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-black'
              : 'bg-slate-100 dark:bg-[#172033] text-slate-600 dark:text-slate-400'
          }`}>
            {completedGroups.length}
          </span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-6 h-6 border-2 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 mt-2">Loading your rides...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: Matched Groups */}
          {activeSubTab === 'matched' && (
            <div className="space-y-4">
              {matchedGroups.length > 0 ? (
                matchedGroups.map((group) => {
                  const isInProgress = group.status === 'IN_PROGRESS';
                  return (
                    <div
                      key={group.id}
                      className="p-5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">{group.destination}</h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                              isInProgress
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 animate-pulse'
                                : 'bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-white border-slate-300 dark:border-white/20'
                            }`}>
                              {isInProgress ? '● Live Convoy' : 'Group Matched'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span>📅 {group.rideDate}</span>
                            <span>⏰ {group.scheduledTime}</span>
                            <span>{group.travelMode === 'CAR' ? '🚗 Car Group' : '🏍️ Biker Group'}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => onOpenGroup(group.id)}
                            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#172033] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-colors"
                          >
                            Meetup Pin
                          </button>

                          <button
                            onClick={() => onOpenLive(group.id)}
                            className="px-4 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 transition-opacity flex items-center space-x-1.5 shadow-sm"
                          >
                            <span>Live Ride Cockpit</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="text-slate-600 dark:text-slate-400 flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400 dark:text-white shrink-0" />
                          <span>Rendezvous Checkpoint: <strong>{group.meetingPointName}</strong></span>
                        </div>

                        <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 text-[11px]">
                          <span>{group.members?.length || 0} Members:</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {group.members?.map(m => m.user?.name?.split(' ')[0]).join(', ')}
                          </span>
                        </div>
                      </div>

                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">No active matched groups yet.</p>
                  <button
                    onClick={onPostNewIntent}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-black text-xs font-bold"
                  >
                    Post a Ride Intent
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Pending Intents */}
          {activeSubTab === 'pending' && (
            <div className="space-y-3">
              {pendingIntents.length > 0 ? (
                pendingIntents.map((intent) => (
                  <div
                    key={intent.id}
                    className="p-4 rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{intent.destination}</h4>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-white border border-slate-200 dark:border-white/20">
                          Waiting in Pool
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {intent.rideDate} • {intent.windowStartTime}–{intent.windowEndTime} • {intent.travelMode} • {intent.startingArea || 'Bangalore'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={onOpenMatcherModal}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#172033] text-xs font-semibold hover:bg-slate-50 dark:hover:bg-[#1e293b]"
                      >
                        Match Now
                      </button>
                      <button
                        onClick={() => handleCancelIntent(intent.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                        title="Cancel intent"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">No pending intents in pool.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Completed */}
          {activeSubTab === 'completed' && (
            <div className="space-y-3">
              {completedGroups.length > 0 ? (
                completedGroups.map((group) => (
                  <div
                    key={group.id}
                    className="p-4 rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{group.destination}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Completed on {group.rideDate} • {group.members?.length || 0} Members in convoy
                      </p>
                    </div>

                    <button
                      onClick={() => onOpenRating(group.id)}
                      className="px-4 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90"
                    >
                      Rate Peers ⭐
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">No completed rides yet.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

    </div>
  );
}
