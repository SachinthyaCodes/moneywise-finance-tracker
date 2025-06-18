"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import styles from './expensesReports.module.css';
import { FiCalendar, FiFilter, FiDownload, FiBarChart2, FiPieChart, FiTrendingUp } from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Expense {
  _id: string;
  category: string;
  amount: number;
  date: string;
  paymentMethod: string;
  description?: string;
}

const ExpensesReportsPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [reportType, setReportType] = useState<'summary' | 'detailed'>('summary');

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

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchExpenses();
  }, [user]);

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/expenses`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }
      const data = await response.json();
      setExpenses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filterExpenses = () => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();
      end.setHours(23, 59, 59, 999);

      const matchesDate = expenseDate >= start && expenseDate <= end;
      const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;

      return matchesDate && matchesCategory;
    });
  };

  const getCategoryBreakdown = (filteredExpenses: Expense[]) => {
    const breakdown = filteredExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(breakdown).map(([category, amount]) => ({
      category,
      amount
    }));
  };

  const generatePDF = () => {
    const filteredExpenses = filterExpenses();
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const categoryBreakdown = getCategoryBreakdown(filteredExpenses);

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(24);
    doc.setTextColor(59, 130, 246);
    doc.text('Expense Report', 20, 20);
    
    // Add date range
    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128);
    const dateRange = `${startDate ? new Date(startDate).toLocaleDateString() : 'All time'} to ${endDate ? new Date(endDate).toLocaleDateString() : 'Present'}`;
    doc.text(`Date Range: ${dateRange}`, 20, 30);
    
    // Add summary section
    doc.setFontSize(16);
    doc.setTextColor(31, 41, 55);
    doc.text('Summary', 20, 45);
    
    // Add total expenses
    doc.setFontSize(12);
    doc.text(`Total Expenses: $${totalExpenses.toFixed(2)}`, 20, 55);
    
    // Add category breakdown
    doc.setFontSize(14);
    doc.text('Category Breakdown', 20, 70);
    
    autoTable(doc, {
      startY: 75,
      head: [['Category', 'Amount']],
      body: categoryBreakdown.map(item => [item.category, `$${item.amount.toFixed(2)}`]),
      theme: 'grid',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontSize: 12,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 11,
        cellPadding: 5
      },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 'auto', halign: 'right' }
      }
    });

    // Add detailed transactions if report type is detailed
    if (reportType === 'detailed') {
      const lastY = (doc as any).lastAutoTable.finalY || 120;
      doc.setFontSize(14);
      doc.text('Detailed Transactions', 20, lastY + 15);
      
      autoTable(doc, {
        startY: lastY + 20,
        head: [['Date', 'Category', 'Amount', 'Payment Method', 'Description']],
        body: filteredExpenses.map(expense => [
          new Date(expense.date).toLocaleDateString(),
          expense.category,
          `$${expense.amount.toFixed(2)}`,
          expense.paymentMethod,
          expense.description || 'N/A'
        ]),
        theme: 'grid',
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontSize: 11,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 40 },
          2: { cellWidth: 30, halign: 'right' },
          3: { cellWidth: 40 },
          4: { cellWidth: 'auto' }
        }
      });
    }

    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text(
        'MoneyWise Finance Tracker',
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Generate filename with date range
    const date = new Date().toISOString().split('T')[0];
    const filename = `expense-report-${date}.pdf`;
    
    doc.save(filename);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading expenses...</p>
      </div>
    );
  }

  const filteredExpenses = filterExpenses();
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categoryBreakdown = getCategoryBreakdown(filteredExpenses);

  return (
    <div className={styles.reportsPage}>
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>Expense Reports</h1>
          <p className={styles.pageSubtitle}>Generate and download expense reports</p>
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <div className={styles.reportControls}>
        <div className={styles.dateRangeContainer}>
          <div className={styles.dateInput}>
            <FiCalendar className={styles.inputIcon} />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={styles.input}
            />
          </div>
          <span className={styles.dateSeparator}>to</span>
          <div className={styles.dateInput}>
            <FiCalendar className={styles.inputIcon} />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.filterContainer}>
          <FiFilter className={styles.inputIcon} />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.select}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.reportTypeContainer}>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as 'summary' | 'detailed')}
            className={styles.select}
          >
            <option value="summary">Summary Report</option>
            <option value="detailed">Detailed Report</option>
          </select>
        </div>

        <button
          onClick={generatePDF}
          className={styles.generateButton}
          disabled={filteredExpenses.length === 0}
        >
          <FiDownload className={styles.buttonIcon} />
          Download Report
        </button>
      </div>

      <div className={styles.reportPreview}>
        <div className={styles.previewHeader}>
          <h2>Report Preview</h2>
          <div className={styles.previewStats}>
            <div className={styles.statCard}>
              <FiBarChart2 className={styles.statIcon} />
              <div className={styles.statContent}>
                <span className={styles.statLabel}>Total Expenses</span>
                <span className={styles.statValue}>${totalExpenses.toFixed(2)}</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <FiPieChart className={styles.statIcon} />
              <div className={styles.statContent}>
                <span className={styles.statLabel}>Categories</span>
                <span className={styles.statValue}>{categoryBreakdown.length}</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <FiTrendingUp className={styles.statIcon} />
              <div className={styles.statContent}>
                <span className={styles.statLabel}>Transactions</span>
                <span className={styles.statValue}>{filteredExpenses.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.categoryBreakdown}>
          <h3>Category Breakdown</h3>
          <div className={styles.breakdownList}>
            {categoryBreakdown.map(item => (
              <div key={item.category} className={styles.breakdownItem}>
                <span className={styles.categoryName}>{item.category}</span>
                <span className={styles.categoryAmount}>${item.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpensesReportsPage; 