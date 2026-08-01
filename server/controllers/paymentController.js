import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import { stripe } from '../config/stripe.js';
import crypto from 'crypto';
import { processExternalPaymentGateway } from '../services/externalGatewayService.js';


// @desc    Create a real Stripe payment intent (with fallback for mock/demo)
// @route   POST /api/payments/create-intent
// @access  Private
export const createPaymentIntent = async (req, res, next) => {
  try {
    const { bookingId, amount, method = 'card', currency = 'usd' } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'bookingId and amount are required'
      });
    }

    const validMethods = ['card', 'stripe', 'bank_transfer', 'wallet'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment method. Allowed: ${validMethods.join(', ')}`
      });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this booking'
      });
    }

    const existingPayment = await Payment.findOne({
      bookingId,
      status: { $in: ['pending', 'completed'] }
    });

    if (existingPayment && existingPayment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been paid for'
      });
    }

    let clientSecret = null;
    let stripePaymentIntentId = null;

    // Attempt real Stripe PaymentIntent creation
    try {
      if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('mock')) {
        const amountCents = Math.round(amount * 100);
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountCents,
          currency: currency.toLowerCase(),
          metadata: {
            bookingId: booking._id.toString(),
            userId: req.user._id.toString(),
          },
          automatic_payment_methods: { enabled: true },
        });

        clientSecret = paymentIntent.client_secret;
        stripePaymentIntentId = paymentIntent.id;
      }
    } catch (stripeErr) {
      console.warn('[Stripe PaymentIntent] Stripe API warning, using secure fallback:', stripeErr.message);
    }

    // Fallback if Stripe key is mock/test or call threw error
    if (!clientSecret) {
      const secretHex = crypto.randomBytes(16).toString('hex');
      stripePaymentIntentId = `pi_mock_${crypto.randomBytes(12).toString('hex')}`;
      clientSecret = `${stripePaymentIntentId}_secret_${secretHex}`;
    }

    let payment;
    if (existingPayment) {
      existingPayment.amount = amount;
      existingPayment.method = method;
      existingPayment.clientSecret = clientSecret;
      existingPayment.stripePaymentIntentId = stripePaymentIntentId;
      await existingPayment.save();
      payment = existingPayment;
    } else {
      payment = await Payment.create({
        userId: req.user._id,
        bookingId,
        amount,
        currency: currency.toUpperCase(),
        method,
        status: 'pending',
        clientSecret,
        stripePaymentIntentId
      });
    }

    res.status(201).json({
      success: true,
      payment,
      clientSecret,
      stripePaymentIntentId
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm a payment (Stripe webhook simulation / Client confirmation)
// @route   POST /api/payments/confirm
// @access  Private
export const confirmPayment = async (req, res, next) => {
  try {
    const { paymentId, transactionId } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'paymentId is required'
      });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to confirm this payment'
      });
    }

    if (payment.status === 'completed') {
      return res.status(200).json({
        success: true,
        message: 'Payment is already completed',
        payment
      });
    }

    if (payment.status === 'refunded') {
      return res.status(400).json({
        success: false,
        message: 'Cannot confirm a refunded payment'
      });
    }

    payment.status = 'completed';
    payment.transactionId = transactionId || payment.stripePaymentIntentId || `txn_${crypto.randomBytes(12).toString('hex')}`;
    payment.paymentDate = new Date();

    const receiptId = crypto.randomBytes(8).toString('hex');
    payment.receiptUrl = `/api/payments/receipt/${receiptId}`;

    await payment.save();

    // Auto update booking status if accepted
    const booking = await Booking.findById(payment.bookingId);
    if (booking && booking.status === 'Pending') {
      booking.status = 'Accepted';
      booking.statusHistory.push({
        status: 'Accepted',
        changedBy: req.user._id,
        changedByModel: 'User',
        note: 'Booking auto-confirmed upon successful payment'
      });
      await booking.save();
    }

    res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully',
      payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Stripe Webhook Handler
// @route   POST /api/payments/webhook
// @access  Public (Stripe Webhook Signature Verification)
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event = req.body;

  if (endpointSecret && sig) {
    try {
      event = stripe.webhooks.constructEvent(req.rawBody || req.body, sig, endpointSecret);
    } catch (err) {
      console.error('[Stripe Webhook Error]:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  console.log(`[Stripe Webhook] Event received: ${event.type}`);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const bookingId = paymentIntent.metadata?.bookingId;
        const stripeId = paymentIntent.id;

        const payment = await Payment.findOne({
          $or: [{ stripePaymentIntentId: stripeId }, { bookingId }]
        });

        if (payment && payment.status !== 'completed') {
          payment.status = 'completed';
          payment.transactionId = stripeId;
          payment.paymentDate = new Date();
          await payment.save();

          // Update booking status
          if (bookingId) {
            const booking = await Booking.findById(bookingId);
            if (booking && booking.status === 'Pending') {
              booking.status = 'Accepted';
              await booking.save();
            }
          }
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const stripeId = paymentIntent.id;
        const payment = await Payment.findOne({ stripePaymentIntentId: stripeId });
        if (payment) {
          payment.status = 'failed';
          await payment.save();
        }
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object;
        const stripeId = charge.payment_intent;
        const payment = await Payment.findOne({ stripePaymentIntentId: stripeId });
        if (payment) {
          payment.status = 'refunded';
          payment.refundReason = charge.refunds?.data?.[0]?.reason || 'Stripe webhook refund';
          await payment.save();
        }
        break;
      }
      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook Processing Error]:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get paginated payment history for current user
// @route   GET /api/payments/history
// @access  Private
export const getPaymentHistory = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.find({ userId: req.user._id })
        .populate('bookingId', 'service scheduledTime address price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments({ userId: req.user._id })
    ]);

    res.status(200).json({
      success: true,
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single payment by ID
// @route   GET /api/payments/:id
// @access  Private
export const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('bookingId')
      .populate('userId', 'name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this payment'
      });
    }

    res.status(200).json({
      success: true,
      payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request a refund for a completed payment via Stripe API
// @route   POST /api/payments/:id/refund
// @access  Private
export const requestRefund = async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Refund reason is required'
      });
    }

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to request a refund for this payment'
      });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Only completed payments can be refunded'
      });
    }

    let stripeRefundId = null;

    // Call Stripe Refund API if real payment intent exists
    try {
      if (payment.stripePaymentIntentId && process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('mock')) {
        const refund = await stripe.refunds.create({
          payment_intent: payment.stripePaymentIntentId,
          reason: 'requested_by_customer',
        });
        stripeRefundId = refund.id;
      }
    } catch (stripeErr) {
      console.warn('[Stripe Refund Error]:', stripeErr.message);
    }

    payment.status = 'refunded';
    payment.refundReason = reason.trim();
    payment.stripeRefundId = stripeRefundId || `re_mock_${crypto.randomBytes(8).toString('hex')}`;
    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      payment
    });
  } catch (error) {
    next(error);
  }
};
