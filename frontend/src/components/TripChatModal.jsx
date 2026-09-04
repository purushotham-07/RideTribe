import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { X, Send, MessageSquare, Radio, User, Sparkles, CheckCircle2, Heart } from 'lucide-react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const PRE_RIDE_QUICK_SHOUTS = [
  "📍 Meetup location confirmed!",
  "🧳 Packing checklist ready!",
  "⛽ Fuel tank is 100% full",
  "⏰ Leaving my place in 15 mins",
  "☕ Ready for breakfast stop!",
  "🌧️ Carrying rain gear"
];

const POST_RIDE_MEMORIES_SHOUTS = [
  "📸 Awesome ride team! Shared memories.",
  "🛣️ That scenic twisty section was unreal!",
  "☕ Loved the highway breakfast stop!",
  "👑 Huge thanks to our convoy lead!",
  "🏍️ Ready for the next weekend tour!"
];

export default function TripChatModal({ trip, isOpen, onClose }) {
  if (!isOpen || !trip) return null;

  const { user } = useAuth();
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const stompClientRef = useRef(null);

  const isCompleted = trip.status === 'COMPLETED';
  const quickShouts = isCompleted ? POST_RIDE_MEMORIES_SHOUTS : PRE_RIDE_QUICK_SHOUTS;

  const fetchMessages = async () => {
    try {
      const data = await api.getTripChat(trip.id);
      setMessages(data || []);
    } catch (err) {
      console.error("Error fetching trip chat:", err);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Setup STOMP WebSocket connection
    const API_BASE = import.meta.env.VITE_API_URL || '';
    const socket = new SockJS(`${API_BASE}/ws-ridetribe`);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      debug: () => {},
      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe(`/topic/trips/${trip.id}/chat`, (message) => {
          try {
            const newMsg = JSON.parse(message.body);
            setMessages(prev => {
              if (prev.some(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          } catch (e) {
            console.error("Error parsing chat socket msg:", e);
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
      }
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [trip.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text || !text.trim()) return;

    setSending(true);
    try {
      const newMsg = await api.sendTripChat(trip.id, text.trim());
      setMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      setInputText('');
    } catch (err) {
      toast.error("Failed to send message: " + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0c0d10] text-zinc-900 dark:text-zinc-100 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-white dark:bg-[#0c0d10] text-zinc-900 dark:text-zinc-100 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center font-bold">
              <MessageSquare className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate max-w-[220px]">
                  {trip.title || trip.destination}
                </h3>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {isCompleted ? 'Completed Trip • Post-Ride Discussion' : `${trip.members?.length || 1} Convoy Members • ${trip.destination}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center transition-colors border border-zinc-200 dark:border-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Shouts / Memories Bar */}
        <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 flex items-center space-x-1.5 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider shrink-0 ml-1">
            {isCompleted ? 'Discuss:' : 'Quick:'}
          </span>
          {quickShouts.map((shout) => (
            <button
              key={shout}
              type="button"
              onClick={() => handleSendMessage(shout)}
              className="px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shrink-0 whitespace-nowrap shadow-xs"
            >
              {shout}
            </button>
          ))}
        </div>

        {/* Chat Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-zinc-50/40 dark:bg-[#08090b]">
          {messages.length === 0 ? (
            <div className="py-16 text-center text-zinc-400 dark:text-zinc-500 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-xs">
                {isCompleted
                  ? 'Share your ride stories, photos, and thank the convoy team!'
                  : 'No messages yet. Send a quick shout or greet your ride mates!'}
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.sender?.id === user?.id;
              return (
                <div
                  key={m.id}
                  className={`flex items-end space-x-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMe && (
                    <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden shrink-0 flex items-center justify-center">
                      {m.sender?.avatarUrl ? (
                        <img src={m.sender.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                      )}
                    </div>
                  )}

                  <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-xs shadow-xs ${
                    isMe
                      ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-medium rounded-br-xs'
                      : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-bl-xs border border-zinc-200 dark:border-zinc-800'
                  }`}>
                    {!isMe && (
                      <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mb-0.5">
                        {m.sender?.name} {m.sender?.vehicleModel ? `(${m.sender.vehicleModel.split(' ')[0]})` : ''}
                      </p>
                    )}
                    <p className="leading-relaxed">{m.content}</p>
                    <p className={`text-[9px] text-right mt-1 opacity-70 ${isMe ? 'text-zinc-400 dark:text-zinc-600' : 'text-zinc-400 dark:text-zinc-500'}`}>
                      {m.sentAt ? new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          className="p-3 bg-white dark:bg-[#0c0d10] border-t border-zinc-200 dark:border-zinc-800 flex items-center space-x-2 shrink-0"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isCompleted ? "Share post-ride feedback, memories, or stories..." : "Type message or tap quick shout..."}
            className="flex-1 px-4 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="p-2.5 rounded-full bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 disabled:opacity-40 transition-opacity shadow-xs flex items-center justify-center"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
}
