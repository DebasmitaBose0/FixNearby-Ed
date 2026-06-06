import React, { useState } from 'react';

export default function BookingCalendar({ onSelectSlot }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const timeSlots = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-slate-100 max-w-md mx-auto">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Select Schedule</h3>
      <div className="grid grid-cols-7 gap-2 mb-4">
        {[...Array(7)].map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() + i);
          const isSelected = selectedDate === date.toDateString();
          return (
            <button
              key={i}
              onClick={() => setSelectedDate(date.toDateString())}
              className={`flex flex-col items-center p-2 rounded-lg transition ${
                isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="text-xs">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
              <span className="text-sm font-semibold">{date.getDate()}</span>
            </button>
          );
        })}
      </div>
      {selectedDate && (
        <div>
          <h4 className="text-sm font-semibold text-slate-600 mb-2">Available Slots</h4>
          <div className="grid grid-cols-2 gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot}
                onClick={() => {
                  setSelectedTime(slot);
                  onSelectSlot({ date: selectedDate, time: slot });
                }}
                className={`p-2 text-sm rounded-lg border transition ${
                  selectedTime === slot ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}