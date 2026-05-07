import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeReview, setActiveReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const statusOptions = ["All", "Pending", "Completed", "Cancelled"];

  useEffect(() => {
    setLoading(true);
    try {
      const saved = localStorage.getItem("bookings");

      if (saved) {
        setBookings(JSON.parse(saved));
      } else {
        const demo = [
          { id: "BK-101", worker: "Jane Smith", service: "Plumbing", date: "2023-10-25", status: "Pending" },
          { id: "BK-102", worker: "John Doe", service: "Electrical", date: "2023-11-05", status: "Pending" },
          { id: "BK-103", worker: "Mike Johnson", service: "Carpentry", date: "2023-11-10", status: "Completed" },
        ];
        setBookings(demo);
        localStorage.setItem("bookings", JSON.stringify(demo));
      }
    } catch (e) {
      setError("Failed to load bookings");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem("bookings", JSON.stringify(bookings));
  }, [bookings]);

  const handleCancel = (id) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, status: "Cancelled" } : b
      )
    );
  };

  const handleReviewSubmit = (id) => {
    if (!rating) return alert("Please select rating");

    setBookings((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, review: { rating, comment } }
          : b
      )
    );

    setActiveReview(null);
    setRating(0);
    setComment("");
  };

  const filtered = bookings.filter((b) => {
    const matchSearch =
      b.worker.toLowerCase().includes(search.toLowerCase()) ||
      b.service.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "All" || b.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const statusStyle = (status) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-100 text-emerald-800";
      case "Pending":
        return "bg-amber-100 text-amber-800";
      case "Cancelled":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900">
          My Bookings
        </h1>
        <p className="text-slate-600 mt-2">
          Track, manage, and review your service bookings
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search worker or service..."
          className="w-full md:w-1/2 px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />

        <div className="flex flex-wrap gap-2">
          {statusOptions.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                statusFilter === s
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* States */}
      {loading && (
        <p className="text-slate-500">Loading bookings...</p>
      )}

      {error && (
        <p className="text-rose-600">{error}</p>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 bg-slate-50 border border-slate-200 rounded-2xl">
          <h3 className="text-xl font-bold text-slate-900">
            No bookings found
          </h3>
          <p className="text-slate-600 mt-2">
            Try adjusting filters or book a new service
          </p>
          <Link
            to="/services"
            className="inline-block mt-5 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
          >
            Browse Services
          </Link>
        </div>
      )}

      {/* Booking List */}
      <div className="space-y-4">

        {filtered.map((b) => (
          <div
            key={b.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
          >

            {/* Top */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {b.service}
                </h3>
                <p className="text-slate-600">
                  {b.worker}
                </p>
              </div>

              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyle(b.status)}`}>
                {b.status}
              </span>
            </div>

            {/* Meta */}
            <div className="mt-3 flex justify-between text-sm text-slate-500">
              <span>ID: {b.id}</span>
              <span>{b.date}</span>
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-4 text-sm">

              {b.status === "Pending" && (
                <button
                  onClick={() => handleCancel(b.id)}
                  className="text-rose-600 hover:text-rose-700 font-medium"
                >
                  Cancel
                </button>
              )}

              {b.status === "Completed" && !b.review && (
                <button
                  onClick={() => setActiveReview(b.id)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Leave Review
                </button>
              )}

              {b.review && (
                <span className="text-emerald-600 font-medium">
                  ⭐ {b.review.rating} Reviewed
                </span>
              )}
            </div>

            {/* Review Box */}
            {activeReview === b.id && (
              <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4">

                <p className="font-semibold text-slate-800 mb-2">
                  Rate your experience
                </p>

                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setRating(s)}
                      className={`text-xl ${
                        rating >= s ? "text-yellow-400" : "text-slate-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write feedback..."
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                />

                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => handleReviewSubmit(b.id)}
                    className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm"
                  >
                    Submit
                  </button>

                  <button
                    onClick={() => setActiveReview(null)}
                    className="text-slate-500 text-sm"
                  >
                    Cancel
                  </button>
                </div>

              </div>
            )}

          </div>
        ))}

      </div>
    </div>
  );
};

export default Bookings;