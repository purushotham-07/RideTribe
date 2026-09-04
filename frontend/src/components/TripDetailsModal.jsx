import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BangaloreMap from './BangaloreMap';
import DestinationWeatherWidget from './DestinationWeatherWidget';
import PreRideSafetyChecklist from './PreRideSafetyChecklist';
import {
  X, MapPin, Calendar, Clock, Users, Shield, Bike, Car, CheckCircle2,
  AlertCircle, MessageSquare, ArrowRight, User, Package, Send, Check, Ban, Navigation, Play, Trash2, AlertTriangle
} from 'lucide-react';

export default function TripDetailsModal({
  tripId,
  isOpen,
  onClose,
  onOpenChat,
  onOpenLiveCockpit,
  onTripUpdated
}) {
  if (!isOpen || !tripId) return null;

  const { user } = useAuth();
  const toast = useToast();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joinNote, setJoinNote] = useState('');
  const [submittingJoin, setSubmittingJoin] = useState(false);
  const [startingRide, setStartingRide] = useState(false);
  const [deletingTrip, setDeletingTrip] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'requests'

  const fetchTripDetails = async () => {
    try {
      const data = await api.getTrip(tripId);
      setTrip(data);
      if (data.hostUser?.id === user?.id) {
        const reqs = await api.getTripJoinRequests(tripId);
        setPendingRequests(reqs || []);
      }
    } catch (err) {
      console.error("Error fetching trip details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripDetails();
  }, [tripId, user]);

  const isHost = trip?.hostUser?.id === user?.id;
  const isMember = trip?.members?.some(m => m.user?.id === user?.id);
  const isFull = trip?.isFull || (trip?.members?.length >= trip?.maxMembers);
  const hasPendingRequest = trip?.myJoinRequestStatus === 'PENDING';
  const isRideInProgress = trip?.status === 'IN_PROGRESS';
  const isRideCompleted = trip?.status === 'COMPLETED';

  const handleSendJoinRequest = async () => {
    setSubmittingJoin(true);
    try {
      await api.sendJoinRequest(trip.id, {
        message: joinNote.trim() || `Hi ${trip.hostUser?.name || 'Host'}, I would like to join this ride!`
      });
      toast.success("🚀 Join request sent to the trip host! You will be notified once approved.");
      fetchTripDetails();
      if (onTripUpdated) onTripUpdated();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmittingJoin(false);
    }
  };

  const handleRespondRequest = async (requestId, approved) => {
    try {
      await api.respondJoinRequest(trip.id, requestId, {
        status: approved ? 'APPROVED' : 'REJECTED'
      });
      toast.success(approved ? "✅ Rider approved and added to convoy!" : "❌ Request declined.");
      fetchTripDetails();
      if (onTripUpdated) onTripUpdated();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleStartConvoy = async () => {
    setStartingRide(true);
    try {
      await api.startRide(trip.id);
      toast.success("🚀 Convoy Ride Started! Live telemetry & GPS tracking activated.");
      if (onTripUpdated) onTripUpdated();
      onOpenLiveCockpit(trip.id);
    } catch (err) {
      onOpenLiveCockpit(trip.id);
    } finally {
      setStartingRide(false);
    }
  };

  const handleDeleteTrip = async () => {
    setDeletingTrip(true);
    try {
      await api.deleteTrip(trip.id);
      toast.success("🗑️ Trip cancelled and deleted successfully.");
      if (onTripUpdated) onTripUpdated();
      onClose();
    } catch (err) {
      toast.error("Failed to delete trip: " + err.message);
    } finally {
      setDeletingTrip(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading || !trip) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="p-8 bg-white dark:bg-[#111726] rounded-3xl text-center space-y-3">
          <div className="w-8 h-8 border-3 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500">Loading trip details...</p>
        </div>
      </div>
    );
  }

  const packingItems = trip.whatToCarry
    ? trip.whatToCarry.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#0c0d10] text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden my-8">
        
        {/* Cover Photo Banner */}
        <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-black">
          <img
            src={trip.coverImageUrl || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80"}
            alt={trip.destination}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors border border-white/20 z-10"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>

          {/* Badges on Cover */}
          <div className="absolute bottom-4 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white">
            <div>
              <div className="flex items-center space-x-2 mb-1.5">
                <span className="text-[11px] font-mono text-[#f04f23] uppercase tracking-wider font-semibold">
                  {trip.numberOfDays === 1 ? '1 Day Ride' : `${trip.numberOfDays} Days Tour`}
                </span>
                <span className="text-white/40">•</span>
                <span className="text-[11px] font-mono text-white/70 uppercase">
                  {trip.travelMode === 'CAR' ? 'Car Convoy' : 'Motorcycle Convoy'}
                </span>
                {isRideInProgress ? (
                  <>
                    <span className="text-white/40">•</span>
                    <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-emerald-400 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>LIVE</span>
                    </span>
                  </>
                ) : isFull ? (
                  <>
                    <span className="text-white/40">•</span>
                    <span className="text-[11px] font-mono text-rose-400">TRIP FULL</span>
                  </>
                ) : null}
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">{trip.title}</h2>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="text-[11px] text-white/50 block font-mono uppercase">Capacity</span>
              <span className="text-base font-bold text-white font-mono">
                {trip.members?.length || 1} / {trip.maxMembers}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation (Host sees Requests tab) */}
        {isHost && (
          <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0d10] px-6 justify-between items-center">
            <div className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-zinc-900 text-zinc-900 dark:border-white dark:text-white'
                    : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                Overview & Route
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center space-x-1.5 ${
                  activeTab === 'requests'
                    ? 'border-zinc-900 text-zinc-900 dark:border-white dark:text-white'
                    : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <span>Join Requests</span>
                {pendingRequests.filter(r => r.status === 'PENDING').length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-[#f04f23] text-white">
                    {pendingRequests.filter(r => r.status === 'PENDING').length}
                  </span>
                )}
              </button>
            </div>

            {/* Host Delete Action */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="py-1 px-2.5 rounded-full text-rose-500 hover:bg-rose-500/10 text-xs font-medium flex items-center space-x-1 transition-colors"
              title="Delete Trip"
            >
              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Cancel Ride</span>
            </button>
          </div>
        )}

        {/* Delete Confirmation Banner */}
        {showDeleteConfirm && (
          <div className="p-4 bg-rose-500/10 border-b border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-rose-500 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              <span>Permanently cancel and delete this trip? All convoy members will be removed.</span>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3.5 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
              >
                Keep
              </button>
              <button
                onClick={handleDeleteTrip}
                disabled={deletingTrip}
                className="px-4 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold disabled:opacity-50"
              >
                {deletingTrip ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Host & Trip Meta Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Host Card */}
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 flex items-center space-x-3.5">
                  <div className="relative w-11 h-11 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
                    {trip.hostUser?.avatarUrl ? (
                      <img src={trip.hostUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-zinc-500" strokeWidth={1.75} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#f04f23] font-semibold">LEAD / HOST</span>
                      {trip.hostUser?.avgRating && (
                        <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">★ {trip.hostUser.avgRating}</span>
                      )}
                    </div>
                    <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-50 mt-0.5">{trip.hostUser?.name || 'Rider'}</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{trip.hostUser?.vehicleModel || 'Touring Pilot'}</p>
                  </div>
                </div>

                {/* Ride Schedule Card */}
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                    <span className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5" strokeWidth={1.75} />
                      <span>Date</span>
                    </span>
                    <span className="font-semibold font-mono text-zinc-900 dark:text-zinc-100">{trip.rideDate}</span>
                  </div>

                  <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                    <span className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5" strokeWidth={1.75} />
                      <span>Departure</span>
                    </span>
                    <span className="font-semibold font-mono text-zinc-900 dark:text-zinc-100">{trip.scheduledTime}</span>
                  </div>

                  <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                    <span className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5" strokeWidth={1.75} />
                      <span>Route Distance</span>
                    </span>
                    <span className="font-semibold font-mono text-[#f04f23]">~{trip.estimatedDistanceKm} km</span>
                  </div>
                </div>

              </div>

              {/* Description */}
              {trip.description && (
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                    Route Briefing
                  </h4>
                  <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-normal">
                    {trip.description}
                  </p>
                </div>
              )}

              {/* What Should We Carry? */}
              {packingItems.length > 0 && (
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center space-x-1.5">
                    <Package className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" strokeWidth={1.75} />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Packing Checklist
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {packingItems.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 flex items-center space-x-1.5 shadow-xs"
                      >
                        <Check className="w-3 h-3 text-[#f04f23]" strokeWidth={2.5} />
                        <span>{item}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Route Map */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Navigation className="w-3.5 h-3.5 text-[#f04f23]" strokeWidth={1.75} />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Route Trajectory
                    </h4>
                  </div>
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
                    ~{trip.estimatedDistanceKm || 60} km
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 block uppercase">Meetup Point</span>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate mt-0.5">{trip.meetingPointName}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] font-mono text-[#f04f23] block uppercase">Destination</span>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate mt-0.5">{trip.destination}</p>
                  </div>
                </div>

                <BangaloreMap
                  group={trip}
                  showRoute={true}
                  isLiveRide={isRideInProgress}
                  height="220px"
                />
              </div>

              {/* Accepted Convoy Members */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Riders in Convoy ({trip.members?.length || 1} / {trip.maxMembers})
                  </h4>
                  {isFull && (
                    <span className="text-[10px] font-mono text-rose-500 font-semibold">TRIP FULL</span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {trip.members?.map((m) => (
                    <div
                      key={m.id}
                      className="p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center space-x-2.5"
                    >
                      <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
                        {m.user?.avatarUrl ? (
                          <img src={m.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 text-zinc-400" strokeWidth={1.75} />
                        )}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">{m.user?.name}</span>
                          {m.isLead && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#f04f23]/15 text-[#f04f23] font-mono font-bold">LEAD</span>}
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{m.user?.vehicleModel || 'Rider'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: MANAGE REQUESTS (Host Only) */}
          {activeTab === 'requests' && isHost && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Pending Join Requests ({pendingRequests.filter(r => r.status === 'PENDING').length})
                </h4>
                {isFull && <span className="text-xs font-mono text-rose-500 font-semibold">Convoy Cap Reached ({trip.maxMembers}/{trip.maxMembers})</span>}
              </div>

              {pendingRequests.length === 0 ? (
                <div className="py-12 text-center text-zinc-400 dark:text-zinc-500">
                  <p className="text-xs">No pending join requests.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
                          {req.user?.avatarUrl ? (
                            <img src={req.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-zinc-400" strokeWidth={1.75} />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <h5 className="font-semibold text-sm text-zinc-900 dark:text-zinc-50">{req.user?.name}</h5>
                            {req.user?.gender && req.user?.age && (
                              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">({req.user.gender}, {req.user.age}y)</span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">{req.user?.vehicleModel || 'Rider'}</p>
                          {req.message && (
                            <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-1.5 italic bg-white dark:bg-zinc-950 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                              "{req.message}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {req.status === 'PENDING' ? (
                          <>
                            <button
                              disabled={isFull}
                              onClick={() => handleRespondRequest(req.id, true)}
                              className="px-4 py-1.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 text-xs font-semibold hover:opacity-90 disabled:opacity-40 flex items-center space-x-1 transition-opacity shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" strokeWidth={2} />
                              <span>Accept</span>
                            </button>

                            <button
                              onClick={() => handleRespondRequest(req.id, false)}
                              className="px-3.5 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-rose-500 text-xs font-medium flex items-center space-x-1 transition-colors"
                            >
                              <Ban className="w-3.5 h-3.5" strokeWidth={1.75} />
                              <span>Decline</span>
                            </button>
                          </>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-[11px] font-mono font-medium ${
                            req.status === 'APPROVED' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-500'
                          }`}>
                            {req.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white dark:bg-[#0c0d10] border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Chat & Live Convoy Buttons for Members/Host */}
          {(isMember || isHost) && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onOpenChat(trip)}
                className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center space-x-1.5 min-h-[40px] transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Group Radio</span>
              </button>

              {/* If Ride is In Progress -> Open Live Convoy Cockpit */}
              {isRideInProgress ? (
                <button
                  onClick={() => onOpenLiveCockpit(trip.id)}
                  className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 min-h-[40px] shadow-xs animate-pulse"
                >
                  <Navigation className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>Enter Live Cockpit</span>
                </button>
              ) : isHost ? (
                /* Host can start the ride */
                <button
                  onClick={handleStartConvoy}
                  disabled={startingRide}
                  className="px-5 py-2 rounded-full bg-[#f04f23] hover:bg-[#d9421a] active:scale-[0.99] text-white text-xs font-semibold flex items-center space-x-1.5 min-h-[40px] transition-all shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{startingRide ? 'Starting...' : 'Start Convoy Run'}</span>
                </button>
              ) : (
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono px-2">
                  Awaiting host departure
                </span>
              )}
            </div>
          )}

          {/* Join Request Form for Non-Members */}
          {!isMember && !isHost && (
            <div className="flex-1 flex flex-col sm:flex-row items-center gap-2">
              {hasPendingRequest ? (
                <div className="w-full p-2.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-medium flex items-center justify-center space-x-2">
                  <span>Join request submitted. Awaiting host response.</span>
                </div>
              ) : isFull ? (
                <div className="w-full p-2.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 text-xs font-medium flex items-center justify-center space-x-2">
                  <span>Convoy is at capacity ({trip.maxMembers}/{trip.maxMembers} riders).</span>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={joinNote}
                    onChange={(e) => setJoinNote(e.target.value)}
                    placeholder="Brief intro or vehicle model..."
                    className="flex-1 px-4 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 font-medium transition-colors"
                  />
                  <button
                    onClick={handleSendJoinRequest}
                    disabled={submittingJoin}
                    className="px-6 py-2 rounded-full bg-[#f04f23] hover:bg-[#d9421a] active:scale-[0.99] text-white text-xs font-semibold disabled:opacity-50 flex items-center justify-center space-x-1.5 whitespace-nowrap min-h-[40px] transition-all shadow-sm"
                  >
                    {submittingJoin ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" strokeWidth={1.75} />
                        <span>Request Join</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            Close
          </button>

        </div>
      </div>
    </div>
  );
}
