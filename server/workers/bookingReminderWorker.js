import Booking from '../models/Booking.js';
import { queueNotification } from '../utils/queue.js';

export const startBookingReminderScheduler = () => {
  console.log('[Scheduler]: Booking Reminder check initialized (running every 60s)');

  setInterval(async () => {
    try {
      const now = new Date();
      const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Find bookings scheduled in the next 24 hours that are 'Accepted' and haven't had a reminder sent yet
      const bookings = await Booking.find({
        status: 'Accepted',
        reminderSent: { $ne: true },
        scheduledTime: { $gt: now, $lt: twentyFourHoursFromNow }
      });

      for (const booking of bookings) {
        booking.reminderSent = true;
        booking.status = 'Reminder Sent';
        booking.statusHistory.push({
          status: 'Reminder Sent',
          note: 'Booking reminder sent automatically 24 hours prior to service scheduled time.'
        });
        await booking.save();

        console.log(`[Scheduler]: Sent reminder for booking ${booking._id}`);

        try {
          await queueNotification('booking_reminder', { bookingId: booking._id });
        } catch (notifyErr) {
          console.error(`[Scheduler Error]: Failed to queue reminder notification for booking ${booking._id}:`, notifyErr.message);
        }
      }
    } catch (error) {
      console.error('[Scheduler Error]: Failed to process booking reminders:', error.message);
    }
  }, 60000); // Check every 60 seconds
};
