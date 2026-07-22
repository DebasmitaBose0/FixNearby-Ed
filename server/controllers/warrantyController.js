const WarrantyClaim = require('../models/WarrantyClaim');
const Booking = require('../models/Booking');

exports.fileWarrantyClaim = async (req, res) => {
  try {
    const { bookingId, issueDescription } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const claim = await WarrantyClaim.create({
      bookingId,
      userId: req.user._id || req.user.id,
      workerId: booking.worker,
      issueDescription,
      warrantyExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    res.status(201).json({ success: true, data: claim });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
