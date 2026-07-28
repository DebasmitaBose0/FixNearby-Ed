import axios from 'axios';

const API_URL = '/api/disputes';

const disputeService = {
  createDispute: async (disputeData) => {
    const res = await axios.post(API_URL, disputeData);
    return res.data;
  },
  getUserDisputes: async () => {
    const res = await axios.get(API_URL);
    return res.data;
  },
  getDisputeById: async (id) => {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
  },
  resolveDispute: async (id, resolutionData) => {
    const res = await axios.patch(`${API_URL}/${id}/resolve`, resolutionData);
    return res.data;
  }
};

export default disputeService;
