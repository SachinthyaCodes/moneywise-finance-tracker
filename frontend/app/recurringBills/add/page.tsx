"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getRecurringBills, addRecurringBill } from '../RecurringAPI';
import RecurringForm from '../RecurringForm';
import { RecurringBill } from '../types';
import { toast, Toaster } from 'react-hot-toast';
import './AddPage.css';

// Define common toast styles
const toastStyles = {
  style: {
    background: '#10B981',
    color: 'white',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '500',
    minWidth: '300px',
    textAlign: 'center' as const,
  },
  duration: 5000,
  position: 'top-center' as const,
};

const AddRecurringBillPage = () => {
  const router = useRouter();
  const [bills, setBills] = useState<RecurringBill[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const data = await getRecurringBills();
      setBills(data);
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast.error('Failed to fetch bills', {
        ...toastStyles,
        style: { ...toastStyles.style, background: '#EF4444' }
      });
    }
  };

  const handleAddBill = async (
    name: string,
    amount: number,
    billingCycle: string,
    startDate: string,
    dueDate: string,
    paymentMethod: string,
    autoPay: boolean,
    userId: number
  ) => {
    try {
      setIsSubmitting(true);
      await addRecurringBill(name, amount, billingCycle, startDate, dueDate, paymentMethod, autoPay, userId);
      toast.success('Bill added successfully!', toastStyles);
      setIsSubmitting(false);
      // Refresh the bills list
      fetchBills();
    } catch (error) {
      console.error('Error adding bill:', error);
      toast.error('Failed to add bill', {
        ...toastStyles,
        style: { ...toastStyles.style, background: '#EF4444' }
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-page">
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
      <div className="add-page__header">
        <h1 className="add-page__title">Add New Recurring Bill</h1>
        <p className="add-page__subtitle">Create a new recurring bill or subscription</p>
      </div>
      <div className="add-page__content">
        <RecurringForm 
          onAdd={handleAddBill}
          onUpdate={() => {}}
          billToEdit={null}
          onClose={() => {}}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default AddRecurringBillPage; 