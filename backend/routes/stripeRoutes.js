const express = require('express');
const router = express.Router();
const stripeService = require('../services/stripeService');
const RecurringBill = require('../models/RecurringBill');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Setup payment for a bill
router.post('/:billId/setup-payment', async (req, res) => {
  try {
    const { billId } = req.params;
    const bill = await RecurringBill.findById(billId);

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    if (bill.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const customerId = await stripeService.createOrRetrieveCustomer(req.user._id, req.user.email);
    const paymentIntent = await stripeService.createPaymentIntent(bill.amount, customerId);

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error setting up payment:', error);
    res.status(500).json({ error: error.message || 'Failed to setup payment' });
  }
});

// Toggle auto-pay for a bill
router.post('/:billId/toggle-autopay', async (req, res) => {
  try {
    const { billId } = req.params;
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'Enabled status must be a boolean' });
    }

    const bill = await RecurringBill.findById(billId);
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    if (bill.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // If enabling auto-pay, check for payment method
    if (enabled && !bill.stripePaymentMethodId) {
      return res.status(400).json({ 
        error: 'No payment method found. Please set up a payment method first.',
        requiresPaymentMethod: true
      });
    }

    try {
      if (enabled) {
        // Enable auto-pay
        const customerId = await stripeService.createOrRetrieveCustomer(req.user._id, req.user.email);
        const subscriptionId = await stripeService.createSubscription(
          billId,
          customerId,
          bill.stripePaymentMethodId,
          bill.amount,
          bill.billingCycle
        );

        await RecurringBill.findByIdAndUpdate(billId, {
          autoPay: true,
          stripeSubscriptionId: subscriptionId,
          paymentStatus: 'PENDING'
        });

        res.json({
          success: true,
          message: 'Auto-pay has been enabled successfully',
          subscriptionId
        });
      } else {
        // Disable auto-pay
        if (bill.stripeSubscriptionId) {
          await stripeService.cancelSubscription(bill.stripeSubscriptionId);
        }

        await RecurringBill.findByIdAndUpdate(billId, {
          autoPay: false,
          stripeSubscriptionId: null,
          paymentStatus: 'CANCELLED'
        });

        res.json({
          success: true,
          message: 'Auto-pay has been disabled successfully'
        });
      }
    } catch (error) {
      console.error('Error toggling auto-pay:', error);
      res.status(400).json({ 
        error: error.message || 'Failed to toggle auto-pay',
        details: error.message
      });
    }
  } catch (error) {
    console.error('Error in toggle-autopay route:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Update payment method for a bill
router.post('/:billId/update-payment-method', async (req, res) => {
  try {
    const { billId } = req.params;
    const { paymentMethodId } = req.body;

    if (!paymentMethodId) {
      return res.status(400).json({ error: 'Payment method ID is required' });
    }

    const bill = await RecurringBill.findById(billId);
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    if (bill.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const customerId = await stripeService.createOrRetrieveCustomer(req.user._id, req.user.email);
    await stripeService.attachPaymentMethod(paymentMethodId, customerId);
    await stripeService.updateCustomerDefaultPaymentMethod(customerId, paymentMethodId);

    await RecurringBill.findByIdAndUpdate(billId, {
      stripePaymentMethodId: paymentMethodId
    });

    res.json({ success: true, message: 'Payment method updated successfully' });
  } catch (error) {
    console.error('Error updating payment method:', error);
    res.status(500).json({ error: error.message || 'Failed to update payment method' });
  }
});

// Cancel subscription for a bill
router.post('/:billId/cancel-subscription', async (req, res) => {
  try {
    const { billId } = req.params;
    const bill = await RecurringBill.findById(billId);

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    if (bill.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!bill.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    await stripeService.cancelSubscription(bill.stripeSubscriptionId);
    await RecurringBill.findByIdAndUpdate(billId, {
      stripeSubscriptionId: null,
      autoPay: false,
      paymentStatus: 'CANCELLED'
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

module.exports = router; 