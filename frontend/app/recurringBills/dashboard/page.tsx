"use client";

import React, { useState, useEffect } from 'react';
import { getRecurringBills } from '../RecurringAPI';
import RecurringCharts from '../RecurringCharts';
import { RecurringBill } from '../types';
import './DashboardPage.css';

const RecurringBillsDashboardPage = () => {
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

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__header">
        <h1 className="dashboard-page__title">Recurring Bills Dashboard</h1>
        <p className="dashboard-page__subtitle">Visualize and analyze your recurring bills</p>
      </div>
      <div className="dashboard-page__content">
        <RecurringCharts bills={bills} />
      </div>
    </div>
  );
};

export default RecurringBillsDashboardPage; 