"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import styles from './addExpense.module.css';
import { FiPlus, FiCalendar, FiCreditCard, FiTag, FiDollarSign, FiFileText } from 'react-icons/fi';
import { Toaster } from 'react-hot-toast';
import { showSuccessToast, showErrorToast, toastStyles } from '../../utils/toastConfig';

const AddExpensePage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const validateDate = (date: string) => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    return selectedDate <= today;
  };

  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    date: getTodayDate(),
    paymentMethod: '',
    description: ''
  });

  const categories = [
    'Food & Dining',
    'Transportation',
    'Housing',
    'Utilities',
    'Entertainment',
    'Shopping',
    'Healthcare',
    'Education',
    'Travel',
    'Other'
  ];

  const paymentMethods = [
    'Cash',
    'Credit Card',
    'Debit Card',
    'Bank Transfer',
    'Digital Wallet',
    'Other'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'date') {
      if (!validateDate(value)) {
        showErrorToast('Please select today\'s date or a past date');
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    if (!validateDate(formData.date)) {
      showErrorToast('Please select today\'s date or a past date');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          date: formData.date
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add expense');
      }

      showSuccessToast('Expense added successfully!');
      router.push('/expenses/manage');
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.addExpensePage}>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 5000,
          style: toastStyles.style,
          success: {
            style: { ...toastStyles.style, background: '#10B981' }
          },
          error: {
            style: { ...toastStyles.style, background: '#EF4444' }
          },
        }}
      />
      <div className={styles.addExpenseHeader}>
        <h1 className={styles.addExpenseTitle}>Add New Expense</h1>
        <p className={styles.addExpenseSubtitle}>Record your expense with detailed information</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.expenseForm}>
        <div className={styles.formGroup}>
          <label htmlFor="category" className={styles.label}>
            <FiTag className={styles.labelIcon} />
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={styles.select}
            required
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="amount" className={styles.label}>
            <FiDollarSign className={styles.labelIcon} />
            Amount
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className={styles.input}
            placeholder="Enter amount"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="date" className={styles.label}>
            <FiCalendar className={styles.labelIcon} />
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={styles.input}
            required
            max={getTodayDate()}
          />
          <small className={styles.helperText}>
            Select today's date or a past date
          </small>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="paymentMethod" className={styles.label}>
            <FiCreditCard className={styles.labelIcon} />
            Payment Method
          </label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            className={styles.select}
            required
          >
            <option value="">Select payment method</option>
            {paymentMethods.map(method => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>
            <FiFileText className={styles.labelIcon} />
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={styles.textarea}
            placeholder="Enter expense description"
            rows={4}
            required
          />
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => router.back()}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Adding...' : (
              <>
                <FiPlus className={styles.submitIcon} />
                Add Expense
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddExpensePage; 