import SubscriptionSchedulerService from '../services/subscriptionSchedulerService.js';
import ServiceSubscription from '../models/ServiceSubscription.js';

export const createSubscription = async (req, res) => {
  try {
    const customerId = req.user ? req.user.id : req.body.customerId;
    const sub = await SubscriptionSchedulerService.createSubscription(customerId, req.body);
    return res.status(201).json({
      success: true,
      message: 'Service subscription created.',
      data: sub,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCustomerSubscriptions = async (req, res) => {
  try {
    const customerId = req.params.customerId || (req.user && req.user.id);
    const subs = await ServiceSubscription.find({ customerId });
    return res.status(200).json({
      success: true,
      data: subs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const toggleStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await SubscriptionSchedulerService.updateSubscriptionStatus(req.params.subscriptionId, status);
    return res.status(200).json({
      success: true,
      message: `Subscription ${status.toLowerCase()}.`,
      data: updated,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
