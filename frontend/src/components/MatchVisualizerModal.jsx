import React, { useState } from 'react';
import { api } from '../api/client';
import confetti from 'canvas-confetti';
import { Sparkles, Play, CheckCircle2, MapPin, X, Users, Clock, Network } from 'lucide-react';

export default function MatchVisualizerModal({ isOpen, onClose, onMatchingComplete }) {
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
      }

      if (onMatchingComplete) {
        onMatchingComplete(res);
      }
    } catch (err) {
      alert("Matching engine error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-h-[85vh] overflow-y-auto shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-black flex items-center justify-center">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Greedy Graph Clustering Matcher</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Union-Find bounds (3–6 riders) with 4-factor compatibility scoring
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Algorithm details */}
        <div className="grid grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#161f33] border border-slate-200 dark:border-slate-700/60">
            <span className="font-bold block text-slate-900 dark:text-white">Time Overlap</span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">50% weight</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#161f33] border border-slate-200 dark:border-slate-700/60">
            <span className="font-bold block text-slate-900 dark:text-white">Group Bounds</span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">3 to 6 members</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#161f33] border border-slate-200 dark:border-slate-700/60">
            <span className="font-bold block text-slate-900 dark:text-white">Rendezvous</span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">Highway hub</span>
          </div>
        </div>

        {/* Trigger Controls */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161f33] border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <select
            value={selectedDestination}
            onChange={(e) => setSelectedDestination(e.target.value)}
            className="px-3 py-2 text-xs bg-white dark:bg-[#111726] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
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
            className="py-2.5 px-4 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-sm"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Matching Engine</span>
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
                <span>Candidates Processed: <strong>{result.totalIntentsProcessed}</strong></span>
                <span>Matched: <strong>{result.totalUsersMatched}</strong></span>
                <span>Groups Formed: <strong>{result.totalGroupsFormed}</strong></span>
                <span>Unmerged Pending: <strong>{result.unmergedPendingIntents}</strong></span>
              </div>
            </div>

            {result.formedGroups && result.formedGroups.length > 0 ? (
              <div className="space-y-2.5">
                {result.formedGroups.map((group, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161f33] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{group.destination}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-black text-[10px] font-bold">
                        {group.averageCompatibilityScore}% Compatibility
                      </span>
                    </div>

                    <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                      📍 Rendezvous Checkpoint: <strong>{group.meetingPointName}</strong> @ {group.scheduledTime}
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {group.matchedUsers.map((u) => (
                        <span key={u.id} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#111726] text-slate-700 dark:text-slate-200 text-[11px] font-medium border border-slate-200 dark:border-white/20">
                          {u.name} (⭐ {u.avgRating || '5.0'})
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-2">
                No groups formed. Need at least 3 matching intents with overlapping time windows.
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
