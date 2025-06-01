const stripe = require('../config/stripe');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class StripeService {
  // Create or retrieve a Stripe customer for a user
  async createOrRetrieveCustomer(userId, email) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { recurringBills: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.stripeCustomerId) {
        return user.stripeCustomerId;
      }

      const customer = await stripe.customers.create({
        email,
        metadata: {
          userId: userId.toString()
        }
      });

      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customer.id }
      });

      return customer.id;
    } catch (error) {
      console.error('Error in createOrRetrieveCustomer:', error);
      throw error;
    }
  }

  // Create a payment intent
  async createPaymentIntent(amount, customerId) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        customer: customerId,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return paymentIntent;
    } catch (error) {
      console.error('Error in createPaymentIntent:', error);
      throw error;
    }
  }

  // Create a payment method
  async createPaymentMethod(paymentMethodId, customerId) {
    try {
      const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId
      });

      return paymentMethod.id;
    } catch (error) {
      console.error('Error in createPaymentMethod:', error);
      throw error;
    }
  }

  // Create a subscription
  async createSubscription(billId, customerId, paymentMethodId, amount, billingCycle) {
    try {
      console.log('Creating subscription with params:', {
        billId,
        customerId,
        paymentMethodId,
        amount,
        billingCycle
      });

      const bill = await prisma.recurringBill.findUnique({
        where: { id: billId },
        include: { user: true }
      });

      if (!bill) {
        throw new Error('Bill not found');
      }

      if (!bill.user) {
        throw new Error('Bill has no associated user');
      }

      // Convert billing cycle to Stripe interval
      const interval = this.convertBillingCycleToStripeInterval(billingCycle);
      if (!interval) {
        throw new Error(`Invalid billing cycle: ${billingCycle}`);
      }

      console.log('Retrieving payment method...');
      // First, get the payment method details
      let paymentMethod;
      try {
        paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
        console.log('Payment method type:', paymentMethod.type);
      } catch (error) {
        console.error('Error retrieving payment method:', error);
        throw new Error(`Failed to retrieve payment method: ${error.message}`);
      }

      console.log('Attaching payment method to customer...');
      // Attach payment method if not already attached
      try {
        if (paymentMethod.customer && paymentMethod.customer !== customerId) {
          throw new Error('Payment method is already attached to a different customer');
        }
        
        if (!paymentMethod.customer) {
          await stripe.paymentMethods.attach(paymentMethodId, {
            customer: customerId,
          });
        }

        await stripe.customers.update(customerId, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });
      } catch (error) {
        console.error('Error attaching payment method:', error);
        throw new Error(`Failed to attach payment method: ${error.message}`);
      }

      console.log('Creating Stripe product...');
      // Create a product for this bill if it doesn't exist
      let product;
      try {
        product = await stripe.products.create({
          name: `${bill.name} - Recurring Payment`,
          metadata: {
            billId: billId.toString(),
            userId: bill.user.id.toString()
          }
        });
      } catch (error) {
        console.error('Error creating product:', error);
        throw new Error(`Failed to create product: ${error.message}`);
      }

      console.log('Creating Stripe price...');
      // Create a price for the product
      let price;
      try {
        price = await stripe.prices.create({
          product: product.id,
          unit_amount: Math.round(amount * 100), // Convert to cents
          currency: 'usd',
          recurring: {
            interval: interval.toLowerCase(),
            interval_count: 1,
          },
        });
      } catch (error) {
        console.error('Error creating price:', error);
        throw new Error(`Failed to create price: ${error.message}`);
      }

      console.log('Creating Stripe subscription...');
      // Create the subscription
      try {
        const subscriptionData = {
          customer: customerId,
          items: [{ price: price.id }],
          payment_settings: { 
            payment_method_types: ['card', 'link'],
            save_default_payment_method: 'on_subscription'
          },
          metadata: {
            billId: billId.toString(),
            userId: bill.user.id.toString()
          },
          expand: ['latest_invoice.payment_intent'],
          collection_method: 'charge_automatically'
        };

        // Only set default_payment_method if it's a supported type
        if (['card', 'link'].includes(paymentMethod.type)) {
          subscriptionData.default_payment_method = paymentMethodId;
        }

        const subscription = await stripe.subscriptions.create(subscriptionData);

        console.log('Subscription created with status:', subscription.status);

        if (subscription.status === 'incomplete') {
          const invoice = subscription.latest_invoice;
          const paymentIntent = invoice.payment_intent;
          
          if (paymentIntent && paymentIntent.status === 'requires_payment_method') {
            throw new Error('Payment method declined. Please update payment method and try again.');
          }
          
          throw new Error(`Subscription incomplete: ${subscription.status}`);
        }

        return subscription.id;
      } catch (error) {
        console.error('Error creating subscription:', error);
        throw new Error(`Failed to create subscription: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in createSubscription:', error);
      throw error;
    }
  }

  // Convert billing cycle to Stripe interval
  convertBillingCycleToStripeInterval(billingCycle) {
    console.log('Converting billing cycle:', billingCycle);
    const intervalMap = {
      DAILY: 'day',
      WEEKLY: 'week',
      MONTHLY: 'month',
      YEARLY: 'year'
    };
    const interval = intervalMap[billingCycle.toUpperCase()];
    console.log('Converted to interval:', interval);
    return interval;
  }

  // Construct Stripe event from webhook
  constructEvent(payload, sig, endpointSecret) {
    try {
      return stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (error) {
      console.error('Error constructing Stripe event:', error);
      throw error;
    }
  }

  // Handle webhook events
  async handleWebhookEvent(event) {
    try {
      switch (event.type) {
        case 'invoice.payment_succeeded':
          await this.handleSuccessfulPayment(event.data.object);
          break;
        case 'invoice.payment_failed':
          await this.handleFailedPayment(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionCancelled(event.data.object);
          break;
      }
    } catch (error) {
      console.error('Error handling webhook event:', error);
      throw error;
    }
  }

  // Handle successful payment
  async handleSuccessfulPayment(invoice) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    const bill = await prisma.recurringBill.findFirst({
      where: { stripeSubscriptionId: subscription.id }
    });

    if (bill) {
      await prisma.recurringBill.update({
        where: { id: bill.id },
        data: {
          lastPaymentDate: new Date(),
          paymentStatus: 'SUCCESS'
        }
      });
    }
  }

  // Handle failed payment
  async handleFailedPayment(invoice) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    const bill = await prisma.recurringBill.findFirst({
      where: { stripeSubscriptionId: subscription.id }
    });

    if (bill) {
      await prisma.recurringBill.update({
        where: { id: bill.id },
        data: {
          paymentStatus: 'FAILED'
        }
      });
    }
  }

  // Handle subscription cancellation
  async handleSubscriptionCancelled(subscription) {
    const bill = await prisma.recurringBill.findFirst({
      where: { stripeSubscriptionId: subscription.id }
    });

    if (bill) {
      await prisma.recurringBill.update({
        where: { id: bill.id },
        data: {
          paymentStatus: 'CANCELLED',
          autoPay: false
        }
      });
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      await stripe.subscriptions.cancel(subscriptionId);
      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  // Attach a payment method to a customer
  async attachPaymentMethod(paymentMethodId, customerId) {
    try {
      const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId
      });
      return paymentMethod.id;
    } catch (error) {
      console.error('Error in attachPaymentMethod:', error);
      throw error;
    }
  }

  // Update customer's default payment method
  async updateCustomerDefaultPaymentMethod(customerId, paymentMethodId) {
    try {
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    } catch (error) {
      console.error('Error in updateCustomerDefaultPaymentMethod:', error);
      throw error;
    }
  }
}

module.exports = new StripeService(); 