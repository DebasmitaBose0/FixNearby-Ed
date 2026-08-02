import axios from 'axios';

const API_BASE = '/api/disputes/escalations';

export const fileDisputeEscalation = async (disputeData) => {
  const response = await axios.post(API_BASE, disputeData);
  return response.data;
};

export const attachDisputeEvidence = async (disputeId, evidenceData) => {
  const response = await axios.post(`${API_BASE}/${disputeId}/evidence`, evidenceData);
  return response.data;
};

export const fetchDisputesForBooking = async (bookingId) => {
  const response = await axios.get(`${API_BASE}/booking/${bookingId}`);
  return response.data;
};
