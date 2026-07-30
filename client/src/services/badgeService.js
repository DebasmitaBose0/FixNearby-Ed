import apiClient from './apiClient';

export const getPendingBadgeRequests = async () => {
  const response = await apiClient.get('/badges/pending');
  return response.data;
};

export const submitBadgeRequest = async (data) => {
  const response = await apiClient.post('/badges/request', data);
  return response.data;
};

export const reviewBadgeRequest = async (requestId, status) => {
  const response = await apiClient.put(`/badges/review/${requestId}`, { status });
  return response.data;
};

export default {
  getPendingBadgeRequests,
  submitBadgeRequest,
  reviewBadgeRequest
};
