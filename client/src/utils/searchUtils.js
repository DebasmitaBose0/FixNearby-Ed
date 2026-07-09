const R_EARTH_KM = 6371;

export function getDistanceKm(lat1, lon1, lat2, lon2) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R_EARTH_KM * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

export function formatDistance(d) {
  return d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`;
}

export function buildSearchQuery(params) {
  const query = {};
  if (params.q) query.q = params.q;
  if (params.category && params.category !== 'All') query.category = params.category;
  if (params.minPrice) query.minPrice = params.minPrice;
  if (params.maxPrice) query.maxPrice = params.maxPrice;
  if (params.minRating) query.minRating = params.minRating;
  if (params.maxDistance) query.maxDistance = params.maxDistance;
  if (params.availability && params.availability !== 'all') query.availability = params.availability;
  if (params.sortBy) query.sort = params.sortBy;
  if (params.lat) query.lat = params.lat;
  if (params.lon) query.lon = params.lon;
  return query;
}

export function normalizeWorkerFromApi(w) {
  return {
    ...w,
    id: w._id || w.id,
    profession: w.category || w.profession,
    price: w.price ? (w.price.toString().startsWith('$') ? w.price : `$${w.price}/hr`) : '$30/hr',
    availability: w.availability ||
      (w.availabilityStatus === 'available' ? 'Available today' :
       w.availabilityStatus === 'busy' ? 'Busy' :
       w.availabilityStatus === 'offline' ? 'Offline' : 'Available today'),
    responseTime: w.responseTime || 'Replies in 15 min',
    outcomeText: w.outcomeText || `Review past work and request a ${w.category?.toLowerCase() || 'service'} visit.`,
    mockOffset: w.mockOffset || (w.coordinates ? { lat: w.coordinates.lat, lon: w.coordinates.lon } : null),
    verified: w.verified ?? true,
    rating: Number(w.rating) || 4.5,
    completedJobs: w.completedJobs || 12,
  };
}

export function sortWorkers(workers, sortBy, coords) {
  const sorted = [...workers];
  if (sortBy === 'rating') {
    sorted.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'price') {
    sorted.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'distance') {
    sorted.sort((a, b) => {
      if (a.distanceKm == null && b.distanceKm == null) return 0;
      if (a.distanceKm == null) return 1;
      if (b.distanceKm == null) return -1;
      return a.distanceKm - b.distanceKm;
    });
  }
  return sorted;
}

export function filterWorkers(workers, filters) {
  return workers.filter((w) => {
    const q = (filters.searchQuery || '').trim().toLowerCase();
    const matchesSearch = !q || w.name?.toLowerCase().includes(q) || w.profession?.toLowerCase().includes(q);
    const matchesCategory = !filters.category || filters.category === 'All' || w.profession === filters.category;
    const matchesRating = w.rating >= (filters.minRating || 0);
    const matchesDistance = !filters.maxDistance || w.distanceKm == null || w.distanceKm <= filters.maxDistance;
    const matchesUrgent = !filters.urgent || /today|emergency|open/i.test(w.availability || '');
    return matchesSearch && matchesCategory && matchesRating && matchesDistance && matchesUrgent;
  });
}

export function getAvailabilityUrgency(slots) {
  if (!slots || slots.length === 0) return { text: 'Fully Booked', style: 'bg-red-50 text-red-700 border-red-100' };
  if (slots.length === 1) return { text: 'High Demand - 1 Slot Left!', style: 'bg-red-600 text-white border-red-700 font-bold shadow-sm' };
  if (slots.length <= 2) return { text: 'Limited: 2 Slots Left', style: 'bg-amber-50 text-amber-700 border-amber-200' };
  return { text: `${slots.length} slots available`, style: 'bg-blue-50 text-blue-700 border-blue-100' };
}
