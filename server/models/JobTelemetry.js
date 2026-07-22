const mongoose = require('mongoose');

const jobTelemetrySchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true
    },
    checkInCoordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    checkOutCoordinates: {
      lat: { type: Number },
      lng: { type: Number }
    },
    distanceFromTargetMeters: {
      type: Number,
      required: true
    },
    durationMinutes: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('JobTelemetry', jobTelemetrySchema);
