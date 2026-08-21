import React, { useState } from 'react';
import { api } from '../api/client';
import { BANGALORE_DESTINATIONS } from '../data/destinations';
import { MapPin, Calendar, Clock, Bike, Car, ArrowRight, CheckCircle2, Compass } from 'lucide-react';

export default function PostIntentPage({ onIntentCreated, onOpenMatcherModal }) {
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
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);

    try {
      const payload = {
        destination,
        travelMode,
        pace,
        rideDate,
        windowStartTime: `${startTime}:00`,
        windowEndTime: `${endTime}:00`,
        startingArea,
        notes
      };

      const result = await api.createIntent(payload);
      setSuccessMsg(`Ride intent for ${destination} created successfully.`);

      setTimeout(() => {
        if (onIntentCreated) onIntentCreated(result);
      }, 1000);
    } catch (err) {
      alert("Failed to post ride intent: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
          <Compass className="w-3.5 h-3.5" />
          <span>WEEKEND CONVOY MATCHER</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Post Ride Intent</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Select your destination, departure window, and riding pace to match with a 3–6 member convoy.
        </p>
      </div>

      {successMsg && (
        <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 1. Destination Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2.5">
            1. Select Bangalore Weekend Destination
          </label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {BANGALORE_DESTINATIONS.map((dest) => {
              const isSelected = destination === dest.name;
              return (
                <div
                  key={dest.id}
                  onClick={() => { setDestination(dest.name); setTravelMode(dest.popularMode); }}
                  className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all border p-3 flex flex-col justify-between ${
                    isSelected
                      ? 'border-slate-900 bg-slate-100 dark:border-white dark:bg-[#161f33] dark:ring-2 dark:ring-white/40 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-[#111726] dark:hover:border-slate-700'
                  }`}
                >
                  <div className="h-28 rounded-xl overflow-hidden relative mb-2.5 shadow-inner">
                    <img src={dest.image} alt={dest.name} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"></div>
                    <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/75 text-white backdrop-blur-xs border border-white/20">
                      {dest.badge}
                    </span>
                    <span className="absolute bottom-2 right-2 text-xs font-bold text-white">
                      ~{dest.distanceKm} km
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{dest.name}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{dest.tagline}</p>
                    
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center text-slate-700 dark:text-slate-300 font-medium truncate">
                        <MapPin className="w-3 h-3 mr-1 shrink-0 text-slate-400 dark:text-white" />
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
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">2. Travel Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTravelMode('BIKE')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center space-x-1.5 transition-colors min-h-[44px] ${
                  travelMode === 'BIKE'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-transparent shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-[#172033] dark:text-slate-400 dark:border-slate-700/60'
                }`}
              >
                <Bike className="w-4 h-4" />
                <span>Solo Biker</span>
              </button>

              <button
                type="button"
                onClick={() => setTravelMode('CAR')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center space-x-1.5 transition-colors min-h-[44px] ${
                  travelMode === 'CAR'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-transparent shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-[#172033] dark:text-slate-400 dark:border-slate-700/60'
                }`}
              >
                <Car className="w-4 h-4" />
                <span>Solo Driver</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">3. Riding Pace</label>
            <select
              value={pace}
              onChange={(e) => setPace(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-[#172033] border border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white min-h-[44px]"
            >
              <option value="RELAXED">Relaxed Cruiser (50–70 km/h)</option>
              <option value="MODERATE">Moderate Touring (70–90 km/h)</option>
              <option value="BRISK">Brisk Sporty (90–110 km/h)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">4. Ride Date</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="date"
                required
                value={rideDate}
                onChange={(e) => setRideDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-[#172033] border border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white min-h-[44px]"
              />
            </div>
          </div>

        </div>

        {/* 3. Time Window & Starting Area */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Earliest Departure</label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-[#172033] border border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Latest Departure</label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-[#172033] border border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Bangalore Area</label>
            <select
              value={startingArea}
              onChange={(e) => setStartingArea(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-[#172033] border border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white min-h-[44px]"
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
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-sm">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Optional Convoy Notes</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Carrying toolkit, looking for breakfast stop at highway dhaba"
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-[#172033] border border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white min-h-[44px]"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onOpenMatcherModal}
            className="text-xs font-semibold text-slate-700 dark:text-white hover:underline"
          >
            Inspect matching graph & cluster logic
          </button>

          <button
            type="submit"
            disabled={loading}
            className="py-3 px-6 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 shadow-sm transition-all disabled:opacity-50 flex items-center justify-center space-x-2 min-h-[44px]"
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
