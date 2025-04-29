import React, { useState, useEffect } from 'react';
import { RecurringBill } from './types';
import './RecurringForm.css';
import toast, { Toaster } from 'react-hot-toast';

// Add currency options
const CURRENCY_OPTIONS = {
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  GBP: { symbol: '£', name: 'British Pound' },
  JPY: { symbol: '¥', name: 'Japanese Yen' },
  AUD: { symbol: 'A$', name: 'Australian Dollar' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar' },
  INR: { symbol: '₹', name: 'Indian Rupee' },
  LKR: { symbol: '₨', name: 'Sri Lankan Rupee' },
  CNY: { symbol: '¥', name: 'Chinese Yuan' },
  NZD: { symbol: 'NZ$', name: 'New Zealand Dollar' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar' },
  HKD: { symbol: 'HK$', name: 'Hong Kong Dollar' },
  KRW: { symbol: '₩', name: 'South Korean Won' },
  BRL: { symbol: 'R$', name: 'Brazilian Real' },
  RUB: { symbol: '₽', name: 'Russian Ruble' },
  CHF: { symbol: 'Fr', name: 'Swiss Franc' },
  SEK: { symbol: 'kr', name: 'Swedish Krona' },
  NOK: { symbol: 'kr', name: 'Norwegian Krone' },
  DKK: { symbol: 'kr', name: 'Danish Krone' },
  PLN: { symbol: 'zł', name: 'Polish Złoty' },
  TRY: { symbol: '₺', name: 'Turkish Lira' },
  SAR: { symbol: '﷼', name: 'Saudi Riyal' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham' },
  MXN: { symbol: 'Mex$', name: 'Mexican Peso' },
  ZAR: { symbol: 'R', name: 'South African Rand' },
  THB: { symbol: '฿', name: 'Thai Baht' },
  IDR: { symbol: 'Rp', name: 'Indonesian Rupiah' },
  MYR: { symbol: 'RM', name: 'Malaysian Ringgit' },
  PHP: { symbol: '₱', name: 'Philippine Peso' },
  ILS: { symbol: '₪', name: 'Israeli New Shekel' },
  CZK: { symbol: 'Kč', name: 'Czech Koruna' },
  HUF: { symbol: 'Ft', name: 'Hungarian Forint' },
  CLP: { symbol: 'CL$', name: 'Chilean Peso' },
  ARS: { symbol: 'AR$', name: 'Argentine Peso' },
  VND: { symbol: '₫', name: 'Vietnamese Dong' },
  BDT: { symbol: '৳', name: 'Bangladeshi Taka' },
  PKR: { symbol: '₨', name: 'Pakistani Rupee' },
  KES: { symbol: 'KSh', name: 'Kenyan Shilling' },
  NGN: { symbol: '₦', name: 'Nigerian Naira' },
  EGP: { symbol: 'E£', name: 'Egyptian Pound' },
  MAD: { symbol: 'د.م.', name: 'Moroccan Dirham' },
  TWD: { symbol: 'NT$', name: 'New Taiwan Dollar' },
  RON: { symbol: 'lei', name: 'Romanian Leu' },
  BGN: { symbol: 'лв', name: 'Bulgarian Lev' },
  HRK: { symbol: 'kn', name: 'Croatian Kuna' },
  UAH: { symbol: '₴', name: 'Ukrainian Hryvnia' },
  KWD: { symbol: 'د.ك', name: 'Kuwaiti Dinar' },
  QAR: { symbol: 'ر.ق', name: 'Qatari Riyal' },
  BHD: { symbol: '.د.ب', name: 'Bahraini Dinar' },
  OMR: { symbol: 'ر.ع.', name: 'Omani Rial' },
  JOD: { symbol: 'د.ا', name: 'Jordanian Dinar' },
  LBP: { symbol: 'ل.ل', name: 'Lebanese Pound' },
  ISK: { symbol: 'kr', name: 'Icelandic Króna' },
  FJD: { symbol: 'FJ$', name: 'Fijian Dollar' },
  MOP: { symbol: 'MOP$', name: 'Macanese Pataca' },
  BWP: { symbol: 'P', name: 'Botswana Pula' },
  GHS: { symbol: '₵', name: 'Ghanaian Cedi' },
  XAF: { symbol: 'FCFA', name: 'Central African CFA Franc' },
  XCD: { symbol: 'EC$', name: 'East Caribbean Dollar' },
  XPF: { symbol: 'CFP', name: 'CFP Franc' }
} as const;

// Add these type definitions at the top of the file
const BILLING_CYCLE_OPTIONS = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  YEARLY: 'Yearly'
} as const;

const PAYMENT_METHOD_OPTIONS = {
  CREDIT_CARD: 'Credit Card',
  PAYPAL: 'PayPal',
  BANK_TRANSFER: 'Bank Transfer'
} as const;

// Add these constants at the top of the file after CURRENCY_OPTIONS
const BILL_SUGGESTIONS = {
  Utilities: [
    'Electricity Bill',
    'Water Bill',
    'Gas Bill',
    'Internet Bill',
    'Phone Bill',
    'Cable TV',
    'Waste Management'
  ],
  Subscriptions: [
    'Netflix',
    'Amazon Prime',
    'Disney+',
    'Spotify',
    'Apple Music',
    'YouTube Premium',
    'HBO Max',
    'Hulu',
    'Microsoft 365',
    'Adobe Creative Cloud',
    'iCloud Storage',
    'Google One Storage'
  ],
  Insurance: [
    'Health Insurance',
    'Car Insurance',
    'Home Insurance',
    'Life Insurance',
    'Dental Insurance',
    'Pet Insurance'
  ],
  Housing: [
    'Rent',
    'Mortgage',
    'HOA Fees',
    'Property Tax',
    'Home Security'
  ],
  Transportation: [
    'Car Payment',
    'Car Lease',
    'Public Transit Pass',
    'Parking Pass',
    'Toll Pass'
  ],
  Memberships: [
    'Gym Membership',
    'Costco Membership',
    'Amazon Prime Membership',
    'AAA Membership',
    'Club Membership'
  ],
  Education: [
    'Student Loan',
    'Tuition Payment',
    'Online Course Subscription',
    'Learning Platform Subscription'
  ]
} as const;

// Define toast configuration
const toastConfig = {
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
} as const;

type RecurringFormProps = {
  onAdd: (
    name: string,
    amount: number,
    billingCycle: string,
    startDate: string,
    dueDate: string,
    paymentMethod: string,
    autoPay: boolean,
    userId: number
  ) => void;
  onUpdate: (
    id: number,
    name: string,
    amount: number,
    billingCycle: string,
    startDate: string,
    dueDate: string,
    paymentMethod: string,
    autoPay: boolean,
    userId: number
  ) => void;
  billToEdit: RecurringBill | null;
  onClose?: () => void;
  isSubmitting?: boolean;
};

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

// Add these validation helper functions after getDueDateIndicatorClass
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

const RecurringForm: React.FC<RecurringFormProps> = ({ 
  onAdd, 
  onUpdate, 
  billToEdit, 
  onClose,
  isSubmitting = false 
}) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [convertedAmount, setConvertedAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState(1);
  const [billingCycle, setBillingCycle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [autoPay, setAutoPay] = useState(false);
  const [userId, setUserId] = useState(1); // Default userId, replace if necessary
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Set initial values when editing
  useEffect(() => {
    if (billToEdit) {
      setName(billToEdit.name);
      setAmount(billToEdit.amount.toString());
      setBillingCycle(billToEdit.billingCycle);
      setStartDate(billToEdit.startDate);
      setDueDate(billToEdit.dueDate);
      setPaymentMethod(billToEdit.paymentMethod);
      setAutoPay(billToEdit.autoPay);
    } else {
      setName('');
      setAmount('');
      setBillingCycle('');
      setStartDate('');
      setDueDate('');
      setPaymentMethod('');
      setAutoPay(false);
    }
  }, [billToEdit]);

  // Fetch exchange rates when currency changes
  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (selectedCurrency === 'USD') {
        setExchangeRate(1);
        return;
      }

      try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
        const data = await response.json();
        setExchangeRate(data.rates[selectedCurrency]);
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
        setExchangeRate(1);
      }
    };

    fetchExchangeRate();
  }, [selectedCurrency]);

  // Validate Name (should not be only numbers)
  const validateName = (value: string) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return false;
    if (/^\d+$/.test(trimmedValue)) return false;
    return true;
  };

  // Handle amount and currency changes
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      if (value) {
        const numValue = parseFloat(value);
        const usdAmount = (numValue / exchangeRate).toFixed(2);
        setConvertedAmount(usdAmount);
      } else {
        setConvertedAmount('');
      }
    }
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCurrency(e.target.value);
  };

  // Validate Due Date (cannot be in the past or before start date)
  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    const today = new Date().toISOString().split('T')[0];
    
    if (selectedDate < today) {
      toast.error("Due date cannot be in the past.", toastConfig);
      setDueDate('');
      return;
    }

    if (startDate) {
      const minDueDate = getMinimumDueDate(startDate, billingCycle);
      if (selectedDate < minDueDate) {
        toast.error(`Due date must be at least one ${billingCycle.toLowerCase()} cycle after start date.`, toastConfig);
        setDueDate('');
        return;
      }

      if (billingCycle && !validateDateAlignment(startDate, selectedDate, billingCycle)) {
        toast.error(`For ${BILLING_CYCLE_OPTIONS[billingCycle as keyof typeof BILLING_CYCLE_OPTIONS]} billing, due date must align with the start date.`, toastConfig);
        setDueDate('');
        return;
      }
    }

    setDueDate(selectedDate);
  };

  // Add validation for start date changes to maintain date order
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    
    if (dueDate) {
      // Clear due date if it doesn't align with the new start date and billing cycle
      if (billingCycle && !validateDateAlignment(selectedDate, dueDate, billingCycle)) {
        toast.error(`For ${BILLING_CYCLE_OPTIONS[billingCycle as keyof typeof BILLING_CYCLE_OPTIONS]} billing, start and due dates must align properly.`, toastConfig);
        setDueDate('');
      }
    }
    
    setStartDate(selectedDate);
  };

  // Validate dates (start date and due date cannot be the same)
  const validateDates = () => {
    if (startDate === dueDate) {
      toast.error("Start date and due date cannot be the same.", toastConfig);
      return false;
    }
    return true;
  };

  // Add this function to handle name input changes
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);

    if (value.length >= 2) {
      // Get all bill names from all categories
      const allBills = Object.values(BILL_SUGGESTIONS).flat();
      
      // Filter suggestions based on input
      const filtered = allBills.filter(bill =>
        bill.toLowerCase().includes(value.toLowerCase())
      );
      
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Add this function to handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    setName(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation before submission
    if (!validateName(name)) {
      toast.error("Please enter a valid name that is not empty and does not contain only numbers.", toastConfig);
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Amount must be greater than zero.", toastConfig);
      return;
    }
    if (!billingCycle || !startDate || !dueDate || !paymentMethod) {
      toast.error("All fields are required.", toastConfig);
      return;
    }
    if (!validateDates()) {
      return;
    }

    try {
      // Use the converted amount (in USD) for submission
      const usdAmount = parseFloat(convertedAmount);

      if (billToEdit) {
        await onUpdate(billToEdit.id, name.trim(), usdAmount, billingCycle, startDate, dueDate, paymentMethod, autoPay, userId);
      } else {
        await onAdd(name.trim(), usdAmount, billingCycle, startDate, dueDate, paymentMethod, autoPay, userId);
      }
      
      // Reset form and close
      setName('');
      setAmount('');
      setSelectedCurrency('USD');
      setConvertedAmount('');
      setBillingCycle('');
      setStartDate('');
      setDueDate('');
      setPaymentMethod('');
      setAutoPay(false);
      onClose?.();
    } catch (error) {
      toast.error('Failed to save the bill. Please try again.', toastConfig);
    }
  };

  // Update the billing cycle select element in the JSX
  const handleBillingCycleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCycle = e.target.value;
    setBillingCycle(newCycle);

    // Clear due date if it doesn't align with the new billing cycle
    if (startDate && dueDate && !validateDateAlignment(startDate, dueDate, newCycle)) {
      toast.error(`For ${BILLING_CYCLE_OPTIONS[newCycle as keyof typeof BILLING_CYCLE_OPTIONS]} billing, start and due dates must align properly.`, toastConfig);
      setDueDate('');
    }
  };

  return (
    <>
      <Toaster />
      <form onSubmit={handleSubmit} className="recurring-form">
        <h2 className="recurring-form__title">
          {billToEdit ? 'Edit Recurring Bill' : 'Add New Recurring Bill'}
        </h2>
        
        <div className="recurring-form__grid">
          <div className="recurring-form__field recurring-form__field--double">
            <label className="recurring-form__label">Name</label>
            <div className="recurring-form__input-container">
              <input 
                type="text" 
                value={name} 
                onChange={handleNameChange}
                onFocus={() => name.length >= 2 && setShowSuggestions(true)}
                placeholder="Enter bill name" 
                required 
                className="recurring-form__input"
                disabled={isSubmitting}
              />
              {showSuggestions && (
                <div className="recurring-form__suggestions">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="recurring-form__suggestion-item"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="recurring-form__field">
            <label className="recurring-form__label">Amount</label>
            <div className="recurring-form__amount-container">
              <select 
                value={selectedCurrency} 
                onChange={handleCurrencyChange}
                className="recurring-form__currency-select"
                disabled={isSubmitting}
              >
                {Object.entries(CURRENCY_OPTIONS).map(([code, { symbol, name }]) => (
                  <option key={code} value={code}>
                    {code} ({symbol}) - {name}
                  </option>
                ))}
              </select>
              <div className="recurring-form__amount-input-container">
                <span className="recurring-form__currency-symbol">
                  {CURRENCY_OPTIONS[selectedCurrency as keyof typeof CURRENCY_OPTIONS].symbol}
                </span>
                <input 
                  type="text" 
                  value={amount} 
                  onChange={handleAmountChange} 
                  placeholder="Enter amount" 
                  required 
                  className="recurring-form__input recurring-form__input--amount"
                  disabled={isSubmitting}
                />
              </div>
              {convertedAmount && (
                <div className="recurring-form__converted-amount">
                  ≈ ${convertedAmount} USD
                </div>
              )}
            </div>
          </div>

          <div className="recurring-form__field">
            <label className="recurring-form__label">Billing Cycle</label>
            <select 
              value={billingCycle} 
              onChange={handleBillingCycleChange} 
              required 
              className="recurring-form__select"
              disabled={isSubmitting}
            >
              <option value="">Select Billing Cycle</option>
              {Object.entries(BILLING_CYCLE_OPTIONS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="recurring-form__field">
            <label className="recurring-form__label">Start Date</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={handleStartDateChange}
              required 
              className="recurring-form__input recurring-form__input--date"
              disabled={isSubmitting}
            />
          </div>

          <div className="recurring-form__field">
            <label className="recurring-form__label">Due Date</label>
            <input 
              type="date" 
              value={dueDate} 
              onChange={handleDueDateChange}
              min={startDate ? getMinimumDueDate(startDate, billingCycle) : new Date().toISOString().split('T')[0]}
              required 
              className="recurring-form__input recurring-form__input--date"
              disabled={isSubmitting}
            />
          </div>

          <div className="recurring-form__field">
            <label className="recurring-form__label">Payment Method</label>
            <select 
              value={paymentMethod} 
              onChange={(e) => setPaymentMethod(e.target.value)} 
              required 
              className="recurring-form__select"
              disabled={isSubmitting}
            >
              <option value="">Select Payment Method</option>
              {Object.entries(PAYMENT_METHOD_OPTIONS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="recurring-form__field recurring-form__field--wide">
            <div className="recurring-form__toggle-container">
              <label className="recurring-form__toggle-switch">
                <input
                  type="checkbox"
                  checked={autoPay}
                  onChange={(e) => setAutoPay(e.target.checked)}
                  className="recurring-form__toggle-input"
                  disabled={isSubmitting}
                />
                <span className="recurring-form__toggle-slider"></span>
              </label>
              <span className="recurring-form__toggle-label">Enable Auto Pay</span>
            </div>
          </div>
        </div>

        <div className="recurring-form__actions">
          <button 
            type="submit" 
            className="recurring-form__button recurring-form__button--primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : (billToEdit ? 'Update' : 'Save')}
          </button>
          <button 
            type="button"
            onClick={onClose}
            className="recurring-form__button recurring-form__button--secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  );
};

export default RecurringForm;
