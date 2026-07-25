import Earning from '../models/Earning.js';
import Worker from '../models/Worker.js';
import Booking from '../models/Booking.js';
import mongoose from 'mongoose';

/**
 * Helper to build revenue trends & correlation data
 */
const computeAnalytics = async (workerId) => {
  const now = new Date();
  const objId = new mongoose.Types.ObjectId(workerId);

  // 1. Weekly breakdown (last 7 days)
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const weeklyData = await Earning.aggregate([
    {
      $match: {
        workerId: objId,
        createdAt: { $gte: sevenDaysAgo },
        status: { $ne: 'refunded' }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        earnings: { $sum: '$netAmount' },
        grossAmount: { $sum: '$amount' },
        platformFee: { $sum: '$platformFee' },
        completedJobs: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Fill in missing days for the last 7 days
  const weeklyTrends = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const found = weeklyData.find((w) => w._id === dateStr);

    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    weeklyTrends.push({
      date: dateStr,
      label: dayName,
      earnings: found ? found.earnings : 0,
      grossAmount: found ? found.grossAmount : 0,
      platformFee: found ? found.platformFee : 0,
      completedJobs: found ? found.completedJobs : 0,
      avgPerJob: found && found.completedJobs > 0 ? Math.round(found.earnings / found.completedJobs) : 0
    });
  }

  // 2. Monthly breakdown (last 6 months)
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const monthlyData = await Earning.aggregate([
    {
      $match: {
        workerId: objId,
        createdAt: { $gte: sixMonthsAgo },
        status: { $ne: 'refunded' }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        earnings: { $sum: '$netAmount' },
        grossAmount: { $sum: '$amount' },
        platformFee: { $sum: '$platformFee' },
        completedJobs: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const monthlyTrends = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = d.toISOString().slice(0, 7); // YYYY-MM
    const found = monthlyData.find((m) => m._id === monthKey);
    const monthLabel = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

    monthlyTrends.push({
      period: monthKey,
      label: monthLabel,
      earnings: found ? found.earnings : 0,
      grossAmount: found ? found.grossAmount : 0,
      platformFee: found ? found.platformFee : 0,
      completedJobs: found ? found.completedJobs : 0,
      avgPerJob: found && found.completedJobs > 0 ? Math.round(found.earnings / found.completedJobs) : 0
    });
  }

  // 3. Jobs vs Earnings correlation series
  const correlationSeries = monthlyTrends.map((m) => ({
    period: m.label,
    completedJobs: m.completedJobs,
    earnings: m.earnings,
    avgPerJob: m.avgPerJob
  }));

  return {
    weeklyTrends,
    monthlyTrends,
    correlationSeries
  };
};

// @desc    Get earnings dashboard summary & analytics stats
// @route   GET /api/earnings/summary or /api/earnings/dashboard/stats
// @access  Private (Worker)
export const getEarningsDashboard = async (req, res) => {
  try {
    const workerId = req.worker._id;
    const objId = new mongoose.Types.ObjectId(workerId);

    const stats = await Earning.aggregate([
      { $match: { workerId: objId } },
      {
        $group: {
          _id: null,
          totalEarnings: {
            $sum: { $cond: [{ $eq: ['$type', 'booking_income'] }, '$netAmount', 0] }
          },
          totalPayouts: {
            $sum: { $cond: [{ $eq: ['$type', 'payout_withdrawal'] }, '$netAmount', 0] }
          },
          pendingAmount: {
            $sum: { $cond: [{ $and: [{ $eq: ['$status', 'pending'] }, { $eq: ['$type', 'booking_income'] }] }, '$netAmount', 0] }
          },
          paidAmount: {
            $sum: { $cond: [{ $and: [{ $eq: ['$status', 'paid'] }, { $eq: ['$type', 'booking_income'] }] }, '$netAmount', 0] }
          },
          bookingCount: {
            $sum: { $cond: [{ $eq: ['$type', 'booking_income'] }, 1, 0] }
          }
        }
      }
    ]);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [monthlyResult, weeklyResult] = await Promise.all([
      Earning.aggregate([
        {
          $match: {
            workerId: objId,
            createdAt: { $gte: startOfMonth },
            type: 'booking_income',
            status: { $ne: 'refunded' }
          }
        },
        { $group: { _id: null, thisMonth: { $sum: '$netAmount' } } }
      ]),
      Earning.aggregate([
        {
          $match: {
            workerId: objId,
            createdAt: { $gte: startOfWeek },
            type: 'booking_income',
            status: { $ne: 'refunded' }
          }
        },
        { $group: { _id: null, thisWeek: { $sum: '$netAmount' } } }
      ])
    ]);

    const overview = stats.length > 0 ? stats[0] : {
      totalEarnings: 0, totalPayouts: 0, pendingAmount: 0, paidAmount: 0, bookingCount: 0
    };

    const availableBalance = Math.max(0, (overview.paidAmount || 0) - (overview.totalPayouts || 0));
    const avgEarningPerJob = overview.bookingCount > 0 ? Math.round(overview.totalEarnings / overview.bookingCount) : 0;

    const analytics = await computeAnalytics(workerId);

    // Get saved payout methods
    const workerDoc = await Worker.findById(workerId).select('payoutMethods');
    const payoutMethods = workerDoc?.payoutMethods || [];

    res.status(200).json({
      success: true,
      totalEarnings: overview.totalEarnings || 0,
      totalPayouts: overview.totalPayouts || 0,
      availableBalance: availableBalance > 0 ? availableBalance : overview.paidAmount || 0,
      pendingAmount: overview.pendingAmount || 0,
      paidAmount: overview.paidAmount || 0,
      thisMonth: monthlyResult.length > 0 ? monthlyResult[0].thisMonth : 0,
      thisWeek: weeklyResult.length > 0 ? weeklyResult[0].thisWeek : 0,
      bookingCount: overview.bookingCount || 0,
      avgEarningPerJob,
      analytics,
      payoutMethods
    });
  } catch (error) {
    console.error('Error fetching earnings dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching earnings stats'
    });
  }
};

// @desc    Get paginated earnings & payout history
// @route   GET /api/earnings/history
// @access  Private (Worker)
export const getEarningsHistory = async (req, res) => {
  try {
    const workerId = req.worker._id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = { workerId };
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.type) {
      filter.type = req.query.type;
    }

    const total = await Earning.countDocuments(filter);
    const earnings = await Earning.find(filter)
      .populate('bookingId', 'service scheduledTime address price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      earnings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching earnings history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching earnings history'
    });
  }
};

// @desc    Request a payout (Supports Stripe Connect mock, UPI, Bank Transfer)
// @route   POST /api/earnings/request-payout or /api/earnings/payout
// @access  Private (Worker)
export const requestPayout = async (req, res) => {
  try {
    const workerId = req.worker._id;
    const { amount, payoutMethodType = 'bank_account', payoutMethodDetails = {} } = req.body;

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid payout amount greater than zero'
      });
    }

    // Find available paid earnings
    const paidEarnings = await Earning.find({
      workerId,
      status: 'paid',
      type: 'booking_income'
    }).sort({ createdAt: 1 });

    const totalPaidIncome = paidEarnings.reduce((sum, e) => sum + e.netAmount, 0);

    // Find previous payouts
    const previousPayouts = await Earning.find({
      workerId,
      type: 'payout_withdrawal',
      status: { $in: ['paid', 'processing', 'pending'] }
    });

    const totalPreviousPayouts = previousPayouts.reduce((sum, e) => sum + e.netAmount, 0);
    const availableBalance = Math.max(0, totalPaidIncome - totalPreviousPayouts);

    // If available balance is less than requested amount and totalPaidIncome > 0
    if (availableBalance > 0 && availableBalance < numAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Available balance: ₹${availableBalance.toFixed(2)}, requested: ₹${numAmount.toFixed(2)}`
      });
    }

    const transactionId = `TXN_PO_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Create payout withdrawal earning record
    const payoutRecord = await Earning.create({
      workerId,
      amount: numAmount,
      platformFee: payoutMethodType === 'stripe_connect' ? Math.round(numAmount * 0.01) : 0, // 1% fee for express Stripe payout
      netAmount: numAmount,
      type: 'payout_withdrawal',
      status: payoutMethodType === 'stripe_connect' ? 'paid' : 'processing',
      payoutDate: new Date(),
      payoutMethod: {
        type: payoutMethodType,
        details: payoutMethodDetails
      },
      transactionId,
      description: `Payout withdrawal via ${payoutMethodType.toUpperCase().replace('_', ' ')} (${transactionId})`,
      transactionHistory: [{
        action: 'payout_requested',
        amount: numAmount,
        status: payoutMethodType === 'stripe_connect' ? 'paid' : 'processing',
        method: payoutMethodType,
        timestamp: new Date(),
        notes: `Payout request created via ${payoutMethodType}`
      }]
    });

    res.status(200).json({
      success: true,
      message: `Payout request for ₹${numAmount.toFixed(2)} submitted successfully!`,
      payout: payoutRecord,
      transactionId
    });
  } catch (error) {
    console.error('Error processing payout request:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing payout request'
    });
  }
};

