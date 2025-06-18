"use client";

import React from 'react';
import Link from 'next/link';
import styles from './expenses.module.css';

const ExpensesPage = () => {
  return (
    <div className={styles.expensesPage}>
      <div className={styles.expensesHeader}>
        <h1 className={styles.expensesTitle}>Expenses Management</h1>
        <p className={styles.expensesSubtitle}>Track and manage your expenses effectively</p>
      </div>

      <div className={styles.expensesGrid}>
        <Link href="/expenses/add" className={styles.expensesCard}>
          <div className={styles.expensesCardContent}>
            <div className={styles.expensesCardIcon}>➕</div>
            <h2 className={styles.expensesCardTitle}>Add Expense</h2>
            <p className={styles.expensesCardDescription}>
              Record a new expense with detailed information
            </p>
          </div>
        </Link>

        <Link href="/expenses/manage" className={styles.expensesCard}>
          <div className={styles.expensesCardContent}>
            <div className={styles.expensesCardIcon}>📋</div>
            <h2 className={styles.expensesCardTitle}>Manage Expenses</h2>
            <p className={styles.expensesCardDescription}>
              View, edit, and manage your expense records
            </p>
          </div>
        </Link>

        <Link href="/expenses/analytics" className={styles.expensesCard}>
          <div className={styles.expensesCardContent}>
            <div className={styles.expensesCardIcon}>📊</div>
            <h2 className={styles.expensesCardTitle}>Expenses Analytics</h2>
            <p className={styles.expensesCardDescription}>
              Visualize and analyze your spending patterns
            </p>
          </div>
        </Link>

        <Link href="/expenses/reports" className={styles.expensesCard}>
          <div className={styles.expensesCardContent}>
            <div className={styles.expensesCardIcon}>📈</div>
            <h2 className={styles.expensesCardTitle}>Expenses Reports</h2>
            <p className={styles.expensesCardDescription}>
              Generate detailed reports of your expenses
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ExpensesPage; 