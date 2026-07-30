import RewardPoints from '../models/RewardPoints.js';

export const getUserRewards = async (req, res) => {
  try {
    let userRewards = await RewardPoints.findOne({ user: req.user.id });
    if (!userRewards) {
      userRewards = new RewardPoints({ user: req.user.id, balance: 50 });
      await userRewards.save();
    }

    const availableCoupons = [
      { _id: 'c1', title: '$10 Off Plumbing Services', discount: 10, pointsCost: 50 },
      { _id: 'c2', title: '$25 Off Electrical Repair', discount: 25, pointsCost: 100 },
      { _id: 'c3', title: '50% Off House Cleaning', discount: 50, pointsCost: 200 }
    ];

    res.status(200).json({
      balance: userRewards.balance,
      tier: userRewards.tier,
      history: userRewards.transactions,
      availableCoupons
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rewards', error: error.message });
  }
};

export const redeemCoupon = async (req, res) => {
  try {
    const { couponId } = req.body;
    const userRewards = await RewardPoints.findOne({ user: req.user.id });

    if (!userRewards || userRewards.balance < 50) {
      return res.status(400).json({ message: 'Insufficient points to redeem coupon' });
    }

    userRewards.balance -= 50;
    userRewards.transactions.push({
      type: 'redeemed',
      points: 50,
      description: `Redeemed coupon ${couponId}`
    });
    await userRewards.save();

    res.status(200).json({
      success: true,
      code: `SAVE50-${Math.floor(1000 + Math.random() * 9000)}`,
      newBalance: userRewards.balance
    });
  } catch (error) {
    res.status(500).json({ message: 'Redemption failed', error: error.message });
  }
};

export default {
  getUserRewards,
  redeemCoupon
};