// @desc    Get worker saved payout methods
// @route   GET /api/earnings/payout-methods
// @access  Private (Worker)
export const getPayoutMethods = async (req, res) => {
  try {
    const worker = await Worker.findById(req.worker._id).select('payoutMethods');
    res.status(200).json({
      success: true,
      payoutMethods: worker?.payoutMethods || []
    });
  } catch (error) {
    console.error('Error fetching payout methods:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payout methods'
    });
  }
};

// @desc    Add a saved payout method (Bank account, UPI, Stripe Connect)
// @route   POST /api/earnings/payout-methods
// @access  Private (Worker)
export const addPayoutMethod = async (req, res) => {
  try {
    const { type, isDefault = false, details = {} } = req.body;

    if (!type || !['bank_account', 'upi', 'stripe_connect'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payout method type. Allowed: bank_account, upi, stripe_connect'
      });
    }

    const worker = await Worker.findById(req.worker._id);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    if (!worker.payoutMethods) worker.payoutMethods = [];

    // If setting default, unset existing default
    if (isDefault) {
      worker.payoutMethods.forEach((pm) => { pm.isDefault = false; });
    }

    const newMethod = {
      type,
      isDefault: isDefault || worker.payoutMethods.length === 0,
      details,
      createdAt: new Date()
    };

    worker.payoutMethods.push(newMethod);
    await worker.save();

    res.status(201).json({
      success: true,
      message: 'Payout method added successfully',
      payoutMethods: worker.payoutMethods
    });
  } catch (error) {
    console.error('Error adding payout method:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding payout method'
    });
  }
};

