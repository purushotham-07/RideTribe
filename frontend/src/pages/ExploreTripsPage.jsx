import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Compass, Plus, Search, Calendar, Clock, MapPin, Users, Bike, Car,
  Shield, Sparkles, MessageSquare, ArrowRight, User, Package, Filter, CheckCircle2, ArrowUpRight,
  Gauge, Activity, Navigation, Radio, Check, ChevronRight
} from 'lucide-react';

export default function ExploreTripsPage({
  onHostTrip,
  onViewTripDetails,
  onOpenTripChat,
  onOpenLiveCockpit
}) {
  const { user } = useAuth();
  const toast = useToast();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modeFilter, setModeFilter] = useState('ALL'); // 'ALL', 'BIKE', 'CAR'
  const [daysFilter, setDaysFilter] = useState('ALL'); // 'ALL', 1, 2, 3
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTrips = async () => {
    try {
      const data = await api.getTrips();
      setTrips(data || []);
    } catch (err) {
      console.error("Error fetching trips:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [user]);

  const filteredTrips = trips.filter(t => {
    if (modeFilter !== 'ALL' && t.travelMode !== modeFilter) return false;
    if (daysFilter !== 'ALL' && t.numberOfDays !== Number(daysFilter)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title?.toLowerCase().includes(q);
      const matchDest = t.destination?.toLowerCase().includes(q);
      const matchHost = t.hostUser?.name?.toLowerCase().includes(q);
      const matchMeeting = t.meetingPointName?.toLowerCase().includes(q);
      if (!matchTitle && !matchDest && !matchHost && !matchMeeting) return false;
    }
    return true;
  });

  return (
    <div className="w-full bg-white dark:bg-black text-zinc-950 dark:text-zinc-50 font-sans selection:bg-zinc-900 selection:text-white dark:selection:bg-zinc-100 dark:selection:text-zinc-900">
      
      {/* 1. Shadcn Centered Hero Section with Radial Spotlight */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 border-b border-zinc-200 dark:border-zinc-800/80 bg-radial-hero">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          
          {/* Centered Announcement Pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer group shadow-xs">
            <span className="text-[#f04f23]">⚡</span>
            <span>Real-Time Convoy Match Engine 2.0</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Huge Bold Centered Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 max-w-4xl mx-auto leading-[1.08]">
            The Foundation for your Convoy
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Coordinate live GPS telemetry, plan weekend highway tours, automated convoy matching, and stay connected with your pack.
          </p>

          {/* Centered CTA Pill Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                const el = document.getElementById('routes-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-2.5 rounded-full text-xs sm:text-sm font-medium text-white bg-zinc-950 hover:bg-zinc-800 dark:text-zinc-950 dark:bg-white dark:hover:bg-zinc-200 shadow-sm transition-all active:scale-[0.98]"
            >
              Explore Convoys
            </button>

            <button
              onClick={onHostTrip}
              className="px-6 py-2.5 rounded-full text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all active:scale-[0.98]"
            >
              Host a Ride
            </button>
          </div>

        </div>

        {/* 2. Feature Showcase Cards Grid */}
        <div className="max-w-6xl mx-auto mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Interactive Convoy Controls */}
          <div className="rounded-2xl bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-zinc-800/80 p-4 sm:p-5 flex flex-col justify-between shadow-subtle hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Mode Filter</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">Controls</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs">
                  <span className="flex items-center space-x-1.5 font-medium text-zinc-900 dark:text-zinc-100">
                    <Bike className="w-3.5 h-3.5 text-[#f04f23]" />
                    <span>Motorcycles</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Active</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center space-x-1.5">
                    <Car className="w-3.5 h-3.5" />
                    <span>Car Convoy</span>
                  </span>
                  <span className="text-[10px] font-mono">Available</span>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 mt-3 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
              <span>Riding Pace</span>
              <span className="font-mono text-zinc-900 dark:text-zinc-100 font-medium">70–90 km/h</span>
            </div>
          </div>

          {/* Card 2: Live Telemetry Preview */}
          <div className="rounded-2xl bg-card border border-border p-4 sm:p-5 flex flex-col justify-between shadow-subtle hover:border-zinc-700 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Live Telemetry</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-bold font-mono tracking-tight text-zinc-950 dark:text-zinc-50">84</span>
                  <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-1">KM/H AVG</span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#f04f23] h-full rounded-full w-3/4"></div>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                  <span>FORMATION: TIGHT</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">4 RIDERS LIVE</span>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 mt-3 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
              <span>Elevation Gain</span>
              <span className="font-mono text-zinc-900 dark:text-zinc-100 font-medium">+1,420 m</span>
            </div>
          </div>

          {/* Card 3: Bangalore Circuits */}
          <div className="rounded-2xl bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-zinc-800/80 p-4 sm:p-5 flex flex-col justify-between shadow-subtle hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Popular Circuits</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">BLR</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <button
                  onClick={() => setSearchQuery('Nandi Hills')}
                  className="w-full text-left p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium truncate text-zinc-800 dark:text-zinc-200">Nandi Hills Sunrise</span>
                  <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 shrink-0">60 km</span>
                </button>
                <button
                  onClick={() => setSearchQuery('Coorg')}
                  className="w-full text-left p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium truncate text-zinc-800 dark:text-zinc-200">Coorg Ghats Run</span>
                  <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 shrink-0">265 km</span>
                </button>
                <button
                  onClick={() => setSearchQuery('Chikmagalur')}
                  className="w-full text-left p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium truncate text-zinc-800 dark:text-zinc-200">Chikmagalur Peak</span>
                  <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 shrink-0">245 km</span>
                </button>
              </div>
            </div>
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 mt-3 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
              <span>Quick Select</span>
              <span className="text-[#f04f23] font-medium text-[11px] cursor-pointer" onClick={() => setSearchQuery('')}>Reset</span>
            </div>
          </div>

          {/* Card 4: Safety & SOS Radar */}
          <div className="rounded-2xl bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-zinc-800/80 p-4 sm:p-5 flex flex-col justify-between shadow-subtle hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Safety Protocol</span>
                <Shield className="w-3.5 h-3.5 text-[#f04f23]" />
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-zinc-900 dark:text-zinc-100 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Convoy Regroup Alert</span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Automatic horn ping triggers if any rider separates &gt;1.5 km on highway.
                </p>
                <div className="flex items-center space-x-2 text-zinc-900 dark:text-zinc-100 font-medium pt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f04f23]"></span>
                  <span>Instant SOS Beacon</span>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 mt-3 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
              <span>Emergency Radar</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-medium">ARMED</span>
            </div>
          </div>

        </div>

      </section>

      {/* Main Directory & Routes Section */}
      <div id="routes-section" className="max-w-6xl mx-auto py-10 px-4 sm:px-6 space-y-6">
        
        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by destination, title, or host..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-950 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#f04f23] transition-colors min-h-[38px]"
            />
          </div>

          {/* Segmented Mode & Duration Filter */}
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            {/* Mode Selector */}
            <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs">
              <button
                onClick={() => setModeFilter('ALL')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  modeFilter === 'ALL'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 font-semibold shadow-xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setModeFilter('BIKE')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  modeFilter === 'BIKE'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 font-semibold shadow-xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100'
                }`}
              >
                Bikes
              </button>
              <button
                onClick={() => setModeFilter('CAR')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  modeFilter === 'CAR'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 font-semibold shadow-xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100'
                }`}
              >
                Cars
              </button>
            </div>

            {/* Days Filter */}
            <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs">
              <button
                onClick={() => setDaysFilter('ALL')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  daysFilter === 'ALL'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 font-semibold shadow-xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100'
                }`}
              >
                Any Days
              </button>
              <button
                onClick={() => setDaysFilter(1)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  daysFilter === 1
                    ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 font-semibold shadow-xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100'
                }`}
              >
                1D
              </button>
              <button
                onClick={() => setDaysFilter(2)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  daysFilter === 2
                    ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 font-semibold shadow-xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100'
                }`}
              >
                2D
              </button>
            </div>
          </div>

        </div>

      {/* Trips Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-5 h-5 border-2 border-[#f04f23] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-3 tracking-wider uppercase">Loading community routes...</p>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="space-y-6">
          <div className="py-12 px-6 text-center border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-[#0c0d10] p-8 space-y-4 shadow-subtle">
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mx-auto text-zinc-500 dark:text-zinc-400">
              <Compass className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">No Convoys Found</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mt-1 leading-relaxed">
                No active groups match your current filter. Host a route to Nandi Hills, Coorg, or Chikmagalur and invite riders!
              </p>
            </div>
            <button
              onClick={onHostTrip}
              className="px-5 py-2 rounded-full bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 font-medium text-xs shadow-sm transition-all active:scale-[0.98]"
            >
              + Create First Convoy
            </button>
          </div>

          {/* Quick Launch Route Templates */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Popular Bangalore Circuits Ready to Host
              </h4>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">One-click route templates</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                onClick={onHostTrip}
                className="group cursor-pointer rounded-2xl bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 p-4 transition-all shadow-subtle flex flex-col justify-between"
              >
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-neutral-900">
                  <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80" alt="Nandi" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <span className="absolute top-2 left-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/75 text-white border border-white/20">1 DAY</span>
                  <span className="absolute bottom-2 right-2 text-xs font-mono text-white font-medium">~60 km</span>
                </div>
                <div>
                  <h5 className="font-semibold text-sm text-zinc-950 dark:text-zinc-50">Nandi Hills Sunrise Cruise</h5>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Early morning coffee run via Airport Toll Plaza.</p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-[#f04f23] font-medium">
                  <span>Host this route</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div
                onClick={onHostTrip}
                className="group cursor-pointer rounded-2xl bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 p-4 transition-all shadow-subtle flex flex-col justify-between"
              >
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-neutral-900">
                  <img src="https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80" alt="Coorg" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <span className="absolute top-2 left-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/75 text-white border border-white/20">2 DAYS</span>
                  <span className="absolute bottom-2 right-2 text-xs font-mono text-white font-medium">~265 km</span>
                </div>
                <div>
                  <h5 className="font-semibold text-sm text-zinc-950 dark:text-zinc-50">Coorg Ghats & Coffee Estates</h5>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Weekend mountain pass cruise with hairpin bends.</p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-[#f04f23] font-medium">
                  <span>Host this route</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div
                onClick={onHostTrip}
                className="group cursor-pointer rounded-2xl bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 p-4 transition-all shadow-subtle flex flex-col justify-between"
              >
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-neutral-900">
                  <img src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80" alt="Sakleshpur" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <span className="absolute top-2 left-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/75 text-white border border-white/20">2 DAYS</span>
                  <span className="absolute bottom-2 right-2 text-xs font-mono text-white font-medium">~220 km</span>
                </div>
                <div>
                  <h5 className="font-semibold text-sm text-zinc-950 dark:text-zinc-50">Sakleshpur Mist Run</h5>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Scenic Western Ghats monsoon & forest route.</p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-[#f04f23] font-medium">
                  <span>Host this route</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => {
            const isHost = trip.hostUser?.id === user?.id;
            const isMember = trip.members?.some(m => m.user?.id === user?.id);
            const isFull = trip.isFull || (trip.members?.length >= trip.maxMembers);
            const hasPendingReq = trip.myJoinRequestStatus === 'PENDING';

            return (
              <div
                key={trip.id}
                className="group rounded-2xl bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all overflow-hidden flex flex-col justify-between shadow-subtle"
              >
                <div>
                  {/* Card Cover Image with Cinematic 16:10 Ratio */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-900">
                    <img
                      src={trip.coverImageUrl || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80"}
                      alt={trip.destination}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                    {/* Metadata Overlays on Image */}
                    <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-black/75 text-zinc-200 backdrop-blur-xs border border-white/15">
                        {trip.numberOfDays} {trip.numberOfDays === 1 ? 'DAY' : 'DAYS'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-black/75 text-zinc-200 backdrop-blur-xs border border-white/15">
                        {trip.travelMode === 'CAR' ? 'CAR' : 'BIKE'}
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      {isFull ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-rose-600 text-white shadow-xs">
                          FULL
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-black/75 text-emerald-400 border border-emerald-500/20">
                          {trip.members?.length || 1}/{trip.maxMembers} RIDERS
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between text-white">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                          Destination
                        </span>
                        <h3 className="font-semibold text-base text-white tracking-tight truncate">
                          {trip.destination}
                        </h3>
                      </div>
                      <span className="text-xs font-mono font-medium text-white/90 shrink-0">
                        ~{trip.estimatedDistanceKm} km
                      </span>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h4 className="font-medium text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1 tracking-tight">
                        {trip.title}
                      </h4>
                      {trip.description && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                          {trip.description}
                        </p>
                      )}
                    </div>

                    {/* Schedule & Meeting Checkpoint */}
                    <div className="space-y-1.5 pt-1 text-xs border-t border-zinc-100 dark:border-zinc-800/80">
                      <div className="flex items-center text-zinc-500 dark:text-zinc-400 space-x-2">
                        <Calendar className="w-3.5 h-3.5 shrink-0 stroke-[1.5]" />
                        <span className="font-mono text-[11px] text-zinc-900 dark:text-zinc-100 font-medium">
                          {trip.rideDate} at {trip.scheduledTime}
                        </span>
                      </div>

                      <div className="flex items-start text-zinc-500 dark:text-zinc-400 space-x-2">
                        <MapPin className="w-3.5 h-3.5 shrink-0 stroke-[1.5] text-[#f04f23] mt-0.5" />
                        <span className="truncate text-xs text-zinc-900 dark:text-zinc-100" title={trip.meetingPointName}>
                          {trip.meetingPointName.split(',')[0]}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          Host: <strong className="text-zinc-900 dark:text-zinc-100 font-medium">{trip.hostUser?.name?.split(' ')[0]}</strong>
                        </span>
                        {trip.hostUser?.avgRating && (
                          <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                            ★ {trip.hostUser.avgRating}
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Single Primary Action Button */}
                <div className="p-4 pt-0">
                  {isHost ? (
                    <button
                      onClick={() => onViewTripDetails(trip.id)}
                      className="w-full py-2 px-3 rounded-full bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 text-xs font-medium transition-all flex items-center justify-center space-x-1.5 shadow-sm"
                    >
                      <span>Manage Tour</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
                    </button>
                  ) : isMember ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onOpenTripChat(trip)}
                        className="py-2 px-3 rounded-full bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 text-xs font-medium flex items-center justify-center space-x-1 shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5 stroke-[1.75]" />
                        <span>Chat</span>
                      </button>
                      <button
                        onClick={() => onViewTripDetails(trip.id)}
                        className="py-2 px-3 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  ) : hasPendingReq ? (
                    <button
                      onClick={() => onViewTripDetails(trip.id)}
                      className="w-full py-2 px-3 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium flex items-center justify-center space-x-1.5"
                    >
                      <span>Request Pending</span>
                    </button>
                  ) : isFull ? (
                    <button
                      onClick={() => onViewTripDetails(trip.id)}
                      className="w-full py-2 px-3 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 text-xs font-medium"
                    >
                      <span>Convoy Full</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onViewTripDetails(trip.id)}
                      className="w-full py-2 px-3 rounded-full bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 text-xs font-medium transition-all flex items-center justify-center space-x-1.5 active:scale-[0.99] shadow-sm"
                    >
                      <span>View Route & Join</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      </div>
    </div>
  );
}
