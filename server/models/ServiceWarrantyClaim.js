import mongoose from 'mongoose';

const serviceWarrantyClaimSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    index: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  originalWorkerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  claimDescription: {
    type: String,
    required: true,
    minlength: 15,
  },
  defectPhotos: [{
    type: String,
  }],
  warrantyDaysAllowed: {
    type: Number,
    default: 30, // 30-Day FixNearby Satisfaction Guarantee
  },
  claimStatus: {
    type: String,
    enum: ['Claim Filed', 'Inspection Scheduled', 'Re-Dispatch Assigned', 'Claim Resolved', 'Claim Rejected'],
    default: 'Claim Filed',
    index: true,
  },
  assignedInspectorWorkerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  resolutionSummary: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

export default mongoose.model('ServiceWarrantyClaim', serviceWarrantyClaimSchema);
