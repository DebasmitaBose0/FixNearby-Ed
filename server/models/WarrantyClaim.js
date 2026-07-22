const mongoose = require('mongoose');

const warrantyClaimSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true
    },
    issueDescription: { type: String, required: true },
    warrantyExpiryDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['CLAIM_SUBMITTED', 'APPROVED_FREE_RESERVICE', 'REJECTED', 'CLOSED'],
      default: 'CLAIM_SUBMITTED'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('WarrantyClaim', warrantyClaimSchema);
