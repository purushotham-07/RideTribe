import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import { Star, ThumbsUp, CheckCircle2, ArrowRight, User } from 'lucide-react';

const PRAISE_TAGS = [
  "Safe Rider",
  "Steady Pace",
  "Great Navigator",
  "Punctual",
  "Reliable Lead",
  "Good Convoy Discipline",
  "Friendly",
  "Disciplined Driver"
];

export default function PostRideRatingPage({ groupId, onDone }) {
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [ratings, setRatings] = useState({});

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const data = await api.getGroup(groupId);
        setGroup(data);

        const initialRatings = {};
        data.members?.forEach(m => {
          if (m.user.id !== user?.id) {
            initialRatings[m.user.id] = {
              stars: 5,
              wouldRideAgain: true,
              tags: ["Safe Rider"],
              comment: ""
            };
          }
        });
        setRatings(initialRatings);
      } catch (err) {
        console.error("Error fetching group for rating:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId, user]);

  const handleStarChange = (rateeId, starCount) => {
    setRatings(prev => ({
      ...prev,
      [rateeId]: { ...prev[rateeId], stars: starCount }
    }));
  };

  const handleRideAgainToggle = (rateeId) => {
    setRatings(prev => ({
      ...prev,
      [rateeId]: { ...prev[rateeId], wouldRideAgain: !prev[rateeId]?.wouldRideAgain }
    }));
  };

  const handleTagToggle = (rateeId, tag) => {
    setRatings(prev => {
      const curTags = prev[rateeId]?.tags || [];
      const newTags = curTags.includes(tag)
        ? curTags.filter(t => t !== tag)
        : [...curTags, tag];
      return {
        ...prev,
        [rateeId]: { ...prev[rateeId], tags: newTags }
      };
    });
  };

  const handleCommentChange = (rateeId, comment) => {
    setRatings(prev => ({
      ...prev,
      [rateeId]: { ...prev[rateeId], comment }
    }));
  };

  const handleSubmitAllRatings = async () => {
    setSubmitting(true);
    try {
      const promises = Object.entries(ratings).map(([rateeId, rData]) => {
        return api.submitRating({
          rideGroupId: groupId,
          rateeId: Number(rateeId),
          stars: rData.stars,
          wouldRideAgain: rData.wouldRideAgain,
          tags: rData.tags?.join(", "),
          comment: rData.comment
        });
      });

      await Promise.all(promises);
      setSubmitted(true);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        if (onDone) onDone();
      }, 1500);

    } catch (err) {
      alert("Failed to submit ratings: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-6 h-6 border-2 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 mt-2">Loading peer rating form...</p>
      </div>
    );
  }

  const peersToRate = group?.members?.filter(m => m.user.id !== user?.id) || [];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Peer Ratings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Rate your fellow convoy riders for the ride to <strong>{group?.destination}</strong>. Positive ratings boost future compatibility matching.
        </p>
      </div>

      {submitted ? (
        <div className="p-8 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 text-center space-y-2 shadow-md">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Ratings Submitted</h2>
          <p className="text-xs text-slate-500">Thank you for rating your group. Returning to dashboard...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {peersToRate.map((member) => {
            const peer = member.user;
            const peerRating = ratings[peer.id] || { stars: 5, wouldRideAgain: true, tags: [] };

            return (
              <div
                key={peer.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 ring-1 ring-slate-300 dark:ring-white/30 flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
                      {peer.avatarUrl ? (
                        <img src={peer.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{peer.name}</h3>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        {peer.vehiclePhotoUrl && (
                          <img src={peer.vehiclePhotoUrl} alt="" className="w-4 h-4 rounded object-cover border border-slate-300 dark:border-slate-700 shrink-0" />
                        )}
                        <p className="text-xs text-slate-500 dark:text-slate-400">{peer.vehicleModel || 'Rider'}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRideAgainToggle(peer.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center space-x-1.5 transition-colors ${
                      peerRating.wouldRideAgain
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-transparent shadow-sm'
                        : 'bg-slate-100 dark:bg-[#172033] text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{peerRating.wouldRideAgain ? 'Would Ride Again' : 'Skip Boost'}</span>
                  </button>
                </div>

                {/* Stars */}
                <div>
                  <div className="flex items-center space-x-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleStarChange(peer.id, star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= (peerRating.stars || 5)
                              ? 'fill-white text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]'
                              : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 dark:text-white ml-2">
                      {peerRating.stars}.0 / 5.0
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <div className="flex flex-wrap gap-1.5">
                    {PRAISE_TAGS.map((tag) => {
                      const isSelected = peerRating.tags?.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagToggle(peer.id, tag)}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-colors ${
                            isSelected
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-transparent shadow-sm'
                              : 'bg-slate-50 dark:bg-[#161f33] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                          }`}
                        >
                          {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Comment */}
                <input
                  type="text"
                  value={peerRating.comment || ''}
                  onChange={(e) => handleCommentChange(peer.id, e.target.value)}
                  placeholder="Optional feedback about this rider..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-[#161f33] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                />

              </div>
            );
          })}

          <button
            onClick={handleSubmitAllRatings}
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center space-x-2 min-h-[44px] shadow-sm"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Submit Peer Ratings & Finish</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      )}

    </div>
  );
}
