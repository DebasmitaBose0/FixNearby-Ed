import React from 'react';

const RatingDistributionBar = ({ rating, count, total }) => {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="flex items-center gap-3 text-sm my-1">
      <span className="w-12 font-medium">{rating} Stars</span>
      <div className="flex-1 bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-amber-400 h-2.5 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-10 text-right text-gray-500 text-xs">{percentage}%</span>
    </div>
  );
};

export default RatingDistributionBar;
