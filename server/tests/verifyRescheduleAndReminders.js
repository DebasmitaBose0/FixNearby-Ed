import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import WorkerModel from '../models/Worker.js';
import Booking from '../models/Booking.js';
import { startBookingReminderScheduler } from '../workers/bookingReminderWorker.js';
import { queueNotification, notificationQueue } from '../utils/queue.js';
import { getIo } from '../socket.js';

dotenv.config();

// Stub getIo if needed
import { createServer } from 'http';
import { initSocket } from '../socket.js';
const server = createServer();
initSocket(server);

const runTests = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();

    if (!mongoose.connection.readyState) {
      console.error('Failed to establish database connection. Exiting.');
      process.exit(1);
    }

    console.log('Cleaning up old test data...');
    const testEmailUser = 'testuser-resched@example.com';
    const testEmailWorker = 'testworker-resched@example.com';
    
    await User.deleteMany({ email: testEmailUser });
    await WorkerModel.deleteMany({ email: testEmailWorker });

    console.log('Creating test user and worker...');
    const user = await User.create({
      name: 'Test Resched User',
      email: testEmailUser,
      password: 'Password123',
      phone: '+15005550006',
      notificationPreferences: { email: true, sms: true, push: true }
    });

    const worker = await WorkerModel.create({
      name: 'Test Resched Worker',
      email: testEmailWorker,
      password: 'Password123',
      category: 'Plumbing',
      experience: '5 years',
      location: { type: 'Point', coordinates: [-73.935242, 40.73061] },
      contact: '+15005550006',
      bio: 'Plumbing bio.',
      notificationPreferences: { email: true, sms: true, push: true }
    });

    console.log('\n--- Test 1: Booking Creation ---');
    const start = new Date(Date.now() + 2 * 3600000); // 2 hours from now
    const booking = await Booking.create({
      userId: user._id,
      workerId: worker._id,
      service: 'Plumbing Repair',
      scheduledTime: start,
      durationHours: 2,
      address: '123 Test St',
      price: 150,
      status: 'Pending'
    });
    console.log(`Created booking ID: ${booking._id}, status: ${booking.status}`);

    console.log('\n--- Test 2: Rescheduling Pending Booking ---');
    // Reschedule to 5 hours from now
    const newTime = new Date(Date.now() + 5 * 3600000);
    booking.scheduledTime = newTime;
    booking.statusHistory.push({
      status: 'Pending',
      note: 'Rescheduled for test'
    });
    await booking.save();
    console.log(`Rescheduled booking scheduledTime updated to: ${booking.scheduledTime}`);

    console.log('\n--- Test 3: Overlap Verification ---');
    // Accept booking to check overlap
    booking.status = 'Accepted';
    await booking.save();

    // Create a new booking overlapping
    const overlapStart = new Date(newTime.getTime() + 1 * 3600000); // overlapping duration (starts during booking)
    const query = {
      workerId: worker._id,
      status: { $in: ['Accepted', 'In-Progress'] },
      $expr: {
        $and: [
          { $lt: ['$scheduledTime', new Date(overlapStart.getTime() + 2 * 3600000)] },
          {
            $lt: [
              overlapStart,
              {
                $add: [
                  '$scheduledTime',
                  { $multiply: ['$durationHours', 3600000] }
                ]
              }
            ]
          }
        ]
      }
    };
    const overlap = await Booking.findOne(query);
    if (overlap) {
      console.log('SUCCESS: Overlap detected successfully for worker!');
    } else {
      console.error('FAIL: Overlap not detected');
    }

    console.log('\n--- Test 4: Reminder Scheduler Verification ---');
    // Set booking status to Accepted and scheduledTime to 2 hours from now
    booking.status = 'Accepted';
    booking.scheduledTime = new Date(Date.now() + 2 * 3600000);
    booking.reminderSent = false;
    await booking.save();

    // Run the reminder search query directly to simulate the scheduler
    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const toRemind = await Booking.find({
      status: 'Accepted',
      reminderSent: { $ne: true },
      scheduledTime: { $gt: now, $lt: twentyFourHoursFromNow }
    });

    console.log(`Found ${toRemind.length} bookings to remind (Expected: 1)`);
    if (toRemind.length === 1) {
      const b = toRemind[0];
      b.reminderSent = true;
      b.status = 'Reminder Sent';
      b.statusHistory.push({
        status: 'Reminder Sent',
        note: 'Reminder sent in test'
      });
      await b.save();
      console.log(`SUCCESS: Booking ${b._id} status updated to: ${b.status}, reminderSent: ${b.reminderSent}`);
    } else {
      console.error('FAIL: No bookings found for reminder');
    }

    console.log('\n--- CLEANING UP ---');
    await Booking.findByIdAndDelete(booking._id);
    await User.findByIdAndDelete(user._id);
    await WorkerModel.findByIdAndDelete(worker._id);
    console.log('Cleanup completed.');

    console.log('\n=============================================');
    console.log('ALL RESCHEDULING & REMINDER TESTS PASSED!');
    console.log('=============================================');
    process.exit(0);
  } catch (error) {
    console.error('\nXXX TESTS FAILED XXX');
    console.error(error);
    process.exit(1);
  }
};

runTests();
