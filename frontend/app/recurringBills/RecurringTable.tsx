// RecurringTable.tsx

import React, { useState, useEffect } from 'react';
import { RecurringBill } from './types';
import 'flowbite';
import './RecurringTable.css';
import { toast, Toaster } from 'react-hot-toast';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripePaymentForm from './StripePaymentForm';
import { getStripeClientSecret, toggleAutoPay, updatePaymentMethod, cancelSubscription } from './RecurringAPI';

// Add toast configuration
const toastConfig = {
  loading: {
    duration: 0,
    position: 'top-center' as const,
    style: {
      background: '#1E40AF',
      color: '#ffffff',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      maxWidth: '400px',
      textAlign: 'center' as const
    }
  },
  success: {
    duration: 3000,
    position: 'top-center' as const,
    style: {
      background: '#059669',
      color: '#ffffff',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      maxWidth: '400px',
      textAlign: 'center' as const
    }
  },
  error: {
    duration: 4000,
    position: 'top-center' as const,
    style: {
      background: '#EF4444',
      color: '#ffffff',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      maxWidth: '400px',
      textAlign: 'center' as const
    }
  }
} as const;

// Add payment method options
const PAYMENT_METHOD_OPTIONS = {
  CREDIT_CARD: 'Credit Card',
  PAYPAL: 'PayPal',
  BANK_TRANSFER: 'Bank Transfer'
} as const;

const BILLING_CYCLE_OPTIONS = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  YEARLY: 'Yearly'
} as const;

// Add these validation helper functions after BILLING_CYCLE_OPTIONS
const getNextCycleDate = (date: Date, cycle: string): Date => {
  const nextDate = new Date(date);
  switch (cycle) {
    case 'DAILY':
      nextDate.setDate(date.getDate() + 1);
      break;
    case 'WEEKLY':
      nextDate.setDate(date.getDate() + 7);
      break;
    case 'MONTHLY':
      nextDate.setMonth(date.getMonth() + 1);
      break;
    case 'YEARLY':
      nextDate.setFullYear(date.getFullYear() + 1);
      break;
  }
  return nextDate;
};

const validateDateAlignment = (startDate: string, dueDate: string, cycle: string): boolean => {
  const start = new Date(startDate);
  const due = new Date(dueDate);
  
  // For weekly billing, both dates should be on the same day of week
  if (cycle === 'WEEKLY') {
    return start.getDay() === due.getDay();
  }
  
  // For monthly billing, both dates should be on the same day of month
  if (cycle === 'MONTHLY') {
    return start.getDate() === due.getDate();
  }
  
  // For yearly billing, both dates should be on the same day and month
  if (cycle === 'YEARLY') {
    return start.getDate() === due.getDate() && start.getMonth() === due.getMonth();
  }
  
  // For daily billing, any date is valid
  return true;
};

const getMinimumDueDate = (startDate: string, cycle: string): string => {
  if (!startDate) return '';
  const start = new Date(startDate);
  const minDue = getNextCycleDate(start, cycle);
  return minDue.toISOString().split('T')[0];
};

// Update the date formatting function
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Add the getDueDateIndicatorClass function
const getDueDateIndicatorClass = (dueDate: string) => {
  if (!dueDate) return '';
  
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 3) return 'danger';
  if (diffDays <= 7) return 'warning';
  return '';
};

// Add confirmation dialog function
const confirmAction = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.confirm(message)) {
      resolve(true);
    } else {
      resolve(false);
    }
  });
};

