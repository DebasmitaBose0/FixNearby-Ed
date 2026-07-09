import { useCallback, useEffect, useRef, useState } from "react";
import {
  getBookings,
  updateBookingStatus,
  rescheduleBooking as rescheduleBookingService,
} from "../services/bookingService";
import api from "../services/apiClient";

const CACHE_KEY = "fixnearby_bookings_cache";
const CACHE_TTL_MS = 5 * 60 * 1000;
const PAGE_SIZE = 10;

const loadCache = () => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (raw) {
      const cached = JSON.parse(raw);
      if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.data;
      }
    }
  } catch {}
  return null;
};

const saveCache = (data) => {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
};

export const useBookings = (initialParams = {}) => {
  const [bookings, setBookings] = useState(() => loadCache() || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [params, setParams] = useState(initialParams);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const cacheInitialized = useRef(!!loadCache());

  const fetchBookings = useCallback(async (fetchParams = params, pageNum = 1) => {
    setLoading(true);
    setError("");
    try {
      const queryParams = { ...fetchParams, page: pageNum, limit: PAGE_SIZE };
      const data = await getBookings(queryParams);
      const fetched = data.bookings || [];
      setBookings(fetched);
      setTotalPages(data.totalPages || Math.ceil((data.count || fetched.length) / PAGE_SIZE));
      setTotalCount(data.count || fetched.length);
      saveCache(fetched);
    } catch (err) {
      if (!cacheInitialized.current) {
        setError(err.message || "Failed to load bookings");
        setBookings([]);
      }
    } finally {
      setLoading(false);
      cacheInitialized.current = true;
    }
  }, [params]);

  useEffect(() => {
    fetchBookings(params, page);
  }, [params.status, page]);

  const cancelBooking = useCallback(async (id, reason) => {
    const previous = bookings;
    setBookings((current) =>
      current.map((b) => (b._id === id ? { ...b, status: "Cancelled" } : b))
    );
    try {
      await updateBookingStatus(id, "Cancelled");
      if (reason) {
        try {
          await api.patch(`/bookings/${id}/cancel-reason`, { reason });
        } catch {}
      }
      return true;
    } catch (err) {
      setBookings(previous);
      setError(err.message || "Failed to cancel booking");
      return false;
    }
  }, [bookings]);

  const rescheduleBooking = useCallback(async (id, newTime) => {
    try {
      await rescheduleBookingService(id, newTime);
      setBookings((current) =>
        current.map((b) =>
          b._id === id ? { ...b, scheduledTime: newTime, scheduledDate: newTime } : b
        )
      );
      return { success: true };
    } catch (err) {
      setError(err.message || "Failed to reschedule booking");
      return { success: false, message: err.message };
    }
  }, []);

  const goToPage = useCallback((p) => {
    setPage(Math.max(1, Math.min(p, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => goToPage(page + 1), [goToPage, page]);
  const prevPage = useCallback(() => goToPage(page - 1), [goToPage, page]);

  return {
    bookings,
    loading,
    error,
    params,
    setParams,
    page,
    totalPages,
    totalCount,
    nextPage,
    prevPage,
    goToPage,
    refresh: fetchBookings,
    cancelBooking,
    rescheduleBooking,
  };
};

export default useBookings;
