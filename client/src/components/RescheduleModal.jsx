import { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import FocusTrap from './FocusTrap';

const RescheduleModal = ({ isOpen, onClose, onConfirm, submitting, error }) => {
  const [newDate, setNewDate] = useState('');
  const [localError, setLocalError] = useState('');

  if (!isOpen) return null;

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const handleConfirm = () => {
    setLocalError('');
    if (!newDate) {
      setLocalError('Please select a date and time.');
      return;
    }
    const selected = new Date(newDate);
    if (selected.getTime() <= Date.now()) {
      setLocalError('New time must be in the future.');
      return;
    }
    onConfirm(new Date(newDate).toISOString());
  };

  const handleClose = () => {
    setNewDate('');
    setLocalError('');
    onClose();
  };

  return (
    <FocusTrap active={isOpen}>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={handleClose}
        role="dialog"
        aria-modal="true"
        aria-label="Reschedule booking"
      >
        <div
          className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Calendar className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Reschedule Booking</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Pick a new date and time for your service.
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="reschedule-datetime" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                New Date & Time
              </label>
              <input
                id="reschedule-datetime"
                type="datetime-local"
                value={newDate}
                min={getMinDateTime()}
                onChange={(e) => { setNewDate(e.target.value); setLocalError(''); }}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>

            {(localError || error) && (
              <p className="text-xs font-semibold text-rose-600">{localError || error}</p>
            )}

            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
              <p className="text-xs text-amber-700">
                The worker will need to confirm the new time. We will notify them immediately after you reschedule.
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!newDate || submitting}
              className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Updating\u2026' : 'Confirm Reschedule'}
            </button>
          </div>
        </div>
      </div>
    </FocusTrap>
  );
};

export default RescheduleModal;
