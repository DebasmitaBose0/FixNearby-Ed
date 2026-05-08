import React from "react";
import { CalendarDays, Briefcase, CheckCircle2, Star, ArrowRight } from "lucide-react";
import EmptyState from '../components/EmptyState';

const Dashboard = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">User Dashboard</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Welcome back!</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">This is a placeholder dashboard. Contributors will add user-specific data here.</p>
        
        <div className="mt-6 border-t border-gray-200 pt-4">
          <EmptyState
            icon="🗓️"
            title="No active bookings yet"
            description="You haven't booked any services recently. Browse trusted professionals and book a service today."
            primaryAction={{ label: 'Browse Services', to: '/services' }}
          />
          {/* TODO: Connect API here to fetch user data/bookings */}
          <div className="text-center py-10 bg-gray-50 rounded border border-dashed border-gray-300">
            <span className="text-slate-600 leading-relaxed">No active bookings yet.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const stats = [
    {
      label: "Total Bookings",
      value: "12",
      icon: <CalendarDays size={22} />,
      bg: "bg-blue-100",
      text: "text-blue-700",
    },
    {
      label: "Active Jobs",
      value: "2",
      icon: <Briefcase size={22} />,
      bg: "bg-emerald-100",
      text: "text-emerald-700",
    },
    {
      label: "Completed",
      value: "10",
      icon: <CheckCircle2 size={22} />,
      bg: "bg-purple-100",
      text: "text-purple-700",
    },
    {
      label: "Rating",
      value: "4.8★",
      icon: <Star size={22} />,
      bg: "bg-yellow-100",
      text: "text-yellow-700",
    },
  ];

  const recentActivities = [
    {
      title: "AC Service Booked",
      date: "2 May 2026",
      status: "Pending",
    },
    {
      title: "Plumbing Work Completed",
      date: "28 Apr 2026",
      status: "Completed",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              Welcome Back 👋
            </h1>

            <p className="mt-2 text-slate-600 text-base">
              Track bookings, manage services, and monitor activity.
            </p>
          </div>

          <button className="bg-[#0056D2] hover:bg-[#0047AF] text-white px-6 py-3 rounded-2xl font-semibold shadow-lg shadow-blue-200 transition-all duration-300 hover:scale-[1.02]">
            + Book New Service
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          {stats.map((item, idx) => (
            <div
              key={idx}
              className="group bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.bg} ${item.text}`}
              >
                {item.icon}
              </div>

              <div className="mt-5">
                <p className="text-sm font-medium text-slate-500">
                  {item.label}
                </p>

                <h2 className="mt-1 text-3xl font-black text-slate-900">
                  {item.value}
                </h2>
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left Side */}
          <div className="lg:col-span-2 space-y-8">

            {/* Activity Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    Recent Activity
                  </h3>

                  <p className="text-slate-500 text-sm mt-1">
                    Your latest booking updates
                  </p>
                </div>

                <button className="text-[#0056D2] font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                  View All
                  <ArrowRight size={18} />
                </button>
              </div>

              <div className="space-y-4">
                {recentActivities.map((activity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl p-5 hover:bg-slate-100 transition"
                  >
                    <div>
                      <h4 className="font-semibold text-slate-800">
                        {activity.title}
                      </h4>

                      <p className="text-sm text-slate-500 mt-1">
                        {activity.date}
                      </p>
                    </div>

                    <span
                      className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                        activity.status === "Completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {activity.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Empty State */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
              <div className="flex flex-col items-center justify-center py-14 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-300">

                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-4xl mb-5 shadow-inner">
                  📦
                </div>

                <h3 className="text-xl font-bold text-slate-800">
                  No Active Bookings
                </h3>

                <p className="text-slate-500 mt-2 max-w-md">
                  You currently don’t have any active service bookings.
                  Start by exploring available services.
                </p>

                <button className="mt-6 bg-[#0056D2] hover:bg-[#0047AF] text-white px-7 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-blue-200 hover:scale-[1.03]">
                  Browse Services
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">

            {/* Profile */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
              <div className="flex flex-col items-center text-center">
                <img
                  src="https://i.pravatar.cc/120"
                  alt="profile"
                  className="w-24 h-24 rounded-full border-4 border-blue-100 shadow"
                />

                <h3 className="mt-4 text-xl font-bold text-slate-900">
                  John Doe
                </h3>

                <p className="text-slate-500 text-sm">
                  Premium Member
                </p>

                <button className="mt-5 w-full border border-slate-300 hover:border-[#0056D2] hover:text-[#0056D2] py-2.5 rounded-xl font-semibold transition">
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-5">
                Quick Actions
              </h3>

              <div className="space-y-4">
                {[
                  "Track Booking",
                  "Payment History",
                  "Saved Services",
                  "Support Center",
                ].map((item, idx) => (
                  <button
                    key={idx}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:text-[#0056D2] transition font-medium text-slate-700"
                  >
                    {item}
                    <ArrowRight size={18} />
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;