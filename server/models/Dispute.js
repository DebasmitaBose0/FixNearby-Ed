const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true
    },
    disputedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    againstUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      required: true,
      enum: ['INCOMPLETE_WORK', 'PROPERTY_DAMAGE', 'UNPROFESSIONAL_BEHAVIOR', 'OVERCHARGED', 'NON_PAYMENT', 'OTHER']
    },
    claimAmount: {
      type: Number,
      default: 0
    },
    evidenceUrls: [{
      type: String
    }],
    status: {
      type: String,
      enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED_REFUND', 'RESOLVED_PAYOUT', 'REJECTED'],
      default: 'OPEN',
      index: true
    },
    resolutionNotes: {
      type: String
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

disputeSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Dispute', disputeSchema);
