import { useState, useEffect, useCallback } from 'react';

const GEO_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 300000, // 5 min cache
};

/**
 * useGeolocation
 * Returns { coords, loading, error, permissionDenied, retry }
 *   coords          – { latitude, longitude } or null
 *   loading         – true while the browser is fetching the position
 *   error           – human-readable error string, or null
 *   permissionDenied – true when the user explicitly blocked location
 *   retry           – function to re-trigger a location fetch
 */
const useGeolocation = () => {
  const [coords, setCoords]                   = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const fetchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setPermissionDenied(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLoading(false);
        setError(null);
      },
      (err) => {
        let message = 'Could not retrieve your location.';
        if (err.code === err.PERMISSION_DENIED) {
          message = 'Location permission denied. Enable it in your browser settings.';
          setPermissionDenied(true);
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          message = 'Location information is unavailable.';
        } else if (err.code === err.TIMEOUT) {
          message = 'Location request timed out. Please try again.';
        }
        setError(message);
        setLoading(false);
      },
      GEO_OPTIONS,
    );
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return { coords, loading, error, permissionDenied, retry: fetchLocation };
};

export default useGeolocation;
