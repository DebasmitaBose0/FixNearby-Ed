import React from 'react';

const PriceBreakdownModal = ({ isOpen, onClose, quote }) => {
  if (!isOpen || !quote) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <h3 className="text-xl font-bold mb-4">Transparent Price Breakdown</h3>
        <div className="space-y-2 border-b pb-4">
          <div className="flex justify-between">
            <span>Base Service Rate:</span>
            <span>${quote.baseRate}</span>
          </div>
          <div className="flex justify-between text-amber-600">
            <span>Peak Demand Surge:</span>
            <span>+${quote.surgeAmount}</span>
          </div>
          <div className="flex justify-between">
            <span>Travel & Distance Fee:</span>
            <span>+${quote.distanceFee}</span>
          </div>
        </div>
        <div className="flex justify-between font-bold text-lg mt-4">
          <span>Total Estimate:</span>
          <span className="text-indigo-600">${quote.finalRate}</span>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-slate-800 text-white py-2 rounded hover:bg-slate-900"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default PriceBreakdownModal;
