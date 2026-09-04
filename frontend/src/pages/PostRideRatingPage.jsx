import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
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
  const toast = useToast();
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
      toast.success("⭐ Peer ratings submitted! Reputation scores updated.");

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        if (onDone) onDone();
      }, 1500);

    } catch (err) {
      toast.error("Failed to submit ratings: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center font-sans">
        <div className="w-5 h-5 border-2 border-zinc-900 dark:border-zinc-100 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-zinc-500 mt-2">Loading peer rating form...</p>
      </div>
    );
  }

  const peersToRate = group?.members?.filter(m => m.user.id !== user?.id) || [];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 font-sans">
      
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-border">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Peer Ratings</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Rate your fellow convoy riders for the ride to <strong>{group?.destination}</strong>. Positive ratings boost future compatibility matching.
        </p>
      </div>

      {submitted ? (
        <div className="p-8 rounded-2xl bg-card border border-border text-center space-y-2 shadow-subtle">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h2 className="text-lg font-semibold text-foreground tracking-tight">Ratings Submitted</h2>
          <p className="text-xs text-muted-foreground">Thank you for rating your group. Returning to dashboard...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {peersToRate.map((member) => {
            const peer = member.user;
            const peerRating = ratings[peer.id] || { stars: 5, wouldRideAgain: true, tags: [] };

            return (
              <div
                key={peer.id}
                className="p-5 rounded-2xl bg-card border border-border shadow-subtle space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center font-medium text-xs overflow-hidden shrink-0">
                      {peer.avatarUrl ? (
                        <img src={peer.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground tracking-tight">{peer.name}</h3>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        {peer.vehiclePhotoUrl && (
                          <img src={peer.vehiclePhotoUrl} alt="" className="w-4 h-4 rounded object-cover border border-border shrink-0" />
                        )}
                        <p className="text-xs text-muted-foreground">{peer.vehicleModel || 'Rider'}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRideAgainToggle(peer.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium border flex items-center space-x-1.5 transition-all shadow-xs ${
                      peerRating.wouldRideAgain
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{peerRating.wouldRideAgain ? 'Would Ride Again' : 'Skip Boost'}</span>
                  </button>
                </div>

                {/* Stars */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">Rating</label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleStarChange(peer.id, star)}
                        className="p-1 focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= peerRating.stars
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-neutral-300 dark:text-neutral-700'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Praise Tags */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">Praise Tags</label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRAISE_TAGS.map((tag) => {
                      const isSelected = peerRating.tags?.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagToggle(peer.id, tag)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                            isSelected
                              ? 'bg-foreground text-background border-foreground'
                              : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
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
                  className="w-full px-3 py-2 text-xs bg-secondary/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-signal"
                />

              </div>
            );
          })}

          <button
            onClick={handleSubmitAllRatings}
            disabled={submitting}
            className="w-full py-2.5 px-4 rounded-full bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 text-xs font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center space-x-2 min-h-[40px] active:scale-[0.99]"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Submit Peer Ratings & Finish</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
              </>
            )}
          </button>
        </div>
      )}

    </div>
  );
}
