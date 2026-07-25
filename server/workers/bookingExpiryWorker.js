import { Worker } from 'bullmq';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import { getRedis } from '../utils/redis.js';
import { getIo } from '../socket.js';
import dotenv from 'dotenv';

dotenv.config();

const isDbConnected = () => mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2;

export const startBookingExpiryScheduler = async () => {
  console.log('[BullMQ Expiry Worker]: Initializing booking expiry check worker...');

  if (!isDbConnected()) {
    console.warn('[Expiry Worker] MongoDB not connected — skipping BullMQ expiry worker initialization.');
    return;
  }

  const performExpiryCheck = async () => {
    try {
      if (!isDbConnected()) {
        console.warn('[Expiry Worker] MongoDB unavailable — skipping expiry check.');
        return;
      }
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

      // Find stale pending bookings to extract worker IDs before update
      const staleBookings = await Booking.find({
        status: 'Pending',
        createdAt: { $lt: fifteenMinutesAgo },
      }).select('_id workerId');

      if (staleBookings.length > 0) {
        const staleIds = staleBookings.map((b) => b._id);
        const affectedWorkerIds = [...new Set(staleBookings.map((b) => b.workerId.toString()))];

        const result = await Booking.updateMany(
          { _id: { $in: staleIds } },
          { $set: { status: 'Expired' } }
        );

        if (result.modifiedCount > 0) {
          console.log(`[BullMQ Expiry Worker]: Transitioned ${result.modifiedCount} stale pending bookings to Expired`);

          // Emit real-time socket events for affected workers to auto-release slots
          try {
            const io = getIo();
            if (io) {
              affectedWorkerIds.forEach((workerId) => {
                io.emit('availability-update', { workerId, reason: 'slot_released' });
                io.emit('schedule-update', { workerId, reason: 'slot_released' });
              });
            }
          } catch (ioErr) {
            console.warn('[Expiry Worker] Socket notification failed:', ioErr.message);
          }
        }
      }
    } catch (err) {
      console.error('[Expiry Worker] performExpiryCheck error:', err.message);
    }
  };

  const conn = await getRedis();
  if (conn && conn.status === 'ready') {
    try {
      const expiryWorker = new Worker(
        'booking-expiry-queue',
        async (job) => {
          if (job.name === 'check_expiry') {
            console.log('[BullMQ Expiry Worker]: Executing scheduled expiry scan...');
            await performExpiryCheck();
          }
        },
        { connection: conn }
      );

      expiryWorker.on('completed', (job) => {
        console.log(`[BullMQ Expiry Worker]: Job completed successfully: ${job.id}`);
      });

      expiryWorker.on('failed', (job, err) => {
        console.error(`[BullMQ Expiry Worker]: Job failed for ID ${job?.id}:`, err.message);
      });

      console.log('[BullMQ Expiry Worker]: Registered BullMQ consumer.');
    } catch (err) {
      console.warn('[Expiry Worker] Failed to create BullMQ Worker:', err.message);
      console.log('[BullMQ Expiry Worker]: Fallback to standard setInterval loop.');
    }
  } else {
    console.log('[BullMQ Expiry Worker]: Fallback to standard setInterval loop.');
  }

  setInterval(async () => {
    try {
      await performExpiryCheck();
    } catch (err) {
      console.error('[Expiry Scheduler Fallback Error]: Failed to expire stale bookings:', err.message);
    }
  }, 60000);
};
