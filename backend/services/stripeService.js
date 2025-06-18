const stripe = require('../config/stripe');
const User = require('../models/User');
const RecurringBill = require('../models/RecurringBill');

class StripeService {
  // Create or retrieve a Stripe customer for a user
  async createOrRetrieveCustomer(userId, email) {
    try {
      const user = await User.findById(userId);
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

      await User.findByIdAndUpdate(userId, { stripeCustomerId: customer.id });
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
      const bill = await RecurringBill.findById(billId);
      if (!bill) {
        throw new Error('Bill not found');
      }

      // Convert billing cycle to Stripe interval
      const interval = this.convertBillingCycleToStripeInterval(billingCycle);
      if (!interval) {
        throw new Error(`Invalid billing cycle: ${billingCycle}`);
      }

      // Create a product for this bill
      const product = await stripe.products.create({
        name: `${bill.name} - Recurring Payment`,
        metadata: {
          billId: billId.toString()
        }
      });

      // Create a price for the product
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        recurring: {
          interval: interval.toLowerCase(),
          interval_count: 1,
        },
      });

      // Create the subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: price.id }],
        payment_settings: {
          payment_method_types: ['card'],
          save_default_payment_method: 'on_subscription'
        },
        default_payment_method: paymentMethodId,
        metadata: {
          billId: billId.toString()
        },
        expand: ['latest_invoice.payment_intent']
      });

      return subscription.id;
    } catch (error) {
      console.error('Error in createSubscription:', error);
      throw error;
    }
  }

  // Convert billing cycle to Stripe interval
  convertBillingCycleToStripeInterval(billingCycle) {
    const mapping = {
      'DAILY': 'day',
      'WEEKLY': 'week',
      'MONTHLY': 'month',
      'YEARLY': 'year'
    };
    return mapping[billingCycle];
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
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling webhook event:', error);
      throw error;
    }
  }

  // Handle successful payment
  async handleSuccessfulPayment(invoice) {
    try {
      const subscriptionId = invoice.subscription;
      const billId = invoice.metadata.billId;

      await RecurringBill.findByIdAndUpdate(billId, {
        lastPaymentDate: new Date(),
        paymentStatus: 'SUCCESS',
        stripeSubscriptionId: subscriptionId
      });
    } catch (error) {
      console.error('Error handling successful payment:', error);
      throw error;
    }
  }

  // Handle failed payment
  async handleFailedPayment(invoice) {
    try {
      const billId = invoice.metadata.billId;

      await RecurringBill.findByIdAndUpdate(billId, {
        paymentStatus: 'FAILED'
      });
    } catch (error) {
      console.error('Error handling failed payment:', error);
      throw error;
    }
  }

  // Handle subscription cancelled
  async handleSubscriptionCancelled(subscription) {
    try {
      const billId = subscription.metadata.billId;

      await RecurringBill.findByIdAndUpdate(billId, {
        paymentStatus: 'CANCELLED',
        stripeSubscriptionId: null
      });
    } catch (error) {
      console.error('Error handling subscription cancelled:', error);
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      await stripe.subscriptions.del(subscriptionId);
    } catch (error) {
      console.error('Error in cancelSubscription:', error);
      throw error;
    }
  }

  // Attach payment method to customer
  async attachPaymentMethod(paymentMethodId, customerId) {
    try {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId
      });
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
          default_payment_method: paymentMethodId
        }
      });
    } catch (error) {
      console.error('Error in updateCustomerDefaultPaymentMethod:', error);
      throw error;
    }
  }
}

module.exports = new StripeService(); 