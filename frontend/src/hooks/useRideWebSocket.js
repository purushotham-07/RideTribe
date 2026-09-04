import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { api } from '../api/client';

export function useRideWebSocket(groupId, currentUser) {
  const [connected, setConnected] = useState(false);
  const [groupLocations, setGroupLocations] = useState(null);
  const [regroupAlert, setRegroupAlert] = useState(null);
  const [sosAlert, setSosAlert] = useState(null);
  const stompClientRef = useRef(null);
  const pollTimerRef = useRef(null);

  // Clear alerts
  const clearRegroupAlert = useCallback(() => setRegroupAlert(null), []);
  const clearSosAlert = useCallback(() => setSosAlert(null), []);

  useEffect(() => {
    if (!groupId) return;

    let isMounted = true;

    // Fetch initial location state via REST
    api.getGroupLocations(groupId)
      .then(data => {
        if (isMounted && data) {
          setGroupLocations(data);
        }
      })
      .catch(err => console.warn("Initial location fetch failed:", err));

    // STOMP Client setup - fallback to API base URL if set, otherwise window.location
    let wsUrl = import.meta.env.VITE_WS_URL;
    if (!wsUrl) {
      const apiBase = import.meta.env.VITE_API_URL;
      if (apiBase) {
        wsUrl = `${apiBase.replace(/^http/, 'http')}/ws`;
      } else {
        wsUrl = (window.location.protocol === 'https:' ? 'https://' : 'http://') + window.location.host + '/ws';
      }
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (msg) => {
        // console.log("[STOMP]", msg);
      },
      onConnect: () => {
        if (!isMounted) return;
        setConnected(true);
        console.log(`✅ STOMP connected to /ws for Ride Group ${groupId}`);

        // 1. Subscribe to Live Group Locations
        client.subscribe(`/topic/ride-groups/${groupId}/locations`, (message) => {
          try {
            const data = JSON.parse(message.body);
            setGroupLocations(data);
          } catch (e) {
            console.error("Error parsing location update:", e);
          }
        });

        // 2. Subscribe to Regroup Checkpoint Alerts
        client.subscribe(`/topic/ride-groups/${groupId}/regroup-alert`, (message) => {
          try {
            const alert = JSON.parse(message.body);
            setRegroupAlert(alert);
          } catch (e) {
            console.error("Error parsing regroup alert:", e);
          }
        });

        // 3. Subscribe to SOS Siren Alerts
        client.subscribe(`/topic/ride-groups/${groupId}/sos-alert`, (message) => {
          try {
            const alert = JSON.parse(message.body);
            setSosAlert(alert);
          } catch (e) {
            console.error("Error parsing SOS alert:", e);
          }
        });
      },
      onDisconnect: () => {
        if (isMounted) setConnected(false);
      },
      onStompError: (frame) => {
        console.warn("STOMP error, falling back to REST sync:", frame.headers['message']);
      }
    });

    client.activate();
    stompClientRef.current = client;

    // Fallback polling every 6 seconds to ensure data freshness even if WS drops
    pollTimerRef.current = setInterval(() => {
      api.getGroupLocations(groupId)
        .then(data => {
          if (isMounted && data && data.locations) {
            setGroupLocations(prev => {
              // Only update if no recent websocket push
              if (!prev || !prev.timestamp || (new Date() - new Date(prev.timestamp) > 5000)) {
                return data;
              }
              return prev;
            });
          }
        })
        .catch(() => {});
    }, 6000);

    return () => {
      isMounted = false;
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [groupId]);

  // Send live telemetry ping
  const sendLocation = useCallback((locationData) => {
    if (!groupId || !currentUser) return;

    const payload = {
      userId: currentUser.id,
      userName: currentUser.name,
      avatarUrl: currentUser.avatarUrl,
      vehicleModel: currentUser.vehicleModel,
      rideGroupId: groupId,
      lat: locationData.lat,
      lng: locationData.lng,
      speed: locationData.speed || 0,
      heading: locationData.heading || 0,
      battery: locationData.battery || 100,
      onMyWay: locationData.onMyWay,
      isLead: locationData.isLead
    };

    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.publish({
        destination: `/app/ride-groups/${groupId}/location`,
        body: JSON.stringify(payload)
      });
    } else {
      // REST fallback
      api.postLocation(groupId, payload).catch(err => console.error("REST location send error:", err));
    }
  }, [groupId, currentUser]);

  // Send high-priority SOS beacon
  const sendSos = useCallback(async (sosData) => {
    if (!groupId || !currentUser) return;

    const payload = {
      rideGroupId: groupId,
      lat: sosData.lat,
      lng: sosData.lng,
      notes: sosData.notes || "Rider triggered emergency SOS beacon!"
    };

    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.publish({
        destination: `/app/ride-groups/${groupId}/sos`,
        body: JSON.stringify(payload)
      });
    }

    // Also persist via REST for database audit log
    try {
      const result = await api.triggerSos(payload);
      setSosAlert(result);
      return result;
    } catch (err) {
      console.error("SOS trigger error:", err);
      throw err;
    }
  }, [groupId, currentUser]);

  return {
    connected,
    groupLocations,
    regroupAlert,
    sosAlert,
    sendLocation,
    sendSos,
    clearRegroupAlert,
    clearSosAlert
  };
}