// @desc    Delete a payout method
// @route   DELETE /api/earnings/payout-methods/:id
// @access  Private (Worker)
export const deletePayoutMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const worker = await Worker.findById(req.worker._id);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    worker.payoutMethods = worker.payoutMethods.filter((pm) => pm._id.toString() !== id);
    await worker.save();

    res.status(200).json({
      success: true,
      message: 'Payout method deleted successfully',
      payoutMethods: worker.payoutMethods
    });
  } catch (error) {
    console.error('Error deleting payout method:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting payout method'
    });
  }
};

// @desc    Export earnings as CSV report download
// @route   GET /api/earnings/export-csv
// @access  Private (Worker)
export const exportEarningsCSV = async (req, res) => {
  try {
    const workerId = req.worker._id;
    const earnings = await Earning.find({ workerId })
      .populate('bookingId', 'service scheduledTime')
      .sort({ createdAt: -1 });

    let csvContent = 'ID,Date,Type,Description,Gross Amount (INR),Platform Fee (INR),Net Amount (INR),Status,Payout Date,Transaction ID\n';

    earnings.forEach((e) => {
      const date = e.createdAt ? new Date(e.createdAt).toISOString().split('T')[0] : '';
      const payoutDate = e.payoutDate ? new Date(e.payoutDate).toISOString().split('T')[0] : '';
      const desc = `"${(e.description || e.bookingId?.service || 'Service Earning').replace(/"/g, '""')}"`;

      csvContent += `${e._id},${date},${e.type || 'booking_income'},${desc},${e.amount},${e.platformFee},${e.netAmount},${e.status},${payoutDate},${e.transactionId || ''}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="earnings_report_${Date.now()}.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error exporting earnings CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while exporting earnings CSV'
    });
  }
};
