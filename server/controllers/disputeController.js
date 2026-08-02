import Dispute from '../models/Dispute.js';
import Booking from '../models/Booking.js';
import { processDisputeEvidence } from '../services/disputeWorkflowService.js';

export const createDispute = async (req, res) => {
  try {
    const { bookingId, againstUser, reason, claimAmount, evidenceUrls } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const processedEvidence = processDisputeEvidence(evidenceUrls || []);

    const dispute = await Dispute.create({
      bookingId,
      disputedBy: req.user._id || req.user.id,
      againstUser,
      reason,
      claimAmount,
      evidenceUrls: processedEvidence.validUrls
    });

    res.status(201).json({ success: true, data: dispute, metadata: { sanitizationSummary: processedEvidence } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDisputes = async (req, res) => {
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

export const getDisputeById = async (req, res) => {
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

export const resolveDispute = async (req, res) => {
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
