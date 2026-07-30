import apiClient from './apiClient';

export const getUserRewards = async () => {
  const response = await apiClient.get('/rewards/my-rewards');
  return response.data;
};

export const redeemCoupon = async (couponId) => {
  const response = await apiClient.post('/rewards/redeem', { couponId });
  return response.data;
};

export default {
  getUserRewards,
  redeemCoupon
};
