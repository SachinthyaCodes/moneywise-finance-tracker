"use client";

import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import IncomeChart from "./IncomeChart";
import IncomeTable from "./IncomeTable";
import IncomeForm from "./IncomeForm";
import Link from 'next/link';

interface Income {
  id: string;
  category: string;
  amount: number;
  source: string;
  date: string;
}

export default function IncomePage() {
  const [income, setIncome] = useState<Income[]>([]);
  const [editData, setEditData] = useState<Income | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchIncome();
  }, []);

  const fetchIncome = async () => {
    try {
      const response = await api.get('/api/income');
      setIncome(response.data);
    } catch (error) {
      console.error('Error fetching income:', error);
      setError('Failed to fetch income data');
    }
  };

  const handleAddIncome = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newIncome = {
      category: formData.get('category'),
      amount: parseFloat(formData.get('amount') as string),
      source: formData.get('source'),
      date: new Date().toISOString(),
    };

    try {
      await api.post('/api/income', newIncome);
      fetchIncome(); // Refresh the list
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Error adding income:', error);
      setError('Failed to add income');
    }
  };

  const handleUpdateIncome = (id: string, source: string, amount: number, category: string) => {
    // Implementation needed
  };

  const handleDeleteIncome = (id: string) => {
    // Implementation needed
  };

  // Filtered Income Data for Search
  const filteredIncome = income.filter((item) =>
    item.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Category-wise Summation
  const categoryTotals = income.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {} as Record<string, number>);

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Income Management</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Add Income Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Income</h2>
        <form onSubmit={handleAddIncome} className="space-y-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <input
              type="text"
              name="category"
              id="category"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <input
              type="number"
              name="amount"
              id="amount"
              step="0.01"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="source" className="block text-sm font-medium text-gray-700">
              Source
            </label>
            <input
              type="text"
              name="source"
              id="source"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Income
          </button>
        </form>
      </div>

      {/* Income List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Income History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {income.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{item.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${item.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.source}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ Charts Section */}
      <div className="w-[500px] mx-auto mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income Trends */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Income Trends</h2>
          <IncomeChart income={income} />
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-md ">
          <h2 className="text-lg font-semibold mb-4 ">Category Breakdown</h2>
          <div className="space-y-3">
            {Object.entries(categoryTotals).map(([category, total]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="text-gray-700">{category}</span>
                <span className="font-medium">Rs. {total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ Progress Section */}
      <div className="w-[500px] mx-auto mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        {/* Progress Bar */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Progress Bar</h2>
            <span className="text-sm text-blue-600">70%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: "70%" }} />
          </div>
          <p className="mt-2 text-sm text-gray-500">70% completed</p>
        </div>

        {/* Income vs Expenses */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Income vs. Expenses</h2>
            <span className="text-sm text-green-600">110%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full" style={{ width: "110%" }} />
          </div>
          <p className="mt-2 text-sm text-gray-500">110% of target</p>
        </div>
      </div>
    </div>
  );
}
