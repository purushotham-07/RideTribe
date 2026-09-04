import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Users, Clock, MapPin, Calendar, Trash2, ArrowRight, Bike, Car, Sparkles, AlertCircle, MessageSquare, Star } from 'lucide-react';

export default function MyRidesPage({
  onOpenGroup,
  onOpenLive,
  onOpenRating,
  onOpenMatcherModal,
  onPostNewIntent,
  onOpenChat
}) {
  const toast = useToast();
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
    try {
      await api.cancelIntent(id);
      fetchData();
      toast.info("Ride intent cancelled from matchmaking pool.");
    } catch (err) {
      toast.error("Failed to cancel intent: " + err.message);
    }
  };

  const matchedGroups = groups.filter(g => g.status === 'CONFIRMED' || g.status === 'IN_PROGRESS');
  const completedGroups = groups.filter(g => g.status === 'COMPLETED');
  const pendingIntents = intents.filter(i => i.status === 'PENDING');

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">My Convoys</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Active matched groups, pending matchmaking pool, and completed tours with discussions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenMatcherModal}
            className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center space-x-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#f04f23]" strokeWidth={1.75} />
            <span>Match Engine</span>
          </button>

          <button
            onClick={onPostNewIntent}
            className="px-4 py-2 rounded-full bg-[#f04f23] hover:bg-[#d9421a] active:scale-[0.99] text-white text-xs font-semibold shadow-xs transition-all flex items-center space-x-1"
          >
            <span>+ Host / Post Ride</span>
          </button>
        </div>
      </div>

      {/* Tabs with Minimal Tasteful Accents */}
      <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-full border border-zinc-200 dark:border-zinc-800 w-fit">
        <button
          onClick={() => setActiveSubTab('matched')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center space-x-2 ${
            activeSubTab === 'matched'
              ? 'bg-white dark:bg-[#0c0d10] text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          }`}
        >
          <span>Matched Groups</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
            activeSubTab === 'matched'
              ? 'bg-[#f04f23]/15 text-[#f04f23] font-semibold'
              : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
          }`}>
            {matchedGroups.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('pending')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center space-x-2 ${
            activeSubTab === 'pending'
              ? 'bg-white dark:bg-[#0c0d10] text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          }`}
        >
          <span>Pending Pool</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
            activeSubTab === 'pending'
              ? 'bg-[#f04f23]/15 text-[#f04f23] font-semibold'
              : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
          }`}>
            {pendingIntents.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('completed')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center space-x-2 ${
            activeSubTab === 'completed'
              ? 'bg-white dark:bg-[#0c0d10] text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          }`}
        >
          <span>Completed & Discuss</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
            activeSubTab === 'completed'
              ? 'bg-[#f04f23]/15 text-[#f04f23] font-semibold'
              : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
          }`}>
            {completedGroups.length}
          </span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-6 h-6 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-mono text-zinc-500 mt-2">Loading your rides...</p>
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
                      className="p-5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all space-y-3.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-base text-zinc-950 dark:text-zinc-50">{group.title || group.destination}</h3>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                              isInProgress
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 animate-pulse'
                                : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800'
                            }`}>
                              {isInProgress ? '● Live Convoy' : 'Group Matched'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            <span>📍 {group.destination}</span>
                            <span>📅 {group.rideDate}</span>
                            <span>⏰ {group.scheduledTime}</span>
                            <span>{group.travelMode === 'CAR' ? '🚗 Car Group' : '🏍️ Biker Group'}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {onOpenChat && (
                            <button
                              onClick={() => onOpenChat(group)}
                              className="px-3 py-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-colors flex items-center space-x-1"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Chat</span>
                            </button>
                          )}

                          <button
                            onClick={() => onOpenGroup(group.id)}
                            className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                          >
                            Meetup Pin
                          </button>

                          <button
                            onClick={() => onOpenLive(group.id)}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm shadow-emerald-500/20 transition-all flex items-center space-x-1.5 active:scale-[0.98]"
                          >
                            <span>Live Cockpit</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="text-zinc-600 dark:text-zinc-400 flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1.5 text-rose-500 shrink-0" />
                          <span>Rendezvous Point: <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">{group.meetingPointName}</strong></span>
                        </div>

                        <div className="flex items-center space-x-1 text-zinc-500 dark:text-zinc-400 text-[11px]">
                          <span>{group.members?.length || 0} Members:</span>
                          <span className="font-medium text-zinc-700 dark:text-zinc-300">
                            {group.members?.map(m => m.user?.name?.split(' ')[0]).join(', ')}
                          </span>
                        </div>
                      </div>

                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">No active matched groups yet.</p>
                  <button
                    onClick={onPostNewIntent}
                    className="px-4 py-2 rounded-lg bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200"
                  >
                    Host or Post a Ride
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
                    className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-sm text-zinc-950 dark:text-zinc-50">{intent.destination}</h4>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800">
                          Waiting in Pool
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {intent.rideDate} • {intent.windowStartTime}–{intent.windowEndTime} • {intent.travelMode} • {intent.startingArea || 'Bangalore'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={onOpenMatcherModal}
                        className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                      >
                        Match Now
                      </button>
                      <button
                        onClick={() => handleCancelIntent(intent.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 transition-colors"
                        title="Cancel intent"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">No pending intents in pool.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Completed Trips & Post-Ride Discussion */}
          {activeSubTab === 'completed' && (
            <div className="space-y-4">
              {completedGroups.length > 0 ? (
                completedGroups.map((group) => (
                  <div
                    key={group.id}
                    className="p-5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-sm text-zinc-950 dark:text-zinc-50">{group.title || group.destination}</h4>
                        <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                          🏁 Completed
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Completed on {group.rideDate} • {group.members?.length || 0} Convoy members • Destination: {group.destination}
                      </p>
                      <div className="flex items-center space-x-1.5 mt-2 text-[11px] text-zinc-600 dark:text-zinc-300">
                        <span className="font-medium">Riders:</span>
                        <span>{group.members?.map(m => m.user?.name?.split(' ')[0]).join(', ')}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {/* Discuss & Memory Wall */}
                      {onOpenChat && (
                        <button
                          onClick={() => onOpenChat(group)}
                          className="px-3.5 py-2 rounded-lg bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center space-x-1.5 shadow-2xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Discuss & Memories</span>
                        </button>
                      )}

                      <button
                        onClick={() => onOpenRating(group.id)}
                        className="px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-medium flex items-center space-x-1 text-amber-600 dark:text-amber-400 transition-colors"
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>Rate Peers</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">No completed rides yet.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

    </div>
  );
}
