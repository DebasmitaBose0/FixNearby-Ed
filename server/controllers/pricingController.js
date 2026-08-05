import { calculateDynamicPrice } from '../utils/pricingEngine.js';
import Worker from '../models/Worker.js';
import Booking from '../models/Booking.js';
import Subscription from '../models/Subscription.js';

// @desc    Estimate dynamic surge pricing for a booking request
// @route   POST /api/pricing/estimate
// @access  Public / Private
export const estimateBookingPrice = async (req, res, next) => {
  try {
    const { workerId, distanceKm = 5, category = 'General' } = req.body;

    let baseHourlyRate = 40;
    if (workerId) {
      const worker = await Worker.findById(workerId);
      if (worker) {
        baseHourlyRate = worker.hourlyRate || 40;
      }
    }

    const [activeWorkerCount, pendingDemandCount] = await Promise.all([
      Worker.countDocuments({ availabilityStatus: 'available', category }),
      Booking.countDocuments({ status: 'Pending', service: category })
    ]);

    let userTier = 'free';
    if (req.user) {
      const sub = await Subscription.findOne({ subscriberId: req.user._id, status: 'active' });
      if (sub) userTier = sub.planTier;
    }

    const priceBreakdown = calculateDynamicPrice({
      baseHourlyRate,
      distanceKm: Number(distanceKm),
      activeWorkerCount,
      pendingDemandCount,
      userTier
    });

    res.status(200).json({
      success: true,
      category,
      priceBreakdown
    });
  } catch (error) {
    next(error);
  }
};
