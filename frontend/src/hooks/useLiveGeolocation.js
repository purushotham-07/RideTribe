import { useState, useEffect, useRef, useCallback } from 'react';

export function useLiveGeolocation({ enabled = true, onLocationUpdate }) {
  const [coords, setCoords] = useState(null);
  const [gpsActive, setGpsActive] = useState(false);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'granted', 'denied', 'prompt', 'unsupported'
  const watchIdRef = useRef(null);
  const onLocationUpdateRef = useRef(onLocationUpdate);

  useEffect(() => {
    onLocationUpdateRef.current = onLocationUpdate;
  }, [onLocationUpdate]);

  // Check browser permission status if supported
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' })
        .then((result) => {
          setPermissionStatus(result.state);
          result.onchange = () => {
            setPermissionStatus(result.state);
          };
        })
        .catch(() => {});
    }
  }, []);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setPermissionStatus('unsupported');
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 2000
    };

    const handleSuccess = (position) => {
      const { latitude, longitude, speed, heading, accuracy } = position.coords;
      const speedKmH = speed ? Math.round(speed * 3.6) : 0;

      const locData = {
        lat: Number(latitude.toFixed(6)),
        lng: Number(longitude.toFixed(6)),
        speed: speedKmH,
        heading: heading ? Math.round(heading) : 0,
        accuracy: accuracy ? Math.round(accuracy) : 10,
        timestamp: position.timestamp
      };

      setCoords(locData);
      setGpsActive(true);
      setError(null);
      setPermissionStatus('granted');

      if (onLocationUpdateRef.current) {
        onLocationUpdateRef.current(locData);
      }
    };

    const handleError = (err) => {
      if (err.code === 1) {
        // User denied geolocation or browser has blocked it due to prior dismissals
        setPermissionStatus('denied');
        setError("Location permission denied or blocked. You can reset it in browser settings (click 🔒 / tune icon next to the URL).");
        // Clear any active watch to avoid redundant browser requests
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
      } else if (err.code === 2) {
        setError("GPS position unavailable. Check device GPS / location services.");
      } else if (err.code === 3) {
        setError("GPS signal timeout. Retrying...");
      }
      setGpsActive(false);
    };

    // If permission is known to be denied, do not spam browser requests
    if (permissionStatus === 'denied') {
      return;
    }

    // First do an immediate getCurrentPosition
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);

    // Then start continuous watchPosition
    watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, handleError, options);
  }, [permissionStatus]);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setGpsActive(false);
  }, []);

  useEffect(() => {
    if (enabled) {
      startWatching();
    } else {
      stopWatching();
    }

    return () => {
      stopWatching();
    };
  }, [enabled, startWatching, stopWatching]);

  const requestPermission = () => {
    startWatching();
  };

  return {
    coords,
    gpsActive,
    error,
    permissionStatus,
    startWatching,
    stopWatching,
    requestPermission
  };
}
