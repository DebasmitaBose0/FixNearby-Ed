import mongoose from 'mongoose';
import { STATUS_ENUM } from '../models/Booking.js';

export function validateObjectId(id, fieldName = 'ID') {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return { valid: false, message: `Invalid ${fieldName}` };
  }
  return { valid: true };
}

export function validateScheduledTime(time) {
  if (!time) {
    return { valid: false, message: 'Scheduled time is required' };
  }
  const date = new Date(time);
  if (isNaN(date.getTime())) {
    return { valid: false, message: 'Invalid scheduled time format' };
  }
  if (date.getTime() < Date.now() - 60000) {
    return { valid: false, message: 'Scheduled time must be in the future' };
  }
  return { valid: true };
}

export function validateDuration(hours) {
  const num = Number(hours);
  if (isNaN(num) || num <= 0) {
    return { valid: false, message: 'Duration must be a positive number' };
  }
  if (num > 24) {
    return { valid: false, message: 'Duration cannot exceed 24 hours' };
  }
  return { valid: true };
}

export function validatePrice(price) {
  const num = Number(price);
  if (isNaN(num) || num < 0) {
    return { valid: false, message: 'Price must be a non-negative number' };
  }
  if (num > 100000) {
    return { valid: false, message: 'Price cannot exceed 100,000' };
  }
  return { valid: true };
}

export const validateCreateBooking = (req, res, next) => {
  const { workerId, service, scheduledTime, durationHours, address, price } = req.body;

  if (!workerId || !service || !scheduledTime || !durationHours || !address || price === undefined) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required: workerId, service, scheduledTime, durationHours, address, price'
    });
  }

  const idCheck = validateObjectId(workerId, 'worker ID');
  if (!idCheck.valid) {
    return res.status(400).json({ success: false, message: idCheck.message });
  }

  if (!service || typeof service !== 'string' || service.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Service must be at least 2 characters' });
  }

  if (service.length > 120) {
    return res.status(400).json({ success: false, message: 'Service must be less than 120 characters' });
  }

  const timeCheck = validateScheduledTime(scheduledTime);
  if (!timeCheck.valid) {
    return res.status(400).json({ success: false, message: timeCheck.message });
  }

  const durationCheck = validateDuration(durationHours);
  if (!durationCheck.valid) {
    return res.status(400).json({ success: false, message: durationCheck.message });
  }

  if (!address || typeof address !== 'string' || address.trim().length < 5) {
    return res.status(400).json({ success: false, message: 'Address must be at least 5 characters' });
  }

  const priceCheck = validatePrice(price);
  if (!priceCheck.valid) {
    return res.status(400).json({ success: false, message: priceCheck.message });
  }

  next();
};

export const validateBookingStatusFilter = (req, res, next) => {
  const { status } = req.query;
  if (status) {
    const normalized = String(status).trim();
    if (!STATUS_ENUM.includes(normalized)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status filter. Allowed: ${STATUS_ENUM.join(', ')}`
      });
    }
  }
  next();
};

export const validateCancelBooking = (req, res, next) => {
  const { note } = req.body;
  if (note !== undefined && (typeof note !== 'string' || note.length > 500)) {
    return res.status(400).json({
      success: false,
      message: 'Cancellation note must be under 500 characters'
    });
  }
  next();
};
