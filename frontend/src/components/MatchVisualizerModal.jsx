import React, { useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';
import { Sparkles, Play, CheckCircle2, MapPin, X, Users, Clock, Compass } from 'lucide-react';

export default function MatchVisualizerModal({ isOpen, onClose, onMatchingComplete }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState('');

  if (!isOpen) return null;

  const triggerMatching = async () => {
    setLoading(true);
    setResult(null);
    try {
      const payload = selectedDestination ? { destination: selectedDestination } : {};
      const res = await api.runMatching(payload);
      setResult(res);

      if (res.totalGroupsFormed > 0) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
        toast.success(`🎉 Successfully matched and formed ${res.totalGroupsFormed} ride groups!`);
      } else {
        toast.info("No matching groups formed yet. Need at least 3 riders with matching time windows.");
      }

      if (onMatchingComplete) {
        onMatchingComplete(res);
      }
    } catch (err) {
      toast.error("Match Engine error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-h-[85vh] overflow-y-auto shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#f04f23]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">Smart Group Matcher</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Automatically matches solo riders into small, compatible weekend convoys
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
            <span className="font-bold block text-zinc-900 dark:text-zinc-100">Time Matching</span>
            <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">Matching schedule & pace</span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
            <span className="font-bold block text-zinc-900 dark:text-zinc-100">Group Size</span>
            <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">3 to 6 riders per convoy</span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
            <span className="font-bold block text-zinc-900 dark:text-zinc-100">Meetup Point</span>
            <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">Convenient highway hubs</span>
          </div>
        </div>

        {/* Trigger Controls */}
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <select
            value={selectedDestination}
            onChange={(e) => setSelectedDestination(e.target.value)}
            className="px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 min-h-[40px] focus:ring-1 focus:ring-[#f04f23]"
          >
            <option value="">All Bangalore Destinations</option>
            <option value="Nandi Hills">Nandi Hills</option>
            <option value="Coorg (Madikeri)">Coorg (Madikeri)</option>
            <option value="Chikmagalur">Chikmagalur</option>
            <option value="Lepakshi">Lepakshi</option>
            <option value="Skandagiri">Skandagiri</option>
            <option value="Wayanad">Wayanad</option>
          </select>

          <button
            onClick={triggerMatching}
            disabled={loading}
            className="py-2.5 px-5 rounded-full bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 text-xs font-semibold disabled:opacity-50 flex items-center justify-center space-x-2 shadow-sm min-h-[40px] transition-all active:scale-[0.99]"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-[#f04f23]" />
                <span>Find & Form Convoys</span>
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-3 pt-1">
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-xs text-emerald-900 dark:text-emerald-300">
              <p className="font-bold">{result.executionMessage}</p>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px]">
                <span>Candidates Evaluated: <strong>{result.totalIntentsProcessed}</strong></span>
                <span>Riders Matched: <strong>{result.totalUsersMatched}</strong></span>
                <span>Groups Formed: <strong>{result.totalGroupsFormed}</strong></span>
                <span>Pending Intents: <strong>{result.unmergedPendingIntents}</strong></span>
              </div>
            </div>

            {result.formedGroups && result.formedGroups.length > 0 ? (
              <div className="space-y-2.5">
                {result.formedGroups.map((group, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-900 dark:text-white text-sm">{group.destination}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 text-[10px] font-bold">
                        {group.averageCompatibilityScore}% Compatibility
                      </span>
                    </div>

                    <div className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                      📍 Rendezvous Checkpoint: <strong>{group.meetingPointName}</strong> @ {group.scheduledTime}
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {group.matchedUsers.map((u) => (
                        <span key={u.id} className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-[11px] font-medium border border-zinc-200 dark:border-zinc-700">
                          {u.name} (⭐ {u.avgRating || '5.0'})
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center py-2">
                No groups formed yet. Need at least 3 riders with overlapping time windows.
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
