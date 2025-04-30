import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { RecurringBill } from './types';
import { getRecurringBills, toggleAutoPay } from './RecurringAPI';
import './StripeSettings.css';

interface StripeSettingsProps {
  isModal?: boolean;
}

const StripeSettings: React.FC<StripeSettingsProps> = ({ isModal = false }) => {
  const [bills, setBills] = useState<RecurringBill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const data = await getRecurringBills();
      setBills(data);
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoPayToggle = async (bill: RecurringBill) => {
    const action = bill.autoPay ? 'disable' : 'enable';
    const confirmed = window.confirm(
      `Are you sure you want to ${action} auto-pay for ${bill.name}?`
    );

    if (confirmed) {
      try {
        await toggleAutoPay(bill.id, action === 'enable');
        await fetchBills();
        toast.success(
          `Auto-pay has been ${action === 'enable' ? 'enabled' : 'disabled'} for ${bill.name}`
        );
      } catch (error) {
        toast.error(`Failed to ${action} auto-pay. Please try again.`);
      }
    }
  };

  if (loading) {
    return <div className="stripe-settings__loading">Loading...</div>;
  }

  return (
    <div className={`stripe-settings ${isModal ? 'stripe-settings--modal' : ''}`}>
      {!isModal && (
        <>
          <h2 className="stripe-settings__title">Auto-Pay Settings</h2>
          <div className="stripe-settings__description">
            Manage automatic payments for your recurring bills
          </div>
        </>
      )}
      
      <div className="stripe-settings__bills">
        {bills.map((bill) => (
          <div key={bill.id} className="stripe-settings__bill">
            <div className="stripe-settings__bill-info">
              <h3 className="stripe-settings__bill-name">{bill.name}</h3>
              <p className="stripe-settings__bill-amount">
                ${bill.amount.toFixed(2)} - {bill.billingCycle}
              </p>
              <p className="stripe-settings__bill-dates">
                Due: {new Date(bill.dueDate).toLocaleDateString()}
              </p>
            </div>
            
            <div className="stripe-settings__bill-actions">
              <div className="stripe-settings__toggle-container">
                <label className="stripe-settings__toggle-switch">
                  <input
                    type="checkbox"
                    checked={bill.autoPay}
                    onChange={() => handleAutoPayToggle(bill)}
                    className="stripe-settings__toggle-input"
                  />
                  <span className="stripe-settings__toggle-slider"></span>
                </label>
                <span className="stripe-settings__toggle-label">
                  {bill.autoPay ? 'Auto-Pay Enabled' : 'Auto-Pay Disabled'}
                </span>
              </div>
              
              {bill.autoPay && bill.stripePaymentMethodId && (
                <div className="stripe-settings__payment-status">
                  <span className="stripe-settings__status-indicator stripe-settings__status-indicator--active"></span>
                  <span>Payment Method Active</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StripeSettings; 