type RecurringTableProps = {
  bills: RecurringBill[];
  onEdit: (bill: RecurringBill) => void;
  onDelete: (id: number) => void;
  onToggleAutoPay?: (bill: RecurringBill) => void;
  onUpdatePaymentMethod?: (billId: number, newPaymentMethod: string) => void;
  onUpdateBillingCycle?: (billId: number, newBillingCycle: string) => void;
  onUpdateAmount?: (billId: number, newAmount: number) => void;
  onUpdateStartDate?: (billId: number, newStartDate: string) => void;
  onUpdateDueDate?: (billId: number, newDueDate: string) => void;
};

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const RecurringTable: React.FC<RecurringTableProps> = ({ 
  bills, 
  onEdit, 
  onDelete,
  onToggleAutoPay = (bill) => console.log('Toggle auto pay for bill:', bill),
  onUpdatePaymentMethod = (billId, newPaymentMethod) => console.log('Update payment method:', billId, newPaymentMethod),
  onUpdateBillingCycle = (billId, newBillingCycle) => console.log('Update billing cycle:', billId, newBillingCycle),
  onUpdateAmount = (billId, newAmount) => console.log('Update amount:', billId, newAmount),
  onUpdateStartDate = (billId, newStartDate) => console.log('Update start date:', billId, newStartDate),
  onUpdateDueDate = (billId, newDueDate) => console.log('Update due date:', billId, newDueDate)
}) => {
  const [localBills, setLocalBills] = useState(bills);
  const [editingAmount, setEditingAmount] = useState<{ id: number; value: string } | null>(null);
  const [editingStartDate, setEditingStartDate] = useState<number | null>(null);
  const [editingDueDate, setEditingDueDate] = useState<number | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedBill, setSelectedBill] = useState<RecurringBill | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Update local bills when props change
  useEffect(() => {
    setLocalBills(bills);
  }, [bills]);

  // Sort bills by their original order (assuming id represents the order)
  const sortedBills = [...localBills].sort((a, b) => a.id - b.id);

  const handlePaymentMethodChange = async (e: React.ChangeEvent<HTMLSelectElement>, billId: number, currentMethod: string) => {
    const newMethod = e.target.value;
    if (newMethod === currentMethod) return;

    const loadingToastId = toast.loading('Updating payment method...', {
      ...toastConfig.loading,
      id: `payment-loading-${billId}`
    });
    try {
      await onUpdatePaymentMethod(billId, newMethod);
      toast.dismiss(loadingToastId);
      toast.success(`Payment method updated successfully`, {
        ...toastConfig.success,
        id: `payment-${billId}`
      });
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error('Failed to update payment method', {
        ...toastConfig.error,
        id: `payment-error-${billId}`
      });
      // Reset the select to the previous value
      e.target.value = currentMethod;
    }
  };

  const handleBillingCycleChange = async (e: React.ChangeEvent<HTMLSelectElement>, billId: number, currentCycle: string) => {
    const newCycle = e.target.value;
    if (newCycle === currentCycle) return;

    const bill = bills.find(b => b.id === billId);
    if (!bill) return;

    // Check if the new billing cycle is compatible with existing dates
    if (bill.startDate && bill.dueDate && !validateDateAlignment(bill.startDate, bill.dueDate, newCycle)) {
      toast.error(`For ${BILLING_CYCLE_OPTIONS[newCycle as keyof typeof BILLING_CYCLE_OPTIONS]} billing, start and due dates must align properly. Please update the dates after changing the billing cycle.`, toastConfig.error);
      e.target.value = currentCycle;
      return;
    }

    const loadingToastId = toast.loading('Updating billing cycle...', toastConfig.loading);
    try {
      await onUpdateBillingCycle(billId, newCycle);
      toast.dismiss(loadingToastId);
      toast.success(`Billing cycle updated successfully`, toastConfig.success);
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error('Failed to update billing cycle', toastConfig.error);
      e.target.value = currentCycle;
    }
  };

  const handlePaymentSuccess = async (paymentMethodId: string) => {
    if (selectedBill) {
      const loadingToastId = toast.loading('Setting up auto-pay...', {
        ...toastConfig.loading,
        id: `autopay-loading-${selectedBill.id}`
      });

      try {
        // Silently update payment method and enable auto-pay without showing toasts
        await updatePaymentMethod(selectedBill.id, paymentMethodId);
        await toggleAutoPay(selectedBill.id, true);
        
        // Update the UI through the parent component
        await onToggleAutoPay({
          ...selectedBill,
          stripePaymentMethodId: paymentMethodId,
          autoPay: true
        });

        toast.dismiss(loadingToastId);
        // Only show one success message for the entire process
        toast.success('Auto-pay has been enabled', {
          ...toastConfig.success,
          id: `autopay-${selectedBill.id}`,
          duration: 3000
        });
      } catch (error: any) {
        console.error('Error in handlePaymentSuccess:', error);
        toast.dismiss(loadingToastId);
        toast.error('Failed to set up auto-pay', {
          ...toastConfig.error,
          id: `autopay-error-${selectedBill.id}`
        });
      }
    }
    setShowPaymentForm(false);
    setSelectedBill(null);
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
    setSelectedBill(null);
    setClientSecret(null);
  };

  const handleDelete = async (id: number, billName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${billName}"? This action cannot be undone.`
    );

    if (confirmed) {
      const loadingToastId = toast.loading(`Deleting ${billName}...`, {
        ...toastConfig.loading,
        id: `delete-loading-${id}`
      });
      try {
        await onDelete(id);
        toast.dismiss(loadingToastId);
        toast.success(`Successfully deleted ${billName}`, {
          ...toastConfig.success,
          id: `delete-${id}`, // Add unique ID to prevent duplicates
        });
      } catch (error) {
        toast.dismiss(loadingToastId);
        toast.error(`Failed to delete ${billName}. Please try again.`, {
          ...toastConfig.error,
          id: `delete-error-${id}`, // Add unique ID to prevent duplicates
        });
      }
    }
  };

  // Add amount validation function
  const validateAmount = (value: string): boolean => {
    const numValue = parseFloat(value);
    return !isNaN(numValue) && numValue > 0 && /^\d*\.?\d{0,2}$/.test(value);
  };

  // Add handler for amount editing
  const handleAmountEdit = (bill: RecurringBill) => {
    setEditingAmount({ id: bill.id, value: bill.amount.toString() });
  };

  // Add handler for amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingAmount) return;
    
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setEditingAmount({ ...editingAmount, value });
    }
  };

  // Add handler for amount save
  const handleAmountSave = async (bill: RecurringBill) => {
    if (!editingAmount) return;

    if (!validateAmount(editingAmount.value)) {
      toast.error("Please enter a valid amount greater than 0.", {
        ...toastConfig.error,
        id: `amount-error-${bill.id}`
      });
      return;
    }

    const newAmount = parseFloat(editingAmount.value);
    const loadingToastId = toast.loading("Updating amount...", {
      ...toastConfig.loading,
      id: `amount-loading-${bill.id}`
    });

    try {
      await onUpdateAmount(bill.id, newAmount);
      toast.dismiss(loadingToastId);
      toast.success(`Amount updated to $${newAmount.toFixed(2)}`, {
        ...toastConfig.success,
        id: `amount-success-${bill.id}`
      });
      setEditingAmount(null);
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error("Failed to update amount. Please try again.", {
        ...toastConfig.error,
        id: `amount-error-${bill.id}`
      });
    }
  };

  // Add handler for amount edit cancel
  const handleAmountCancel = (bill: RecurringBill) => {
    setEditingAmount(null);
  };

  // Add handler for amount key press
  const handleAmountKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, bill: RecurringBill) => {
    if (e.key === 'Enter') {
      handleAmountSave(bill);
    } else if (e.key === 'Escape') {
      handleAmountCancel(bill);
    }
  };

  // Update the handleStartDateChange function
  const handleStartDateChange = async (e: React.ChangeEvent<HTMLInputElement>, billId: number, currentStartDate: string, dueDate: string) => {
    const newStartDate = e.target.value;
    if (newStartDate === currentStartDate) return;

    const bill = bills.find(b => b.id === billId);
    if (!bill) return;

    // Validate start date is not after due date
    if (dueDate && newStartDate > dueDate) {
      toast.error("Start date cannot be later than due date", toastConfig.error);
      e.target.value = currentStartDate;
      return;
    }

    // Validate date alignment with billing cycle
    if (dueDate && bill.billingCycle && !validateDateAlignment(newStartDate, dueDate, bill.billingCycle)) {
      toast.error(`For ${BILLING_CYCLE_OPTIONS[bill.billingCycle as keyof typeof BILLING_CYCLE_OPTIONS]} billing, start and due dates must align properly.`, toastConfig.error);
      e.target.value = currentStartDate;
      return;
    }

    const loadingToastId = toast.loading('Updating start date...', toastConfig.loading);

    try {
      // Format the date to yyyy-MM-dd
      const formattedDate = new Date(newStartDate).toISOString().split('T')[0];
      await onUpdateStartDate(billId, formattedDate);
      toast.dismiss(loadingToastId);
      toast.success('Start date updated successfully', toastConfig.success);
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error('Failed to update start date', toastConfig.error);
      e.target.value = currentStartDate;
    }
  };

  const handleDueDateChange = async (e: React.ChangeEvent<HTMLInputElement>, billId: number, currentDueDate: string, startDate: string) => {
    const newDueDate = e.target.value;
    if (newDueDate === currentDueDate) return;

    const bill = bills.find(b => b.id === billId);
    if (!bill) return;

    const today = new Date().toISOString().split('T')[0];
    if (newDueDate < today) {
      toast.error("Due date cannot be in the past", toastConfig.error);
      e.target.value = currentDueDate;
      return;
    }

    // Validate due date is not before start date
    if (startDate) {
      const minDueDate = getMinimumDueDate(startDate, bill.billingCycle);
      if (newDueDate < minDueDate) {
        toast.error(`Due date must be at least one ${bill.billingCycle.toLowerCase()} cycle after start date.`, toastConfig.error);
        e.target.value = currentDueDate;
        return;
      }

      // Validate date alignment with billing cycle
      if (bill.billingCycle && !validateDateAlignment(startDate, newDueDate, bill.billingCycle)) {
        toast.error(`For ${BILLING_CYCLE_OPTIONS[bill.billingCycle as keyof typeof BILLING_CYCLE_OPTIONS]} billing, due date must align with the start date.`, toastConfig.error);
        e.target.value = currentDueDate;
        return;
      }
    }

    const loadingToastId = toast.loading('Updating due date...', toastConfig.loading);

    try {
      // Format the date to yyyy-MM-dd
      const formattedDate = new Date(newDueDate).toISOString().split('T')[0];
      await onUpdateDueDate(billId, formattedDate);
      toast.dismiss(loadingToastId);
      toast.success('Due date updated successfully', toastConfig.success);
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error('Failed to update due date', toastConfig.error);
      e.target.value = currentDueDate;
    }
  };

  const handleAutoPayToggle = async (bill: RecurringBill) => {
    const action = bill.autoPay ? 'disable' : 'enable';
    const confirmed = window.confirm(
      `Are you sure you want to ${action} auto-pay for ${bill.name}?`
    );

    if (!confirmed) return;

    // Show payment form if enabling auto-pay without payment method
    if (!bill.autoPay && !bill.stripePaymentMethodId) {
      setSelectedBill(bill);
      try {
        const secret = await getStripeClientSecret(bill.id);
        setClientSecret(secret);
        setShowPaymentForm(true);
      } catch (error) {
        toast.error('Failed to get payment setup information', {
          ...toastConfig.error,
          id: `autopay-error-${bill.id}`
        });
      }
      return;
    }

    const loadingToastId = toast.loading(`${action === 'enable' ? 'Enabling' : 'Disabling'} auto-pay...`, {
      ...toastConfig.loading,
      id: `autopay-loading-${bill.id}`
    });

    try {
      let updatedBill = { ...bill };

      // Enabling auto-pay
      if (!bill.autoPay) {
        // Validate bill data
        if (!bill.amount || bill.amount <= 0) {
          throw new Error('Bill amount must be greater than 0');
        }
        if (!bill.billingCycle) {
          throw new Error('Billing cycle must be specified');
        }

        // Enable auto-pay
        const response = await toggleAutoPay(bill.id, true);
        if (!response.success) {
          throw new Error(response.error || 'Failed to enable auto-pay');
        }

        updatedBill = {
          ...bill,
          autoPay: true,
          stripeSubscriptionId: response.subscriptionId
        };
      } 
      // Disabling auto-pay
      else {
        // Cancel subscription first if it exists
        if (bill.stripeSubscriptionId) {
          await cancelSubscription(bill.id);
        }

        // Disable auto-pay
        const response = await toggleAutoPay(bill.id, false);
        if (!response.success) {
          throw new Error(response.error || 'Failed to disable auto-pay');
        }

        updatedBill = {
          ...bill,
          autoPay: false,
          stripeSubscriptionId: null
        };
      }

      // Update local state first to ensure immediate UI feedback
      setLocalBills(prevBills => {
        const newBills = [...prevBills];
        const billIndex = newBills.findIndex(b => b.id === bill.id);
        if (billIndex !== -1) {
          newBills[billIndex] = updatedBill;
        }
        return newBills;
      });

      // Update parent component state
      if (onToggleAutoPay) {
        await onToggleAutoPay(updatedBill);
      }

      // Show success message after all operations complete
      toast.dismiss(loadingToastId);
      toast.success(`Auto-pay has been ${action}d`, {
        ...toastConfig.success,
        id: `autopay-${bill.id}`
      });
    } catch (error: any) {
      console.error('Error toggling auto-pay:', error);
      toast.dismiss(loadingToastId);
      toast.error(error.message || `Failed to ${action} auto-pay`, {
        ...toastConfig.error,
        id: `autopay-error-${bill.id}`
      });

      // Revert local state on error
      setLocalBills(prevBills => {
        const newBills = [...prevBills];
        const billIndex = newBills.findIndex(b => b.id === bill.id);
        if (billIndex !== -1) {
          newBills[billIndex] = bill; // Revert to original bill state
        }
        return newBills;
      });
    }
  };

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            maxWidth: '500px',
            wordBreak: 'break-word'
          },
        }}
      />
      {showPaymentForm && clientSecret && selectedBill && (
        <div className="payment-modal">
          <div className="payment-modal__content">
            <Elements 
              stripe={stripePromise} 
              options={{
                clientSecret,
                paymentMethodCreation: 'manual',
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#0066cc',
                  },
                },
              }}
              key={clientSecret}
            >
              <StripePaymentForm
                clientSecret={clientSecret}
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
                billName={selectedBill.name}
                amount={selectedBill.amount}
              />
            </Elements>
          </div>
        </div>
      )}
      <table className="recurring-table">
        <thead>
          <tr className="recurring-table__header">
          <th className="recurring-table__header-cell recurring-table__header-cell--name">Name</th>
            <th className="recurring-table__header-cell">Amount</th>
            <th className="recurring-table__header-cell">Billing Cycle</th>
          <th className="recurring-table__header-cell recurring-table__header-cell--date">Start Date</th>
          <th className="recurring-table__header-cell recurring-table__header-cell--date">Due Date</th>
            <th className="recurring-table__header-cell">Payment Method</th>
          <th className="recurring-table__header-cell recurring-table__header-cell--center recurring-table__header-cell--autopay">Auto Pay</th>
          <th className="recurring-table__header-cell recurring-table__header-cell--center recurring-table__header-cell--actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedBills.map((bill, index) => (
            <tr 
              key={bill.id} 
              className="recurring-table__row"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <td className="recurring-table__cell">{bill.name}</td>
            <td className="recurring-table__cell recurring-table__cell--amount">
              {editingAmount?.id === bill.id ? (
                <div className="recurring-table__amount-edit">
                  <span className="recurring-table__currency">$</span>
                  <input
                    type="text"
                    value={editingAmount.value}
                    onChange={handleAmountChange}
                    onKeyDown={(e) => handleAmountKeyPress(e, bill)}
                    onBlur={() => handleAmountSave(bill)}
                    className="recurring-table__amount-input"
                    autoFocus
                  />
                </div>
              ) : (
                <div 
                  className="recurring-table__amount-display"
                  onClick={() => handleAmountEdit(bill)}
                  title="Click to edit amount"
                >
                  ${bill.amount.toFixed(2)}
                </div>
              )}
            </td>
              <td className="recurring-table__cell">
                <select
                  value={bill.billingCycle}
                onChange={(e) => handleBillingCycleChange(e, bill.id, bill.billingCycle)}
                  className="recurring-table__select"
                >
                  {Object.entries(BILLING_CYCLE_OPTIONS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </td>
            <td className="recurring-table__cell">
              {editingStartDate === bill.id ? (
                <input 
                  type="date" 
                  value={bill.startDate}
                  onChange={(e) => handleStartDateChange(e, bill.id, bill.startDate, bill.dueDate)}
                  onBlur={() => setEditingStartDate(null)}
                  className="recurring-table__date-input"
                  autoFocus
                />
              ) : (
                <div 
                  className="recurring-table__date-display"
                  onClick={() => setEditingStartDate(bill.id)}
                  title="Click to edit start date"
                >
                  {formatDate(bill.startDate)}
                </div>
              )}
            </td>
            <td className="recurring-table__cell">
              <div className="recurring-table__due-date-cell">
                <div className={`recurring-table__due-date-indicator ${getDueDateIndicatorClass(bill.dueDate)}`} />
                {editingDueDate === bill.id ? (
                  <input 
                    type="date" 
                    value={bill.dueDate}
                    onChange={(e) => handleDueDateChange(e, bill.id, bill.dueDate, bill.startDate)}
                    onBlur={() => setEditingDueDate(null)}
                    className="recurring-table__date-input"
                    min={new Date().toISOString().split('T')[0]}
                    autoFocus
                  />
                ) : (
                  <div 
                    className="recurring-table__date-display"
                    onClick={() => setEditingDueDate(bill.id)}
                    title="Click to edit due date"
                  >
                    {formatDate(bill.dueDate)}
                  </div>
                )}
              </div>
            </td>
              <td className="recurring-table__cell">
                <select
                  value={bill.paymentMethod}
                onChange={(e) => handlePaymentMethodChange(e, bill.id, bill.paymentMethod)}
                  className="recurring-table__select"
                >
                  {Object.entries(PAYMENT_METHOD_OPTIONS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </td>
              <td className="recurring-table__cell recurring-table__cell--center">
              <div className="recurring-table__toggle-container">
                <label className="recurring-table__toggle-switch">
                  <input
                    type="checkbox"
                    checked={bill.autoPay}
                    onChange={() => handleAutoPayToggle(bill)}
                    className="recurring-table__toggle-input"
                  />
                  <span className="recurring-table__toggle-slider"></span>
                </label>
              </div>
              </td>
              <td className="recurring-table__cell recurring-table__cell--center">
                <button 
                onClick={() => handleDelete(bill.id, bill.name)}
                  className="recurring-table__delete-button"
                  title="Delete"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="recurring-table__delete-icon"
                  >
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default RecurringTable;
