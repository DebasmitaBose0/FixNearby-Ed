import React, { useState } from 'react';

const EmergencyDispatchModal = ({ isOpen, onClose }) => {
  const [category, setCategory] = useState('PLUMBING_LEAK');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(null);

  if (!isOpen) return null;

  const handleBroadcast = async () => {
    setStatus('Broadcasting to nearby workers...');
    try {
      const res = await fetch('/api/emergency/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emergencyCategory: category, description })
      });
      const data = await res.json();
      if (data.success) {
        setStatus('Emergency broadcast active! Worker response expected within 90 seconds.');
      } else {
        setStatus('Failed to launch broadcast.');
      }
    } catch (err) {
      setStatus('Network error initiating emergency request.');
    }
  };

  return (
    <div className="fixed inset-0 bg-red-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border-2 border-red-500">
        <h2 className="text-2xl font-black text-red-600 mb-2">🚨 Express Emergency Dispatch</h2>
        <p className="text-sm text-gray-600 mb-4">Instant broadcast to all active pros within 5km.</p>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        >
          <option value="PLUMBING_LEAK">Plumbing Pipe Burst</option>
          <option value="POWER_OUTAGE">Electrical Power Hazard</option>
          <option value="LOCKOUT">Lockout Emergency</option>
        </select>
        <textarea
          placeholder="Describe urgency..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 rounded mb-4"
          rows={3}
        />
        {status && <p className="text-xs font-semibold text-red-600 mb-4">{status}</p>}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 border py-2 rounded">Cancel</button>
          <button onClick={handleBroadcast} className="flex-1 bg-red-600 text-white font-bold py-2 rounded hover:bg-red-700">
            Dispatch Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyDispatchModal;
