import React, { useState } from 'react';
import { Radio, Send, Coffee, Fuel, AlertTriangle, Camera, CheckCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RADIO_PRESETS = [
  { label: "Tea Break (5km)", icon: Coffee, text: "☕ Planning tea/breakfast break at the next toll in 5km!" },
  { label: "Fuel Stop", icon: Fuel, text: "⛽ Need a quick 5-min fuel stop at upcoming pump." },
  { label: "Road Hazard", icon: AlertTriangle, text: "⚠️ Road hazard/speed breakers ahead, watch convoy speed!" },
  { label: "Photo Point", icon: Camera, text: "📸 Scenic viewpoint coming up, slowing down for photos." },
  { label: "All Regrouped", icon: CheckCheck, text: "✅ Convoy all together and rolling smoothly." }
];

export default function ConvoyRadioChat({ groupId, members }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      senderName: "Lead Rider",
      senderAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      text: "👋 Welcome everyone! Convoy speed target: 70-80 km/h. Keep safe 2-bike distance.",
      time: "06:15 AM",
      isLead: true
    }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = (textToSend) => {
    const msg = textToSend || inputText;
    if (!msg.trim()) return;

    const newMsg = {
      id: Date.now(),
      senderName: user?.name || "Rider",
      senderAvatar: user?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      text: msg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
  };

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center shrink-0 shadow-xs">
            <Radio className="w-3.5 h-3.5 text-[#f04f23]" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 block">
              Convoy Radio & Comms
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60 flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Ch. 1 Live</span>
        </span>
      </div>

      {/* Quick Radio Shouts */}
      <div>
        <span className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 block mb-2 tracking-wider">
          1-Tap Quick Shouts
        </span>
        <div className="flex flex-wrap gap-1.5">
          {RADIO_PRESETS.map((p, idx) => {
            const Icon = p.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(p.text)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-200 text-xs font-medium border border-zinc-200/80 dark:border-zinc-800 transition-colors shadow-xs active:scale-[0.98]"
              >
                <Icon className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Message Feed */}
      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-3 rounded-xl text-xs space-y-1 border transition-colors ${
              m.isMe
                ? 'bg-zinc-100/70 dark:bg-zinc-900/90 border-zinc-200 dark:border-zinc-800 ml-4'
                : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200/90 dark:border-zinc-800/80 mr-4'
            }`}
          >
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center space-x-2 font-semibold text-zinc-900 dark:text-zinc-100">
                {m.senderAvatar ? (
                  <img src={m.senderAvatar} alt="" className="w-5 h-5 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#f04f23] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {m.senderName?.charAt(0) || 'R'}
                  </div>
                )}
                <span className="truncate max-w-[140px]">{m.senderName}</span>
                {m.isLead && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#f04f23]/15 text-[#f04f23] font-mono font-bold tracking-wider">
                    LEAD
                  </span>
                )}
              </div>
              <span className="text-zinc-400 dark:text-zinc-500 font-mono text-[10px]">{m.time}</span>
            </div>
            <p className="text-zinc-800 dark:text-zinc-200 text-xs pl-7 leading-relaxed font-normal">
              {m.text}
            </p>
          </div>
        ))}
      </div>

      {/* Custom Text Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center space-x-2 pt-1"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Send quick convoy message..."
          className="flex-1 px-4 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
        />
        <button
          type="submit"
          className="p-2.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:opacity-90 active:scale-95 transition-all shrink-0 flex items-center justify-center shadow-xs"
          title="Send broadcast"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
