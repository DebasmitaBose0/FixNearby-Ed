import { Link, useSearchParams } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLocation } from '../context/LocationContext';
import { getDistanceKm, formatDistance } from '../utils/distance';

const Services = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [workers, setWorkers] = useState([]);
  const [error, setError] = useState(null);
  const [sortByDistance, setSortByDistance] = useState(false);

  const { coords, loading: geoLoading, error: geoError } = useLocation();

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

  // Mock worker data – each worker has a mock lat/lng offset from user
  // In production these would be real coordinates from the server
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      try {
        const data = [
          { id: 1,  name: "John Doe",      profession: "Electrician",    rating: 4.8, price: "$40/hr", verified: true, mockOffset: { lat: 0.012,  lon: 0.008  } },
          { id: 2,  name: "Jane Smith",    profession: "Plumber",        rating: 4.9, price: "$50/hr", verified: true, mockOffset: { lat: -0.005, lon: 0.020  } },
          { id: 3,  name: "Mike Johnson",  profession: "Carpenter",      rating: 4.5, price: "$35/hr", verified: true, mockOffset: { lat: 0.030,  lon: -0.015 } },
          { id: 4,  name: "Ravi Kumar",    profession: "Painter",        rating: 4.6, price: "$30/hr", verified: true, mockOffset: { lat: -0.022, lon: -0.010 } },
          { id: 5,  name: "Amit Sharma",   profession: "AC Technician",  rating: 4.7, price: "$45/hr", verified: true, mockOffset: { lat: 0.008,  lon: -0.025 } },
          { id: 6,  name: "Suresh Patel",  profession: "Cleaner",        rating: 4.3, price: "$25/hr", verified: true, mockOffset: { lat: 0.050,  lon: 0.030  } },
          { id: 7,  name: "David Lee",     profession: "Mechanic",       rating: 4.8, price: "$55/hr", verified: true, mockOffset: { lat: -0.040, lon: 0.015  } },
          { id: 8,  name: "Priya Singh",   profession: "Gardener",       rating: 4.4, price: "$20/hr", verified: true, mockOffset: { lat: 0.003,  lon: 0.004  } },
          { id: 9,  name: "Imran Khan",    profession: "Appliance Repair", rating: 4.6, price: "$35/hr", verified: true, mockOffset: { lat: -0.018, lon: -0.030 } },
          { id: 10, name: "Neha Gupta",    profession: "Pest Control",   rating: 4.5, price: "$40/hr", verified: true, mockOffset: { lat: 0.025,  lon: -0.005 } },
        ];
        setWorkers(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load workers");
        setLoading(false);
      }
    }, 800);
  }, []);

  // Enrich workers with computed distance from user's position
  const workersWithDistance = useMemo(() => {
    return workers.map((w) => {
      if (!coords) return { ...w, distanceKm: null };
      const workerLat = coords.latitude  + w.mockOffset.lat;
      const workerLon = coords.longitude + w.mockOffset.lon;
      const distanceKm = getDistanceKm(
        coords.latitude, coords.longitude,
        workerLat, workerLon,
      );
      return { ...w, distanceKm };
    });
  }, [workers, coords]);

  // Filter + optional sort by distance
  const filteredWorkers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    let result = workersWithDistance.filter((worker) => {
      const matchesSearch =
        worker.name.toLowerCase().includes(query) ||
        worker.profession.toLowerCase().includes(query);
      const matchesCategory =
        categoryFilter === "All" || worker.profession === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    if (sortByDistance && coords) {
      result = [...result].sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    }

    return result;
  }, [workersWithDistance, searchQuery, categoryFilter, sortByDistance, coords]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          Find Reliable Services Near You
        </h1>
        <p className="text-lg text-gray-500">
          Discover top-rated professionals in your neighborhood
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-10 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or service (e.g. Electrician)..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-400 hover:text-blue-600 shadow-sm'
              }`}
            >
              {cat !== "All" && iconMap[cat] && <span className="mr-2">{iconMap[cat]}</span>}
              {cat}
            </button>
          ))}
        </div>

        {/* Sort-by-distance toggle — only visible when location is available */}
        {coords && (
          <div className="flex justify-center">
            <button
              onClick={() => setSortByDistance(prev => !prev)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 ${
                sortByDistance
                  ? 'bg-green-600 text-white border-green-600 shadow-lg'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-600 shadow-sm'
              }`}
            >
              <span>📍</span>
              {sortByDistance ? 'Sorted: Nearest First' : 'Sort by Distance'}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-20">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-600 font-medium">
          {error}
        </div>
      ) : filteredWorkers.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <div className="text-6xl mb-4">🔦</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No workers found</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">We couldn't find any professionals matching your search. Try broadening your filters.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('All');
            }}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition transform hover:scale-105"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-6 font-medium">
            Showing {filteredWorkers.length} professionals
            {coords && sortByDistance && ' · sorted by distance'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredWorkers.map((worker) => (
              <div key={worker.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl border border-gray-100 hover:border-blue-100 transition-all duration-300 overflow-hidden flex flex-col">
                <div className="p-8 flex-1">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                      {iconMap[worker.profession] || '👷'}
                    </div>
                    {worker.verified && (
                      <span className="bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Verified
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{worker.name}</h3>
                  <p className="text-blue-600 font-bold mb-4">{worker.profession}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      <span className="font-bold text-gray-900">{worker.rating}</span>
                    </div>
                    <div className="w-px h-4 bg-gray-300"></div>
                    <div className="font-bold text-gray-900">{worker.price}</div>
                  </div>

                  {/* Distance badge */}
                  {worker.distanceKm !== null ? (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-full w-fit">
                      <span>📍</span>
                      <span>{formatDistance(worker.distanceKm)} away</span>
                    </div>
                  ) : geoLoading ? (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full w-fit">
                      <span className="inline-block w-2.5 h-2.5 rounded-full border border-gray-300 border-t-transparent animate-spin" />
                      Detecting distance…
                    </div>
                  ) : geoError ? (
                    <div className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full w-fit font-medium">
                      📍 Location unavailable
                    </div>
                  ) : null}
                </div>
                <div className="p-8 pt-0">
                  <Link
                    to={`/worker/${worker.id}`}
                    className="block w-full text-center bg-gray-900 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-blue-200"
                  >
                    View Details &amp; Book
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Services;