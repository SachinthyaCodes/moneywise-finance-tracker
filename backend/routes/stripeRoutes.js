const express = require('express');
const router = express.Router();
const stripeService = require('../services/stripeService');
const stripe = require('../config/stripe');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Setup payment for a bill
router.post('/:billId/setup-payment', async (req, res) => {
  try {
    const { billId } = req.params;
    const bill = await prisma.recurringBill.findUnique({
      where: { id: parseInt(billId) },
      include: { user: true }
    });

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    // Create or retrieve Stripe customer
    const customerId = await stripeService.createOrRetrieveCustomer(
      bill.userId,
      bill.user.email
    );

    // Create a payment intent
    const paymentIntent = await stripeService.createPaymentIntent(
      bill.amount,
      customerId
    );

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error setting up payment:', error);
    res.status(500).json({ error: 'Failed to setup payment' });
  }
});

// Toggle auto-pay for a bill
router.post('/:billId/toggle-autopay', async (req, res) => {
  try {
    const { billId } = req.params;
    const { enabled } = req.body;

    console.log(`Attempting to ${enabled ? 'enable' : 'disable'} auto-pay for bill ${billId}`);
    console.log('Request body:', req.body);

    // Validate input
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ 
        error: 'Enabled must be a boolean value',
        received: enabled
      });
    }

    const bill = await prisma.recurringBill.findUnique({
      where: { id: parseInt(billId) },
      include: { user: true }
    });

    console.log('Found bill:', { 
      id: bill?.id, 
      name: bill?.name,
      amount: bill?.amount,
      billingCycle: bill?.billingCycle,
      stripePaymentMethodId: bill?.stripePaymentMethodId,
      userId: bill?.userId,
      userEmail: bill?.user?.email,
      stripeCustomerId: bill?.user?.stripeCustomerId
    });

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    if (!bill.user) {
      return res.status(400).json({ error: 'Bill has no associated user' });
    }

    if (enabled) {
      console.log('Checking required Stripe data...');
      
      if (!bill.amount || bill.amount <= 0) {
        return res.status(400).json({ 
          error: 'Invalid bill amount. Amount must be greater than 0.' 
        });
      }

      if (!bill.billingCycle) {
        return res.status(400).json({ 
          error: 'Bill has no billing cycle specified.' 
        });
      }

      if (!bill.stripePaymentMethodId) {
        return res.status(400).json({ 
          error: 'No payment method found. Please set up a payment method first.',
          billId: bill.id
        });
      }

      if (!bill.user.stripeCustomerId) {
        return res.status(400).json({ 
          error: 'User has no Stripe customer ID. Please contact support.',
          userId: bill.userId
        });
      }

      console.log('Creating subscription...');
      try {
        // Create or update subscription
        const subscriptionId = await stripeService.createSubscription(
          bill.id,
          bill.user.stripeCustomerId,
          bill.stripePaymentMethodId,
          bill.amount,
          bill.billingCycle
        );

        console.log('Subscription created:', subscriptionId);

        await prisma.recurringBill.update({
          where: { id: parseInt(billId) },
          data: {
            autoPay: true,
            stripeSubscriptionId: subscriptionId,
            paymentStatus: 'PENDING'
          }
        });

        console.log('Bill updated with subscription');
      } catch (subscriptionError) {
        console.error('Error creating subscription:', subscriptionError);
        return res.status(500).json({ 
          error: 'Failed to create subscription',
          details: process.env.NODE_ENV === 'development' ? subscriptionError.message : undefined,
          billId: bill.id,
          customerId: bill.user.stripeCustomerId,
          paymentMethodId: bill.stripePaymentMethodId
        });
      }
    } else {
      console.log('Disabling auto-pay...');
      // Cancel subscription if exists
      if (bill.stripeSubscriptionId) {
        try {
          await stripeService.cancelSubscription(bill.stripeSubscriptionId);
          console.log('Subscription cancelled:', bill.stripeSubscriptionId);
        } catch (error) {
          console.error('Error cancelling Stripe subscription:', error);
          // Continue with the update even if Stripe cancellation fails
        }
      }

      await prisma.recurringBill.update({
        where: { id: parseInt(billId) },
        data: {
          autoPay: false,
          stripeSubscriptionId: null,
          paymentStatus: 'CANCELLED'
        }
      });

      console.log('Bill updated - auto-pay disabled');
    }

    res.json({ 
      success: true, 
      message: `Auto-pay has been ${enabled ? 'enabled' : 'disabled'} successfully`,
      billId: bill.id
    });
  } catch (error) {
    console.error('Error toggling auto-pay:', error);
    res.status(500).json({ 
      error: 'Failed to toggle auto-pay',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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

    const bill = await prisma.recurringBill.findUnique({
      where: { id: parseInt(billId) },
      include: { user: true }
    });

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    if (!bill.user) {
      return res.status(400).json({ error: 'Bill has no associated user' });
    }

    // Get or create customer
    const customerId = await stripeService.createOrRetrieveCustomer(
      bill.userId,
      bill.user.email
    );

    try {
      // Attach the payment method to the customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set it as the default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Update bill with new payment method
      await prisma.recurringBill.update({
        where: { id: parseInt(billId) },
        data: {
          stripePaymentMethodId: paymentMethodId
        }
      });

      res.json({ success: true });
    } catch (stripeError) {
      console.error('Stripe error:', stripeError);
      res.status(400).json({ 
        error: 'Failed to attach payment method',
        details: process.env.NODE_ENV === 'development' ? stripeError.message : undefined
      });
    }
  } catch (error) {
    console.error('Error updating payment method:', error);
    res.status(500).json({ 
      error: 'Failed to update payment method',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Cancel subscription for a bill
router.post('/:billId/cancel-subscription', async (req, res) => {
  try {
    const { billId } = req.params;

    const bill = await prisma.recurringBill.findUnique({
      where: { id: parseInt(billId) }
    });

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    if (!bill.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    await stripeService.cancelSubscription(bill.stripeSubscriptionId);

    await prisma.recurringBill.update({
      where: { id: parseInt(billId) },
      data: {
        autoPay: false,
        stripeSubscriptionId: null
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const event = stripeService.constructEvent(req.body, sig, endpointSecret);
    await stripeService.handleWebhookEvent(event);
    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(400).json({ error: 'Webhook error' });
  }
});

module.exports = router; 