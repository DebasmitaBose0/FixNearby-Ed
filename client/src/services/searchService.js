import api from './apiClient';

/**
 * Search workers with advanced filters
 * @param {Object} params - Search parameters
 * @returns {Promise} Search results
 */
export const searchWorkers = async (params) => {
  try {
    const response = await api.get('/search', { params });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Error searching workers';
    console.error('Search API error:', message);
    throw new Error(message);
  }
};

/**
 * Get autocomplete suggestions
 * @param {string} query - Search query
 * @returns {Promise} Suggestions array
 */
export const getSearchSuggestions = async (query) => {
  try {
    const response = await api.get('/search/suggestions', {
      params: { q: query },
    });
    return response.data.suggestions || [];
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }
};

/**
 * Get popular searches
 * @returns {Promise} Popular searches array
 */
export const getPopularSearches = async () => {
  try {
    const response = await api.get('/search/popular');
    return response.data.popular || [];
  } catch (error) {
    console.error('Error fetching popular searches:', error);
    return [];
  }
};

/**
 * Search workers with geospatial filtering for map view
 * @param {Object} params - Search parameters with lat/lon
 * @returns {Promise} Search results with distance data
 */
export const searchWorkersNearby = async (params) => {
  try {
    const response = await api.get('/search/nearby', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching nearby workers:', error);
    throw error;
  }
};

/**
 * Get worker count by category for the discovery page
 * @returns {Promise} Category-wise worker counts
 */
export const getCategoryCounts = async () => {
  try {
    const response = await api.get('/search/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching category counts:', error);
    return { categories: [] };
  }
};
