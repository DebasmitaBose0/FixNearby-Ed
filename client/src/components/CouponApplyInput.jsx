import React, { useState } from 'react';

const CouponApplyInput = ({ onApplyCoupon }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleApply = async () => {
    if (!code) return;
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/rewards/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: `Coupon applied! ${data.data.discountPercentage}% off.` });
        if (onApplyCoupon) onApplyCoupon(data.data);
      } else {
        setMsg({ type: 'error', text: data.message });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Error applying coupon' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Promo / Referral Code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="border p-2 rounded flex-1 uppercase"
        />
        <button
          onClick={handleApply}
          disabled={loading}
          className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? 'Validating...' : 'Apply'}
        </button>
      </div>
      {msg && (
        <p className={`text-xs mt-1 ${msg.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
          {msg.text}
        </p>
      )}
    </div>
  );
};

export default CouponApplyInput;
