import React, { useState } from 'react';
import { ShieldCheck, CheckSquare, Square, Check } from 'lucide-react';

const SAFETY_ITEMS = [
  { id: 'helmet', label: 'Helmet & Riding Jacket / Gear Strapped' },
  { id: 'tyre', label: 'Tyre Pressure & Front/Rear Brakes Inspected' },
  { id: 'fuel', label: 'Fuel Tank Filled / Battery > 75%' },
  { id: 'contact', label: 'Emergency Contact Verified in Profile' },
  { id: 'docs', label: 'Vehicle Documents & Driving License Handy' }
];

export default function PreRideSafetyChecklist() {
  const [checkedItems, setCheckedItems] = useState({
    helmet: true,
    tyre: true,
    fuel: true,
    contact: true,
    docs: true
  });

  const toggleItem = (id) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const isAllDone = completedCount === SAFETY_ITEMS.length;

  return (
    <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Pre-Ride Safety Checklist
          </span>
        </div>
        <span className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${
          isAllDone
            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            : 'bg-secondary text-muted-foreground border-border'
        }`}>
          {completedCount}/{SAFETY_ITEMS.length} Ready {isAllDone && '✓'}
        </span>
      </div>

      <div className="space-y-1.5">
        {SAFETY_ITEMS.map((item) => {
          const checked = checkedItems[item.id];
          return (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors text-xs ${
                checked
                  ? 'bg-emerald-500/5 border-emerald-500/30 text-foreground'
                  : 'bg-secondary/40 border-border text-muted-foreground'
              }`}
            >
              <span className="font-medium text-xs">{item.label}</span>
              <div className={`w-4 h-4 rounded-md flex items-center justify-center border shrink-0 transition-colors ${
                checked
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'border-border bg-background'
              }`}>
                {checked && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
