import React from "react";
import {
  FaCalendarCheck,
  FaClipboardList,
  FaStar,
  FaCheckCircle,
  FaArrowRight,
  FaClock,
  FaMapMarkerAlt,
  FaBell,
} from "react-icons/fa";

const stats = [
  {
    label: "Total Bookings",
    value: "12",
    icon: <FaCalendarCheck />,
    color: "from-indigo-500 to-violet-500",
  },
  {
    label: "Active Jobs",
    value: "2",
    icon: <FaClipboardList />,
    color: "from-amber-500 to-orange-500",
  },
  {
    label: "Completed",
    value: "10",
    icon: <FaCheckCircle />,
    color: "from-emerald-500 to-green-500",
  },
  {
    label: "Rating",
    value: "4.8/5",
    icon: <FaStar />,
    color: "from-pink-500 to-rose-500",
  },
];

const recentBookings = [
  {
    title: "Home Cleaning",
    status: "In Progress",
    date: "28 May 2026",
    location: "Kharagpur",
  },
  {
    title: "AC Repair",
    status: "Completed",
    date: "25 May 2026",
    location: "Midnapore",
  },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              User Dashboard
            </h1>

            <p className="mt-3 max-w-2xl text-slate-600">
              Manage bookings, monitor active services, and stay updated with
              your latest activity.
            </p>
          </div>

          <button className="rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-slate-800">
            Book New Service
          </button>
        </div>

        {/* Hero Card */}
        <div className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-8 text-white shadow-2xl">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>

          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-indigo-100">
                Welcome Back
              </p>

              <h2 className="mt-3 text-3xl font-extrabold">
                Your services are running smoothly 🚀
              </h2>

              <p className="mt-3 max-w-xl text-indigo-100">
                Track ongoing bookings, manage appointments, and review service
                history from one place.
              </p>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <FaBell className="text-2xl text-yellow-300" />
                <div>
                  <p className="text-sm text-indigo-100">Upcoming Booking</p>
                  <h3 className="text-lg font-bold">Home Cleaning</h3>
                </div>
              </div>

              <button className="mt-5 flex items-center gap-2 rounded-xl bg-white px-4 py-2 font-semibold text-indigo-700 transition hover:bg-slate-100">
                View Details
                <FaArrowRight />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 transition duration-300 group-hover:opacity-10`}
              ></div>

              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {item.label}
                  </p>

                  <h3 className="mt-3 text-4xl font-black text-slate-900">
                    {item.value}
                  </h3>
                </div>

                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-2xl text-white shadow-lg`}
                >
                  {item.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Recent Activity */}
          <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Recent Activity
                </h2>

                <p className="mt-1 text-slate-500">
                  Your latest bookings and updates.
                </p>
              </div>

              <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                View All
              </button>
            </div>

            <div className="space-y-5">
              {recentBookings.map((booking, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-5 rounded-2xl border border-slate-200 p-5 transition hover:border-indigo-300 hover:bg-slate-50 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {booking.title}
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-2">
                        <FaClock />
                        {booking.date}
                      </span>

                      <span className="flex items-center gap-2">
                        <FaMapMarkerAlt />
                        {booking.location}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      booking.status === "Completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-slate-500">
              Access important actions instantly.
            </p>

            <div className="mt-6 space-y-4">
              {[
                "Book a Service",
                "Track Booking",
                "Payment History",
                "Contact Support",
              ].map((action) => (
                <button
                  key={action}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  {action}
                  <FaArrowRight />
                </button>
              ))}
            </div>

            {/* Empty State */}
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl text-indigo-600">
                <FaClipboardList />
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-900">
                No Pending Tasks
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                You're all caught up. New service updates will appear here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;