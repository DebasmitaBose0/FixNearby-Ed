import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderModel'
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['User', 'Worker']
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'receiverModel'
  },
  receiverModel: {
    type: String,
    required: true,
    enum: ['User', 'Worker']
  },
  text: {
    type: String,
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  },
  serviceCategory: {
    type: String,
    default: 'General Service'
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  readAt: {
    type: Date,
    default: null
  },
  attachment: {
    fileUrl: String,
    fileName: String,
    fileType: String,
    fileSize: Number
  }
}, { timestamps: true });

messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, senderId: 1 });
messageSchema.index({ bookingId: 1 });
messageSchema.index({ createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;