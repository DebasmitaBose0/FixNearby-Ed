const mongoose = require('mongoose');

const emergencyRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    emergencyCategory: { type: String, required: true },
    description: { type: String, required: true },
    broadcastRadiusKm: { type: Number, default: 5 },
    status: {
      type: String,
      enum: ['BROADCASTING', 'ACCEPTED', 'EXPIRED', 'CANCELLED'],
      default: 'BROADCASTING',
      index: true
    },
    assignedWorkerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker'
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 1000)
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmergencyRequest', emergencyRequestSchema);
