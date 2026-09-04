import React, { useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import MeetingPinMapPicker from './MeetingPinMapPicker';
import { X, Bike, Car, Calendar, Clock, Users, Shield, MapPin, Sparkles, Check, ArrowRight, Package, Compass } from 'lucide-react';

const POPULAR_SUGGESTIONS = [
  { name: "Nandi Hills", distanceKm: 60, image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80" },
  { name: "Coorg (Madikeri)", distanceKm: 265, image: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80" },
  { name: "Chikmagalur", distanceKm: 245, image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80" },
  { name: "Sakleshpur", distanceKm: 220, image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80" },
  { name: "Lepakshi Temple", distanceKm: 120, image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&auto=format&fit=crop&q=80" },
  { name: "Wayanad Ghats", distanceKm: 280, image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80" },
  { name: "Ooty & Nilgiris", distanceKm: 275, image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80" },
  { name: "Gokarna Coast", distanceKm: 480, image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80" },
  { name: "Pondicherry", distanceKm: 310, image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop&q=80" }
];

const PACKING_PRESETS = [
  "Full-face helmet",
  "Riding jacket with armor",
  "Rain gear / Waterproof cover",
  "Puncture repair kit",
  "Compact toolkit",
  "Portable tyre inflator",
  "Hydration pack / Water bottle",
  "Power bank (10000mAh+)",
  "Warm windcheater layer",
  "First-aid kit",
  "Emergency cash",
  "Valid DL & Vehicle RC"
];

export default function HostTripModal({ isOpen, onClose, onTripCreated }) {
  if (!isOpen) return null;

  const toast = useToast();

  const getNextSaturday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = (6 - day + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split('T')[0];
  };

  const [destination, setDestination] = useState("Nandi Hills");
  const [title, setTitle] = useState("Sunrise Coffee Tour to Nandi Hills");
  const [description, setDescription] = useState("Early morning scenic highway cruise with breakfast and coffee stop. Disciplined convoy riding.");
  const [travelMode, setTravelMode] = useState('BIKE');
  const [rideDate, setRideDate] = useState(getNextSaturday());
  const [scheduledTime, setScheduledTime] = useState('05:30');
  const [numberOfDays, setNumberOfDays] = useState(1);
  const [maxMembers, setMaxMembers] = useState(4);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [selectedPacking, setSelectedPacking] = useState([
    "Full-face helmet",
    "Rain gear / Waterproof cover",
    "Puncture repair kit",
    "Valid DL & Vehicle RC"
  ]);
  const [meetingPin, setMeetingPin] = useState({
    name: 'Esteem Mall, Hebbal Flyover (Airport Rd / North)',
    lat: 13.0428,
    lng: 77.5912
  });
  const [loading, setLoading] = useState(false);

  const handleSuggestionClick = (sug) => {
    setDestination(sug.name);
    setTitle(`Weekend Tour to ${sug.name}`);
    if (sug.image) setCustomCoverUrl(sug.image);
  };

  const togglePackingItem = (item) => {
    setSelectedPacking(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!destination.trim()) {
      toast.error("Please enter a trip destination.");
      return;
    }

    setLoading(true);

    try {
      const coverImg = customCoverUrl.trim() || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80";

      const payload = {
        title: title.trim() || `${destination} Group Trip`,
        description,
        destination: destination.trim(),
        travelMode,
        rideDate,
        scheduledTime: `${scheduledTime}:00`,
        numberOfDays: Number(numberOfDays),
        maxMembers: Number(maxMembers),
        whatToCarry: selectedPacking.join(', '),
        coverImageUrl: coverImg,
        meetingPointName: meetingPin.name,
        meetingPointLat: meetingPin.lat,
        meetingPointLng: meetingPin.lng,
        destinationLat: 13.3702,
        destinationLng: 77.6835,
        estimatedDistanceKm: 60.0
      };

      const newTrip = await api.createTrip(payload);
      toast.success(`🎉 Trip "${payload.title}" hosted successfully! Open for ride mate requests.`);
      if (onTripCreated) onTripCreated(newTrip);
      onClose();
    } catch (err) {
      toast.error("Failed to host trip: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0c0d10] text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-6 bg-white dark:bg-[#0c0d10] border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#f04f23]">
              Host Convoy
            </span>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-0.5">
              Create New Ride
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* 1. Destination Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Destination
              </label>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">India Routes</span>
            </div>

            <div className="relative">
              <Compass className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3.5 top-3" strokeWidth={1.75} />
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  if (!title || title.startsWith("Weekend Tour to") || title.startsWith("Sunrise Coffee Tour to")) {
                    setTitle(`Weekend Tour to ${e.target.value}`);
                  }
                }}
                placeholder="e.g. Sakleshpur, Ooty, Chikmagalur, Munnar, Goa..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors font-medium"
              />
            </div>

            {/* Popular Suggestions Quick Pick */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 self-center mr-1">Suggested:</span>
              {POPULAR_SUGGESTIONS.map((sug) => {
                const isSelected = destination.toLowerCase() === sug.name.toLowerCase();
                return (
                  <button
                    key={sug.name}
                    type="button"
                    onClick={() => handleSuggestionClick(sug)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-transparent shadow-xs'
                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-800'
                    }`}
                  >
                    {sug.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Trip Title & Overview */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                Ride Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sunrise Coffee Tour to Nandi Hills"
                className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                Route Notes & Pace
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Early morning cruise via NH 44, breakfast stop at highway dhaba. Disciplined riding pace."
                className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors resize-none font-medium"
              />
            </div>
          </div>

          {/* 3. Travel Mode, Date, Time, Duration & Max Members */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                Mode
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setTravelMode('BIKE')}
                  className={`py-2 px-2 rounded-full text-xs font-semibold border flex items-center justify-center space-x-1.5 transition-colors ${
                    travelMode === 'BIKE'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-transparent shadow-xs'
                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-800'
                  }`}
                >
                  <Bike className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>Motorcycle</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTravelMode('CAR')}
                  className={`py-2 px-2 rounded-full text-xs font-semibold border flex items-center justify-center space-x-1.5 transition-colors ${
                    travelMode === 'CAR'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-transparent shadow-xs'
                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-800'
                  }`}
                >
                  <Car className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>Car</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                Date
              </label>
              <input
                type="date"
                required
                value={rideDate}
                onChange={(e) => setRideDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                Departure Time
              </label>
              <input
                type="time"
                required
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                Duration
              </label>
              <select
                value={numberOfDays}
                onChange={(e) => setNumberOfDays(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              >
                <option value={1}>1 Day (Single Run)</option>
                <option value={2}>2 Days (Weekend Trip)</option>
                <option value={3}>3 Days (Long Weekend)</option>
                <option value={4}>4+ Days (Expedition)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                Rider Cap
              </label>
              <select
                value={maxMembers}
                onChange={(e) => setMaxMembers(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              >
                <option value={3}>3 Riders (Tight Pace)</option>
                <option value={4}>4 Riders (Optimal)</option>
                <option value={5}>5 Riders</option>
                <option value={6}>6 Riders (Full Squad)</option>
                <option value={8}>8 Riders (Max Limit)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                Photo URL
              </label>
              <input
                type="url"
                value={customCoverUrl}
                onChange={(e) => setCustomCoverUrl(e.target.value)}
                placeholder="https://... cover photo"
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              />
            </div>
          </div>

          {/* 4. Interactive Map Pin Picker */}
          <MeetingPinMapPicker
            selectedLat={meetingPin.lat}
            selectedLng={meetingPin.lng}
            meetingPointName={meetingPin.name}
            onChange={(pin) => setMeetingPin(pin)}
          />

          {/* 5. What Should We Carry? (Packing List) */}
          <div className="space-y-2">
            <div className="flex items-center space-x-1.5">
              <Package className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" strokeWidth={1.75} />
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Packing Checklist
              </label>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Select essential gear required for this ride:</p>

            <div className="flex flex-wrap gap-1.5">
              {PACKING_PRESETS.map((item) => {
                const isSelected = selectedPacking.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => togglePackingItem(item)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center space-x-1.5 ${
                      isSelected
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-transparent shadow-xs'
                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-800'
                    }`}
                  >
                    {isSelected ? <Check className="w-3 h-3 stroke-[2.5]" /> : <span className="text-zinc-400 dark:text-zinc-500">+</span>}
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-full bg-[#f04f23] hover:bg-[#d9421a] active:scale-[0.99] text-white text-xs font-semibold transition-all disabled:opacity-50 flex items-center space-x-2 min-h-[40px] shadow-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Publish Ride</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
