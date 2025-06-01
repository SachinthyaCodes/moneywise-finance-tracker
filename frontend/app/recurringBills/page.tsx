"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './RecurringPage.css';

const RecurringBillsPage = () => {
  const [bills, setBills] = useState([]);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await api.get('/recurring-bill');
      setBills(response.data);
    } catch (error) {
      console.error('Error fetching bills:', error);
      setError('Failed to fetch bills');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
          <p className="mb-4">You need to be logged in to view this page.</p>
          <Link 
            href="/login"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="recurring-page">
      <div className="recurring-page__header">
        <h1 className="recurring-page__title">Recurring Bills Management</h1>
        <p className="recurring-page__subtitle">Manage your recurring bills and subscriptions</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="recurring-page__grid">
        <Link href="/recurringBills/add" className="recurring-page__card">
          <div className="recurring-page__card-content">
            <div className="recurring-page__card-icon">➕</div>
            <h2 className="recurring-page__card-title">Add Recurring Bill</h2>
            <p className="recurring-page__card-description">
              Create a new recurring bill or subscription
            </p>
          </div>
        </Link>

        <Link href="/recurringBills/manage" className="recurring-page__card">
          <div className="recurring-page__card-content">
            <div className="recurring-page__card-icon">📋</div>
            <h2 className="recurring-page__card-title">Manage Recurring Bills</h2>
            <p className="recurring-page__card-description">
              View, edit, and manage your existing bills
            </p>
          </div>
        </Link>

        <Link href="/recurringBills/dashboard" className="recurring-page__card">
          <div className="recurring-page__card-content">
            <div className="recurring-page__card-icon">📊</div>
            <h2 className="recurring-page__card-title">Recurring Bills Dashboard</h2>
            <p className="recurring-page__card-description">
              Visualize and analyze your bill data
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default RecurringBillsPage;
