import React from 'react';

const AccreditationBadgeList = ({ accreditations = [] }) => {
  if (!accreditations.length) return null;

  return (
    <div className="flex flex-wrap gap-2 my-2">
      {accreditations.map((acc, idx) => (
        <span
          key={acc._id || idx}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
        >
          <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {acc.title}
        </span>
      ))}
    </div>
  );
};

export default AccreditationBadgeList;
