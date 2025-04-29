'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

interface RecurringBill {
  id: number;
  name: string;
  amount: number;
  billingCycle: string;
  startDate: string;
  dueDate: string;
  paymentMethod: string;
  autoPay: boolean;
  userId: number;
}

export default function RecurringBillsPage() {
  const [bills, setBills] = useState<RecurringBill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await api.get('/recurring-bills');
      setBills(response.data);
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast.error('Failed to load recurring bills');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Recurring Bills</h1>
      {/* Add your bills list UI here */}
    </div>
  );
} 