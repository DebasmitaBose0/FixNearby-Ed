import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import StarRating from "../components/StarRating";

const demoBookings = [
  {
    id: "BK-101",
    worker: "Jane Smith",
    service: "Plumbing",
    date: "2026-05-10",
    status: "Pending",
    price: 1200,
    workerImage:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
  },
  {
    id: "BK-102",
    worker: "John Doe",
    service: "Electrical",
    date: "2026-05-14",
    status: "Pending",
    price: 1800,
    workerImage:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
  },
  {
    id: "BK-103",
    worker: "Mike Johnson",
    service: "Carpentry",
    date: "2026-05-01",
    status: "Completed",
    price: 950,
    workerImage:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200",
  },
];

const statusOptions = ["All", "Pending", "Completed", "Cancelled"];

const statusStyle = (status) => {
  switch (status) {
    case "Completed":
      return "bg-emerald-100 text-emerald-700";

    case "Pending":
      return "bg-amber-100 text-amber-700";

    case "Cancelled":
      return "bg-rose-100 text-rose-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
};

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("latest");

  const [activeReview, setActiveReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // LOAD BOOKINGS
  useEffect(() => {
    try {
      const savedBookings = localStorage.getItem("bookings");

      if (savedBookings) {
        setBookings(JSON.parse(savedBookings));
      } else {
        setBookings(demoBookings);
        localStorage.setItem("bookings", JSON.stringify(demoBookings));
      }
    } catch (err) {
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  // SAVE BOOKINGS
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("bookings", JSON.stringify(bookings));
    }
  }, [bookings, loading]);

  // FILTER + SORT
  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    let filtered = bookings.filter((booking) => {
      const matchesSearch =
        !query ||
        booking.worker.toLowerCase().includes(query) ||
        booking.service.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // SORTING
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "latest":
          return new Date(b.date) - new Date(a.date);

        case "oldest":
          return new Date(a.date) - new Date(b.date);

        case "status":
          return a.status.localeCompare(b.status);

        case "price":
          return (b.price || 0) - (a.price || 0);

        default:
          return 0;
      }
    });

    return filtered;
  }, [bookings, search, statusFilter, sortBy]);

  // CANCEL BOOKING
  const handleCancel = (id) => {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === id
          ? { ...booking, status: "Cancelled" }
          : booking
      )
    );
  };

  // SUBMIT REVIEW
  const handleReviewSubmit = (id) => {
    if (!rating) {
      alert("Please select a rating.");
      return;
    }

    setBookings((current) =>
      current.map((booking) =>
        booking.id === id
          ? {
              ...booking,
              review: {
                rating,
                comment,
              },
            }
          : booking
      )
    );

    setActiveReview(null);
    setRating(0);
    setComment("");
  };

  // SUMMARY
  const totalBookings = bookings.length;

  const completedBookings = bookings.filter(
    (b) => b.status === "Completed"
  ).length;

  const pendingBookings = bookings.filter(
    (b) => b.status === "Pending"
  ).length;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">

      {/* BACKGROUND */}
      <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-blue-200/30 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-indigo-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <h1 className="text-4xl font-extrabold text-slate-900">
              My Bookings
            </h1>

            <p className="mt-2 text-slate-600">
              Track, manage and review all your service bookings
            </p>
          </div>

          <Link
            to="/services"
            className="w-fit rounded-2xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            + Book New Service
          </Link>
        </div>

        {/* SUMMARY */}
        <div className="mb-10 grid gap-4 sm:grid-cols-3">

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Bookings
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {totalBookings}
            </h2>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Pending
            </p>

            <h2 className="mt-2 text-3xl font-bold text-amber-600">
              {pendingBookings}
            </h2>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Completed
            </p>

            <h2 className="mt-2 text-3xl font-bold text-emerald-600">
              {completedBookings}
            </h2>
          </div>

        </div>

        {/* FILTERS */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          {/* SEARCH */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search worker or service..."
            className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 lg:w-1/3"
          />

          <div className="flex flex-wrap items-center gap-3">

            {/* STATUS FILTER */}
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    statusFilter === status
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* SORT */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
              <option value="status">Status</option>
              <option value="price">Price</option>
            </select>

          </div>
        </div>

        {/* LOADING */}
        {loading && <LoadingSpinner />}

        {/* ERROR */}
        {!loading && error && (
          <p className="text-rose-600">
            {error}
          </p>
        )}

        {/* EMPTY */}
        {!loading && !error && filteredBookings.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white py-16 text-center shadow-sm">

            <h3 className="text-2xl font-bold text-slate-900">
              No bookings found
            </h3>

            <p className="mt-2 text-slate-600">
              Try adjusting your filters or book a new service.
            </p>

            <Link
              to="/services"
              className="mt-5 inline-block rounded-2xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
            >
              Browse Services
            </Link>

          </div>
        )}

        {/* BOOKINGS */}
        {!loading && !error && filteredBookings.length > 0 && (
          <div className="space-y-6">

            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >

                {/* TOP BAR */}
                <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

                <div className="p-6">

                  {/* TOP */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                    <div className="flex items-center gap-4">

                      <img
                        src={booking.workerImage}
                        alt={booking.worker}
                        className="h-16 w-16 rounded-2xl object-cover"
                      />

                      <div>

                        <h3 className="text-xl font-bold text-slate-900">
                          {booking.worker}
                        </h3>

                        <p className="text-slate-500">
                          {booking.service}
                        </p>

                      </div>

                    </div>

                    <span
                      className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${statusStyle(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>

                  </div>

                  {/* DETAILS */}
                  <div className="mt-6 grid gap-4 sm:grid-cols-3">

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Booking ID
                      </p>

                      <p className="mt-1 font-semibold text-slate-800">
                        {booking.id}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Date
                      </p>

                      <p className="mt-1 font-semibold text-slate-800">
                        {booking.date}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Price
                      </p>

                      <p className="mt-1 font-semibold text-slate-800">
                        ₹{booking.price}
                      </p>
                    </div>

                  </div>

                  {/* ACTIONS */}
                  <div className="mt-6 flex flex-wrap gap-3">

                    {booking.status === "Pending" && (
                      <button
                        type="button"
                        onClick={() => handleCancel(booking.id)}
                        className="rounded-2xl bg-rose-50 px-5 py-2 font-medium text-rose-600 transition hover:bg-rose-100"
                      >
                        Cancel Booking
                      </button>
                    )}

                    {booking.status === "Completed" &&
                      !booking.review && (
                        <button
                          type="button"
                          onClick={() => setActiveReview(booking.id)}
                          className="rounded-2xl bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700"
                        >
                          Leave Review
                        </button>
                      )}

                    {booking.review && (
                      <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-2">

                        <StarRating
                          rating={booking.review.rating}
                          size="sm"
                        />

                        <span className="font-medium text-emerald-700">
                          Reviewed
                        </span>

                      </div>
                    )}

                  </div>

                  {/* REVIEW BOX */}
                  {activeReview === booking.id && (
                    <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">

                      <div className="mb-6 flex items-start justify-between gap-4">

                        <div>
                          <h3 className="text-2xl font-bold text-slate-900">
                            Share Your Experience
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            Your feedback helps others.
                          </p>
                        </div>

                        <div className="rounded-2xl bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700">
                          ⭐ Review
                        </div>

                      </div>

                      {/* STAR */}
                      <div className="mb-6">

                        <p className="mb-3 text-sm font-medium text-slate-700">
                          Rate your experience
                        </p>

                        <StarRating
                          rating={rating}
                          onRatingChange={setRating}
                          size="lg"
                        />

                      </div>

                      {/* COMMENT */}
                      <div className="mb-6">

                        <div className="mb-2 flex items-center justify-between">

                          <label className="text-sm font-medium text-slate-700">
                            Write feedback
                          </label>

                          <span className="text-xs text-slate-400">
                            {comment.length}/300
                          </span>

                        </div>

                        <textarea
                          value={comment}
                          maxLength={300}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Tell us about your experience..."
                          className="min-h-[140px] w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />

                      </div>

                      {/* QUICK TAGS */}
                      <div className="mb-6">

                        <p className="mb-3 text-sm font-medium text-slate-700">
                          Quick feedback
                        </p>

                        <div className="flex flex-wrap gap-2">

                          {[
                            "Professional",
                            "On Time",
                            "Friendly",
                            "Affordable",
                            "Highly Recommended",
                            "Quick Service",
                          ].map((tag) => (
                            <button
                              key={tag}
                              onClick={() =>
                                setComment((prev) =>
                                  prev.includes(tag)
                                    ? prev
                                    : `${prev} ${tag}`.trim()
                                )
                              }
                              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
                            >
                              + {tag}
                            </button>
                          ))}

                        </div>

                      </div>

                      {/* PREVIEW */}
                      {(rating || comment) && (
                        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">

                          <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">
                            Preview
                          </p>

                          <div className="mb-2 flex items-center gap-1 text-lg text-yellow-400">
                            {"★".repeat(rating)}
                          </div>

                          <p className="text-sm leading-relaxed text-slate-700">
                            {comment ||
                              "Your review preview will appear here..."}
                          </p>

                        </div>
                      )}

                      {/* BUTTONS */}
                      <div className="flex flex-col gap-3 sm:flex-row">

                        <button
                          onClick={() =>
                            handleReviewSubmit(booking.id)
                          }
                          className="flex-1 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-white shadow-lg shadow-blue-100 transition hover:opacity-90"
                        >
                          Submit Review
                        </button>

                        <button
                          onClick={() => {
                            setActiveReview(null);
                            setRating(0);
                            setComment("");
                          }}
                          className="flex-1 rounded-2xl border border-slate-300 px-6 py-3 text-slate-600 transition hover:bg-slate-100 sm:flex-none"
                        >
                          Cancel
                        </button>

                      </div>

                    </div>
                  )}

                </div>
              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
};

export default Bookings;