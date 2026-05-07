import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";

// Helpers (replace with your utils if already exist)
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const formatDistance = (km) =>
  km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;

const Services = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [categoryFilter, setCategoryFilter] = useState(
    searchParams.get("category") || "All"
  );
  const [sortBy, setSortBy] = useState(
    searchParams.get("sort") || "distance"
  );

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState(null);

  const categories = [
    "All",
    "Electrician",
    "Plumber",
    "Carpenter",
    "Painter",
    "AC Technician",
    "Cleaner",
    "Mechanic",
    "Gardener",
    "Appliance Repair",
    "Pest Control",
  ];

  const iconMap = {
    Electrician: "⚡",
    Plumber: "🚰",
    Carpenter: "🪵",
    Painter: "🎨",
    "AC Technician": "❄️",
    Cleaner: "🧹",
    Mechanic: "🔧",
    Gardener: "🌱",
    "Appliance Repair": "🔌",
    "Pest Control": "🐜",
  };

  /* ---------------- LOCATION ---------------- */
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      setCoords({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    });
  }, []);

  /* ---------------- DATA ---------------- */
  useEffect(() => {
    setLoading(true);

    setTimeout(() => {
      setWorkers([
        { id: 1, name: "John Doe", profession: "Electrician", rating: 4.8, price: 40 },
        { id: 2, name: "Jane Smith", profession: "Plumber", rating: 4.9, price: 50 },
        { id: 3, name: "Mike Johnson", profession: "Carpenter", rating: 4.5, price: 35 },
        { id: 4, name: "Ravi Kumar", profession: "Painter", rating: 4.6, price: 30 },
        { id: 5, name: "Amit Sharma", profession: "AC Technician", rating: 4.7, price: 45 },
      ]);
      setLoading(false);
    }, 600);
  }, []);

  /* ---------------- URL SYNC ---------------- */
  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (categoryFilter !== "All") params.category = categoryFilter;
    if (sortBy !== "distance") params.sort = sortBy;

    setSearchParams(params);
  }, [searchQuery, categoryFilter, sortBy]);

  /* ---------------- PROCESS WORKERS ---------------- */
  const processedWorkers = useMemo(() => {
    let result = workers.map((w) => {
      let distance = null;

      if (coords) {
        distance = getDistanceKm(
          coords.latitude,
          coords.longitude,
          coords.latitude + Math.random() * 0.05,
          coords.longitude + Math.random() * 0.05
        );
      }

      return { ...w, distanceKm: distance };
    });

    // SEARCH
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.profession.toLowerCase().includes(q)
      );
    }

    // CATEGORY
    if (categoryFilter !== "All") {
      result = result.filter((w) => w.profession === categoryFilter);
    }

    // SORT
    if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "price") {
      result.sort((a, b) => a.price - b.price);
    } else {
      result.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
    }

    return result;
  }, [workers, searchQuery, categoryFilter, sortBy, coords]);

  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">

      {/* HEADER */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900">
          Find Skilled Professionals
        </h1>
        <p className="text-slate-600 mt-2">
          Search, compare and book trusted workers near you
        </p>
      </div>

      {/* SEARCH */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">

        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search electricians, plumbers..."
          className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-3 border rounded-xl"
        >
          <option value="distance">Nearest</option>
          <option value="rating">Top Rated</option>
          <option value="price">Lowest Price</option>
        </select>

      </div>

      {/* CATEGORIES */}
      <div className="flex flex-wrap gap-2 mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-full text-sm border ${
              categoryFilter === cat
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-700"
            }`}
          >
            {iconMap[cat] && <span className="mr-1">{iconMap[cat]}</span>}
            {cat}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      {loading ? (
        <LoadingSpinner />
      ) : processedWorkers.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          No workers found
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {processedWorkers.map((w) => (
            <div
              key={w.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition"
            >

              <div className="text-3xl mb-3">
                {iconMap[w.profession]}
              </div>

              <h3 className="text-xl font-bold text-slate-900">
                {w.name}
              </h3>

              <p className="text-blue-600 font-medium">
                {w.profession}
              </p>

              <div className="flex justify-between mt-3 text-sm text-slate-600">
                <span>⭐ {w.rating}</span>
                <span className="font-semibold">${w.price}/hr</span>
              </div>

              {w.distanceKm && (
                <p className="text-xs text-emerald-600 mt-2">
                  📍 {formatDistance(w.distanceKm)}
                </p>
              )}

              <Link
                to={`/worker/${w.id}`}
                className="block mt-4 text-center bg-slate-900 text-white py-2 rounded-xl hover:bg-blue-600"
              >
                View & Book
              </Link>

            </div>
          ))}

        </div>
      )}

    </div>
  );
};

export default Services;