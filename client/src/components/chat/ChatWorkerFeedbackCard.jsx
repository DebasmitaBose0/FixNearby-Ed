import React from 'react';
import { ShieldCheck, Award, ThumbsUp, Star, TrendingUp } from 'lucide-react';

const ChatWorkerFeedbackCard = ({ rating = 4.8, reviewCount = 12, karmaScore = 95, category = 'AC Repair' }) => {
  return (
    <div className="absolute top-12 left-0 z-30 w-72 rounded-2xl border border-amber-100 bg-white p-4 shadow-xl transition-all animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center gap-2 border-b border-slate-50 pb-2.5">
        <ShieldCheck className="h-5 w-5 text-amber-500 shrink-0" />
        <div>
          <h4 className="text-xs font-bold text-slate-800">Reputation Summary</h4>
          <p className="text-[10px] text-slate-400">FixNearby Trust & Accreditation Metrics</p>
        </div>
      </div>

      <div className="mt-3 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Average Rating</span>
          <div className="flex items-center gap-1 font-bold text-slate-800">
            <Star size={13} className="fill-amber-400 text-amber-400" />
            <span>{rating.toFixed(1)}</span>
            <span className="text-slate-400 font-normal">({reviewCount})</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Karma / Reliability Index</span>
          <div className="flex items-center gap-1 font-bold text-emerald-600">
            <TrendingUp size={13} />
            <span>{karmaScore}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Completion Rate</span>
          <div className="flex items-center gap-1 font-bold text-blue-600">
            <Award size={13} />
            <span>98%</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Recommended By</span>
          <div className="flex items-center gap-1 font-bold text-indigo-600">
            <ThumbsUp size={13} />
            <span>95% Users</span>
          </div>
        </div>
      </div>

      <div className="mt-3.5 rounded-xl bg-amber-50/50 border border-amber-100/50 p-2.5 text-[10px] leading-relaxed text-amber-800 font-medium">
        ⭐ Verified Professional: Consistent background verification and client reviews validate high service standards.
      </div>
    </div>
  );
};

export default ChatWorkerFeedbackCard;
