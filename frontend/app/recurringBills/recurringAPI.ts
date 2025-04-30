// RecurringAPI.ts

import api from '../utils/api';

const BASE_URL = '/recurring-bills';
const STRIPE_BASE_URL = '/stripe';

// Get all recurring bills
export const getRecurringBills = async () => {
  const response = await api.get(BASE_URL);
  return response.data;
};

// Add a new recurring bill
export const addRecurringBill = async (
  name: string,
  amount: number,
  billingCycle: string,
  startDate: string,
  dueDate: string,
  paymentMethod: string,
  autoPay: boolean,
  userId: number
) => {
  const response = await api.post(BASE_URL, {
    name,
    amount,
    billingCycle,
    startDate,
    dueDate,
    paymentMethod,
    autoPay,
    userId
  });
  return response.data;
};

// Update a recurring bill
export const updateRecurringBill = async (
  id: number,
  name: string,
  amount: number,
  billingCycle: string,
  startDate: string,
  dueDate: string,
  paymentMethod: string,
  autoPay: boolean,
  userId: number
) => {
  const response = await api.put(`${BASE_URL}/${id}`, {
    name,
    amount,
    billingCycle,
    startDate,
    dueDate,
    paymentMethod,
    autoPay,
    userId
  });
  return response.data;
};

// Delete a recurring bill
export const deleteRecurringBill = async (id: number) => {
  const response = await api.delete(`${BASE_URL}/${id}`);
  return response.data;
};

// Stripe-related API functions

// Get Stripe client secret for payment setup
export const getStripeClientSecret = async (billId: number) => {
  const response = await api.post(`${STRIPE_BASE_URL}/${billId}/setup-payment`);
  return response.data.clientSecret;
};

// Toggle auto-pay for a bill
export const toggleAutoPay = async (billId: number, enabled: boolean) => {
  const response = await api.post(`${STRIPE_BASE_URL}/${billId}/toggle-autopay`, {
    enabled
  });
  
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to toggle auto-pay');
  }
  
  return response.data;
};

// Update payment method for a bill
export const updatePaymentMethod = async (billId: number, paymentMethodId: string) => {
  const response = await api.post(`${STRIPE_BASE_URL}/${billId}/update-payment-method`, {
    paymentMethodId
  });
  
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to update payment method');
  }
  
  return response.data;
};

// Cancel subscription for a bill
export const cancelSubscription = async (billId: number) => {
  const response = await api.post(`${STRIPE_BASE_URL}/${billId}/cancel-subscription`);
  
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to cancel subscription');
  }
  
  return response.data;
};
