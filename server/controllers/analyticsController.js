const Booking = require('../models/Booking');
const Review = require('../models/Review');
const mongoose = require('mongoose');

exports.getWorkerAnalytics = async (req, res) => {
  try {
    const workerId = new mongoose.Types.ObjectId(req.params.workerId);

    const bookingStats = await Booking.aggregate([
      { $match: { worker: workerId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const reviewStats = await Review.aggregate([
      { $match: { workerId } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        bookings: bookingStats,
        reviews: reviewStats
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
