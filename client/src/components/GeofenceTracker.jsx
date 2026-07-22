import React, { useState } from 'react';

const GeofenceTracker = ({ bookingId, targetLocation, onCheckInSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [distance, setDistance] = useState(null);

  const handleCheckIn = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch('/api/telemetry/check-in', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId, lat: latitude, lng: longitude })
          });
          const data = await res.json();
          if (data.success) {
            setDistance(data.data.distanceFromTargetMeters);
            if (onCheckInSuccess) onCheckInSuccess(data.data);
          } else {
            setError(data.message);
          }
        } catch (err) {
          setError('Failed to transmit location telemetry');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError('Location permission denied');
        setLoading(false);
      }
    );
  };

  return (
    <div className="p-4 border rounded bg-slate-50">
      <h3 className="font-bold text-lg mb-2">Job Location Verification</h3>
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      {distance !== null && <div className="text-green-600 font-semibold mb-2">Checked in successfully! Distance: {distance}m</div>}
      <button
        onClick={handleCheckIn}
        disabled={loading}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Validating GPS Location...' : 'Check In at Job Site'}
      </button>
    </div>
  );
};

export default GeofenceTracker;
