import api from './apiClient';

const disputeService = {
  createDispute: async (disputeData) => {
    const res = await api.post('/disputes', disputeData);
    return res.data;
  },
  getUserDisputes: async () => {
    const res = await api.get('/disputes');
    return res.data;
  },
  getDisputeById: async (id) => {
    const res = await api.get(`/disputes/${id}`);
    return res.data;
  },
  resolveDispute: async (id, resolutionData) => {
    const res = await api.patch(`/disputes/${id}/resolve`, resolutionData);
    return res.data;
  }
};

export default disputeService;
