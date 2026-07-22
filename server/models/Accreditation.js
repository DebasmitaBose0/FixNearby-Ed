const mongoose = require('mongoose');

const accreditationSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
      index: true
    },
    title: { type: String, required: true },
    issuingBody: { type: String, required: true },
    credentialId: { type: String },
    issueDate: { type: Date },
    expiryDate: { type: Date },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED'],
      default: 'PENDING'
    },
    documentUrl: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Accreditation', accreditationSchema);
