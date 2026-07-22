import React, { useState, useEffect } from 'react';
import RatingDistributionBar from '../../components/RatingDistributionBar';

const PerformanceAnalytics = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Fetch analytics data
    setStats({
      totalBookings: 42,
      completionRate: 95,
      ratings: [
        { rating: 5, count: 28 },
        { rating: 4, count: 10 },
        { rating: 3, count: 3 },
        { rating: 2, count: 1 },
        { rating: 1, count: 0 }
      ]
    });
  }, []);

  if (!stats) return <div>Loading performance analytics...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Worker Performance & SLA Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-gray-500 text-sm">Job Completion Rate</h3>
          <p className="text-3xl font-black text-indigo-600">{stats.completionRate}%</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-gray-500 text-sm">Total Bookings Completed</h3>
          <p className="text-3xl font-black text-emerald-600">{stats.totalBookings}</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded shadow">
        <h3 className="font-bold text-lg mb-4">Customer Rating Breakdown</h3>
        {stats.ratings.map((r) => (
          <RatingDistributionBar
            key={r.rating}
            rating={r.rating}
            count={r.count}
            total={stats.totalBookings}
          />
        ))}
      </div>
    </div>
  );
};

export default PerformanceAnalytics;
