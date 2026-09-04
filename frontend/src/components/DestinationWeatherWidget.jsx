import React from 'react';
import { CloudSun, Wind, Droplets, Compass, ShieldCheck } from 'lucide-react';

const DESTINATION_WEATHER = {
  "Nandi Hills": {
    temp: "21°C",
    condition: "Crisp & Foggy",
    visibility: "High (9 km)",
    rainProb: "0%",
    wind: "12 km/h",
    roadStatus: "Dry & Smooth",
    score: "9.6 / 10 (Ideal Sunrise)"
  },
  "Coorg (Madikeri)": {
    temp: "24°C",
    condition: "Cool Mountain Breeze",
    visibility: "Excellent",
    rainProb: "10%",
    wind: "8 km/h",
    roadStatus: "Scenic Curves",
    score: "9.2 / 10"
  },
  "Chikmagalur": {
    temp: "23°C",
    condition: "Pleasant Hill Station",
    visibility: "Clear (12 km)",
    rainProb: "5%",
    wind: "10 km/h",
    roadStatus: "Good Highway",
    score: "9.4 / 10"
  },
  "Lepakshi": {
    temp: "27°C",
    condition: "Sunny Highway",
    visibility: "Clear (15 km)",
    rainProb: "0%",
    wind: "14 km/h",
    roadStatus: "Fast NH-44",
    score: "9.5 / 10"
  },
  "Skandagiri": {
    temp: "20°C",
    condition: "Misty Pre-Dawn",
    visibility: "Moderate",
    rainProb: "0%",
    wind: "15 km/h",
    roadStatus: "Dry Asphalt",
    score: "9.1 / 10"
  },
  "Wayanad": {
    temp: "25°C",
    condition: "Green Forest Route",
    visibility: "Clear",
    rainProb: "15%",
    wind: "6 km/h",
    roadStatus: "Ghats / Curves",
    score: "8.9 / 10"
  }
};

export default function DestinationWeatherWidget({ destination = "Nandi Hills" }) {
  const data = DESTINATION_WEATHER[destination] || DESTINATION_WEATHER["Nandi Hills"];

  return (
    <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CloudSun className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Route Weather & Conditions
          </span>
        </div>
        <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-foreground border border-border">
          ⭐ Score: {data.score}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-3 rounded-xl bg-secondary/40 border border-border">
          <span className="text-[10px] text-muted-foreground block font-medium">Temperature</span>
          <span className="font-bold text-foreground text-sm">{data.temp}</span>
          <span className="text-[10px] text-muted-foreground block truncate">{data.condition}</span>
        </div>

        <div className="p-3 rounded-xl bg-secondary/40 border border-border">
          <span className="text-[10px] text-muted-foreground block font-medium">Precipitation</span>
          <span className="font-bold text-foreground text-sm">{data.rainProb}</span>
          <span className="text-[10px] text-emerald-500 font-medium block">Rain Free</span>
        </div>

        <div className="p-3 rounded-xl bg-secondary/40 border border-border">
          <span className="text-[10px] text-muted-foreground block font-medium">Road Surface</span>
          <span className="font-bold text-foreground text-sm">{data.roadStatus}</span>
          <span className="text-[10px] text-muted-foreground block">Good Grip</span>
        </div>

        <div className="p-3 rounded-xl bg-secondary/40 border border-border">
          <span className="text-[10px] text-muted-foreground block font-medium">Visibility</span>
          <span className="font-bold text-foreground text-sm">{data.visibility}</span>
          <span className="text-[10px] text-muted-foreground block">Wind: {data.wind}</span>
        </div>
      </div>
    </div>
  );
}
