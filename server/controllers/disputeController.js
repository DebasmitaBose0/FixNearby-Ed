const Dispute = require('../models/Dispute');
const Booking = require('../models/Booking');

exports.createDispute = async (req, res) => {
  try {
    const { bookingId, againstUser, reason, claimAmount, evidenceUrls } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const dispute = await Dispute.create({
      bookingId,
      disputedBy: req.user._id || req.user.id,
      againstUser,
      reason,
      claimAmount,
      evidenceUrls: evidenceUrls || []
    });

    res.status(201).json({ success: true, data: dispute });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find()
      .populate('bookingId')
      .populate('disputedBy', 'name email')
      .populate('againstUser', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: disputes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDisputeById = async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate('bookingId')
      .populate('disputedBy', 'name email')
      .populate('againstUser', 'name email');

    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    res.json({ success: true, data: dispute });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resolveDispute = async (req, res) => {
  try {
    const { status, resolutionNotes } = req.body;
    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    dispute.status = status;
    dispute.resolutionNotes = resolutionNotes;
    dispute.resolvedBy = req.user._id || req.user.id;
    dispute.resolvedAt = new Date();
    await dispute.save();

    res.json({ success: true, data: dispute });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
