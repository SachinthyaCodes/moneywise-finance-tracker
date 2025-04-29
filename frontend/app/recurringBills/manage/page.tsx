"use client";

import React, { useState, useEffect } from 'react';
import { getRecurringBills, updateRecurringBill, deleteRecurringBill } from '../RecurringAPI';
import RecurringTable from '../RecurringTable';
import { RecurringBill } from '../types';
import { toast, Toaster } from 'react-hot-toast';
import { toastStyles } from '../../shared/toastStyles';
import './ManagePage.css';

export default function ManageRecurringBillsPage() {
  const [bills, setBills] = useState<RecurringBill[]>([]);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const data = await getRecurringBills();
      setBills(data);
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
  };

  const handleUpdatePaymentMethod = async (billId: number, newPaymentMethod: string) => {
    try {
      const bill = bills.find(b => b.id === billId);
      if (!bill) return;

      await updateRecurringBill(
        billId,
        bill.name,
        bill.amount,
        bill.billingCycle,
        bill.startDate,
        bill.dueDate,
        newPaymentMethod,
        bill.autoPay,
        bill.userId
      );
      await fetchBills();
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  };

  const handleUpdateBillingCycle = async (billId: number, newBillingCycle: string) => {
    try {
      const bill = bills.find(b => b.id === billId);
      if (!bill) return;

      await updateRecurringBill(
        billId,
        bill.name,
        bill.amount,
        newBillingCycle,
        bill.startDate,
        bill.dueDate,
        bill.paymentMethod,
        bill.autoPay,
        bill.userId
      );
      await fetchBills();
    } catch (error) {
      console.error('Error updating billing cycle:', error);
      throw error;
    }
  };

  const handleToggleAutoPay = async (updatedBill: RecurringBill) => {
    try {
      await updateRecurringBill(
        updatedBill.id,
        updatedBill.name,
        updatedBill.amount,
        updatedBill.billingCycle,
        updatedBill.startDate,
        updatedBill.dueDate,
        updatedBill.paymentMethod,
        updatedBill.autoPay,
        updatedBill.userId
      );
      await fetchBills();
    } catch (error) {
      console.error('Error toggling auto pay:', error);
      throw error;
    }
  };

  const handleDeleteBill = async (id: number) => {
    try {
      await deleteRecurringBill(id);
      await fetchBills();
    } catch (error) {
      console.error('Error deleting bill:', error);
      throw error;
    }
  };

  const handleUpdateAmount = async (billId: number, newAmount: number) => {
    try {
      const bill = bills.find(b => b.id === billId);
      if (!bill) return;

      await updateRecurringBill(
        billId,
        bill.name,
        newAmount,
        bill.billingCycle,
        bill.startDate,
        bill.dueDate,
        bill.paymentMethod,
        bill.autoPay,
        bill.userId
      );
      await fetchBills();
    } catch (error) {
      console.error('Error updating amount:', error);
      throw error;
    }
  };

  const handleUpdateStartDate = async (billId: number, newStartDate: string) => {
    try {
      const bill = bills.find(b => b.id === billId);
      if (!bill) return;

      await updateRecurringBill(
        billId,
        bill.name,
        bill.amount,
        bill.billingCycle,
        newStartDate,
        bill.dueDate,
        bill.paymentMethod,
        bill.autoPay,
        bill.userId
      );
      await fetchBills();
    } catch (error) {
      console.error('Error updating start date:', error);
      throw error;
    }
  };

  const handleUpdateDueDate = async (billId: number, newDueDate: string) => {
    try {
      const bill = bills.find(b => b.id === billId);
      if (!bill) return;

      await updateRecurringBill(
        billId,
        bill.name,
        bill.amount,
        bill.billingCycle,
        bill.startDate,
        newDueDate,
        bill.paymentMethod,
        bill.autoPay,
        bill.userId
      );
      await fetchBills();
    } catch (error) {
      console.error('Error updating due date:', error);
      throw error;
    }
  };

  return (
    <div className="manage-page">
      <div className="manage-page__header">
        <h1 className="manage-page__title">Manage Recurring Bills</h1>
        <p className="manage-page__subtitle">View, edit, and manage your recurring bills</p>
      </div>
      <div className="manage-page__content">
        <RecurringTable 
          bills={bills}
          onEdit={() => {}}
          onDelete={handleDeleteBill}
          onToggleAutoPay={handleToggleAutoPay}
          onUpdatePaymentMethod={handleUpdatePaymentMethod}
          onUpdateBillingCycle={handleUpdateBillingCycle}
          onUpdateAmount={handleUpdateAmount}
          onUpdateStartDate={handleUpdateStartDate}
          onUpdateDueDate={handleUpdateDueDate}
        />
      </div>
    </div>
  );
} 