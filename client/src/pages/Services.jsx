import { Link, useSearchParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { getDistanceKm, formatDistance } from "../utils/distance";

const Services = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // 🔗 URL Synced State
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "All");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "distance");

  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState([]);

  // 🌍 Location
  const [coords, setCoords] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");

  const categories = [
    "All","Electrician","Plumber","Carpenter","Painter",
    "AC Technician","Cleaner","Mechanic","Gardener",
    "Appliance Repair","Pest Control"
  ];

  const iconMap = {
    Electrician: "⚡", Plumber: "🚰", Carpenter: "🪵", Painter: "🎨",
    "AC Technician": "❄️", Cleaner: "🧹", Mechanic: "🔧",
    Gardener: "🌱", "Appliance Repair": "🔌", "Pest Control": "🐜",
  };

  // 🌍 LOCATION
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("unsupported");
      return;
    }

    setLocationStatus("loading");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLocationStatus("success");
      },
      () => setLocationStatus("denied")
    );
  }, []);

  // 🔗 Sync URL
  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (categoryFilter !== "All") params.category = categoryFilter;
    if (sortBy !== "distance") params.sort = sortBy;

    setSearchParams(params);
  }, [searchQuery, categoryFilter, sortBy]);

  // 📦 Mock Data
  useEffect(() => {
    setTimeout(() => {
      setWorkers([
        { id: 1, name: "John Doe", profession: "Electrician", rating: 4.8, price: 40, mockOffset: { lat: 0.012, lon: 0.008 } },
        { id: 2, name: "Jane Smith", profession: "Plumber", rating: 4.9, price: 50, mockOffset: { lat: -0.005, lon: 0.02 } },
        { id: 3, name: "Mike Johnson", profession: "Carpenter", rating: 4.5, price: 35, mockOffset: { lat: 0.03, lon: -0.015 } },
        { id: 4, name: "Ravi Kumar", profession: "Painter", rating: 4.6, price: 30, mockOffset: { lat: -0.022, lon: -0.01 } },
        { id: 5, name: "Amit Sharma", profession: "AC Technician", rating: 4.7, price: 45, mockOffset: { lat: 0.008, lon: -0.025 } },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  // 📍 Distance
  const workersWithDistance = useMemo(() => {
    return workers.map((w) => {
      if (!coords) return { ...w, distanceKm: null };

      const workerLat = coords.latitude + w.mockOffset.lat;
      const workerLon = coords.longitude + w.mockOffset.lon;

      return {
        ...w,
        distanceKm: getDistanceKm(
          coords.latitude,
          coords.longitude,
          workerLat,
          workerLon
        ),
      };
    });
  }, [workers, coords]);

  // 🔍 Filter + Sort
  const filteredWorkers = useMemo(() => {
    let result = workersWithDistance.filter((w) => {
      const q = searchQuery.toLowerCase();

      return (
        (w.name.toLowerCase().includes(q) ||
          w.profession.toLowerCase().includes(q)) &&
        (categoryFilter === "All" || w.profession === categoryFilter)
      );
    });

    if (sortBy === "distance") {
      result.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "price") {
      result.sort((a, b) => a.price - b.price);
    }

    return result;
  }, [workersWithDistance, searchQuery, categoryFilter, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">Find Services Near You</h1>
        <p className="text-gray-500 mt-2">
          {locationStatus === "success"
            ? "Showing nearby professionals"
            : "Enable location for better results"}
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-6 mb-10">

        {/* Search */}
        <input
          type="text"
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-2xl mx-auto block p-3 border rounded-xl"
        />

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                categoryFilter === cat
                  ? "bg-blue-600 text-white"
                  : "bg-white border hover:border-blue-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sorting */}
        <div className="flex justify-center gap-4">
          {["distance", "rating", "price"].map((type) => (
            <button
              key={type}
              onClick={() => setSortBy(type)}
              className={`px-4 py-2 rounded-lg border ${
                sortBy === type ? "bg-black text-white" : ""
              }`}
            >
              {type === "distance" && "📍 Nearest"}
              {type === "rating" && "⭐ Top Rated"}
              {type === "price" && "💰 Lowest Price"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredWorkers.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">😕</div>
          <p>No workers found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkers.map((worker) => (
            <div
              key={worker.id}
              className="group bg-white p-6 rounded-2xl shadow hover:shadow-xl transition"
            >
              <div className="flex justify-between mb-4">
                <span className="text-3xl">
                  {iconMap[worker.profession]}
                </span>

                {worker.distanceKm && (
                  <span className="text-xs bg-green-100 px-2 py-1 rounded">
                    📍 {formatDistance(worker.distanceKm)}
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold">{worker.name}</h3>
              <p className="text-blue-600">{worker.profession}</p>

              <div className="flex justify-between mt-3 text-sm">
                <span>⭐ {worker.rating}</span>
                <span className="font-semibold">${worker.price}/hr</span>
              </div>

              <Link
                to={`/worker/${worker.id}`}
                className="block mt-4 text-center bg-black text-white py-2 rounded-lg hover:bg-blue-600"
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