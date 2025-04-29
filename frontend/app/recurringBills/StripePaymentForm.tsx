import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { toast } from 'react-hot-toast';

interface StripePaymentFormProps {
  clientSecret: string;
  onSuccess: (paymentMethodId: string) => void;
  onCancel: () => void;
  billName: string;
  amount: number;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  clientSecret,
  onSuccess,
  onCancel,
  billName,
  amount
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Submit the form first
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message || 'Failed to submit form');
      }

      // Create the payment method
      const { error: methodError, paymentMethod } = await stripe.createPaymentMethod({
        elements,
        params: {
          billing_details: {
            name: billName,
          },
        },
      });

      if (methodError) {
        throw new Error(methodError.message || 'Failed to create payment method');
      }

      if (!paymentMethod) {
        throw new Error('No payment method created');
      }

      onSuccess(paymentMethod.id);
    } catch (error: any) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="stripe-payment-form">
      <h2 className="stripe-payment-form__title">Add Payment Method</h2>
      <div className="stripe-payment-form__details">
        <p>Bill: {billName}</p>
        <p>Amount: ${amount.toFixed(2)}</p>
      </div>
      <form onSubmit={handleSubmit} className="stripe-payment-form__form">
        <PaymentElement />
        <div className="stripe-payment-form__actions">
          <button
            type="submit"
            disabled={!stripe || isProcessing}
            className="stripe-payment-form__button stripe-payment-form__button--primary"
          >
            {isProcessing ? 'Processing...' : 'Add Payment Method'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="stripe-payment-form__button stripe-payment-form__button--secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default StripePaymentForm; 