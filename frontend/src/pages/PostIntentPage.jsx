import React, { useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { BANGALORE_DESTINATIONS } from '../data/destinations';
import { MapPin, Calendar, Clock, Bike, Car, ArrowRight, CheckCircle2, Compass, Sparkles } from 'lucide-react';

export default function PostIntentPage({ onIntentCreated, onOpenMatcherModal }) {
  const toast = useToast();
  const getNextSaturday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = (6 - day + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split('T')[0];
  };

  const [destination, setDestination] = useState(BANGALORE_DESTINATIONS[0].name);
  const [travelMode, setTravelMode] = useState('BIKE');
  const [pace, setPace] = useState('MODERATE');
  const [rideDate, setRideDate] = useState(getNextSaturday());
  const [startTime, setStartTime] = useState('05:30');
  const [endTime, setEndTime] = useState('07:30');
  const [startingArea, setStartingArea] = useState('Indiranagar');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!destination.trim()) {
      toast.error("Please enter a destination.");
      return;
    }
    setLoading(true);

    try {
      const payload = {
        destination: destination.trim(),
        travelMode,
        pace,
        rideDate,
        windowStartTime: `${startTime}:00`,
        windowEndTime: `${endTime}:00`,
        startingArea,
        notes
      };

      const result = await api.createIntent(payload);
      toast.success(`🎉 Ride intent for ${destination} posted successfully! Looking for group...`);

      setTimeout(() => {
        if (onIntentCreated) onIntentCreated(result);
      }, 900);
    } catch (err) {
      toast.error("Failed to post ride intent: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 font-sans">
      
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-1.5 text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400 mb-1 tracking-wide">
          <Compass className="w-3.5 h-3.5" />
          <span>WEEKEND CONVOY MATCHER</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Post Ride Intent</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Enter any destination in India, departure window, and riding pace to match with a compatible 3–6 member convoy.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 1. Destination Input (Any destination allowed) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              1. Destination (Type any place or choose below)
            </label>
            <span className="text-[11px] text-zinc-400 font-mono">Any destination in India</span>
          </div>

          <div className="relative">
            <Compass className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Sakleshpur, Nandi Hills, Ooty, Coorg, Chikmagalur, Wayanad, Goa..."
              className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-950 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-300 transition-colors"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-1">
            {BANGALORE_DESTINATIONS.map((dest) => {
              const isSelected = destination.toLowerCase() === dest.name.toLowerCase();
              return (
                <div
                  key={dest.id}
                  onClick={() => { setDestination(dest.name); setTravelMode(dest.popularMode); }}
                  className={`relative rounded-xl overflow-hidden cursor-pointer transition-all border p-3 flex flex-col justify-between ${
                    isSelected
                      ? 'border-zinc-950 bg-zinc-50 dark:border-zinc-200 dark:bg-zinc-900 ring-1 ring-zinc-950 dark:ring-zinc-200 shadow-sm'
                      : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="h-28 rounded-lg overflow-hidden relative mb-2.5 bg-zinc-100 dark:bg-zinc-900">
                    <img src={dest.image} alt={dest.name} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <span className="absolute top-2 left-2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/75 text-zinc-100 backdrop-blur-xs border border-white/20">
                      {dest.badge}
                    </span>
                    <span className="absolute bottom-2 right-2 text-xs font-mono font-medium text-white">
                      ~{dest.distanceKm} km
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm text-zinc-950 dark:text-zinc-50 tracking-tight">{dest.name}</h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">{dest.tagline}</p>
                    
                    <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center text-zinc-700 dark:text-zinc-300 font-medium truncate">
                        <MapPin className="w-3 h-3 mr-1 shrink-0 text-zinc-400" />
                        {dest.meetingPoint.split(',')[0]}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Travel Mode, Pace, Date */}
        <div className="p-5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">2. Travel Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTravelMode('BIKE')}
                className={`py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center space-x-1.5 transition-colors min-h-[40px] ${
                  travelMode === 'BIKE'
                    ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950 border-zinc-900 dark:border-zinc-50 shadow-xs'
                    : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800'
                }`}
              >
                <Bike className="w-4 h-4" />
                <span>Solo Biker</span>
              </button>

              <button
                type="button"
                onClick={() => setTravelMode('CAR')}
                className={`py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center space-x-1.5 transition-colors min-h-[40px] ${
                  travelMode === 'CAR'
                    ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950 border-zinc-900 dark:border-zinc-50 shadow-xs'
                    : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800'
                }`}
              >
                <Car className="w-4 h-4" />
                <span>Solo Driver</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">3. Riding Pace</label>
            <select
              value={pace}
              onChange={(e) => setPace(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-950 dark:text-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-300 min-h-[40px]"
            >
              <option value="RELAXED">Relaxed Cruiser (50–70 km/h)</option>
              <option value="MODERATE">Moderate Touring (70–90 km/h)</option>
              <option value="BRISK">Brisk Sporty (90–110 km/h)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">4. Ride Date</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="date"
                required
                value={rideDate}
                onChange={(e) => setRideDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-950 dark:text-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-300 min-h-[40px]"
              />
            </div>
          </div>

        </div>

        {/* 3. Time Window & Starting Area */}
        <div className="p-5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Earliest Departure</label>
            <div className="relative">
              <Clock className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-950 dark:text-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-300 min-h-[40px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Latest Departure</label>
            <div className="relative">
              <Clock className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-950 dark:text-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-300 min-h-[40px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Bangalore Area</label>
            <select
              value={startingArea}
              onChange={(e) => setStartingArea(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-950 dark:text-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-300 min-h-[40px]"
            >
              <option value="Indiranagar">Indiranagar (East)</option>
              <option value="Koramangala">Koramangala (South-East)</option>
              <option value="HSR Layout">HSR Layout (South-East)</option>
              <option value="Whitefield">Whitefield (East)</option>
              <option value="Hebbal">Hebbal (North)</option>
              <option value="Jayanagar">Jayanagar (South)</option>
              <option value="Malleshwaram">Malleshwaram (West)</option>
              <option value="Electronic City">Electronic City (South)</option>
            </select>
          </div>

        </div>

        {/* 4. Notes */}
        <div className="p-5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Optional Convoy Notes</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Carrying toolkit, looking for breakfast stop at highway dhaba"
            className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-950 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-300 min-h-[40px]"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onOpenMatcherModal}
            className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 flex items-center space-x-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Match Engine</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="py-2.5 px-5 rounded-lg bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 text-xs font-medium shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 min-h-[40px]"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Submit Ride Intent & Enter Match Pool</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
